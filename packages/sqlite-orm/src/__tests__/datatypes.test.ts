import datatypes from "../datatypes"

describe("sqlite-orm", () => {
  describe("datatypes", () => {
    test("string", () => {
      const stmt = datatypes().string(176).build()
      expect(stmt).toBe("VARCHAR(176)")
    })

    test("char", () => {
      const stmt = datatypes().char(50).build()
      expect(stmt).toBe("CHAR(50)")
    })

    test("int", () => {
      let stmt = datatypes().int().build()
      expect(stmt).toBe("INT")

      stmt = datatypes().integer().build()
      expect(stmt).toBe("INTEGER")

      stmt = datatypes().tinyInt().build()
      expect(stmt).toBe("TINYINT")

      stmt = datatypes().smallInt().build()
      expect(stmt).toBe("SMALLINT")

      stmt = datatypes().mediumInt().build()
      expect(stmt).toBe("MEDIUMINT")

      stmt = datatypes().bigInt().build()
      expect(stmt).toBe("BIGINT")

      stmt = datatypes().int().unsigned().build()
      expect(stmt).toBe("UNSIGNED INT")
    })

    test("double/float", () => {
      let stmt = datatypes().double().build()
      expect(stmt).toBe("DOUBLE")

      stmt = datatypes().double().unsigned().build()
      expect(stmt).toBe("UNSIGNED DOUBLE")

      stmt = datatypes().float().build()
      expect(stmt).toBe("FLOAT")

      stmt = datatypes().float().unsigned().build()
      expect(stmt).toBe("UNSIGNED FLOAT")
    })

    test("date", () => {
      let stmt = datatypes().date().build()
      expect(stmt).toBe("DATE")

      stmt = datatypes().dateTime().build()
      expect(stmt).toBe("DATETIME")
    })

    test("all stmt", () => {
      let stmt = datatypes()
        .string()
        .char()
        .text()
        .unsigned()
        .int()
        .integer()
        .tinyInt()
        .smallInt()
        .mediumInt()
        .bigInt()
        .double()
        .float()
        .date()
        .dateTime()
        .build()

      expect(stmt).toBe(
        "VARCHAR(255) CHAR(255) TEXT UNSIGNED INT INTEGER TINYINT SMALLINT MEDIUMINT BIGINT DOUBLE FLOAT DATE DATETIME"
      )
    })
  })
})
