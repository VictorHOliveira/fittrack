const { withProjectBuildGradle } = require("expo/config-plugins");

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

  return config;
}

module.exports = withCmakeFix;
