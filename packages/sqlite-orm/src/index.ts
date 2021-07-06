import {
  openDatabase,
  SQLError,
  SQLResultSet,
  WebSQLDatabase
} from "expo-sqlite"
import { OrmFunctions } from "./interface"
import { createResult, Result } from "../../../util/helpers"
import queryBuilder from "./query_builder"

const dbInstances: Record<string, WebSQLDatabase> = {}

/**
 *
 * @param databaseName - Database to connect to
 * @param tableName - Table to fetch data from
 * @returns
 */
const useOrm = (databaseName: string, tableName: string): OrmFunctions => {
  let db: WebSQLDatabase = dbInstances[databaseName]
  if (!db) {
    db = openDatabase(`${databaseName}.db`)
    dbInstances[databaseName] = db
  }

  const builder = queryBuilder(tableName)

  return {
    createTable: (fields, createIfNotExists = true) => {
      const stmt = builder.createTable(fields, createIfNotExists)
      return executeQuery(db, stmt)
    },
    createVirtualTable: (...args) => {
      const stmt = builder.createVirtualTable(...args)
      return executeQuery(db, stmt)
    },
    find: offset => {
      const stmt = builder.find(offset)
      return executeQuery(db, stmt)
    },
    select(...fields) {
      builder.select(...fields)
      return this
    },
    distinct() {
      builder.distinct()
      return this
    },
    limit(limit) {
      builder.limit(limit)
      return this
    },
    orderBy(field, sortOpt) {
      builder.orderBy(field, sortOpt)
      return this
    },
    where(field, sign, value) {
      builder.where(field, sign, value)
      return this
    },
    count: () => {
      const stmt = builder.count()
      return executeQuery(db, stmt)
    },
    insert: fields => {
      const [stmt, values] = builder.insert(fields)
      console.log(stmt, values)
      return executeQuery(db, stmt, values)
    },
    update: fields => {
      const [stmt, values] = builder.update(fields)
      console.log(stmt, values)
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

export default useOrm
