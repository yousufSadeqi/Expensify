import { scale, verticalScale } from "@/utils/styling";

export const colors = {
  primary: "#a3e635",
  secondary: "#0ea5e9",
  primaryLight: "#0ea5e9",
  primaryDark: "#0369a1",
  text: "#fff",
  textLight: "#e5e5e5",
  textLighter: "#d4d4d4",
  white: "#fff",
  black: "#000",
  rose: "#ef4444",
  green: "#16a34a",
  neutral50: "#fafafa",
  neutral100: "#f5f5f5",
  neutral200: "#e5e5e5",
  neutral300: "#d4d4d4",
  neutral350: "#CCCCCC",
  neutral400: "#a3a3a3",
  neutral500: "#737373",
  neutral600: "#525252",
  neutral700: "#404040",
  neutral800: "#262626",
  neutral900: "#171717",
};

export const spacingX = {
  _3: scale(3),
  _5: scale(5),
  _7: scale(7),
  _10: scale(10),
  _12: scale(12),
  _15: scale(15),
  _20: scale(20),
  _25: scale(25),
  _30: scale(30),
  _35: scale(35),
  _40: scale(40),
};

export const spacingY = {
  _5: verticalScale(5),
  _7: verticalScale(7),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _25: verticalScale(25),
  _30: verticalScale(30),
  _35: verticalScale(35),
  _40: verticalScale(40),
  _50: verticalScale(50),
  _60: verticalScale(60),
};

export const radius = {
  _3: verticalScale(3),
  _6: verticalScale(6),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _30: verticalScale(30),
};

export const lightTheme = {
  ...colors,
  // Override specific colors for light theme
  text: colors.neutral900,
  textLight: colors.neutral800,
  textLighter: colors.neutral700,
  textSecondary: colors.neutral600,
  background: colors.white,
  surface: colors.neutral100,
  surfaceVariant: colors.neutral200,
};

export const darkTheme = {
  ...colors,
  // Override specific colors for dark theme
  text: colors.white,
  textLight: colors.neutral100,
  textLighter: colors.neutral200,
  textSecondary: colors.neutral400,
  background: colors.neutral900,
  surface: colors.neutral800,
  surfaceVariant: colors.neutral700,
};
