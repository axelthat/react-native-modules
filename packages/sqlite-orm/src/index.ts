import {
  openDatabase,
  SQLError,
  SQLResultSet,
  WebSQLDatabase
} from "expo-sqlite"
import { OrmFunctions } from "./interface"
import { createResult, Result } from "../../../util/helpers"
import queryBuilder from "./query_builder"

/**
 *
 * @param databaseName - Database to connect to
 * @param tableName - Table to fetch data from
 * @returns
 */
const useOrm = (databaseName: string, tableName: string): OrmFunctions => {
  const db = openDatabase(databaseName)
  const builder = queryBuilder(tableName)

  return {
    createTable: (fields, createIfNotExists = true) => {
      const stmt = builder.createTable(fields, createIfNotExists)
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
      const stmt = builder.insert(fields)
      return executeQuery(db, stmt)
    },
    update: fields => {
      const stmt = builder.update(fields)
      return executeQuery(db, stmt)
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
  stmt: string
): Promise<Result<SQLResultSet, SQLError>> => {
  const result = createResult<SQLResultSet, SQLError>()

  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          stmt,
          [],
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
