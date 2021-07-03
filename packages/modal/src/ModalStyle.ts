import { Dimensions, StyleSheet, ViewStyle } from "react-native"

const OVERLAY_BG_COLOR = "#000000"
const MODAL_BG_COLOR = "#ffffff"

const SPACING = {
    sm: 5,
    md: 10,
    lg: 15
}

export const OVERLAY_OPACITY = 0.5

// const { height: windowHeight, width: windowWidth } = Dimensions.get("window")

export default function makeStyles() {
    const absPos: ViewStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    }

    return StyleSheet.create({
        wrapper: {
            ...absPos
        },
        overlay: {
            ...absPos,
            opacity: OVERLAY_OPACITY,
            backgroundColor: OVERLAY_BG_COLOR
        },
        modal: {
            ...absPos,
            backgroundColor: MODAL_BG_COLOR,
            borderRadius: SPACING.lg,
            padding: SPACING.md
        },
        swipeHandle: {
            height: SPACING.sm,
            width: SPACING.lg * 4,
            backgroundColor: OVERLAY_BG_COLOR,
            opacity: 0.25,
            alignSelf: "center",
            borderRadius: SPACING.md
        }
    })
}
