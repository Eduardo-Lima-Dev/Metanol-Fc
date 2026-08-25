import { Image } from "react-native";

const logoSource = require("../../assets/brand/logo.png") as number;

export function Logo({ size = 140 }: { size?: number }) {
  return (
    <Image
      source={logoSource}
      resizeMode="contain"
      style={{ width: size, height: size }}
      accessibilityLabel="Metanol FC"
    />
  );
}
