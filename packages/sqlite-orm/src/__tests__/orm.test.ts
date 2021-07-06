import { openDatabase } from "expo-sqlite"
import useOrm from ".."
import datatypes from "../datatypes"
import { OrmError } from "../interface"
const db = openDatabase("test.db")

jest.useFakeTimers()

function sleep(duration = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(duration)
    }, duration)
  })
}

describe("orm", () => {
  test("throws error if two different types is used on same column", async () => {
    db.transaction(tsx => {
      tsx.executeSql(`SELECT * FROM USERS`)
    })
    await sleep(1000)
    // const orm = useOrm("sql", "users")
    // try {
    //   await orm.createTable({
    //     name: datatypes().string().char()
    //   })
    // } catch (e) {
    //   expect(e.unwrapErr()).toContain('Error code 1: near "CHAR"')
    // }
  })
})
