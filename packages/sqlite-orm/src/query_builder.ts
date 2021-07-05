import { isString } from "../../../util/helpers"
import { QueryBuilder } from "./interface"

const CLAUSES = {
  selectClause: "*",
  selectDistinct: false,
  whereClauses: [] as string[],
  orderByClauses: [] as string[],
  offset: 0,
  limit: 1
}

export default function queryBuilder(tableName: string): QueryBuilder {
  /**
   * Holds statements like where, order by,
   * limit, select, etc.. so that these values
   * can later be appended into the query.
   */
  let clauses = Object.assign({}, CLAUSES)

  function appendClause(s: string, addLimit = false) {
    const { whereClauses, orderByClauses, limit, offset } = clauses

    let stmt = s
    if (whereClauses.length) {
      stmt += ` WHERE ${whereClauses.join(" AND ")}`
    }
    if (orderByClauses.length) {
      stmt += ` ORDER BY ${orderByClauses.join(",")}`
    }
    if (limit && addLimit) {
      stmt += ` LIMIT ${limit}`
    }
    if (offset) {
      stmt += ` OFFSET ${offset}`
    }
    return stmt.trim()
  }

  function reset() {
    clauses = Object.assign({}, CLAUSES)
  }

  return {
    createTable: (fields, createIfNotExists) => {
      let columns = ""
      let indexes = ""

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
          indexes += `CREATE INDEX ${
            createIfNotExists ? "IF NOT EXISTS" : ""
          } idx_${tableName}_${name} ON ${tableName}(${name});\n`
          stmt = stmt.replace(/\s?INDEX\s?/, "")
        }

        columns += `${stmt}\n`
      }

      const stmt = `CREATE TABLE ${
        createIfNotExists ? "IF NOT EXISTS" : ""
      } ${tableName}(${columns});
      ${indexes}`

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
      const stmt = `SELECT sum([rows]) FROM sys.partitions WHERE object_id=object_id(${tableName}) and index_id in (0,1)`

      reset()

      return stmt
    },
    find: (offsetCount = 0) => {
      clauses.offset = offsetCount
      const stmt = appendClause(
        `SELECT ${clauses.selectDistinct ? "DISTINCT" : ""} ${
          clauses.selectClause
        } FROM ${tableName}`
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

      for (const k of Object.keys(fields)) {
        const columnName = k as keyof typeof fields
        const value = fields[columnName]

        columns += `${columnName},`
        values += `${value},`
      }

      columns = columns.replace(/,$/, "")
      values = values.replace(/,$/, "")

      const stmt = `INSERT INTO ${tableName} (${columns}) VALUES(${values})`

      reset()

      return stmt
    },
    update: fields => {
      let columnToValuesMapped = ""

      for (const k of Object.keys(fields)) {
        const columnName = k as keyof typeof fields
        columnToValuesMapped = `${columnName}=?,`
      }

      columnToValuesMapped = columnToValuesMapped.replace(/,$/, "")

      const stmt = appendClause(
        `UPDATE ${tableName} SET ${columnToValuesMapped}`,
        true
      )

      reset()

      return stmt
    },
    delete: () => {
      const stmt = appendClause(`DELETE FROM ${tableName}`, true)

      reset()

      return stmt
    }
  }
}
