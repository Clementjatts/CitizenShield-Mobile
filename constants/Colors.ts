import { Theme } from "@react-navigation/native";

export const ColorScheme = {
  light: {
    primary: "#3498db",
    secondary: "#2ecc71",
    accent: "#e74c3c",
    background: "#f5f5f5",
    card: "#ffffff",
    text: "#2c3e50",
    subtext: "#7f8c8d",
    border: "#bdc3c7",
  },
  dark: {
    primary: "#2980b9",
    secondary: "#27ae60",
    accent: "#c0392b",
    background: "#121212",
    card: "#1e1e1e",
    text: "#ecf0f1",
    subtext: "#bdc3c7",
    border: "#34495e",
  },
};

export type ExtendedTheme = Theme & {
  colors: Theme["colors"] & {
    subtext: string;
  };
};

export const AppLightTheme: ExtendedTheme = {
  dark: false,
  colors: {
    ...ColorScheme.light,
    notification: ColorScheme.light.accent,
  },
};

export const AppDarkTheme: ExtendedTheme = {
  dark: true,
  colors: {
    ...ColorScheme.dark,
    notification: ColorScheme.dark.accent,
  },
};

export default ColorScheme;
