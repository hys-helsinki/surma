import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";

export default function Home() {
  const [sessionChecker, setSessionChecker] = useState(true);

  useEffect(() => {
    setTimeout(() => setSessionChecker(false), 5000);
  }, []);

  const { data: session } = useSession();
  if (session) {
    const router = useRouter();
    router.push("/personal");
  }
  return (
    <>
      {sessionChecker ? (
        <div style={{ margin: "10px" }}>
          <h3>Tarkistetaan onko käyttäjä kirjautunut ...</h3>
          <TailSpin
            height="60"
            width="60"
            color="#fafafa"
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      ) : (
        <div style={{ margin: "10px" }}>
          Et ole kirjautunut sisään.
          <br />
          <button onClick={() => signIn("email", { callbackUrl: "/personal" })}>
            Kirjaudu sisään
          </button>
        </div>
      )}
    </>
  );
}
