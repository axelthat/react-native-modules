import { SQLError, SQLResultSet } from "expo-sqlite"
import { Result } from "../../../util/helpers"

export type OrmError = Result<null, SQLError>

/**
 * @param fields - List of columns to add in a table
 *
 * @param createIfNotExists - Create table only if the table doesn't exist
 *
 * @returns
 */
type CreateTableFn<T> = (
  fields: Record<string, DataTypesObj>,
  createIfNotExists?: boolean
) => T

/**
 * @param fields - List of columns to add in a table
 *
 * @param createIfNotExists - Create table only if the table doesn't exist
 *
 * @returns
 */
type CreateVirtualTableFn<T> = (
  fields: Record<string, DataTypesObj>,
  createIfNotExists?: boolean
) => T

/**
 * @param fields - List of columns to fetch. Default is "*"
 */
type SelectFn<T> = (...fields: string[]) => T

type CountFn<T> = () => T

type DistinctFn<T> = () => T

/**
 * @param field - Field to compare
 *
 * @param sign - Comparision operator. Default is "="
 *
 * @param value - Value to compare field with
 */
type WhereFn<T> = (
  field: string,
  sign: "=" | ">=" | "<=" | "<>" | "like",
  value: string | number
) => T

/**
 * @param field - Field to sort
 *
 * @param sortOpt - Sorting option. Either ascending or descending. Default is "DESC"
 */
type OrderByFn<T> = (field: string, sortOpt: "ASC" | "DESC") => T

/**
 * @param limit - Count of rows to perform action against
 */
type LimitFn<T> = (limit?: number) => T

/**
 * @param fields - Fields to insert into a table
 */
type InsertFn<T> = (fields: Record<string, string | number>) => T

/**
 * @param fields - Fields to update in a table
 */
type UpdateFn<T> = (fields: Record<string, string | number>) => T

/**
 * @param offset - Offset to skip rows from
 *
 * @param limit - Amount of rows to fetch after offset
 */
type FindFn<T> = (offset?: number) => T

type DeleteFn<T> = () => T

export interface QueryBuilder {
  createTable: CreateTableFn<string>
  // createVirtualTable: CreateVirtualTableFn<string>
  find: FindFn<string>
  select: SelectFn<void>
  distinct: DistinctFn<void>
  where: WhereFn<void>
  orderBy: OrderByFn<void>
  limit: LimitFn<void>
  count: CountFn<string>
  insert: InsertFn<[string, (string | number)[]]>
  update: UpdateFn<[string, (string | number)[]]>
  delete: DeleteFn<string>
}

type OrmFunctionReturnType = Promise<Result<SQLResultSet, SQLError>>

export interface OrmFunctions {
  createTable: CreateTableFn<OrmFunctionReturnType>
  // createVirtualTable: CreateVirtualTableFn<OrmFunctionReturnType>
  find: FindFn<OrmFunctionReturnType>
  select: SelectFn<OrmFunctions>
  distinct: DistinctFn<OrmFunctions>
  where: WhereFn<OrmFunctions>
  orderBy: OrderByFn<OrmFunctions>
  limit: LimitFn<OrmFunctions>
  count: CountFn<OrmFunctionReturnType>
  insert: InsertFn<OrmFunctionReturnType>
  update: UpdateFn<OrmFunctionReturnType>
  delete: DeleteFn<OrmFunctionReturnType>
}

export interface DataTypesObj {
  build: () => string

  autoincrement: () => DataTypesObj
  primary: () => DataTypesObj
  index: () => DataTypesObj
  unique: () => DataTypesObj
  unsigned: () => DataTypesObj
  int: () => DataTypesObj
  integer: () => DataTypesObj
  tinyInt: () => DataTypesObj
  smallInt: () => DataTypesObj
  bigInt: () => DataTypesObj
  mediumInt: () => DataTypesObj
  double: () => DataTypesObj
  float: () => DataTypesObj
  string: (length?: number) => DataTypesObj
  char: (length?: number) => DataTypesObj
  text: () => DataTypesObj
  date: () => DataTypesObj
  dateTime: () => DataTypesObj
  default: (value: string | number) => DataTypesObj
}
