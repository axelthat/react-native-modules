export interface OrmFunctions {
  createTable: () => void
}

export interface DataTypesObj {
  _unsigned: string
  _int: string
  _integer: string
  _tinyInt: string
  _smallInt: string
  _bigInt: string
  _mediumInt: string
  _double: string
  _float: string
  _string: string
  _char: string
  _text: string
  _date: string
  _dateTime: string

  build: () => string

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
}
