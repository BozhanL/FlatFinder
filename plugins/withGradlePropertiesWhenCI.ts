import { type PropertiesItem } from "@expo/config-plugins/build/android/Properties";
import { type ConfigPlugin, withGradleProperties } from "expo/config-plugins";

type MyPropertiesItem = {
  key: string;
  value: string;
};

type GradlePropertiesWhenCIProps = {
  gradle_properties?: MyPropertiesItem[];
  ci_environment?: string;
};

const withGradlePropertiesWhenCI: ConfigPlugin<GradlePropertiesWhenCIProps> = (
  config,
  { gradle_properties = [], ci_environment = "CI" } = {},
) => {
  config = withGradleProperties(config, (config) => {
    const CI = process.env[ci_environment];
    if (!CI || CI !== "true") {
      return config;
    }

    // Set the reactNativeArchitectures property
    const gradlePropertyKeys = new Set(gradle_properties.map((p) => p.key));

    config.modResults = config.modResults.filter(
      (item) =>
        item.type !== "property" ||
        !("key" in item) ||
        !gradlePropertyKeys.has(item.key),
    );

    config.modResults.push(
      ...gradle_properties.map(
        (p): PropertiesItem => ({
          type: "property",
          key: p.key,
          value: p.value,
        }),
      ),
    );

    return config;
  });

  return config;
};

module.exports = withGradlePropertiesWhenCI;
