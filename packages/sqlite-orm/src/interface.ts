export interface OrmFunctions {
  createTable: () => void
}

export interface DataTypesObj {
  build: () => string

  default: (value: string | number) => DataTypesObj
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
}
