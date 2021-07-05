import useOrm from ".."
import datatypes from "../datatypes"
import { OrmError } from "../interface"

describe("orm", () => {
  test("throws error if two different types is used on same column", async () => {
    const orm = useOrm("sql", "users")
    try {
      await orm.createTable({
        name: datatypes().string().char()
      })
    } catch (e) {
      expect(e.unwrapErr()).toContain('Error code 1: near "CHAR"')
    }
  })
})
