// https://gist.github.com/Randall71/695f5ced1123dcce484b985484a2a167
import {
  ConfigPlugin,
  withAppBuildGradle,
  withGradleProperties,
} from "expo/config-plugins";

const enum ABI {
  ARM64_V8A = "arm64-v8a",
  X86 = "x86",
  X86_64 = "x86_64",
  ARM_V7A = "armeabi-v7a",
}
type AbiFiltersProps = { abiFilters?: ABI[] };
const withAbiFilters: ConfigPlugin<AbiFiltersProps> = (
  config,
  { abiFilters = [ABI.ARM64_V8A] } = {},
) => {
  console.log("🔧 ABI Filter plugin is running!", abiFilters);

  // Set gradle.properties
  config = withGradleProperties(config, (config) => {
    // Convert array to comma-separated string for gradle.properties
    const architecturesString = abiFilters.join(",");

    // Set the reactNativeArchitectures property
    config.modResults = config.modResults.filter(
      (item) =>
        item.type !== "property" ||
        (item.type === "property" &&
          "key" in item &&
          item.key !== "reactNativeArchitectures"),
    );

    config.modResults.push({
      type: "property",
      key: "reactNativeArchitectures",
      value: architecturesString,
    });

    return config;
  });

  // Set build.gradle ndk.abiFilters
  config = withAppBuildGradle(config, (config) => {
    const abiFiltersString = abiFilters.map((abi) => `"${abi}"`).join(", ");

    // Add ndk abiFilters to defaultConfig
    if (config.modResults.contents.includes("defaultConfig {")) {
      config.modResults.contents = config.modResults.contents.replace(
        /(defaultConfig\s*\{[^}]*versionName\s+[^}]*)/,
        `$1
        
        ndk {
            abiFilters ${abiFiltersString}
        }`,
      );
    }

    return config;
  });

  return config;
};

module.exports = withAbiFilters;
