const colors = {
  system: { black: "#010101", white: "#FFFFFF" },
  gray: {
    900: "#151515",
    800: "#1E1E1E",
    700: "#242424",
    600: "#303030",
    500: "#3B3B3B",
    400: "#717171",
    300: "#828282",
    200: "#979797",
    150: "#CCCCCC",
    100: "#EBECEC",
    50: "#F8F8F8",
  },
  red: {
    900: "#7C271A",
    800: "#A03221",
    700: "#CE402B",
    600: "#E2462F",
    500: "#E86B59",
    400: "#EC8374",
    300: "#F2AA9F",
    200: "#F6C6BF",
    100: "#FFDEDA",
    50: "#FCEDEA",
  },
} as const

const typography = {
  head: [
    { token: "head-sb-24", size: 24, weight: 600, lineHeight: 1.3 },
    { token: "head-r-24", size: 24, weight: 400, lineHeight: 1.3 },
    { token: "head-sb-22", size: 22, weight: 600, lineHeight: 1.3 },
    { token: "head-r-22", size: 22, weight: 400, lineHeight: 1.3 },
    { token: "head-sb-20", size: 20, weight: 600, lineHeight: 1.3 },
    { token: "head-r-20", size: 20, weight: 400, lineHeight: 1.3 },
    { token: "head-sb-18", size: 18, weight: 600, lineHeight: 1.3 },
    { token: "head-r-18", size: 18, weight: 400, lineHeight: 1.3 },
  ],
  body: [
    { token: "body-sb-16", size: 16, weight: 600, lineHeight: 1.5 },
    { token: "body-r-16", size: 16, weight: 400, lineHeight: 1.5 },
    { token: "body-sb-14", size: 14, weight: 600, lineHeight: 1.5 },
    { token: "body-r-14", size: 14, weight: 400, lineHeight: 1.5 },
    { token: "body-sb-13", size: 13, weight: 600, lineHeight: 1.5 },
    { token: "body-r-13", size: 13, weight: 400, lineHeight: 1.5 },
  ],
  caption: [
    { token: "caption-sb-12", size: 12, weight: 600, lineHeight: 1.5 },
    { token: "caption-r-12", size: 12, weight: 400, lineHeight: 1.5 },
    { token: "caption-sb-10", size: 10, weight: 600, lineHeight: 1.5 },
    { token: "caption-r-10", size: 10, weight: 400, lineHeight: 1.5 },
  ],
} as const

const spacing = [1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56] as const

const layout = { mobileGutter: 20, baseSpacing: 4 } as const

export { colors, layout, spacing, typography }
