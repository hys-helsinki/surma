import Image from "next/image";
import styles from "../styles/Home.module.css";
import logo from "/public/images/surma_logo.svg";
import InfoAccordion from "../components/LandingPage/InfoAccordion";
import TournamentTable from "../components/LandingPage/TournamentTable";
import { authConfig } from "./api/auth/[...nextauth]";
import prisma from "../lib/prisma";
import { unstable_getServerSession } from "next-auth/next";

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authConfig
  );

  if (session) {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        umpire: true,
        tournamentId: true
      }
    });
    if (user.umpire) {
      return {
        redirect: {
          destination: `/admin/${user.tournamentId}`,
          permanent: false
        }
      };
    }
    return {
      redirect: {
        destination: `/tournaments/${user.tournamentId}/users/${user.id}`,
        permanent: false
      }
    };
  }

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
}

export default function Home({ tournaments }) {
  return (
    <div
      className={`${styles.center} ${styles.main}`}
      style={{ padding: "20px" }}
    >
      <h1 className={styles.container} style={{ padding: "1em" }}>
        Surma
      </h1>
      <Image
        src={logo}
        alt="logo"
        width={200}
        height={200}
        priority={true}
        style={{
          maxWidth: "100%",
          height: "auto"
        }}
      />
      <h2 className={styles.container} style={{ padding: "1em" }}>
        Avoimet salamurhaturnaukset
      </h2>
      <TournamentTable tournaments={tournaments}></TournamentTable>
      <InfoAccordion></InfoAccordion>
    </div>
  );
}
