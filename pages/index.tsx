import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { AppBar, Container, Toolbar, Typography } from "@mui/material";
import logo from "/public/images/surma_logo.svg";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import TournamentInfoBox from "../components/TournamentInfoBox";

export const getStaticProps: GetStaticProps = async () => {
  const data = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true,
      startTime: true,
      endTime: true,
      registrationStartTime: true,
      registrationEndTime: true
    }
  });
  let tournaments = [];

  data.map((tournament) =>
    tournaments.push({
      ...tournament,
      startTime: tournament.startTime.toString(),
      endTime: tournament.endTime.toString(),
      registrationStartTime: tournament.registrationStartTime.toString(),
      registrationEndTime: tournament.registrationEndTime.toString()
    })
  );
  tournaments = JSON.parse(JSON.stringify(tournaments));
  return {
    props: { tournaments }
  };
  
};

const Home = ({ tournaments }) => {
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
    <>
      <AppBar position="static" sx={{ background: "#424242" }}>
        <Toolbar disableGutters>
          <Image src={logo} alt="logo" width={50} height={50} />

          <Typography
            variant="h6"
            noWrap
            sx={{
              m: 3,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".4rem",
              color: "inherit",
              textDecoration: "none"
            }}
          >
            SURMA
          </Typography>
          <button onClick={() => signIn("email", { callbackUrl: "/personal" })}>
            Kirjaudu sisään
          </button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{mt: 2, mb: 2}}>Tervetuloa Surmaan</Typography>
          (PLACEHOLDER) Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis elit mi. Mauris facilisis lacus ut nibh pretium convallis at vel velit. In in odio enim. Duis non neque non sem sodales commodo et eu elit. Integer in est fermentum, consequat massa in, scelerisque tortor. Cras ut neque ac mauris sagittis ornare id vel diam. Donec fermentum libero nunc, a sagittis magna egestas non. Sed euismod dictum dui a ultrices. Suspendisse nec libero elit. Integer blandit finibus lobortis. Donec sapien urna, accumsan sed risus a, hendrerit tempus nulla. Donec ipsum sem, pharetra sed euismod eu, euismod at arcu.

          Pellentesque non nisi vitae purus vehicula tempor. Sed tristique turpis non cursus tincidunt. Praesent bibendum nisi eget justo iaculis, eu varius dolor gravida. Donec iaculis ex at ligula condimentum tincidunt. Morbi quis condimentum diam. Sed bibendum a tortor at ultrices. Nam mattis ipsum at odio malesuada, sit amet laoreet mauris iaculis. Vestibulum vestibulum odio nisl, ac rhoncus lorem tincidunt nec. Proin porttitor volutpat urna non tempus. Vivamus eget turpis tristique, malesuada quam et, imperdiet ipsum. Ut rutrum nunc ex. Curabitur vel ligula posuere, consectetur dui id, tincidunt velit.
        <Typography variant="h4" sx={{mt: 2, mb: 2}}>Tulevat turnaukset</Typography>
        {tournaments.map((tournament) => (
          <TournamentInfoBox tournament={tournament} key={tournament.id}/>
        ))} 
      </Container>
    </>
  );
}

export default Home