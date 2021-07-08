import { SQLError, SQLResultSet } from "expo-sqlite"
import { Result } from "./util"

export type OrmError = Result<null, SQLError>

type FieldsType = Record<string, string | number>

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
  sign?: "=" | ">=" | "<=" | "<>" | "like",
  value?: string | number
) => T

/**
 * @param field - Field to search for
 *
 * @param match - Search keyword
 */
type WhereMatchFn<T> = (field: string, match?: string) => T

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
 * @param offset - Number of rows to skip
 */
type OffsetFn<T> = (offset: number) => T

/**
 * @param fields - Fields to insert into a table
 */
type InsertFn<T> = <F = FieldsType>(fields: F) => T

/**
 * @param fields - Fields to update in a table
 */
type UpdateFn<T> = <F = FieldsType>(fields: F) => T

type FindFn<T> = () => T

/**
 * @param keyword - Search keyword
 */
type MatchFn<T> = (keyword: string) => T

type DeleteFn<T> = () => T

export interface QueryBuilder {
  createTable: CreateTableFn<[string, string | undefined, string[] | undefined]>
  find: FindFn<string>
  select: SelectFn<void>
  distinct: DistinctFn<void>
  where: WhereFn<void>
  whereMatch: WhereMatchFn<void>
  orderBy: OrderByFn<void>
  offset: OffsetFn<void>
  limit: LimitFn<void>
  count: CountFn<string>
  insert: InsertFn<[string, any]>
  update: UpdateFn<[string, any]>
  delete: DeleteFn<string>
}

export type SQLResult = {
  insertId?: string | number
  length: number
  data: any[]
}
export type OrmFunctionReturnType = Promise<Result<SQLResult, SQLError>>

export interface OrmFunctions {
  createTable: CreateTableFn<OrmFunctionReturnType>
  find: FindFn<OrmFunctionReturnType>
  select: SelectFn<OrmFunctions>
  distinct: DistinctFn<OrmFunctions>
  where: WhereFn<OrmFunctions>
  whereMatch: WhereMatchFn<OrmFunctions>
  orderBy: OrderByFn<OrmFunctions>
  offset: OffsetFn<OrmFunctions>
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
  nullable: () => DataTypesObj
  default: (value: string | number) => DataTypesObj
  index: () => DataTypesObj
  foreign: (
    table: string,
    field: string,
    on?: ["update" | "delete", "cascade" | "no action"]
  ) => DataTypesObj
}
