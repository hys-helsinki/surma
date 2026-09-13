import Head from "next/head";
import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import NavigationBar from "../components/NavigationBar";
import { appWithTranslation } from "next-i18next";
import Footer from "../components/Footer";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider>
      <Head>
        <title>Surma</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="app-shell">
        <NavigationBar />
        <div className="app-content">
          <Component {...pageProps} />
        </div>
        <Footer />
      </div>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp);
