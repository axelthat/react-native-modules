import { datatypes } from "../datatypes"
import queryBuilder from "../query_builder"

const builder = queryBuilder("users")
const defaultTable = builder.createTable({
  id: datatypes().integer().primary().autoincrement(),
  name: datatypes().string(255).nullable().default("John Jonathan "),
  surname: datatypes().string(255).nullable().default("Jones"),
  email: datatypes().string(100),
  created: datatypes().unsigned().int()
})

const REGEX = /\s/gs

describe("sqlite-orm", () => {
  describe("query_builder", () => {
    test("createTable without index", () => {
      const [stmt, searchStmt, triggers] = defaultTable

      expect(stmt.replace(REGEX, "")).toBe(
        `
        CREATE TABLE IF NOT EXISTS users(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(255) DEFAULT 'John Jonathan',
          surname VARCHAR(255) DEFAULT 'Jones',
          email VARCHAR(100),
          created UNSIGNED INT
        );
      `.replace(REGEX, "")
      )

      expect(searchStmt).toBeUndefined()
      expect(triggers).toBeUndefined()
    })

    test("createTable with index", () => {
      const [stmt, searchStmt, triggers] = builder.createTable({
        id: datatypes().integer().primary().autoincrement(),
        name: datatypes()
          .string(255)
          .nullable()
          .index()
          .default("John Jonathan "),
        surname: datatypes().string(255).nullable().index().default("Jones"),
        email: datatypes().string(100),
        created: datatypes().unsigned().int()
      })

      expect(stmt.replace(REGEX, "")).toBe(
        `
        CREATE TABLE IF NOT EXISTS users(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(255) DEFAULT 'John Jonathan',
          surname VARCHAR(255) DEFAULT 'Jones',
          email VARCHAR(100),
          created UNSIGNED INT
        );
        CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
        CREATE INDEX IF NOT EXISTS idx_users_surname ON users(surname);
      `.replace(REGEX, "")
      )

      expect(searchStmt?.replace(REGEX, "")).toBe(
        `
        CREATE VIRTUAL TABLE IF NOT EXISTS _users_fts USING fts5(
          name,
          surname,
          content='users',
          content_rowid='id'
        );
      `.replace(REGEX, "")
      )

      expect(triggers?.join("\n").replace(REGEX, "")).toBe(
        `
      CREATE TRIGGER _trigger_users_insert AFTER INSERT ON users
        BEGIN
          INSERT INTO _users_fts (rowid, name,surname)
          VALUES (new.id, new.name,new.surname);
        END;

      CREATE TRIGGER _trigger_users_delete AFTER DELETE ON users
        BEGIN
          INSERT INTO _users_fts (_users_fts, rowid, name,surname)
          VALUES ('delete', old.id, old.name,old.surname);
        END;

      CREATE TRIGGER _trigger_users_update AFTER UPDATE ON users
        BEGIN
          INSERT INTO _users_fts (_users_fts, rowid, name,surname)
          VALUES ('delete', old.id, old.name,old.surname);

          INSERT INTO _users_fts (rowid, name,surname)
          VALUES (new.id, new.name,new.surname);
        END;
      `.replace(REGEX, "")
      )
    })

    test("select", () => {
      builder.select("name", "surname")
      const res = builder.find()
      expect(res.replace(REGEX, "")).toBe(
        `SELECT name,surname FROM users`.replace(REGEX, "")
      )
    })

    test("select(index)", () => {
      builder.whereMatch("name", "h*")
      builder.select("name", "surname")
      const res = builder.find()
      expect(res.replace(REGEX, "")).toBe(
        `SELECT name,surname FROM _users_fts WHERE name MATCH 'h*'`.replace(
          REGEX,
          ""
        )
      )
    })

    test("where", () => {
      builder.where("id", "=", 1)
      builder.where("name", "=", "John")
      const res = builder.find()
      expect(res.replace(REGEX, "")).toBe(
        `SELECT * FROM users WHERE id='1' AND name='John'`.replace(REGEX, "")
      )
    })

    test("whereMatch", () => {
      builder.whereMatch("name", "hell*")
      const res = builder.find()
      expect(res.replace(REGEX, "")).toBe(
        `SELECT rowid as id, * FROM _users_fts WHERE name MATCH 'hell*'`.replace(
          REGEX,
          ""
        )
      )
    })

    test("orderBy", () => {
      builder.orderBy("name", "ASC")
      let res = builder.find()
      expect(res.replace(REGEX, "")).toBe(
        `SELECT * FROM users ORDER BY name ASC`.replace(REGEX, "")
      )

      builder.orderBy("surname", "DESC")
      res = builder.find()
      expect(res.replace(REGEX, "")).toBe(
        `SELECT * FROM users ORDER BY surname DESC`.replace(REGEX, "")
      )
    })

    test("limit", () => {
      builder.limit(15)
      let res = builder.find()
      expect(res.replace(REGEX, "")).toBe(
        `SELECT * FROM users LIMIT 15`.replace(REGEX, "")
      )
    })

    test("count", () => {
      let res = builder.count()
      expect(res.replace(REGEX, "")).toBe(
        `SELECT COUNT(*) FROM users`.replace(REGEX, "")
      )

      builder.select("name")
      res = builder.count()
      expect(res.replace(REGEX, "")).toBe(
        `SELECT COUNT(name) FROM users`.replace(REGEX, "")
      )
    })

    test("find", () => {
      builder.select("name", "surname")
      builder.where("name", "=", "Alexa")
      builder.orderBy("name", "ASC")
      builder.limit(15)

      let res = builder.find(12)
      expect(res.replace(REGEX, "")).toBe(
        `
        SELECT name,surname FROM users WHERE name='Alexa' ORDER BY name ASC LIMIT 15 OFFSET 12
      `.replace(REGEX, "")
      )

      builder.limit(10)
      builder.distinct()
      res = builder.find(10)

      expect(res.replace(REGEX, "")).toBe(
        `
        SELECT DISTINCT * FROM users LIMIT 10 OFFSET 10
      `.replace(REGEX, "")
      )
    })

    test("find(index)", () => {
      builder.whereMatch("_users_fts", "ha*")
      let res = builder.find()

      expect(res.replace(REGEX, "")).toBe(
        `
        SELECT rowid as id, * FROM _users_fts WHERE _users_fts MATCH 'ha*'
      `.replace(REGEX, "")
      )

      builder.whereMatch("_users_fts", "ha*")
      builder.orderBy("name", "DESC")
      res = builder.find()

      expect(res.replace(REGEX, "")).toBe(
        `
        SELECT rowid as id, * FROM _users_fts WHERE _users_fts MATCH 'ha*' ORDER BY name DESC
      `.replace(REGEX, "")
      )
    })

    test("insert", () => {
      const [res, values] = builder.insert({
        name: "Alex Adams",
        surname: "Adonis"
      })

      expect(res.replace(REGEX, "")).toBe(
        `
        INSERT INTO users (name,surname) VALUES (?,?)
      `.replace(REGEX, "")
      )

      expect(values).toStrictEqual(["Alex Adams", "Adonis"])
    })

    test("insert doesn't apply limit", () => {
      builder.limit(15)
      const [res, values] = builder.insert({
        name: "Alex Adams",
        surname: "Adonis"
      })

      expect(res.replace(REGEX, "")).toBe(
        `
        INSERT INTO users (name,surname) VALUES (?,?)
      `.replace(REGEX, "")
      )

      expect(values).toStrictEqual(["Alex Adams", "Adonis"])
    })

    test("update", () => {
      const [res, values] = builder.update({
        name: "Alexa Adonis"
      })

      expect(res.replace(REGEX, "")).toBe(
        `
        UPDATE users SET name=?
      `.replace(REGEX, "")
      )

      expect(values).toStrictEqual(["Alexa Adonis"])
    })

    test("update with limit", () => {
      builder.limit(15)
      const [res, values] = builder.update({
        name: "Alexa Adonis"
      })

      expect(res.replace(REGEX, "")).toBe(
        `
        UPDATE users SET name=? LIMIT 15
      `.replace(REGEX, "")
      )

      expect(values).toStrictEqual(["Alexa Adonis"])
    })

    test("delete", () => {
      builder.where("name", "=", "Alexa Adonis")
      const res = builder.delete()

      expect(res.replace(REGEX, "")).toBe(
        `
        DELETE FROM users WHERE name='Alexa Adonis'
      `.replace(REGEX, "")
      )
    })

    test("delete with limit", () => {
      builder.limit(20)
      builder.where("name", "=", "Alexa Adonis")
      const res = builder.delete()

      expect(res.replace(REGEX, "")).toBe(
        `
        DELETE FROM users WHERE name='Alexa Adonis' LIMIT 20
      `.replace(REGEX, "")
      )
    })

    test("find:all", () => {
      builder.select("name", "surname")
      builder.where("name", "=", "Alexa Adonis")
      builder.orderBy("surname", "DESC")
      builder.limit(20)
      builder.distinct()

      let res = builder.find(20)
      expect(res.replace(REGEX, "")).toBe(
        `
        SELECT DISTINCT name,surname FROM users WHERE name='Alexa Adonis' ORDER BY surname DESC LIMIT 20 OFFSET 20
      `.replace(REGEX, "")
      )
    })
  })
})
