import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  if (session) {
    return (
      <div className={styles.container}>
        <h1>Murhamaster 3.0 (Surma)</h1>
        <button onClick={() => signOut()}>Kirjaudu ulos</button>
      </div>
    );
  }
  return (
    <>
      Et ole kirjautunut sisään.
      <br />
      {/* <button onClick={() => signIn("email", { callbackUrl: "/" })}>
        Kirjaudu sisään
      </button> */}
    </>
  );
}
