import { GetServerSideProps } from "next";
import prisma from "../../../../lib/prisma";
import { Alert, Button, useMediaQuery, useTheme } from "@mui/material";
import { AuthenticationRequired } from "../../../../components/AuthenticationRequired";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../../api/auth/[...nextauth]";
import { v2 as cloudinary } from "cloudinary";
import DesktopView from "../../../../components/PlayerPage/DesktopView";
import MobileView from "../../../../components/PlayerPage/MobileView";
import PlayerForm from "../../../../components/Registration/PlayerForm";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { UserProvider } from "../../../../components/UserProvider";

const isCurrentUserAuthorized = async (currentUser, userId, tournamentId) => {
  return (
    currentUser.id == userId ||
    (currentUser != null &&
      currentUser.umpire != null &&
      currentUser.umpire.tournamentId == tournamentId)
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  ...context
}) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authConfig
  );

  let currentUser = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      id: true,
      umpire: true
    }
  });

  if (
    !(await isCurrentUserAuthorized(
      currentUser,
      params.id,
      params.tournamentId
    ))
  )
    return { redirect: { destination: "/personal", permanent: false } };

  let user = await prisma.user.findUnique({
    where: {
      id: params.id as string
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      tournamentId: true,
      player: {
        select: {
          id: true,
          alias: true,
          address: true,
          learningInstitution: true,
          eyeColor: true,
          hair: true,
          height: true,
          other: true,
          calendar: true,
          lastVisit: true,
          title: true,
          confirmed: true,
          state: true,
          safetyNotes: true,
          umpire: {
            select: {
              id: true,
              responsibility: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  let tournament = await prisma.tournament.findUnique({
    where: { id: params.tournamentId as string }
  });

  const umpires = await prisma.umpire.findMany({
    select: {
      id: true,
      responsibility: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          email: true
        }
      }
    }
  });

  let imageUrl = "";
  try {
    const result = await cloudinary.api.resource(
      `surma/${user.tournamentId}/${user.player.id}` as string
    );
    imageUrl = result.url;
  } catch (error) {
    console.log(error);
  }

  user = JSON.parse(JSON.stringify(user));
  currentUser = JSON.parse(JSON.stringify(currentUser));
  tournament = JSON.parse(JSON.stringify(tournament));

  return {
    props: {
      user,
      tournament,
      imageUrl,
      currentUserIsUmpire: currentUser.umpire != null,
      umpires,
      currentUser
    }
  };
};

export default function User({
  user: u,
  tournament,
  imageUrl,
  currentUserIsUmpire,
  umpires,
  currentUser
}): JSX.Element {
  const [user, setUser] = useState(u);
  const [confirmed, setConfirmed] = useState(
    user.player ? user.player.confirmed : false
  );
  const session = useSession();
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));

  if (session.status === "loading") return null;

  if (!Boolean(user.player) && user.id !== session.data.user.id) {
    return (
      <div style={{ margin: 2 }}>
        <h3>Pelaaja ei ole vielä täyttänyt tietojaan</h3>
        ```
        <p>
          Nimi: {user.firstName} {user.lastName}
        </p>
        <p>Sähköpostiosoite: {user.email}</p>
        <p>Puhelinnumero: {user.phone}</p>
      </div>
    );
  }

  if (!Boolean(user.player)) {
    return <PlayerForm tournament={user.tournament} />;
  }

  const handleConfirmRegistration = async () => {
    const id = user.player.id;
    const data = { confirmed: true };
    await fetch(`/api/player/${id}/confirm`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
    setConfirmed(true);
  };

  return (
    <AuthenticationRequired>
      <UserProvider user={user}>
        {!user.player.confirmed && (
          <Alert
            severity="warning"
            sx={{ minHeight: "50px", display: "flex", alignItems: "center" }}
          >
            Tuomaristo ei ole vielä hyväksynyt ilmoittautumista
            {currentUserIsUmpire && (
              <Button
                onClick={() => handleConfirmRegistration()}
                variant="outlined"
                color="error"
                sx={{ ml: 1 }}
                disabled={confirmed}
              >
                Hyväksy ilmoittautuminen
              </Button>
            )}
          </Alert>
        )}
        {isMobileView ? (
          <MobileView
            setUser={setUser}
            tournament={tournament}
            imageUrl={imageUrl}
            currentUserIsUmpire={currentUserIsUmpire}
            currentUserId={currentUser.id}
            umpires={umpires}
          />
        ) : (
          <DesktopView
            setUser={setUser}
            tournament={tournament}
            imageUrl={imageUrl}
            currentUserIsUmpire={currentUserIsUmpire}
            currentUserId={currentUser.id}
            umpires={umpires}
          />
        )}
      </UserProvider>
    </AuthenticationRequired>
  );
}
