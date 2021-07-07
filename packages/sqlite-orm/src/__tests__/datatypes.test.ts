import { datatypes } from "../datatypes"

describe("sqlite-orm", () => {
  describe("datatypes", () => {
    test("nullable", () => {
      let stmt = datatypes().string().nullable().build()
      expect(stmt).toBe("VARCHAR(255)")
    })

    test("string", () => {
      const stmt = datatypes().string(176).nullable().build()
      expect(stmt).toBe("VARCHAR(176)")
    })

    test("char", () => {
      const stmt = datatypes().char(50).nullable().build()
      expect(stmt).toBe("CHAR(50)")
    })

    test("int", () => {
      let stmt = datatypes().int().nullable().build()
      expect(stmt).toBe("INT")

      stmt = datatypes().integer().nullable().build()
      expect(stmt).toBe("INTEGER")

      stmt = datatypes().tinyInt().nullable().build()
      expect(stmt).toBe("TINYINT")

      stmt = datatypes().smallInt().nullable().build()
      expect(stmt).toBe("SMALLINT")

      stmt = datatypes().mediumInt().nullable().build()
      expect(stmt).toBe("MEDIUMINT")

      stmt = datatypes().bigInt().nullable().build()
      expect(stmt).toBe("BIGINT")

      stmt = datatypes().unsigned().int().nullable().build()
      expect(stmt).toBe("UNSIGNED INT")

      stmt = datatypes().int().unsigned().nullable().build()
      expect(stmt).toBe("UNSIGNED INT")
    })

    test("double/float", () => {
      let stmt = datatypes().double().nullable().build()
      expect(stmt).toBe("DOUBLE")

      stmt = datatypes().double().unsigned().nullable().build()
      expect(stmt).toBe("UNSIGNED DOUBLE")

      stmt = datatypes().float().nullable().build()
      expect(stmt).toBe("FLOAT")

      stmt = datatypes().float().unsigned().nullable().build()
      expect(stmt).toBe("UNSIGNED FLOAT")
    })

    test("date", () => {
      let stmt = datatypes().date().nullable().build()
      expect(stmt).toBe("DATE")

      stmt = datatypes().dateTime().nullable().build()
      expect(stmt).toBe("DATETIME")
    })

    test("primary", () => {
      let stmt = datatypes().primary().nullable().build()
      expect(stmt).toBe("PRIMARY KEY")
    })

    test("index", () => {
      let stmt = datatypes().index().nullable().build()
      expect(stmt).toBe("INDEX")
    })

    test("unique", () => {
      let stmt = datatypes().unique().nullable().build()
      expect(stmt).toBe("UNIQUE")
    })

    test("default", () => {
      let stmt = datatypes().default("Hello World").nullable().build()
      expect(stmt).toBe("DEFAULT 'Hello World'")
    })

    test("autoincrement", () => {
      let stmt = datatypes().autoincrement().nullable().build()
      expect(stmt).toBe("AUTOINCREMENT")
    })

    test("foreign", () => {
      let stmt = datatypes()
        .foreign("customers", "user_id", ["delete", "cascade"])
        .nullable()
        .build()
      expect(stmt).toBe(
        //prettier-ignore
        'FOREIGN_KEY:[\"customers\",\"user_id\",\"delete\",\"cascade\"]:'
      )
    })

    test("all stmt", () => {
      let stmt = datatypes()
        .primary()
        .index()
        .foreign("customers", "user_id", ["delete", "cascade"])
        .unique()
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
        .default("Test")
        .build()

      expect(stmt).toBe(
        // prettier-ignore
        "INDEX VARCHAR(255) CHAR(255) TEXT UNSIGNED INT INTEGER TINYINT SMALLINT MEDIUMINT BIGINT DOUBLE FLOAT DATE DATETIME UNIQUE PRIMARY KEY NOT NULL DEFAULT 'Test' FOREIGN_KEY:[\"customers\",\"user_id\",\"delete\",\"cascade\"]:"
      )
    })
  })
})
