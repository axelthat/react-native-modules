import React, { useEffect, useRef } from "react"
import { FlatList, Text, View } from "react-native"
import Modal, { ModalRef } from "./packages/modal/src"
import useOrm from "./packages/sqlite-orm/src"
import datatypes from "./packages/sqlite-orm/src/datatypes"
// import { FileSystem } from "react-native-unimodules"

const App: React.FC = () => {
  const modalRef = useRef<ModalRef>(null)

  const orm = useOrm("sql", "users")

  useEffect(() => {
    orm
      .createTable({
        name: datatypes().string().char()
      })
      .then(r => {
        console.log("SUCCESS")
      })
      .catch(e => {
        console.log(e.unwrapErr())
      })
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
