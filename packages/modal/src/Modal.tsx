import Constants from "expo-constants"
import React, {
  useMemo,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
  useState,
  forwardRef,
  ReactElement,
  Ref,
  useImperativeHandle,
  ForwardRefRenderFunction
} from "react"
import {
  Dimensions,
  FlatList,
  FlatListProps,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollViewProps,
  StyleSheet,
  Text,
  View,
  ViewProps,
  ViewStyle
} from "react-native"
import {
  // FlatList,
  NativeViewGestureHandler,
  PanGestureHandler,
  ScrollView
} from "react-native-gesture-handler"
import Animated, {
  Easing,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated"
import makeStyles, { OVERLAY_OPACITY } from "./ModalStyle"

declare module "react" {
  function forwardRef<T, P = {}>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null
}

const ENTER_TRANSITION: Animated.WithTimingConfig = {
  easing: Easing.bezier(0.16, 1, 0.3, 1),
  duration: 500
}
const EXIT_TRANSITION: Animated.WithTimingConfig = Object.assign(
  {},
  ENTER_TRANSITION,
  {
    duration: ENTER_TRANSITION.duration! + 100
  }
)

const OVERLAY_ENTER_TRANSITION: Animated.WithTimingConfig = {
  duration: 200,
  easing: Easing.linear
}
const OVERLAY_EXIT_TRANSITION: Animated.WithTimingConfig = Object.assign(
  {},
  OVERLAY_ENTER_TRANSITION,
  {
    duration: OVERLAY_ENTER_TRANSITION.duration! * 4
  }
)

const SWIPE_VELOCITY = 500
const CLOSE_WAIT_DURATION = 500

export interface ModalProps<T> {
  wrapperStyle?: ViewStyle
  style?: ViewStyle
  overlayStyle?: ViewStyle
  swipeHandleStyle?: ViewStyle
  fullPage?: boolean
  hideSwipeHandle?: boolean
  enterTransition?: Animated.WithTimingConfig
  exitTransition?: Animated.WithTimingConfig
  overlayEnterTransition?: Animated.WithTimingConfig
  overlayExitTransition?: Animated.WithTimingConfig
  swipeVelocity?: number
  flatList?: FlatListProps<T>
  scrollView?: boolean
  scrollViewProps?: ScrollViewProps
  children?: ReactNode | ReactNode[]
}

export interface ModalRef {
  show: () => void
  hide: () => void
}

const ModalView = <T extends unknown>(
  {
    style,
    overlayStyle,
    wrapperStyle,
    swipeHandleStyle,
    hideSwipeHandle,
    flatList,
    scrollViewProps,
    children,
    fullPage,
    enterTransition,
    exitTransition,
    overlayEnterTransition,
    overlayExitTransition,
    swipeVelocity,
    scrollView
  }: ModalProps<T>,
  ref: React.ForwardedRef<ModalRef>
) => {
  const { statusBarHeight } = Constants

  const styles = makeStyles()

  const { height: winHeight, width: winWidth } = Dimensions.get("window")

  const modalHeight = (fullPage ? winHeight : winHeight / 2) - statusBarHeight
  const modalWidth = winWidth

  const [visible, setVisible] = useState(false)

  const modalStyles = useMemo(
    () => [
      styles.modal,
      {
        marginTop: fullPage ? statusBarHeight : winHeight - modalHeight,
        height: modalHeight,
        width: modalWidth,
        flex: 1
      } as ViewStyle,
      style
    ],
    [modalHeight, modalWidth]
  )

  let isScrollable = scrollView
  if (flatList) {
    isScrollable = true
  }

  const scrollYOffset = useSharedValue(0)
  const panRef = useRef<PanGestureHandler>()
  const scrollRef = useRef<ScrollView>()
  const flatListRef = useRef<FlatList>()

  const opacity = useSharedValue(0)
  const animateOpacity = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    }
  })

  const y = useSharedValue(modalHeight)
  const animateY = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: y.value }]
    }
  })

  function scrollToTop() {
    /**
     * Setting animated to true doesn't
     * quickly sets the scroll to 0. Since
     * this function is invoked while dragging
     * the scroll never reaches to 0 as RN
     * constantly tries to animate with some
     * duration. Hence, setting the animated
     * to false.
     */
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: false })
    } else if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: 0, y: 0, animated: false })
    }
  }

  const swipe = useAnimatedGestureHandler({
    onStart: (
      e,
      ctx: {
        startTime: number
        endTime: number
        initY: number
        cancel: boolean
      }
    ) => {
      ctx.cancel = false
      ctx.initY = y.value
      ctx.startTime = +new Date()
    },
    onActive: (e, ctx) => {
      /**
       * If scrolling stop drag related
       * functions.
       */
      if (scrollYOffset.value > 1) {
        ctx.cancel = true
        return
      }

      if (ctx.endTime) {
        const t = ctx.startTime - ctx.endTime
        if (t < CLOSE_WAIT_DURATION) {
          ctx.cancel = true
          return
        }
      }

      const nextY = ctx.initY + e.translationY
      if (nextY < 0) return
      /**
       * At this point scroll's y offset
       * is at 0. That means user is trying
       * to close the modal. Hence setting
       * the scroll's y offset to 0 and
       * initiating drag.
       */
      runOnJS(scrollToTop)()
      y.value = nextY
      /**
       * Decrease opacity as we translate
       *
       * (1 / OVERLAY_OPACITY) brings the
       * value in between 0 to OVERLAY_OPACITY
       */
      opacity.value =
        OVERLAY_OPACITY - nextY / modalHeight / (1 / OVERLAY_OPACITY)
    },
    onEnd: (e, ctx) => {
      ctx.endTime = +new Date()
      /**
       * If scrolling stop drag related
       * functions
       */
      if (ctx.cancel) {
        return
      }
      /**
       * Swipe to close
       */
      if (e.velocityY >= swipeVelocity!) {
        runOnJS(callToggle)(false)
        return
      }
      /**
       * Close modal when current drag offset
       * is half of modal's height
       */
      if (y.value >= modalHeight / 2) {
        runOnJS(callToggle)(false)
      } else {
        runOnJS(callToggle)(true)
      }
    }
  })

  // https://github.com/software-mansion/react-native-reanimated/issues/2165
  function callToggle(show: boolean) {
    toggle(show)
  }

  /**
   * Check which stays for the longest time
   * in UI among modal and overlay so that
   * we know which animation end to wait for
   * and set visible to false.
   *
   * @returns
   */
  const componentWithHighestExitLifetime = () => {
    const modalDuration = exitTransition!.duration ?? EXIT_TRANSITION.duration!
    const overlayDuration =
      overlayExitTransition!.duration ?? OVERLAY_EXIT_TRANSITION.duration!

    if (Math.max(modalDuration, overlayDuration) === overlayDuration) {
      return "overlay"
    }
    return "modal"
  }

  const toggle = useCallback((show: boolean) => {
    if (show) {
      setVisible(true)
      y.value = withTiming(0, enterTransition)
      opacity.value = withTiming(OVERLAY_OPACITY, overlayEnterTransition)
    } else {
      const c = componentWithHighestExitLifetime()

      y.value = withTiming(modalHeight, exitTransition, f => {
        if (f && c == "modal") {
          runOnJS(setVisible)(false)
        }
      })

      opacity.value = withTiming(0, overlayExitTransition, f => {
        if (f && c === "overlay") {
          runOnJS(setVisible)(false)
        }
      })
    }
  }, [])

  const setScrollOffset = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYOffset.value = e.nativeEvent.contentOffset.y
  }

  const show = () => toggle(true)
  const hide = () => toggle(false)

  /**
   * Expose show/hide methods
   */
  useImperativeHandle(ref, () => ({
    show,
    hide
  }))

  const renderContent = () => {
    if (flatList) {
      /**
       * https://github.com/software-mansion/react-native-gesture-handler/issues/492
       */
      return (
        <NativeViewGestureHandler ref={scrollRef} simultaneousHandlers={panRef}>
          <FlatList
            // @ts-ignore
            ref={flatListRef}
            {...flatList}
            onScrollBeginDrag={setScrollOffset}
            onScrollEndDrag={setScrollOffset}
            testID="flatList"
          />
        </NativeViewGestureHandler>
      )
    }

    if (scrollView) {
      return (
        <ScrollView
          // @ts-ignore
          ref={scrollRef}
          {...scrollViewProps}
          simultaneousHandlers={panRef}
          onScrollBeginDrag={setScrollOffset}
          onScrollEndDrag={setScrollOffset}
          testID="scrollView">
          {children}
        </ScrollView>
      )
    }

    return children
  }

  return (
    <View
      testID="wrapper"
      style={[
        styles.wrapper,
        wrapperStyle,
        {
          display: visible ? "flex" : "none"
        }
      ]}>
      <Pressable
        onPress={e => {
          const pressYLocation = e.nativeEvent.locationY
          if (pressYLocation < winHeight - modalHeight) {
            toggle(false)
          }
        }}
        style={{
          position: "absolute",
          top: 0,
          height: "100%",
          width: "100%"
        }}>
        <Animated.View
          style={[styles.overlay, overlayStyle, animateOpacity]}
          pointerEvents="auto"
        />
      </Pressable>
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={swipe}
        simultaneousHandlers={isScrollable ? scrollRef : undefined}>
        <Animated.View style={[modalStyles, animateY]} testID="modal">
          {!hideSwipeHandle && (
            <View style={[styles.swipeHandle, swipeHandleStyle]} />
          )}
          {renderContent()}
        </Animated.View>
      </PanGestureHandler>
    </View>
  )
}

const Modal = forwardRef(ModalView)
// @ts-ignore
Modal.defaultProps = {
  fullPage: true,
  enterTransition: ENTER_TRANSITION,
  exitTransition: EXIT_TRANSITION,
  overlayEnterTransition: OVERLAY_ENTER_TRANSITION,
  overlayExitTransition: OVERLAY_EXIT_TRANSITION,
  swipeVelocity: SWIPE_VELOCITY,
  scrollView: false
}

export default Modal
