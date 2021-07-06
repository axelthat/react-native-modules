import {
  openDatabase,
  SQLError,
  SQLResultSet,
  WebSQLDatabase
} from "expo-sqlite"
import { OrmFunctions } from "./interface"
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
    createTable: (...args) => {
      const stmt = builder.createTable(...args)
      return executeQuery(db, stmt)
    },
    createVirtualTable: (...args) => {
      const stmt = builder.createVirtualTable(...args)
      return executeQuery(db, stmt)
    },
    find: (...args) => {
      const stmt = builder.find(...args)
      console.log(stmt)
      return executeQuery(db, stmt)
    },
    select(...args) {
      builder.select(...args)
      return this
    },
    match(...args) {
      builder.match(...args)
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
const executeQuery = <T extends (string | number)[]>(
  db: WebSQLDatabase,
  stmt: string,
  values?: T
): Promise<Result<SQLResultSet, SQLError>> => {
  const result = createResult<SQLResultSet, SQLError>()

  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          stmt,
          values ?? [],
          (_, res) => resolve(result.ok(res)),
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
