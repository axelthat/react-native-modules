import { DataTypesObj } from "./interface"

const DEFAULT_STRING_LENGTH = 255
const DEFAULT_CHAR_LENGTH = 255

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

const datatypes = (): DataTypesObj => {
  /**
   * Using map because it remembers
   * the insertion order
   */
  const types = new Map<string, string | null>([
    ["primary", null],
    ["index", null],
    ["string", null],
    ["char", null],
    ["text", null],
    ["unsigned", null],
    ["int", null],
    ["integer", null],
    ["tinyInt", null],
    ["smallInt", null],
    ["mediumInt", null],
    ["bigInt", null],
    ["double", null],
    ["float", null],
    ["date", null],
    ["dateTime", null],
    ["unique", null],
    ["default", null]
  ])

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
    index() {
      types.set("index", INDEX)
      return this
    },
    primary() {
      types.set("primary", PRIMARY_KEY)
      return this
    },
    unique() {
      types.set("unique", UNIQUE)
      return this
    },
    default(value) {
      types.set("default", `${DEFAULT} ${value.toString()}`)
      return this
    },
    string(length = DEFAULT_STRING_LENGTH) {
      types.set("string", STRING.replace("#", length.toString()))
      return this
    },
    char(length = DEFAULT_CHAR_LENGTH) {
      types.set("char", CHAR.replace("#", length.toString()))
      return this
    },
    text() {
      types.set("text", TEXT)
      return this
    },
    unsigned() {
      types.set("unsigned", UNSIGNED)
      return this
    },
    int() {
      types.set("int", INT)
      return this
    },
    integer() {
      types.set("integer", INTEGER)
      return this
    },
    tinyInt() {
      types.set("tinyInt", TINYINT)
      return this
    },
    smallInt() {
      types.set("smallInt", SMALLINT)
      return this
    },
    mediumInt() {
      types.set("mediumInt", MEDIUMINT)
      return this
    },
    bigInt() {
      types.set("bigInt", BIGINT)
      return this
    },
    double() {
      types.set("double", DOUBLE)
      return this
    },
    float() {
      types.set("float", FLOAT)
      return this
    },
    date() {
      types.set("date", DATE)
      return this
    },
    dateTime() {
      types.set("dateTime", DATETIME)
      return this
    }
  }
}

export default datatypes
