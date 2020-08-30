import { theme as chakraTheme } from "@chakra-ui/core";

const fonts = { ...chakraTheme.fonts, mono: `'Menlo', monospace` };

const breakpoints = ["40em", "52em", "64em"];

const theme = {
  ...chakraTheme,
  colors: {
    ...chakraTheme.colors,
    black: "#16161D",
    footer: "#EDF2F7",
    header: "#351E29",
    dark: "#351E29",
    white: "#FAF9F9",
    blue: "#BEE3DB",
  } as any,
  fonts,
  breakpoints,
  icons: {
    ...chakraTheme.icons,
  },
};

export default theme;
