import { GetServerSideProps } from "next";
import prisma from "../../../../lib/prisma";
import { useState } from "react";
import NavigationBar from "../../../../components/NavigationBar";
import { Alert, Button, useMediaQuery, useTheme } from "@mui/material";
import { AuthenticationRequired } from "../../../../components/AuthenticationRequired";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../../api/auth/[...nextauth]";
import { v2 as cloudinary } from "cloudinary";
import DesktopView from "../../../../components/PlayerPage/DesktopView";
import MobileView from "../../../../components/PlayerPage/MobileView";
import PlayerForm from "../../../../components/Registration/PlayerForm";
import { useSession } from "next-auth/react";

const isCurrentUserAuthorized = async (currentUser, userId, tournamentId) => {
  return (
    currentUser.id == userId ||
    (currentUser != null &&
      currentUser.umpire != null &&
      currentUser.umpire.tournamentId == tournamentId)
  );
};

const isTournamentRunning = (startTime: Date, endTime: Date) => {
  const currentTime = new Date().getTime();
  return startTime.getTime() < currentTime && currentTime < endTime.getTime();
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
          targets: {
            select: {
              target: {
                select: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          },
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
      },
      tournament: {
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
          registrationStartTime: true,
          registrationEndTime: true
        }
      }
    }
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
    const result = await cloudinary.api.resource(user.player.id as string);
    imageUrl = result.url;
  } catch (error) {
    console.log(error);
  }

  user = JSON.parse(JSON.stringify(user));
  currentUser = JSON.parse(JSON.stringify(currentUser));
  const tournament = user.tournament;

  return {
    props: {
      user,
      tournament,
      imageUrl,
      targets: isTournamentRunning(
        new Date(tournament.startTime),
        new Date(tournament.endTime)
      )
        ? user.player.targets
        : [],
      currentUserIsUmpire: currentUser.umpire != null,
      umpires,
      currentUser
    }
  };
};

export default function User({
  user,
  tournament,
  imageUrl,
  targets = [],
  currentUserIsUmpire,
  umpires,
  currentUser
}): JSX.Element {
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

  let targetUsers = [];

  if (targets.length > 0) {
    targetUsers = user.player.targets.map(
      (assignment) => assignment.target.user
    );
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
      <div>
        <NavigationBar
          targets={targetUsers}
          userId={user.id}
          tournamentId={user.tournamentId}
          currentUserIsUmpire={currentUserIsUmpire}
        />
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
            user={user}
            tournament={tournament}
            imageUrl={imageUrl}
            currentUserIsUmpire={currentUserIsUmpire}
            currentUserId={currentUser.id}
            umpires={umpires}
          />
        ) : (
          <DesktopView
            user={user}
            tournament={tournament}
            imageUrl={imageUrl}
            currentUserIsUmpire={currentUserIsUmpire}
            currentUserId={currentUser.id}
            umpires={umpires}
          />
        )}
      </div>
    </AuthenticationRequired>
  );
}
