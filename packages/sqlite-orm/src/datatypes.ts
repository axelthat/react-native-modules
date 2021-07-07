import { DataTypesObj } from "./interface"

const DEFAULT_STRING_LENGTH = 255
const DEFAULT_CHAR_LENGTH = 255

const AUTO_INCREMENT = "AUTOINCREMENT"
const PRIMARY_KEY = "PRIMARY KEY"
const INDEX = "INDEX"
const UNIQUE = "UNIQUE"
const STRING = "VARCHAR(#)"
const CHAR = "CHAR(#)"
const TEXT = "TEXT"
const UNSIGNED = "UNSIGNED"
const INT = "INT"
const INTEGER = "INTEGER"
const TINYINT = "TINYINT"
const SMALLINT = "SMALLINT"
const MEDIUMINT = "MEDIUMINT"
const BIGINT = "BIGINT"
const DOUBLE = "DOUBLE"
const FLOAT = "FLOAT"
const DATE = "DATE"
const DATETIME = "DATETIME"
const DEFAULT = "DEFAULT"
const FOREIGN_KEY = "FOREIGN_KEY"
const NOT_NULL = "NOT NULL"

export const datatypes = (): DataTypesObj => {
  /**
   * Using map because it remembers
   * the insertion order
   */
  const types = new Map<string, string | null>()

  return {
    build: () => {
      let stmt: string[] = []
      types.forEach(value => {
        if (value !== null) {
          stmt.push(value)
        }
      })

      return stmt.join(" ")
    },
    autoincrement() {
      types.set(AUTO_INCREMENT, AUTO_INCREMENT)
      return this
    },
    index() {
      types.set(INDEX, INDEX)
      return this
    },
    primary() {
      types.set(PRIMARY_KEY, PRIMARY_KEY)
      return this
    },
    unique() {
      types.set(UNIQUE, UNIQUE)
      return this
    },
    default(value) {
      const v = value === "CURRENT_TIMESTAMP" ? value : `'${value.toString()}'`
      types.set(DEFAULT, `${DEFAULT} ${v}`)
      return this
    },
    string(length = DEFAULT_STRING_LENGTH) {
      types.set(STRING, STRING.replace("#", length.toString()))
      return this
    },
    char(length = DEFAULT_CHAR_LENGTH) {
      types.set(CHAR, CHAR.replace("#", length.toString()))
      return this
    },
    text() {
      types.set(TEXT, TEXT)
      return this
    },
    unsigned() {
      types.set(UNSIGNED, UNSIGNED)
      return this
    },
    int() {
      types.set(INT, INT)
      return this
    },
    integer() {
      types.set(INTEGER, INTEGER)
      return this
    },
    tinyInt() {
      types.set(TINYINT, TINYINT)
      return this
    },
    smallInt() {
      types.set(SMALLINT, SMALLINT)
      return this
    },
    mediumInt() {
      types.set(MEDIUMINT, MEDIUMINT)
      return this
    },
    bigInt() {
      types.set(BIGINT, BIGINT)
      return this
    },
    double() {
      types.set(DOUBLE, DOUBLE)
      return this
    },
    float() {
      types.set(FLOAT, FLOAT)
      return this
    },
    date() {
      types.set(DATE, DATE)
      return this
    },
    dateTime() {
      types.set(DATETIME, DATETIME)
      return this
    },
    nullable() {
      types.set(NOT_NULL, null)
      return this
    },
    foreign(table, field, on = ["delete", "no action"]) {
      const action = on[0] ?? "delete"
      const actionType = on[1] ?? "no action"

      types.set(
        FOREIGN_KEY,
        `${FOREIGN_KEY}:[\"${table}\",\"${field}\",\"${action}\",\"${actionType}\"]:`
      )
      return this
    }
  }
}
