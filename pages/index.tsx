import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useSession, signIn } from "next-auth/react";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import Link from "next/link";
import logo from "/public/images/surma_logo.svg";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { NoSsr } from "@mui/base/NoSsr";

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
  const modifyDate = (s) => {
    const date = new Date(s);
    const formattedDate = `${date.toLocaleTimeString("fi-FI", {
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      day: "numeric",
      month: "numeric",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })}`;
    return formattedDate;
  };

  if (session) {
    return {
      redirect: {
        destination: `/personal`,
        permanent: false
      }
    };
  }
  return (
    <div className={`${styles.center} ${styles.main}`}>
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
      <p>
        {" "}
        Alla on lista tulevista turnauksista. Jos alla ei näy mitään, tulevia
        turnauksia ei ole juuri nyt tiedossa, joten palaathan myöhemmin
        takaisin. Tietoa tulevista turnauksista voi saada myös{" "}
        <a href="https://salamurhaajat.net/tulevat-tapahtumat">
          Helsingin yliopiston salamurhapelaajien eli HYSin nettisivuilta.
        </a>
      </p>
      {tournaments.map((tournament) => (
        <div key={tournament.id}>
          <Link href={`/registration/${tournament.id}`}>
            <table
              aria-label="tournament-table"
              className={styles.tournamentTable}
            >
              <thead>
                <tr>
                  <th>Nimi</th>
                  <th>Turnaus käynnissä</th>
                  <th>Ilmoittautuminen käynnissä</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{tournament.name}</td>
                  <td>
                    <NoSsr>
                      {modifyDate(tournament.startTime)}&nbsp;-&nbsp;
                      {modifyDate(tournament.endTime)} (
                      {Intl.DateTimeFormat().resolvedOptions().timeZone})
                    </NoSsr>
                  </td>
                  <td>
                    <NoSsr>
                      {modifyDate(tournament.registrationStartTime)}
                      &nbsp;-&nbsp;{modifyDate(
                        tournament.registrationEndTime
                      )}{" "}
                      ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                    </NoSsr>
                  </td>
                  <td>
                    <a>Ilmoittautumislomake</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </Link>
        </div>
      ))}
      <Accordion variant="outlined">
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon style={{ color: "white" }} />}
          aria-controls="info-from-Slaughter"
          id="surma-panel"
          sx={{
            backgroundColor: "rgb(34, 23, 23)",
            color: "white"
          }}
        >
          <h2 className={styles.accordionText}>Mikä on Surma?</h2>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "rgb(34, 23, 23)",
            color: "white"
          }}
        >
          Surma on leikkisten salamurhaturnausten järjestämiseen tarkoitettu
          ohjelma, jota ylläpitää ja kehittää Helsingin yliopiston
          salamurhapelaajat ry:n aktiivit eli{" "}
          <a href="https://github.com/hys-helsinki">
            GitHubin hys-helsinki -organisaatio
          </a>
          . Surmaa käytetään salamurhaturnauksien ylläpitämiseen: pelaajat
          jakavat tietoja toisilleen Surman kautta turnauksen ajan.
        </AccordionDetails>
      </Accordion>
      <Accordion variant="outlined">
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon style={{ color: "white" }} />}
          aria-controls="info-from-assassination-tournaments"
          id="tournament-panel"
          sx={{
            backgroundColor: "rgb(34, 23, 23)",
            color: "white"
          }}
        >
          <h2 className={styles.accordionText}>Mikä on salamurhaturnaus?</h2>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "rgb(34, 23, 23)",
            color: "white"
          }}
        >
          <p>
            Salamurhaturnauksessa pelaajat elävät arkista elämäänsä samalla kun
            he pyrkivät hankkiutumaan muiden ihmisten huomaamatta olosuhteisiin,
            joissa voivat soveltaa toisiin pelaajiin sääntöjen sallimaa kirjoa
            leikkimielisiä aseenkorvikkeita. Turnausta pelataan osallistujien
            kesken murharingeittäin: pelaaja A:n tavoite on salamurhata kohde
            eli pelaaja B, pelaaja B saalistaa pelaaja C:tä ja niin edelleen
            aina pelaajaan N asti, joka väijyy pelaajaa A. Mikäli A onnistuu
            murhaamaan B:n sääntöjen sallimalla tavalla, A ja B ottavat yhteyttä
            tuomaristoon ja raportoivat tapahtumien kulusta pisteytystä varten.
            Nyt B putoaa pelistä, jolloin A alkaakin väijyä C:tä uutena
            kohteenaan. Peliä pelataan näin kellon ympäri ennalta määrättyyn
            aikarajaan asti, jolloin pelin voittaja päätetään pisteillä. Pelin
            helpottamiseksi pelaajat jakavat muun muuassa kalentereitaan ja
            kotiosoitteitaan toisilleen Surmassa.
          </p>
          <p>
            Salamurhaturnaukseen osallistuminen aloitetaan ilmoittautumalla
            peliin Surman kautta, jonka jälkeen Surma ja turnauksen tuomaristo
            lähettävät lisäohjeita sähköpostilla.{" "}
          </p>
          <p>
            Lue lisää pelaajatiedoista ja niiden käsittelystä{" "}
            <Link href="/privacy">
              <a>Surman tietosuojakäytännöstä</a>
            </Link>
            .
          </p>
          <p>
            Lue lisää salamurhaturnauksesta ja sen säännöistä{" "}
            <a href="https://salamurhaajat.net/mika-salamurhapeli">
              HYSin nettisivuilta
            </a>
            .
          </p>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
