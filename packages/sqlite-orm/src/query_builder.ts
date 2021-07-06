import { QueryBuilder } from "./interface"
import { cloneDeep, isString } from "lodash-es"

const CLAUSES = {
  selectClause: "*",
  selectDistinct: false,
  whereClauses: [] as string[],
  orderByClauses: [] as string[],
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
    createTable: (fields, createIfNotExists) => {
      let columns: string[] = []
      let indexes: string[] = []

      for (const name of Object.keys(fields)) {
        const field = fields[name]
        let stmt = `${name} ${isString(field) ? field : field.build()}`
        /**
         * Check if stmt includes INDEX
         * and if so create a new query
         * stmt to create index and remove
         * the keyword INDEX from the
         * stmt.
         */
        if (stmt.includes("INDEX")) {
          indexes.push(
            `CREATE INDEX ${
              createIfNotExists ? "IF NOT EXISTS" : ""
            } idx_${tableName}_${name} ON ${tableName}(${name});`
          )
          stmt = stmt.replace(/\s?INDEX\s?/, " ")
        }

        columns.push(stmt)
      }

      const stmt = `CREATE TABLE ${
        createIfNotExists ? "IF NOT EXISTS" : ""
      } ${tableName}(
        ${columns.join(",\n")}
      );
      ${indexes.join("\n")}`

      reset()

      return stmt
    },
    select: (...fields) => {
      clauses.selectClause = fields.join(",")
    },
    where: (field, sign, compareWith) => {
      clauses.whereClauses.push(`${field}${sign}${compareWith}`)
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
        } FROM ${tableName}`,
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
      const valuesArr: (string | number)[] = new Array(iter.length)

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
      const valuesArr: (string | number)[] = new Array(iter.length)

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
