import { GetServerSideProps } from "next";
import { PlayerDetails } from "../../../../components/PlayerPage/PlayerDetails";
import { PlayerContactInfo } from "../../../../components/PlayerPage/PlayerContactInfo";
import prisma from "../../../../lib/prisma";
import React, { MouseEventHandler } from "react";
import { useState } from "react";
import Image from "next/image";
import { Grid } from "@mui/material";
import { AuthenticationRequired } from "../../../../components/AuthenticationRequired";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../../api/auth/[...nextauth]";
import { v2 as cloudinary } from "cloudinary";
import NavigationBar from "../../../../components/NavigationBar";

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

  const currentTime = new Date();
  const isTournamentRunning =
    tournament.startTime.getTime() < currentTime.getTime() &&
    currentTime.getTime() < tournament.endTime.getTime();

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

  return isUmpire || (isTournamentRunning && isHunter);
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
      tournamentId: true,
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

  const player = await prisma.player.findUnique({
    where: {
      userId: params.id as string
    },
    select: {
      alias: true,
      address: true,
      learningInstitution: true,
      eyeColor: true,
      hair: true,
      height: true,
      other: true,
      title: true,
      calendar: true,
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      umpire: {
        select: {
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
  });

  let targets = [];
  if (
    currentUser.player &&
    new Date().getTime() > new Date(tournament.startTime).getTime()
  ) {
    targets = currentUser.player.targets;
  }

  return {
    props: { player, imageUrl, currentUser, tournament, targets }
  };
};

export default function Target({
  player,
  imageUrl,
  currentUser,
  tournament,
  targets
}): JSX.Element {
  const [showPicture, setShowPicture] = useState(false);
  const [slideNumber, setSlideNumber] = useState(0);

  const cal = [];
  for (const x in player.calendar) {
    cal.push([x, player.calendar[x]]);
  }

  let chunks = [];
  const chunkSize = 7;

  for (let i = 0; i < cal.length; i += chunkSize) {
    const chunk = cal.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  const handleSlideShow = (event) => {
    if (slideNumber == chunks.length - 1) {
      setSlideNumber(0);
    } else {
      setSlideNumber(slideNumber + 1);
    }
  };

  const togglePicture: MouseEventHandler = () => {
    if (showPicture === true) {
      setShowPicture(false);
    } else {
      setShowPicture(true);
    }
  };

  let targetUsers = [];
  if (targets) {
    targetUsers = targets.map((assignment) => assignment.target.user);
  }

  return (
    <AuthenticationRequired>
      <div>
        <NavigationBar
          targets={targetUsers}
          userId={currentUser.id}
          tournamentId={tournament.id}
        />
        <Grid container>
          <Grid item xs={12} md={5}>
            <div
              style={{
                paddingLeft: "10px",
                display: "inline-block"
              }}
            >
              <h1>
                {player.title} {player.user.firstName} {player.user.lastName}
              </h1>
              {imageUrl !== "" ? (
                <div>
                  {showPicture ? (
                    <div>
                      <Image
                        src={imageUrl}
                        width="100%"
                        height="100%"
                        layout="responsive"
                        objectFit="contain"
                        alt="profile picture"
                      ></Image>
                    </div>
                  ) : null}
                  <button onClick={togglePicture}>
                    {showPicture ? "piilota" : "näytä kuva"}
                  </button>
                </div>
              ) : (
                <p>Ei kuvaa</p>
              )}

              <div>
                <div className="userdetails">
                  {player.umpire && (
                    <div>
                      <h3>Pelaajan tuomari</h3>
                      <p>
                        {player.umpire.user.firstName}{" "}
                        {player.umpire.user.lastName}
                      </p>
                      <p>{player.umpire.user.phone}</p>
                      <p>{player.umpire.user.email}</p>
                    </div>
                  )}
                  <h2>Kohteen tiedot</h2>
                  {currentUser.player.state == "DETECTIVE" && (
                    <h3>Pelaajan alias: {player.alias}</h3>
                  )}
                  <PlayerDetails player={player} />
                </div>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} md={7}>
            <div className="calendar">
              <h3 style={{ width: "40%", margin: "auto", padding: "10px" }}>
                Kalenteri
              </h3>

              <div>
                <ul>
                  {chunks[slideNumber].map((c, index) => (
                    <li
                      key={index}
                      style={{ paddingBottom: "20px", whiteSpace: "pre-line" }}
                    >
                      {c[0]}: {c[1]}
                    </li>
                  ))}
                </ul>
                <button onClick={handleSlideShow} style={{ left: "40%" }}>
                  Seuraava
                </button>
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
    </AuthenticationRequired>
  );
}
