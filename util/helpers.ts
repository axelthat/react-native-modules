export function isString(value: any): value is string {
  return typeof value === "string" || value instanceof String
}

export function isNumber(value: any): value is number {
  return typeof value === "number" && isFinite(value)
}

export function isObject(value: any): value is Object {
  return value && typeof value === "object" && value.constructor === Object
}

export function isFunction(value: any): value is Function {
  return typeof value === "function"
}

export const { isArray } = Array

export function isJson(value: any) {
  try {
    return JSON.parse(value) || {}
  } catch (e) {
    return false
  }
}
