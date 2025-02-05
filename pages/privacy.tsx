import Image from "next/image";
import logo from "/public/images/surma_logo.svg";
import { Box, Container } from "@mui/material";

export default function Privacy() {
  return (
    (<Container maxWidth="md">
      <Box>
        <Box sx={{ display: "flex", paddingTop: "20px" }}>
          <Image
            src={logo}
            width={75}
            height={75}
            alt="Slaughter logo"
            style={{
              paddingTop: "10px",
              paddingLeft: "5px",
              paddingRight: "10px",
              maxWidth: "100%",
              height: "auto"
            }} />
          <h1 style={{ marginLeft: "10px" }}>Tietosuojakäytäntö</h1>
        </Box>
        <Box sx={{ paddingTop: "5px" }}>
          <h2>Mikä Surma?</h2>
          <p>
            Surma on sovellus, jolla voi luoda, hallita ja ylläpitää
            salamurhaturnauksia. Salamurhaturnauksissa pelaajat yrittävät
            leikkisästi ”salamurhata” toisensa erinäisten tietojen avulla ja{" "}
            <a href="https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot">
              Helsingin yliopiston salamurhapelaajat ry:n turnaussääntöjen
            </a>{" "}
            puitteissa. Ilmoittautuessaan ja osallistuessaan
            salamurhaturnaukseen Surmassa, käyttäjä hyväksyy tietojensa käytön
            Surmassa seuraavan tietosuojakäytännön, Suomen kansallisen
            lainsäädännön ja Euroopan unionin tietosuoja-asetuksen mukaisesti
            salamurhaturnauksen järjestämistä ja Surman ylläpitämistä varten.
          </p>
          <h2>Tietolähteet</h2>
          <p>
            Käyttäjän tiedot kerätään kahdella lomakkeella ja evästeillä.
            Ensimmäisen lomakkeen käyttäjä täyttää ilmoittautuessaan
            salamurhaturnaukseen Surmassa (jatkossa “ilmoittautumislomake”) ja
            toisen lomakkeen käyttäjä täyttää ilmoittautumisen jälkeen Surmassa
            (jatkossa “osallistumislomake”). Turnaukseen ilmoittautuminen ja
            osallistuminen on vapaaehtoista. Evästeet käyttäjästä luodaan
            lomakkeiden täytön ja Surman käytön yhteydessä.
          </p>
          <h2>Kerättävät tiedot</h2>
          <p>Ilmoittautumislomakkeella kerättävät käyttäjän tiedot ovat:</p>
          <ul>
            <li>etu- ja sukunimi</li>
            <li>sähköpostiosoite</li>
            <li>puhelinnumero</li>
            <li>
              suostumus tietojen käsittelystä tämän tietosuojailmoituksen
              mukaisesti ja
            </li>
            <li>aikaleima, milloin käyttäjä täytti lomakkeen.</li>
          </ul>
          <p>Osallistumislomakkeella kerättävät käyttäjän tiedot ovat:</p>
          <ul>
            <li>turnauskohtainen anonyymi peitenimi</li>
            <li>pituus</li>
            <li>omakuva</li>
            <li>osoite</li>
            <li>oppilaitos</li>
            <li>kalenteri</li>
            <li>ammattilaistaso</li>
            <li>vapaa kuvaus silmistä</li>
            <li>vapaa kuvaus hiuksista ja</li>
            <li>
              turvallisuushuomiot (esim. pelin ulkopuolelle rajatut ajat ja
              paikat)
            </li>
            <li>muut vapaavalintaiset tiedot (esim.kulkuneuvot)</li>
            <li>
              suostumus tietojen käsittelystä tämän tietosuojailmoituksen
              mukaisesti ja
            </li>
            <li>aikaleima, milloin käyttäjä täytti lomakkeen.</li>
          </ul>
          <p>
            Lisäksi Surma kerää seuraavia evästeitä käyttäjäkohtaisesti
            käyttäjän käyttäessä Surmaa:
          </p>
          <ul>
            <li>
              aikaleima, milloin käyttäjä on viimeksi kirjautunut Surmaan ja
            </li>
            <li>
              aikaleima, milloin käyttäjä on viimeksi muokannut tietojaan
              Surmassa.
            </li>
          </ul>
          <h2>Perusteet ja käyttötarkoitukset</h2>
          <p>
            Ylläpitäjät käyttävät seuraavia tietoja Euroopan tietosuoja-asetusta
            varten (suostumus):
          </p>
          <ul>
            <li>etu- ja sukunimi</li>
            <li>sähköpostiosoite</li>
            <li>puhelinnumero</li>
            <li>suostumus tietojen käsittelystä ja</li>
            <li>
              aikaleimat ilmoittautumis- ja osallistumislomakkeen täytöistä.
            </li>
          </ul>
          <p>
            Ylläpitäjät ja tuomaristo käyttävät seuraavia tietoja Surman ja
            salamurhaturnauksen ylläpitämiseen (suostumus):
          </p>
          <ul>
            <li>aikaleima käyttäjän edellisestä kirjautumisesta Surmaan ja</li>
            <li>
              aikaleima edellisestä kerrasta, jolloin käyttäjä on muokannut
              tietojaan Surmassa.
            </li>
          </ul>
          <p>
            Tuomaristo käyttää seuraavia tietoja salamurhaturnauksen sisäiseen
            ja käyttäjäkohtaiseen viestintään (suostumus):
          </p>
          <ul>
            <li>etu- ja sukunimi</li>
            <li>sähköpostiosoite ja</li>
            <li>puhelinnumero.</li>
          </ul>
          <p>
            Tuomaristo käyttää seuraavia tietoja salamurhaturnauksen avoimeen ja
            julkiseen viestintään turnauksen tapahtumasivulla (suostumus):
          </p>
          <ul>
            <li>turnauskohtainen anonyymi peitenimi.</li>
          </ul>
          <p>
            Tuomaristo ja muut pelaajat käyttävät seuraavia tietoja käyttäjän
            tunnistamiseen turnauksessa sekä turnauksen pelaamista ja
            ylläpitämistä varten (suostumus):
          </p>
          <ul>
            <li>etu- ja sukunimi</li>
            <li>pituus</li>
            <li>omakuva</li>
            <li>osoite</li>
            <li>oppilaitos</li>
            <li>kalenteri</li>
            <li>ammattilaistaso</li>
            <li>vapaa kuvaus silmistä</li>
            <li>vapaa kuvaus hiuksista ja</li>
            <li>
              turvallisuushuomiot (esim. pelin ulkopuolelle rajatut ajat ja
              paikat) ja
            </li>
            <li>muut vapaavalintaiset annetut tiedot (esim. kulkuneuvot).</li>
          </ul>
          <h2>Säilytysaika</h2>
          <p>
            Käyttäjän turnauskohtainen anonyymi peitenimi julkaistaan turnauksen
            tapahtumasivulla toistaiseksi, joka on erillinen nettisivu Surmasta.
            Kaikkea muuta Surmassa kerättyä dataa käytetään vain
            salamurhaturnauksen ajan ja se tuhotaan salamurhaturnauksen
            päätyttyä.
          </p>
          <h2>Käyttäjän oikeudet</h2>
          <h3>
            Oikeus tietää, mitä tietoja on kerätty ja siirtää tiedot muualle
          </h3>
          <p>
            Kaikki kerätyt tiedot käyttäjästä ovat saatavilla tarvittaessa JSON-
            ja CSV-muodoissa käyttäjän pyynnöstä. Käyttäjä voi kysyä tietoja
            rekisterin käsittelijöiltä. Käyttäjän toivotaan kuvailevan tarkasti,
            koskeeko pyyntö vain Surman tietoja vai myös palveluntarjoajiemme
            tietoja. Toimitamme tiedot mahdollisimman nopeasti. Ilmoitamme
            arvioidun toimitusajan pyynnön laajuuden perusteella. Käyttäjä voi
            välittää saamansa tiedot toiselle rekisterinpitäjälle.
          </p>
          <h3>Oikeus oikaista tietoja</h3>
          <p>
            Käyttäjän antama data oletetaan oikeaksi sellaisenaan. Tuomaristo
            voi halutessaan varmistaa käyttäjältä tietojen oikeellisuuden.
            Käyttäjä voi myös itse muokata osallistumislomakkeen tietoja
            Surmassa peitenimeä lukuun ottamatta. Muissa tapauksissa käyttäjä
            voi ottaa yhteyttä rekisterin käsittelijöihin.
          </p>
          <h3>Oikeus tulla unohdetuksi</h3>
          <p>
            Käyttäjä voi tulla unohdetuksi milloin tahansa osoittamalla pyynnön
            rekisterin käsittelijöille. Jos käyttäjän data poistetaan, myös
            käyttäjän turnausosallistuminen peruuntuu.
          </p>
          <h3>Oikeus vastustaa tai rajoittaa tietojen käsittelyä</h3>
          <p>
            Käyttäjä voi vastustaa tai rajoittaa henkilötietojensa käsittelyä
            niin halutessaan tässä tietosuojailmoituksessa mainittuihin
            tarkoituksiin osoittamalla pyynnön rekisterin käsittelijöille.
            Henkilötietojen käsittelyn rajoittaminen tai vastustaminen johtaa
            käyttäjän turnausosallistumisen peruuntumiseen ja tietojen
            säilyttämiseen turnauksen loppumiseen asti.
          </p>
          <h2>Kolmannet tahot</h2>
          <p>
            <a href="https://eur-lex.europa.eu/legal-content/FI/TXT/?uri=CELEX%3A32016R0679">
              Euroopan unionin tietosuoja-asetus
            </a>{" "}
            takaa käyttäjälle useita oikeuksia, joiden avulla käyttäjä voi itse
            usein määrätä tietojensa käsittelystä kolmansilla tahoilla. Alla on
            lisätietoa Surman tietojen käsittelystä kolmansilla tahoilla.
          </p>
          <p>
            Surmassa kerätyt tiedot siirtyvät käytettyjen palveluntarjoajien
            kautta EU:n ulkopuolelle kolmansille tahoille. Tietoja siirretään
            palveluntarjoajille vain siinä laajuudessa, kuin he tarvitsevat
            voidakseen tarjota palveluitaan tämän tietosuojailmoituksen
            määrittelemissä tarkoituksissa. Palveluntarjoajat on valittu
            huolellisesti ja heidän vastuullisuutensa tietosuojan suhteen
            huomioiden.
          </p>
          <p>
            Surmassa kerättyjä tietoja siirretään muille käyttäjille vain siinä
            laajuudessa, kuin he tarvitsevat voidakseen osallistua turnaukseen.
          </p>
          <p>
            Käyttäjän tietoja säilytetään Surman PostgreSQL-tietokannassa, jota
            ylläpidetään ilmaiseksi Vercelillä. Vercel on amerikkalaisomisteinen
            yhtiö. Surman tietokantapalvelin sijaitsee Washingtonissa, USA:ssa.
          </p>
          <p>
            <a href="https://vercel.com/legal/privacy-policy">
              Vercelin, Surman tietokantapalvelimen tarjoajan,
              tietosuojailmoitus englanniksi
            </a>
            .
          </p>
          <p>
            Surman käyttöliittymän palvelinta ylläpidetään suomalaisomisteisen
            Suncometin kautta. Suncometin palvelimet ovat ympäri maailmaa, mutta
            kotisivumme on ensisijaisesti C1-palvelimella.
            <a href="https://suncomet.fi/osoitteet/">
              Suncometin, Surman käyttöliittymän ja kotisivujen ylläpidon
              tarjoajan, palvelintiedot suomeksi
            </a>
            .
          </p>
          <p>
            Turnauksen tapahtumasivu on osana HYSin kotisivuja julkaistu
            ilmaiseksi WordPress.orgilla, joka on avoimen lähdekoodin
            ohjelmisto. WordPressin palvelinta ylläpidetään suomalaisomisteisen
            Suncometin kautta. WordPress Foundation, joka on voittoa
            tavoittelematon organisaatio Yhdysvalloissa, omistaa WordPressin ja
            varmistaa ohjelmiston avoimen saatavuuden.
          </p>
          <p>
            <a href="https://wordpress.org/about/privacy/">
              WordPressin, kotisivujen editointiohjelmiston tarjoajan,
              tietosuojailmoitus englanniksi
            </a>
            .
          </p>
          <p>
            <a href="https://salamurhaajat.net/tietosuojakaytanto">
              Kotisivujen tietosuojailmoitus suomeksi
            </a>
            .
          </p>
          <p>
            Käyttäjän tietoja ei luovuteta muille kolmansille osapuolille muista
            kuin oikeudellisista syistä:
          </p>
          <ul>
            <li>
              soveltuvan lainsäädännön ja/tai oikeuden määräyksen täyttämiseksi;
            </li>
            <li>
              väärinkäytöksen, turvallisuusriskin tai teknisen ongelman
              havaitsemiseen, estämiseen tai käsittelemiseen.
            </li>
          </ul>
          <h2>Yhteystiedot</h2>
          <p>
            Kysymykset rekisteristä ja Surman vikatilanteista ohjataan Surman
            kehittäjille. Kysymykset turnauksesta ohjataan tuomaristolle.
          </p>
          <ul>
            <li>Rekisterinpitäjä</li>
            <ul>
              <li>Helsingin yliopiston salamurhapelaajat ry</li>
              <li>Y-tunnus: 3237069-8</li>
              <li>Osoite: Mechelininkatu 3D, 00100 Helsinki</li>
              <li>
                Yhdistyksen tietosuojavastaavan sähköposti:{" "}
                <a href="mailto:gdpr@salamurhaajat.net">
                  gdpr@salamurhaajat.net
                </a>
              </li>
            </ul>
            <li>Rekisterin käsittelijät</li>
            <ul>
              <li>
                Surman ylläpitäjien ja kehittäjien sähköposti:{" "}
                <a href="mailto:surma@salamurhaajat.net">
                  surma@salamurhaajat.net
                </a>
              </li>
              <li>
                Salamurhaturnauksen tuomariston sähköposti:{" "}
                <a href="mailto:tuomaristo@salamurhaajat.net">
                  tuomaristo@salamurhaajat.net
                </a>
              </li>
            </ul>
          </ul>
          <p>
            Jos henkilötietojesi käsittelyssä on mielestäsi rikottu
            tietosuojalainsäädäntöä, sinulla on oikeus tehdä valitus
            valvontaviranomaiselle rekisterinpitäjän toteuttamasta
            henkilötietojen käsittelystä. Valitus tehdään toimivaltaiselle
            valvontaviranomaiselle, Suomessa tietosuojavaltuutetulle tämän
            antamien ohjeiden mukaisesti. Lisätietoja löydät{" "}
            <a href="https://tietosuoja.fi/etusivu">
              tietosuojavaltuutetun verkkosivuilta
            </a>
            .
          </p>
        </Box>
      </Box>
    </Container>)
  );
}
