import { GetServerSideProps } from "next";
import prisma from "../../../../lib/prisma";
import React, { MouseEventHandler } from "react";
import { useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { AuthenticationRequired } from "../../../../components/AuthenticationRequired";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../../api/auth/[...nextauth]";
import { v2 as cloudinary } from "cloudinary";
import NavigationBar from "../../../../components/NavigationBar";
import DesktopView from "../../../../components/PlayerPage/DesktopView";
import MobileView from "../../../../components/PlayerPage/MobileView";

const isCurrentUserAuthorized = async (
  tournamentId,
  targetId,
  context,
  session
) => {
  const isUmpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: tournamentId
    }
  });

  const tournament = await prisma.tournament.findUnique({
    select: {
      startTime: true,
      endTime: true
    },
    where: {
      id: tournamentId
    }
  });

  // const currentTime = new Date();
  // const isTournamentRunning =
  //   tournament.startTime.getTime() < currentTime.getTime() &&
  //   currentTime.getTime() < tournament.endTime.getTime();

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

  return isUmpire || isHunter;
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

  if (
    !(await isCurrentUserAuthorized(
      params.tournamentId,
      params.id,
      context,
      session
    ))
  ) {
    return { redirect: { destination: "/personal", permanent: false } };
  }

  let imageUrl = "";
  try {
    const result = await cloudinary.api.resource(params.id as string);
    imageUrl = result.url;
  } catch (error) {
    console.log(error);
  }

  let currentUser = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      id: true,
      umpire: true,
      tournament: {
        select: {
          startTime: true,
          endTime: true,
          id: true
        }
      },
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

  currentUser = JSON.parse(JSON.stringify(currentUser));

  let tournament = currentUser.tournament;

  // const player = await prisma.player.findUnique({
  //   where: {
  //     userId: params.id as string
  //   },
  //   select: {
  //     alias: true,
  //     address: true,
  //     learningInstitution: true,
  //     eyeColor: true,
  //     hair: true,
  //     height: true,
  //     other: true,
  //     title: true,
  //     calendar: true,
  //     user: {
  //       select: {
  //         firstName: true,
  //         lastName: true
  //       }
  //     },
  //     umpire: {
  //       select: {
  //         user: {
  //           select: {
  //             firstName: true,
  //             lastName: true,
  //             phone: true,
  //             email: true
  //           }
  //         }
  //       }
  //     }
  //   }
  // });

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
          security: true,
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

  let targets = [];
  if (
    currentUser.player &&
    new Date().getTime() > new Date(tournament.startTime).getTime()
  ) {
    targets = currentUser.player.targets;
  }

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

  return {
    props: {
      currentUser,
      user,
      tournament,
      imageUrl,
      targets,
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
  const matches = useMediaQuery(theme.breakpoints.down("md"));

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
          userId={user.id}
          tournamentId={user.tournamentId}
          currentUserIsUmpire={currentUserIsUmpire}
        />
        {matches ? (
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
