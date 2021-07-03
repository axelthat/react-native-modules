import "regenerator-runtime"
import "react-native-gesture-handler/jestSetup"

require("react-native-reanimated/lib/reanimated2/jestUtils").setUpTests()

jest.mock("react-native/Libraries/Utilities/Platform", () => {
    const Platform = require.requireActual(
        "react-native/Libraries/Utilities/Platform"
    )
    Platform.OS = "android"
    return Platform
})
