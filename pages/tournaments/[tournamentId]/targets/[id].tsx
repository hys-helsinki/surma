import { GetServerSideProps } from "next";
import prisma from "../../../../lib/prisma";
import React from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { AuthenticationRequired } from "../../../../components/AuthenticationRequired";
import { Session, unstable_getServerSession } from "next-auth";
import { authConfig } from "../../../api/auth/[...nextauth]";
import { v2 as cloudinary } from "cloudinary";
import NavigationBar from "../../../../components/NavigationBar";
import DesktopView from "../../../../components/PlayerPage/DesktopView";
import MobileView from "../../../../components/PlayerPage/MobileView";
import { Tournament } from "@prisma/client";

const isTournamentRunning = (startTime: Date, endTime: Date) => {
  const currentTime = new Date();
  return (
    startTime.getTime() < currentTime.getTime() &&
    currentTime.getTime() < endTime.getTime()
  );
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
          state: true,
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
          }
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
    const result = await cloudinary.api.resource(params.id as string);
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
      targets: isTournamentRunning(
        new Date(tournament.startTime),
        new Date(tournament.endTime)
      )
        ? currentUser.player.targets
        : [],
      currentUserIsUmpire: currentUser.umpire != null,
      umpires
    }
  };
};

export default function Target({
  user,
  currentUser,
  tournament,
  imageUrl,
  targets = [],
  currentUserIsUmpire,
  umpires
}): JSX.Element {
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));

  let targetUsers = [];

  if (targets.length > 0) {
    targetUsers = currentUser.player.targets.map(
      (assignment) => assignment.target.user
    );
  }

  return (
    <AuthenticationRequired>
      <div>
        <NavigationBar
          targets={targetUsers}
          userId={currentUser.id}
          tournamentId={tournament.id}
          currentUserIsUmpire={currentUserIsUmpire}
        />
        {isMobileView ? (
          <MobileView
            user={user}
            tournament={tournament}
            imageUrl={imageUrl}
            currentUserIsUmpire={currentUserIsUmpire}
            umpires={umpires}
            currentUserIsHunter={true}
          />
        ) : (
          <DesktopView
            user={user}
            tournament={tournament}
            imageUrl={imageUrl}
            currentUserIsUmpire={currentUserIsUmpire}
            umpires={umpires}
            currentUserIsHunter={true}
          />
        )}
      </div>
    </AuthenticationRequired>
  );
}
