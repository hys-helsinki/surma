import Head from "next/head";
import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import NavigationBar from "../components/NavigationBar";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider>
      <Head>
        <title>Surma</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavigationBar />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
