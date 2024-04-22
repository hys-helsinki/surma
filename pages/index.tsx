import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { AppBar, Box, Button, Collapse, Container, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import logo from "/public/images/surma_logo.svg";
import { useState } from "react";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";

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
  const [open, setOpen] = useState(false);

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
          <Box key={tournament.id} sx={{border: "solid", borderColor: "white", padding: "15px"}}>
            <Stack direction="row" gap={2} alignItems="center">
              <IconButton 
                onClick={() => setOpen(!open)} color="inherit"
              > 
                {open ? <KeyboardArrowUpIcon fontSize="large" /> 
                    : <KeyboardArrowDownIcon fontSize="large" />} 
              </IconButton> 
              <Box>{tournament.name}</Box>
              <Box>{tournament.startTime}-
              {tournament.endTime}</Box>
              <button>Ilmoittautuminen auki!</button>
            </Stack>
            <Collapse in={open} timeout="auto"
              unmountOnExit>     
                <Box sx={{m: 5}}>Tähän turnauksen grafiikkaa?? :thinking:</Box>  
                <Box sx={{m: 2}}>Turnauksen kuvaus tähän: (lisää placeholderia) Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ultrices elit ut purus pulvinar dapibus. Nunc fringilla turpis diam. In hac habitasse platea dictumst. Donec vel lectus ac ex viverra sodales. Nullam viverra elementum mauris, nec tempus ante ultrices sit amet. Fusce malesuada massa id orci consectetur tempor. Phasellus ut lorem eget odio hendrerit euismod. Ut in mauris magna. Nulla facilisi. Etiam ac odio elit. Fusce turpis libero, egestas at lobortis non, mattis sed ante. Maecenas tempus facilisis dui, congue imperdiet lorem hendrerit sit amet.</Box>
                <Box sx={{m: 2}}>Ilmoittaumisaika: {tournament.registrationStartTime} - {tournament.registrationEndTime}</Box>
            </Collapse>
          </Box>
        ))} 
      </Container>
    </>
  );
}

export default Home