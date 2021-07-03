import React, { useRef } from "react"
import { render } from "@testing-library/react-native"
import Modal, { ModalProps, ModalRef } from "../Modal"
import { FlatList, ScrollView } from "react-native-gesture-handler"
import { Text } from "react-native"

const MODAL_WRAPPER_ID = "wrapper"
const MODAL_ID = "modal"

const DEVICE_HEIGHT = 1334
const DEVICE_WIDTH = 750
const DEVICE_TOP_SAFEAREA_INSET = 44
const DEVICE_SAFE_HEIGHT = DEVICE_HEIGHT - DEVICE_TOP_SAFEAREA_INSET

test("renders correctly", () => {
    const wrapper = render(<Modal />).toJSON()
    expect(wrapper).toMatchSnapshot("Modal")
})

async function getModal(props: ModalProps<{}>) {
    const instance = render(<Modal {...props} />)
    return await instance.findByTestId(MODAL_ID)
}

function getStyle(
    styles: Record<string, any>[] | Record<string, any>,
    name: string
) {
    if (Array.isArray(styles)) {
        for (const style of styles) {
            if (style && style[name]) {
                return style[name]
            }
        }
    } else {
        if (styles[name]) {
            return styles[name]
        }
    }
}

test("show modal", async () => {
    let ref: ModalRef | null = null
    const instance = render(<Modal ref={r => (ref = r)} />)
    ref!.show()
    const wrapper = await instance.findByTestId(MODAL_WRAPPER_ID)

    expect(getStyle(wrapper.props.style, "display")).toBe("flex")
})

test("hide modal", async () => {
    let ref: ModalRef | null = null
    const instance = render(<Modal ref={r => (ref = r)} />)
    ref!.hide()
    const wrapper = await instance.findByTestId(MODAL_WRAPPER_ID)

    expect(getStyle(wrapper.props.style, "display")).toBe("none")
})

test("modal is hidden (translated to its own height) by default", async () => {
    const modal = await getModal({
        fullPage: true
    })
    expect(modal).toHaveAnimatedStyle({
        transform: [{ translateY: DEVICE_SAFE_HEIGHT }]
    })
})

test("renders full page modal", async () => {
    const modal = await getModal({
        fullPage: true
    })
    expect(modal.props.style.height).toBe(DEVICE_SAFE_HEIGHT)
})

test("renders half page modal", async () => {
    const modal = await getModal({
        fullPage: false
    })
    expect(modal.props.style.height).toBe(
        DEVICE_HEIGHT / 2 - DEVICE_TOP_SAFEAREA_INSET
    )
})

test("renders scroll view", async () => {
    const modal = await getModal({
        scrollView: true
    })
    const scrollView = modal.findByType(ScrollView)

    expect(scrollView).not.toBeNull()
})

test("renders flatList", async () => {
    const modal = await getModal({
        scrollView: true,
        fullPage: false,
        flatList: {
            data: [1, 2, 3],
            renderItem: ({ item }) => <Text>{item}</Text>,
            keyExtractor: item => item.toString()
        }
    })
    const flatList = modal.findByType(FlatList)

    expect(flatList).not.toBeNull()
})
