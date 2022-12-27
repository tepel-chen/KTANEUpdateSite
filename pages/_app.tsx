import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import type { AppProps } from "next/app";
import { useMemo } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode],
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />

    </ThemeProvider>
  );
}

export default MyApp;
