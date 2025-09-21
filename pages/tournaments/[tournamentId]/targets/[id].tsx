import { GetServerSideProps } from "next";
import prisma from "../../../../lib/prisma";
import React, { useEffect, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { AuthenticationRequired } from "../../../../components/AuthenticationRequired";
import { Session, unstable_getServerSession } from "next-auth";
import { authConfig } from "../../../api/auth/[...nextauth]";
import { v2 as cloudinary } from "cloudinary";
import DesktopView from "../../../../components/PlayerPage/DesktopView";
import MobileView from "../../../../components/PlayerPage/MobileView";
import { Tournament } from "@prisma/client";
import { UserProvider } from "../../../../components/UserProvider";
import { useRouter } from "next/router";
import LoadingSpinner from "../../../../components/Common/LoadingSpinner";
import { useRouterLoading } from "../../../../lib/hooks";

const isTournamentRunning = (startTime: Date, endTime: Date) => {
  const currentTime = new Date().getTime();
  return startTime.getTime() < currentTime && currentTime < endTime.getTime();
};

const isCurrentUserAuthorized = async (
  tournament: Tournament,
  targetId: string,
  session: Session
) => {
  const isUmpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: tournament.id
    }
  });

  const isHunter = await prisma.assignment.findFirst({
    where: {
      target: {
        user: {
          id: targetId
        }
      },
      hunter: {
        user: {
          id: session.user.id
        }
      }
    }
  });

  return (
    isUmpire ||
    (isTournamentRunning(tournament.startTime, tournament.endTime) && isHunter)
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

  const { id: userId, tournamentId } = params;

  let tournament = await prisma.tournament.findUnique({
    where: {
      id: tournamentId as string
    }
  });

  if (!(await isCurrentUserAuthorized(tournament, userId as string, session))) {
    return { redirect: { destination: "/personal", permanent: false } };
  }

  let currentUser = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      id: true,
      umpire: true,
      player: {
        select: {
          state: true
        }
      }
    }
  });

  let user = await prisma.user.findUnique({
    where: {
      id: params.id as string
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      player: {
        select: {
          id: true,
          alias: currentUser.player.state === "DETECTIVE" ? true : false,
          address: true,
          learningInstitution: true,
          eyeColor: true,
          hair: true,
          height: true,
          other: true,
          calendar: true,
          title: true,
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
      `surma/${tournament.id}/${user.player.id}` as string
    );
    imageUrl = result.url;
  } catch (error) {
    console.log(error);
  }

  tournament = JSON.parse(JSON.stringify(tournament));

  return {
    props: {
      currentUser,
      user,
      tournament,
      imageUrl,
      currentUserIsUmpire: currentUser.umpire != null,
      currentUserIsDetective: currentUser.player.state === "DETECTIVE",
      umpires
    }
  };
};

export default function Target({
  user: u,
  tournament,
  imageUrl,
  currentUserIsUmpire,
  currentUserIsDetective,
  umpires,
  currentUser
}): JSX.Element {
  const [user, setUser] = useState(u);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));

  const isLoading = useRouterLoading();

  if (isLoading) return <LoadingSpinner />;

  return (
    <AuthenticationRequired>
      <UserProvider user={user}>
        {isMobileView ? (
          <MobileView
            setUser={setUser}
            tournament={tournament}
            imageUrl={imageUrl}
            currentUserIsUmpire={currentUserIsUmpire}
            umpires={umpires}
            currentUserIsHunter={true}
            currentUserIsDetective={currentUserIsDetective}
            currentUserId={currentUser.id}
          />
        ) : (
          <DesktopView
            setUser={setUser}
            tournament={tournament}
            imageUrl={imageUrl}
            currentUserIsUmpire={currentUserIsUmpire}
            umpires={umpires}
            currentUserIsHunter={true}
            currentUserIsDetective={currentUserIsDetective}
            currentUserId={currentUser.id}
          />
        )}
      </UserProvider>
    </AuthenticationRequired>
  );
}
