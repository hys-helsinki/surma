import { GetServerSideProps } from "next";
import { PlayerDetails } from "../../../../components/PlayerDetails";
import { PlayerContactInfo } from "../../../../components/PlayerContactInfo";
import prisma from "../../../../lib/prisma";
import React, { MouseEventHandler } from "react";
import { useState } from "react";
import Image from "next/image";
import { Grid } from "@mui/material";
import { AuthenticationRequired } from "../../../../components/AuthenticationRequired";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../../api/auth/[...nextauth]";
import { v2 as cloudinary } from "cloudinary";

const isCurrentUserAuthorized = async (tournamentId, targetId, context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authConfig
  );
  // TODO add tournamentId to where clauses
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
  if (!(await isCurrentUserAuthorized(params.tournamentId, params.id, context)))
    return { redirect: { destination: "/personal", permanent: false } };

  let imageUrl = "";
  try {
    const result = await cloudinary.api.resource(params.id as string);
    imageUrl = result.url;
  } catch (error) {
    console.log(error);
  }

  const player = await prisma.player.findUnique({
    where: {
      userId: params.id as string
    },
    select: {
      address: true,
      learningInstitution: true,
      eyeColor: true,
      hair: true,
      height: true,
      glasses: true,
      other: true,
      calendar: true,
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });
  return {
    props: { player, imageUrl }
  };
};

export default function Target({ player, imageUrl }): JSX.Element {
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

  // let targetUsers = [];
  // if (currentUser.player) {
  //   const targetPlayerIds = [
  //     currentUser.player.targets.map(
  //       (t) => tournament.players.find((p) => p.id == t.targetId).userId
  //     )
  //   ];

  //   targetUsers = tournament.users.filter((user) =>
  //     targetPlayerIds[0].includes(user.id)
  //   );
  // }

  return (
    <AuthenticationRequired>
      <div>
        {/* <NavigationBar targets={targetUsers} userId={currentUser.id} /> */}
        <Grid container>
          <Grid item xs={12} md={5}>
            <div
              style={{
                paddingLeft: "10px",
                display: "inline-block"
              }}
            >
              <h1>
                {player.user.firstName} {player.user.lastName}
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
                  <PlayerContactInfo user={player.user} />
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
                    <li key={index} style={{ paddingBottom: "20px" }}>
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
