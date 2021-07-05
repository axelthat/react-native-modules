import { DataTypesObj } from "./interface"

const DEFAULT_STRING_LENGTH = 255
const DEFAULT_CHAR_LENGTH = 255

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

const datatypes = (): DataTypesObj => {
  let stmt = ""

  const types = {
    _string: "",
    _char: "",
    _text: "",
    _unsigned: "",
    _int: "",
    _integer: "",
    _tinyInt: "",
    _smallInt: "",
    _mediumInt: "",
    _bigInt: "",
    _double: "",
    _float: "",
    _date: "",
    _dateTime: ""
  }

  return {
    ...types,
    build() {
      const keys = Object.keys(types)
      for (const k of keys) {
        const key = k as keyof typeof types
        if (this[key]) {
          stmt = `${stmt} ${this[key]}`
        }
      }

      stmt = stmt.trim()
      return stmt
    },
    string(length: number = DEFAULT_STRING_LENGTH) {
      this._string = STRING.replace("#", length.toString())
      return this
    },
    char(length: number = DEFAULT_CHAR_LENGTH) {
      this._string = CHAR.replace("#", length.toString())
      return this
    },
    text() {
      this._text = TEXT
      return this
    },
    unsigned() {
      this._unsigned = UNSIGNED
      return this
    },
    int() {
      this._int = INT
      return this
    },
    integer() {
      this._integer = INTEGER
      return this
    },
    tinyInt() {
      this._tinyInt = TINYINT
      return this
    },
    smallInt() {
      this._smallInt = SMALLINT
      return this
    },
    mediumInt() {
      this._mediumInt = MEDIUMINT
      return this
    },
    bigInt() {
      this._bigInt = BIGINT
      return this
    },
    double() {
      this._double = DOUBLE
      return this
    },
    float() {
      this._float = FLOAT
      return this
    },
    date() {
      this._date = DATE
      return this
    },
    dateTime() {
      this._dateTime = DATETIME
      return this
    }
  }
}

export default datatypes
