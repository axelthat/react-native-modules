import { QueryBuilder } from "./interface"
import { cloneDeep, isString } from "lodash-es"

const CLAUSES = {
  selectClause: "*",
  selectDistinct: false,
  whereClauses: [] as string[],
  orderByClauses: [] as string[],
  isSearch: false,
  offset: 0,
  limit: 0
}

export default function queryBuilder(tableName: string): QueryBuilder {
  /**
   * Holds statements like where, order by,
   * limit, select, etc.. so that these values
   * can later be appended into the query.
   */
  let clauses = cloneDeep(CLAUSES)

  function appendClause(s: string, addLimit = false) {
    const { whereClauses, orderByClauses, limit, offset } = clauses

    let stmt = s
    if (whereClauses.length) {
      stmt += ` WHERE ${whereClauses.join(" AND ")}`
    } else {
      if (clauses.isSearch) {
        stmt += ` WHERE _${tableName}_fts`
      }
    }

    if (orderByClauses.length) {
      stmt += ` ORDER BY ${orderByClauses.join(",")}`
    }

    if (limit > 0 && addLimit) {
      stmt += ` LIMIT ${limit}`
    }

    if (offset) {
      stmt += ` OFFSET ${offset}`
    }
    return stmt.trim()
  }

  function reset() {
    clauses = cloneDeep(CLAUSES)
  }

  return {
    createTable: (fields, createIfNotExists = true) => {
      let columns: string[] = []
      let indexes: string[] = []
      let foreignKeys: string[] = []
      let primaryKey = ""

      for (const name of Object.keys(fields)) {
        const field = fields[name]
        let stmt = `${name} ${isString(field) ? field : field.build()}`

        if (stmt.includes("PRIMARY KEY")) {
          primaryKey = name
        }

        /**
         * Check if stmt includes INDEX
         * and if so create a new query
         * stmt to create index and remove
         * the keyword INDEX from the
         * stmt.
         */
        if (stmt.includes("INDEX")) {
          indexes.push(name)
          stmt = stmt.replace(/\s?INDEX\s?/, " ")
        }

        if (stmt.includes("FOREIGN_KEY")) {
          const regex = /FOREIGN_KEY:(.*?):/
          const st = stmt.match(regex)
          if (st && st[1]) {
            const [t, f, a, at] = JSON.parse(st[1])
            foreignKeys.push(
              `FOREIGN KEY (${name}) REFERENCES ${t} (${f}) ON ${a.toUpperCase()} ${at.toUpperCase()}`
            )
            stmt = stmt.replace(regex, "")
          }
        }

        columns.push(stmt)
      }

      const searchTableName = `_${tableName}_fts`

      const searchStmt = indexes.length
        ? `
        CREATE VIRTUAL TABLE ${
          createIfNotExists ? "IF NOT EXISTS" : ""
        } ${searchTableName} USING fts5(
          ${indexes.join(",\n")},
          content='${tableName}',
          content_rowid='${primaryKey}'
        );
      `
        : undefined

      /**
       * Different variants of indexes
       * as string used in query statements
       */
      const indexesStr = {
        comma: "",
        commaNewLine: "",
        newDotComma: "",
        oldDotComma: ""
      }

      const indexesLength = indexes.length
      for (let i = 0; i < indexesLength; i++) {
        const index = indexes[i]
        const isLastIdx = i === indexesLength - 1

        indexesStr.comma += `${index}${!isLastIdx ? "," : ""}`
        indexesStr.commaNewLine += `${index}${!isLastIdx ? ",\n" : ""}`
        indexesStr.newDotComma += `new.${index}${!isLastIdx ? "," : ""}`
        indexesStr.oldDotComma += `old.${index}${!isLastIdx ? "," : ""}`
      }

      const triggers = searchStmt
        ? [
            `CREATE TRIGGER _trigger_${tableName}_insert AFTER INSERT ON ${tableName}
          BEGIN
            INSERT INTO ${searchTableName} (rowid, ${indexesStr.comma})
            VALUES (new.id, ${indexesStr.newDotComma});
          END;`,

            `CREATE TRIGGER _trigger_${tableName}_delete AFTER DELETE ON ${tableName}
          BEGIN
            INSERT INTO ${searchTableName} (${searchTableName}, rowid, ${indexesStr.comma})
            VALUES ('delete', old.id, ${indexesStr.oldDotComma});
          END;`,

            `CREATE TRIGGER _trigger_${tableName}_update AFTER UPDATE ON ${tableName}
          BEGIN
            INSERT INTO ${searchTableName} (${searchTableName}, rowid, ${indexesStr.comma})
            VALUES ('delete', old.id, ${indexesStr.oldDotComma});

            INSERT INTO ${searchTableName} (rowid, ${indexesStr.comma})
            VALUES (new.id, ${indexesStr.newDotComma});
          END;`
          ]
        : undefined

      const stmt = `CREATE TABLE ${
        createIfNotExists ? "IF NOT EXISTS" : ""
      } ${tableName}(
        ${columns.join(",\n")}${foreignKeys.length ? "," : ""}

        ${foreignKeys.join(",\n")}
      );
      ${indexes
        .map(
          name =>
            `CREATE INDEX ${
              createIfNotExists ? "IF NOT EXISTS" : ""
            } idx_${tableName}_${name} ON ${tableName}(${name});`
        )
        .join("\n")}`

      reset()

      return [stmt, searchStmt, triggers]
    },
    select: (...fields) => {
      clauses.selectClause = fields.join(",")
    },
    where: (field, sign, compareWith) => {
      clauses.whereClauses.push(
        `${field}${sign ?? ""}${compareWith ? `'${compareWith}'` : ""}`
      )
    },
    whereMatch: (field, keyword) => {
      clauses.whereClauses.push(`${field} MATCH '${keyword}'`)
      clauses.selectClause = "rowid as id, *"
      clauses.isSearch = true
    },
    orderBy: (field, sortOpt) => {
      clauses.orderByClauses.push(`${field} ${sortOpt}`)
    },
    limit: (limitCount = 1) => {
      clauses.limit = limitCount
    },
    count: () => {
      const stmt = `SELECT COUNT(${clauses.selectClause}) FROM ${tableName}`

      reset()

      return stmt
    },
    find: (offsetCount = 0) => {
      clauses.offset = offsetCount
      const stmt = appendClause(
        `SELECT${clauses.selectDistinct ? "DISTINCT" : ""} ${
          clauses.selectClause
        } FROM ${clauses.isSearch ? `_${tableName}_fts` : tableName}`,
        true
      )
      reset()
      return stmt
    },
    distinct: () => {
      clauses.selectDistinct = true
    },
    insert: fields => {
      let columns = ""
      let values = ""

      const iter = Object.keys(fields)
      const valuesArr: any[] = new Array(iter.length)

      let idx = 0
      for (const k of iter) {
        const columnName = k as keyof typeof fields
        const value = fields[columnName]

        columns += `${columnName},`
        values += "?,"
        valuesArr[idx] = value

        idx++
      }

      columns = columns.replace(/,$/, "")
      values = values.replace(/,$/, "")

      const stmt = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`

      reset()

      return [stmt, valuesArr]
    },
    update: fields => {
      let columnToValuesMapped = ""
      const iter = Object.keys(fields)
      const valuesArr: any[] = new Array(iter.length)

      let idx = 0
      for (const k of iter) {
        const columnName = k as keyof typeof fields
        columnToValuesMapped = `${columnName}=?,`
        valuesArr[idx] = fields[columnName]
        idx++
      }

      columnToValuesMapped = columnToValuesMapped.replace(/,$/, "")

      const stmt = appendClause(
        `UPDATE ${tableName} SET ${columnToValuesMapped}`,
        true
      )

      reset()

      return [stmt, valuesArr]
    },
    delete: () => {
      const stmt = appendClause(`DELETE FROM ${tableName}`, true)

      reset()

      return stmt
    }
  }
}
