import React, { useEffect, useRef } from "react"
import { FlatList, Text, View } from "react-native"
import Modal, { ModalRef } from "./packages/modal/src"
import useOrm from "./packages/sqlite-orm/src"
import datatypes from "./packages/sqlite-orm/src/datatypes"
import { FileSystem } from "react-native-unimodules"
import { openDatabase } from "expo-sqlite"

const App: React.FC = () => {
  const modalRef = useRef<ModalRef>(null)

  const orm = useOrm("sql", "users_fts")
  const db = openDatabase("sql.db")

  useEffect(() => {
    // orm
    //   .createVirtualTable(["name"], "users", "id")
    //   .then(res => {
    //     console.log(res.unwrap())
    //   })
    //   .catch(err => {
    //     console.log(err.unwrapErr())
    //   })
    orm
      .match("Hello")
      .find()
      .then(res => {
        console.log(res.unwrap())
      })
      .catch(err => {
        console.log(err.unwrapErr())
      })
    // db.transaction(tx => {
    //   tx.executeSql(
    //     `CREATE TABLE IF NOT EXISTS users(
    //         name VARCHAR(255),
    // surname VARCHAR(255),
    // age UNSIGNED SMALLINT,
    // username VARCHAR(255) UNIQUE
    //       );
    //       CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
    // CREATE INDEX IF NOT EXISTS idx_users_surname ON users(surname);`,
    //     [],
    //     () => {},
    //     (_, e) => {
    //       console.log(e)
    //       return false
    //     }
    //   )
    // })
    // setTimeout(() => {
    //   db.transaction(tmx => {
    //     tmx.executeSql(
    //       `INSERT INTO users (name,surname,age,username) VALUES (?,?,?,?)`,
    //       ["Hello World", "Hello World", 12, "hello-world1215125"],
    //       () => {},
    //       (_, e) => {
    //         console.log(e)
    //         return false
    //       }
    //     )
    //   })
    // }, 500)
    // orm
    //   .createTable({
    //     id: datatypes().autoincrement().primary(),
    //     name: datatypes().string().index(),
    //     surname: datatypes().string().index(),
    //     age: datatypes().smallInt().unsigned(),
    //     username: datatypes().unique().string()
    //   })
    //   .then(res => {
    //     // orm
    //     //   .limit(2)
    //     //   .find()
    //     //   .then(res => {
    //     //     console.log(res.unwrap()?.rows)
    //     //   })
    //     //   .catch(err => {
    //     //     console.log(err.unwrapErr())
    //     //   })
    //     // orm
    //     //   .select("name", "username")
    //     //   .orderBy("name", "ASC")
    //     //   .limit(1)
    //     //   .find()
    //     //   .then(res => {
    //     //     console.log(res.unwrap()?.rows)
    //     //   })
    //     //   .catch(err => {
    //     //     console.log(err.unwrapErr())
    //     //   })
    //     // orm
    //     //   .insert({
    //     //     name: "Hello World",
    //     //     surname: "Hello World",
    //     //     age: 12,
    //     //     username: "hello-world12512521"
    //     //   })
    //     //   .then(res => {
    //     //     // console.log(res.unwrap())
    //     //   })
    //     //   .catch(err => {
    //     //     console.log("##", err.unwrapErr())
    //     //   })
    //   })
    //   .catch(e => {
    //     console.log(e.unwrapErr())
    //   })
  }, [])

  return <View></View>

  // return (
  //     <Modal ref={modalRef} fullPage={false} scrollView={true}>
  //         {Array.from(new Array(100), (_, i) => (
  //             <Text key={i.toString()}>{i.toString()}</Text>
  //         ))}
  //     </Modal>
  // )
}

export default App
