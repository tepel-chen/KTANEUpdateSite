import { Container, createTheme, CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

import { useMemo } from "react";

function MyApp({ Component, pageProps: {session, ...pageProps} }: AppProps) {
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
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Container sx={{marginTop: "32px"}} maxWidth="lg">
          <Component {...pageProps} />
        </Container>

      </ThemeProvider>

    </SessionProvider>
  );
}

export default MyApp;
