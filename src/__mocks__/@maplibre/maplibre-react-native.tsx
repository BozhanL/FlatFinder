import type { FC } from "react";
import { View } from "react-native";

export const MapView: FC = (props) => <View {...props} />;
export const RasterSource: FC = (props) => <View {...props} />;
export const RasterLayer: FC = (props) => <View {...props} />;
export const Camera: FC = (props) => <View {...props} />;
export const Images: FC = (props) => <View {...props} />;
export const ShapeSource: FC = (props) => <View {...props} />;
export const SymbolLayer: FC = (props) => <View {...props} />;
export const Logger = { setLogCallback: jest.fn(), setLogLevel: jest.fn() };
