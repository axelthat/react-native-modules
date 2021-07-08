import {
  openDatabase,
  SQLError,
  SQLResultSet,
  WebSQLDatabase
} from "expo-sqlite"
import { OrmFunctionReturnType, OrmFunctions, SQLResult } from "./interface"
import { createResult, Result } from "./util"
import queryBuilder from "./query_builder"

const dbInstances: Record<string, WebSQLDatabase> = {}

/**
 *
 * @param databaseName - Database to connect to
 * @param tableName - Table to fetch data from
 * @returns
 */
export const useOrm = (
  databaseName: string,
  tableName: string
): OrmFunctions => {
  let db: WebSQLDatabase = dbInstances[databaseName]
  if (!db) {
    db = openDatabase(`${databaseName}.db`)
    dbInstances[databaseName] = db
  }

  const builder = queryBuilder(tableName)

  return {
    createTable: async (...args) => {
      const [stmt, searchStmt, triggers] = builder.createTable(...args)
      let res = await executeQuery(db, stmt)
      if (searchStmt) {
        res = await executeQuery(db, searchStmt)
        if (triggers) {
          for (const trigger of triggers) {
            await executeQuery(db, trigger)
          }
        }
      }
      return res
    },
    find: (...args) => {
      const stmt = builder.find(...args)
      return executeQuery(db, stmt)
    },
    select(...args) {
      builder.select(...args)
      return this
    },
    whereMatch(...args) {
      builder.whereMatch(...args)
      return this
    },
    distinct() {
      builder.distinct()
      return this
    },
    limit(...args) {
      builder.limit(...args)
      return this
    },
    offset(...args) {
      builder.offset(...args)
      return this
    },
    orderBy(...args) {
      builder.orderBy(...args)
      return this
    },
    where(...args) {
      builder.where(...args)
      return this
    },
    count: () => {
      const stmt = builder.count()
      return executeQuery(db, stmt)
    },
    insert: (...args) => {
      const [stmt, values] = builder.insert(...args)
      return executeQuery(db, stmt, values)
    },
    update: (...args) => {
      const [stmt, values] = builder.update(...args)
      return executeQuery(db, stmt, values)
    },
    delete: () => {
      const stmt = builder.delete()
      return executeQuery(db, stmt)
    }
  }
}

/**
 *
 * @param db - Database Instance
 * @param stmt - Query statement
 * @returns
 */
const executeQuery = (
  db: WebSQLDatabase,
  stmt: string,
  values?: any[]
): OrmFunctionReturnType => {
  const result = createResult<SQLResult, SQLError>()

  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          stmt,
          values ?? [],
          (_, res) =>
            resolve(
              result.ok({
                insertId: res.insertId,
                length: res.rows.length,
                data: (res.rows as any)._array
              })
            ),
          (_, e) => {
            reject(result.error(e))
            return false
          }
        )
      },
      e => {
        reject(result.error(e))
      }
    )
  })
}
