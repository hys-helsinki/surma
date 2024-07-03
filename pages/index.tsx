import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  if (session) {
    return (
      <div className={styles.container}>
        <h1>Surma (Murhamaster 3.0)</h1>
        <button onClick={() => signOut()}>Kirjaudu ulos</button>
      </div>
    );
  }
  return (
      <div className={styles.main}>
      <h1>Surma (Murhamaster 3.0)</h1>
      <img alt="Surman logo / Slaughter's logo" style={{ width: "auto" }} src="~/public/images/surma_logo.svg" />
      <p>Surma on leikkisten salamurhaturnausten ylläpitämiseen tarkoitettu ohjelma, jota ylläpitää ja kehittää Helsingin yliopiston salamurhapelaajat ry:n aktiivit eli GitHubin <a href="https://github.com/hys-helsinki">hys-helsinki -organisaatio</a>.
        Surmaa käytetään salamurhaturnauksien ylläpitämiseen: pelaajat jakavat tietoja toisilleen Surman kautta turnauksen ajan.</p>

      <h2> Mikä on salamurhaturnaus? </h2>
      <p>Salamurhaturnauksessa pelaajat saalistavat toisiaan ja pyrkivät hankkiutumaan olosuhteisiin, joissa voivat soveltaa toisiinsa sääntöjen sallimaa kirjoa leikkimielisiä aseenkorvikkeita.
      Turnauksessa peliä pelataan osallistujien kesken murharingeittäin: pelaaja A:n tavoite on salamurhata kohde eli pelaaja B, pelaaja B saalistaa pelaaja C:tä ja niin edelleen aina pelaajaan N asti, joka väijyy pelaajaa A.
      Mikäli A onnistuu murhaamaan B:n sääntöjen sallimalla tavalla, A ja B ottavat yhteyttä tuomaristoon ja raportoivat tapahtumien kulusta pisteytystä varten. Nyt B putoaa pelistä, jolloin A alkaakin väijyä C:tä seuraavaksi uutena kohteenaan.
      Peliä pelataan näin ennalta määrättyyn aikarajaan asti, jolloin pelin voittaja päätetään pisteillä. Pelin helpottamiseksi pelaajat jakavat muun muuassa kalentereitaan ja kotiosoitteitaan toisilleen Surmassa.
      <br /> Lue lisää pelaajatiedoista ja niiden käsittelystä <a href="">Surman tietosuojaselosteesta</a>. 
      <br /> Lisätietoja salamurhaturnauksesta ja sen säännöistä saa taas <a href="https://salamurhaajat.net/mika-salamurhapeli">Helsingin yliopiston salamurhapelaajien, lyhyemmin HYSin, nettisivuilta.</a></p>
      
      <h2> Avoimet turnaukset </h2>
      <p> Salamurhaturnaukseen osallistuminen aloitetaan ilmoittautumalla peliin Surman kautta, jonka jälkeen Surma lähettää lisäohjeita sähköpostilla.
      <br /> Alla on lista turnauksista, joihin on ilmoittautuminen auki.</p>
      <ul>
        <li>Syysturnaus 2024: Taivaallisten taistelu / Celestials' clash, 14.-31.10.2024</li>
      </ul>

      Et ole kirjautunut sisään.
      <button onClick={() => signIn("email", { callbackUrl: "/personal" })}>
        Kirjaudu sisään
      </button>
    </div>
  );
}
