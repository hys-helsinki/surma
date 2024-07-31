import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from 'react';
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import Link from "next/link";
import logo from "/public/images/surma_logo.svg";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true,
      startTime: true,
      endTime: true,
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
  <div>
      <div>
        <button onClick={() => signIn("email", { callbackUrl: "/personal" })} style={{ float: "right", display: "inline"}}>Kirjaudu sisään</button>
      </div>
    <div className={styles.center}>
      <h1 style={{ textAlign: "center", justifyContent: "center", display: "inline"}}>Surma (Murhamaster 3.0)</h1>
    <div className={styles.main}>
      <Image src={logo} alt="logo" width={200} height={200} />
      <h2> Avoimet salamurhaturnaukset </h2>
      <p> Alla on lista tulevista turnauksista. Jos alla ei näy mitään, tulevia turnauksia ei ole juuri nyt tiedossa, joten palaathan myöhemmin takaisin. Tietoa tulevista turnauksista voi saada myös <a href="https://salamurhaajat.net/tulevat-tapahtumat">HYSin nettisivuilta.</a></p>
      {tournaments.map((tournament) => (
        <div key={tournament.id}>
          <Link href={`/registration/${tournament.id}`}>
          <table aria-label="tournament-table" style={{borderSpacing: "15px", marginBottom: "30px"}}>
          <tr>
            <th style={{width:"15%", padding: "15px"}}>Nimi</th>
            <th style={{width:"25%", padding: "15px"}}>Aika</th>
            <th style={{width:"25%", padding: "15px"}}>Ilmoittautuminen päättyy</th>
            <th style={{width:"25%", padding: "15px"}}></th>
          </tr>
          <tr>
            <td>{tournament.name}</td>
            <td>&nbsp;
            {tournament.startTime}
            &nbsp;-&nbsp;
            {tournament.endTime}
            &nbsp;</td>
            <td>&nbsp;
            {tournament.registrationEndTime}
            &nbsp;</td>
            <td><a>Ilmoittautumislomake</a></td>
          </tr>
        </table>
          </Link>
        </div>
      ))}

        <Accordion variant="outlined">
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon style={{ color: 'white' }}/>}
          aria-controls="info-from-Slaughter"
          id="surma-panel"
          sx={{
          backgroundColor: "rgb(34, 23, 23)",
          borderColor: "white",
          color: "white"
          }}
        >
          <h2 className={styles.center}>Mikä on Surma?</h2>
        </AccordionSummary>
        <AccordionDetails sx={{
          backgroundColor: "rgb(34, 23, 23)",
          color: "white"}}>
          Surma on leikkisten salamurhaturnausten ylläpitämiseen tarkoitettu ohjelma, jota ylläpitää ja kehittää Helsingin yliopiston salamurhapelaajat ry:n aktiivit eli GitHubin <a href="https://github.com/hys-helsinki">hys-helsinki -organisaatio.</a> Surmaa käytetään salamurhaturnauksien ylläpitämiseen: pelaajat jakavat tietoja toisilleen Surman kautta turnauksen ajan.
        </AccordionDetails>
        </Accordion>

        <Accordion variant="outlined">
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon style={{ color: 'white' }}/>}
          aria-controls="info-from-assassination-tournaments"
          id="tournament-panel"
          sx={{
            backgroundColor: "rgb(34, 23, 23)",
            color: "white",
            }}
        >
          <h2 className={styles.center}>Mikä on salamurhaturnaus?</h2>
        </AccordionSummary>
        <AccordionDetails sx={{
          backgroundColor: "rgb(34, 23, 23)",
          color: "white"}}>
          <p>Salamurhaturnauksessa pelaajat elävät arkista elämäänsä samalla kun he pyrkivät hankkiutumaan muiden ihmisten huomaamatta olosuhteisiin, joissa voivat soveltaa toisiin pelaajiin sääntöjen sallimaa kirjoa leikkimielisiä aseenkorvikkeita. 
          Turnausta pelataan osallistujien kesken murharingeittäin: pelaaja A:n tavoite on salamurhata kohde eli pelaaja B, pelaaja B saalistaa pelaaja C:tä ja niin edelleen aina pelaajaan N asti, joka väijyy pelaajaa A. 
          Mikäli A onnistuu murhaamaan B:n sääntöjen sallimalla tavalla, A ja B ottavat yhteyttä tuomaristoon ja raportoivat tapahtumien kulusta pisteytystä varten. Nyt B putoaa pelistä, jolloin A alkaakin väijyä C:tä uutena kohteenaan. 
          Peliä pelataan näin kellon ympäri ennalta määrättyyn aikarajaan asti, jolloin pelin voittaja päätetään pisteillä. Pelin helpottamiseksi pelaajat jakavat muun muuassa kalentereitaan ja kotiosoitteitaan toisilleen Surmassa.</p>
          <p>Salamurhaturnaukseen osallistuminen aloitetaan ilmoittautumalla peliin Surman kautta, jonka jälkeen Surma lähettää lisäohjeita sähköpostilla. </p>
          <p>Lue lisää pelaajatiedoista ja niiden käsittelystä Surman tietosuojaselosteesta.</p> 
          <p>Lisätietoja salamurhaturnauksesta ja sen säännöistä saa taas <a href="https://salamurhaajat.net/mika-salamurhapeli">Helsingin yliopiston salamurhapelaajien alias HYSin nettisivuilta.</a></p>
        </AccordionDetails>
      </Accordion>
      </div>
    </div>
  </div>
  );
}