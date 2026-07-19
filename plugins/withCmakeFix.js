const {
  withProjectBuildGradle,
  withDangerousMod,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const CMAKE_FLAG = "-DANDROID_STL=c++_shared";

const SUBPROJECTS_BLOCK = `
subprojects { subproject ->
  subproject.afterEvaluate {
    try {
      if (subproject.plugins.hasPlugin('com.android.library')) {
        subproject.android.defaultConfig.externalNativeBuild.cmake.arguments '${CMAKE_FLAG}'
      }
    } catch (Exception e) {
    }
  }
}
`;

const CMAKE_FILES_TO_PATCH = [
  {
    path: "node_modules/react-native-screens/android/CMakeLists.txt",
    replacements: [
      {
        find: "target_link_libraries(rnscreens\n    ReactAndroid::reactnative",
        replace:
          "target_link_libraries(rnscreens\n    c++_shared\n    ReactAndroid::reactnative",
      },
    ],
  },
  {
    path: "node_modules/react-native-screens/android/src/main/jni/CMakeLists.txt",
    replacements: [
      {
        find: "target_link_libraries(\n  ${LIB_TARGET_NAME}\n  ReactAndroid::reactnative",
        replace:
          "target_link_libraries(\n  ${LIB_TARGET_NAME}\n  c++_shared\n  ReactAndroid::reactnative",
      },
    ],
  },
  {
    path: "node_modules/react-native-worklets/android/CMakeLists.txt",
    replacements: [
      {
        find: "target_link_libraries(worklets android log ReactAndroid::reactnative",
        replace:
          "target_link_libraries(worklets c++_shared android log ReactAndroid::reactnative",
      },
    ],
  },
  {
    path: "node_modules/react-native-reanimated/android/CMakeLists.txt",
    replacements: [
      {
        find: "target_link_libraries(\n  reanimated\n  log",
        replace: "target_link_libraries(\n  reanimated\n  c++_shared\n  log",
      },
    ],
  },
  {
    path: "node_modules/react-native-gesture-handler/android/CMakeLists.txt",
    replacements: [
      {
        find: "target_link_libraries(\n  react_codegen_rngesturehandler_codegen\n  fbjni",
        replace:
          "target_link_libraries(\n  react_codegen_rngesturehandler_codegen\n  c++_shared\n  fbjni",
      },
    ],
  },
  {
    path: "node_modules/react-native-gesture-handler/android/src/main/jni/CMakeLists.txt",
    replacements: [
      {
        find: "target_link_libraries(\n  ${PACKAGE_NAME}\n  ReactAndroid::reactnative",
        replace:
          "target_link_libraries(\n  ${PACKAGE_NAME}\n  c++_shared\n  ReactAndroid::reactnative",
      },
    ],
  },
  {
    path: "node_modules/react-native-safe-area-context/android/src/main/jni/CMakeLists.txt",
    replacements: [
      {
        find: "target_link_libraries(\n          ${LIB_TARGET_NAME}\n          fbjni\n          jsi\n          reactnative",
        replace:
          "target_link_libraries(\n          ${LIB_TARGET_NAME}\n          c++_shared\n          fbjni\n          jsi\n          reactnative",
      },
      {
        find: "target_link_libraries(\n          ${LIB_TARGET_NAME}\n          fbjni\n          folly_runtime",
        replace:
          "target_link_libraries(\n          ${LIB_TARGET_NAME}\n          c++_shared\n          fbjni\n          folly_runtime",
      },
    ],
  },
  {
    path: "node_modules/react-native-svg/android/src/main/jni/CMakeLists.txt",
    replacements: [
      {
        find: "target_link_libraries(\n    react_codegen_rnsvg\n    ReactAndroid::reactnative",
        replace:
          "target_link_libraries(\n    react_codegen_rnsvg\n    c++_shared\n    ReactAndroid::reactnative",
      },
      {
        find: "target_link_libraries(\n  react_codegen_rnsvg\n  fbjni",
        replace:
          "target_link_libraries(\n  react_codegen_rnsvg\n  c++_shared\n  fbjni",
      },
    ],
  },
];

function patchCmakeFiles(projectRoot) {
  let patchedCount = 0;

  for (const file of CMAKE_FILES_TO_PATCH) {
    const filePath = path.join(projectRoot, file.path);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    for (const { find, replace } of file.replacements) {
      if (content.includes(find) && !content.includes(replace)) {
        content = content.replace(find, replace);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      patchedCount++;
    }
  }

  return patchedCount;
}

function withCmakeFix(config) {
  config = withProjectBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes("subprojects")) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /allprojects\s*\{/,
        `${SUBPROJECTS_BLOCK}\nallprojects {`
      );
    }

    return cfg;
  });

  config = withDangerousMod(config, ["android", (cfg) => {
    const projectRoot = cfg.modRequest.projectRoot;
    const count = patchCmakeFiles(projectRoot);

    if (count > 0) {
      console.log(
        `[withCmakeFix] Patched ${count} CMakeLists.txt file(s) with c++_shared`
      );
    }

    return cfg;
  }]);

  return config;
}

module.exports = withCmakeFix;
