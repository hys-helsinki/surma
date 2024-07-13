import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import Link from "next/link";
import logo from "/public/images/surma_logo.svg";
import { text } from "stream/consumers";

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true
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
    return (
      <div className={styles.container}>
        <h1>Surma (Murhamaster 3.0)</h1>
        <button onClick={() => signOut()}>Kirjaudu ulos</button>
      </div>
    );
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
      <h2> Mikä on Surma? </h2>
      <p> Surma on leikkisten salamurhaturnausten ylläpitämiseen tarkoitettu ohjelma, jota ylläpitää ja kehittää Helsingin yliopiston salamurhapelaajat ry:n aktiivit eli GitHubin <a href="https://github.com/hys-helsinki">hys-helsinki -organisaatio.</a> Surmaa käytetään salamurhaturnauksien ylläpitämiseen: pelaajat jakavat tietoja toisilleen Surman kautta turnauksen ajan. </p>

      <h2> Mikä on salamurhaturnaus? </h2>
      <p> Salamurhaturnauksessa pelaajat elävät arkista elämäänsä samalla kun he pyrkivät hankkiutumaan muiden ihmisten huomaamatta olosuhteisiin, joissa voivat soveltaa toisiin pelaajiin sääntöjen sallimaa kirjoa leikkimielisiä aseenkorvikkeita. 
        Turnausta pelataan osallistujien kesken murharingeittäin: pelaaja A:n tavoite on salamurhata kohde eli pelaaja B, pelaaja B saalistaa pelaaja C:tä ja niin edelleen aina pelaajaan N asti, joka väijyy pelaajaa A. 
        Mikäli A onnistuu murhaamaan B:n sääntöjen sallimalla tavalla, A ja B ottavat yhteyttä tuomaristoon ja raportoivat tapahtumien kulusta pisteytystä varten. Nyt B putoaa pelistä, jolloin A alkaakin väijyä C:tä uutena kohteenaan. 
        Peliä pelataan näin kellon ympäri ennalta määrättyyn aikarajaan asti, jolloin pelin voittaja päätetään pisteillä. Pelin helpottamiseksi pelaajat jakavat muun muuassa kalentereitaan ja kotiosoitteitaan toisilleen Surmassa.</p>
      <p> Lue lisää pelaajatiedoista ja niiden käsittelystä Surman tietosuojaselosteesta.</p> 
      <p> Lisätietoja salamurhaturnauksesta ja sen säännöistä saa taas <a href="https://salamurhaajat.net/mika-salamurhapeli">Helsingin yliopiston salamurhapelaajien alias HYSin nettisivuilta.</a></p>
      
      <h2> Avoimet salamurhaturnaukset </h2>
      <p> Salamurhaturnaukseen osallistuminen aloitetaan ilmoittautumalla peliin Surman kautta, jonka jälkeen Surma lähettää lisäohjeita sähköpostilla. </p>
      <p> Alla on lista turnauksista, joihin on ilmoittautuminen auki. </p>
      {tournaments.map((tournament) => (
        <div key={tournament.id}>
          <Link href={`/registration/${tournament.id}`}>
            <ul>
              <li> <a>{tournament.name}</a> </li>
            </ul>
          </Link>
        </div>
      ))}
      </div>
    </div>
  </div>
  );
}
