import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useSession, signIn } from "next-auth/react";
import logo from "/public/images/surma_logo.svg";
import InfoAccordion from "../components/InfoAccordion";
import TournamentTable from "../components/TournamentTable";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true,
      startTime: true,
      endTime: true,
      registrationStartTime: true,
      registrationEndTime: true
    }
  });
  tournaments = JSON.parse(JSON.stringify(tournaments));
  return {
    props: { tournaments }
  };
};

export default function Home({ tournaments }) {
  const { data: session } = useSession();
  if (session) {
    return {
      redirect: {
        destination: `/personal`,
        permanent: false
      }
    };
  }
  return (
    <div
      className={`${styles.center} ${styles.main}`}
      style={{ padding: "20px" }}
    >
      <button
        onClick={() => signIn("email", { callbackUrl: "/personal" })}
        style={{ margin: "1em" }}
      >
        Kirjaudu sisään
      </button>
      <h1 className={styles.container} style={{ padding: "1em" }}>
        Surma (Murhamaster 3.0)
      </h1>
      <Image src={logo} alt="logo" width={200} height={200} priority={true} />
      <h2 className={styles.container} style={{ padding: "1em" }}>
        {" "}
        Avoimet salamurhaturnaukset{" "}
      </h2>
      <TournamentTable tournaments={tournaments}></TournamentTable>
      <InfoAccordion></InfoAccordion>
    </div>
  );
}
