import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import styles from "../../styles/Home.module.css";
import Link from "next/link";

const InfoAccordion = () => {
  return (
    <div>
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
            <Link href="/privacy">Surman tietosuojakäytännöstä</Link>.
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
};
export default InfoAccordion;
