import { GetServerSideProps } from "next";
import { Prisma, Tournament } from "@prisma/client";
import { PlayerDetails } from "../../../components/PlayerDetails";
import { PlayerContactInfo } from "../../../components/PlayerContactInfo";
import prisma from "../../../lib/prisma";
import React, { MouseEventHandler, useEffect } from "react";
import { useState } from "react";
import { UpdateForm } from "../../../components/UpdateForm";
import { useRouter } from "next/router";
import NavigationBar from "../../../components/NavigationBar";
import { Calendar } from "../../../components/Calendar";
import Image from "next/image";
import { Grid } from "@mui/material";
import { AuthenticationRequired } from "../../../components/AuthenticationRequired";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../api/auth/[...nextauth]";

const isCurrentUserAuthorized = async (targetId, context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authConfig
  );
  // TODO add tournamentId to where clauses
  const isUmpire = await prisma.umpire.findUnique({
    where: {
      userId: session.user.id
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
  return isUmpire || isHunter;
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  ...context
}) => {
  if (!(await isCurrentUserAuthorized(params.id, context)))
    return { redirect: { destination: "/personal", permanent: false } };

  require("dotenv").config();
  const cloudinary = require("cloudinary").v2;
  let imageUrl = "";
  try {
    const result = await cloudinary.api.resource(params.id);
    imageUrl = result.url;
  } catch (error) {
    console.log(error);
  }
  const playerAsTarget: Prisma.PlayerSelect = {
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
  };
  const player = await prisma.player.findUnique({
    where: {
      userId: params.id as string
    },
    select: playerAsTarget
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

  return (
    <AuthenticationRequired>
      <div>
        {/* TODO: Add NavigationBar after the sessions have been implemented */}
        {/* <NavigationBar targets={targetUsers} userId={user.id} />  */}
        <Grid container>
          <Grid item xs={12} md={5}>
            <div
              style={{
                paddingLeft: "10px",
                display: "inline-block"
              }}
            >
              <h1>
                {player.user.firstName} {player.user.lastName}, alias:{" "}
                {player.alias}
              </h1>
              {imageUrl !== "" ? (
                <div>
                  {showPicture ? (
                    <div>
                      <Image
                        src={imageUrl}
                        width={350}
                        height={500}
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
