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
      let stmt = datatypes().int()
      expect(stmt).toBe("INT")

      stmt = datatypes().integer()
      expect(stmt).toBe("INTEGER")

      stmt = datatypes().tinyInt()
      expect(stmt).toBe("TINYINT")

      stmt = datatypes().smallInt()
      expect(stmt).toBe("SMALLINT")

      stmt = datatypes().mediumInt()
      expect(stmt).toBe("MEDIUMINT")

      stmt = datatypes().bigInt()
      expect(stmt).toBe("BIGINT")

      stmt = datatypes().int().unsigned()
      expect(stmt).toBe("INT")
    })

    test("double/float", () => {
      let stmt = datatypes().double()
      expect(stmt).toBe("DOUBLE")

      stmt = datatypes().double().unsigned()
      expect(stmt).toBe("UNSIGNED DOUBLE")

      stmt = datatypes().float()
      expect(stmt).toBe("FLOAT")

      stmt = datatypes().float().unsigned()
      expect(stmt).toBe("UNSIGNED FLOAT")
    })

    test("date", () => {
      let stmt = datatypes().date()
      expect(stmt).toBe("DATE")

      stmt = datatypes().dateTime()
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

export {}
