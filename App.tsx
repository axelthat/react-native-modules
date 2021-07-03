import React, { useEffect, useRef } from "react"
import { FlatList, Text, View } from "react-native"
import Modal, { ModalRef } from "./packages/modal/src"

const App: React.FC = () => {
    const modalRef = useRef<ModalRef>(null)

    useEffect(() => {
        modalRef.current?.show()
    }, [])

    return (
        <Modal
            ref={modalRef}
            flatList={{
                data: [1, 2, 3],
                renderItem: ({ item }) => <Text></Text>
            }}></Modal>
    )

    // return (
    //     <Modal ref={modalRef} fullPage={false} scrollView={true}>
    //         {Array.from(new Array(100), (_, i) => (
    //             <Text key={i.toString()}>{i.toString()}</Text>
    //         ))}
    //     </Modal>
    // )
}

export default App
