import { GetStaticProps, GetStaticPaths } from "next";
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  require("dotenv").config();
  const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  let imageUrl = "";
  try {
    const result = await cloudinary.api.resource(params.id);
    imageUrl = result.url;
  } catch (error) {
    console.log(error);
  }

  let tournament = await prisma.tournament.findFirst({
    select: {
      name: true,
      startTime: true,
      endTime: true,
      registrationStartTime: true,
      registrationEndTime: true,
      players: true,
      users: true
    }
  });
  tournament = JSON.parse(JSON.stringify(tournament)); // avoid Next.js serialization error
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
      player: {
        select: {
          id: true,
          alias: true,
          address: true,
          learningInstitution: true,
          eyeColor: true,
          hair: true,
          height: true,
          glasses: true,
          other: true,
          calendar: true,
          targets: true
        }
      }
    }
  });
  user = JSON.parse(JSON.stringify(user));
  return {
    props: { user, tournament, imageUrl }
  };
};

export default function UserInfo({ user, tournament, imageUrl }): JSX.Element {
  const [notification, setNotification] = useState("");
  const [isUpdated, setIsUpdated] = useState(true);
  const [showPicture, setShowPicture] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    setIsUpdated(true);
    if (router.query.registration) {
      setNotification("Ilmoittautuminen onnistui! :)");
      setTimeout(() => {
        router.replace(`/tournaments/users/${id}`, undefined, {
          shallow: true
        });
        setNotification("");
      }, 4000);
    }
  }, []);

  const start = new Date(tournament.startTime);
  const end = new Date(tournament.endTime);
  let dates: Array<any> = [];
  dates.push(`${start.getDate()}.${start.getMonth() + 1}.`);
  let loopDay = start;
  while (loopDay < end) {
    loopDay.setDate(loopDay.getDate() + 1);
    dates.push(`${loopDay.getDate()}.${loopDay.getMonth() + 1}.`);
  }

  const handleUpdateStatusClick: MouseEventHandler<HTMLButtonElement> = () => {
    if (isUpdated === true) {
      setIsUpdated(false);
    } else {
      setIsUpdated(true);
    }
  };
  type formData = {
    address: string;
    learningInstitution: string;
    eyeColor: string;
    hair: string;
    height: number;
    glasses: string;
    other: string;
    calendar: object;
  };
  const handleDetailsSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    const cal = {};
    dates.forEach((x, i) => (cal[x] = event.currentTarget.dates[i].value));
    event.preventDefault();
    const data: formData = {
      address: event.currentTarget.address.value,
      learningInstitution: event.currentTarget.learningInstitution.value,
      eyeColor: event.currentTarget.eyeColor.value,
      hair: event.currentTarget.hair.value,
      height: parseInt(event.currentTarget.height.value),
      glasses: event.currentTarget.glasses.value,
      other: event.currentTarget.other.value,
      calendar: cal
    };

    fetch(`/api/user/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }).then((response) => router.reload());
  };

  const handleCalendarSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    console.log("tapahtuuko mitään?");
    const cal = {};
    dates.forEach((x, i) => (cal[x] = event.currentTarget.dates[i].value));
    event.preventDefault();
    const data = {
      calendar: cal
    };

    fetch(`/api/user/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }).then((response) => router.reload());
  };

  const togglePicture: MouseEventHandler = () => {
    if (showPicture === true) {
      setShowPicture(false);
    } else {
      setShowPicture(true);
    }
  };
  let targetUsers = [];
  if (user.player != null) {
    const targetPlayerIds = [
      // everything works fine but vscode says that targets, players and users don't exist.

      user.player.targets.map(
        (t) => tournament.players.find((p) => p.id == t.targetId).userId
      )
    ];

    targetUsers = tournament.users.filter((user) =>
      targetPlayerIds[0].includes(user.id)
    );
  }

  return (
    <AuthenticationRequired>
      <div>
        {new Date().getTime() < new Date(tournament.startTime).getTime() ? (
          <NavigationBar targets={[]} userId={user.id} />
        ) : (
          <NavigationBar targets={targetUsers} userId={user.id} />
        )}
        <Grid container>
          <Grid item xs={12} md={5}>
            <div
              style={{
                paddingLeft: "10px",
                display: "inline-block"
              }}
            >
              {notification ? (
                <p className="notification">Ilmoittautuminen onnistui!</p>
              ) : null}

              <h1>
                {user.firstName} {user.lastName}
              </h1>
              {imageUrl !== "" ? (
                <div>
                  {showPicture ? (
                    <div>
                      <Image src={imageUrl} width={200} height={100}></Image>
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
                <button onClick={handleUpdateStatusClick}>
                  {isUpdated ? "muokkaa tietoja" : "peruuta"}
                </button>
              </div>
              {isUpdated ? (
                <div>
                  <div className="userdetails">
                    <PlayerContactInfo user={user} />
                    {user.player && <PlayerDetails player={user.player} />}
                  </div>
                </div>
              ) : (
                <div>
                  <PlayerContactInfo user={user} />
                  {user.player && (
                    <UpdateForm
                      data={user.player}
                      handleSubmit={handleDetailsSubmit}
                    />
                  )}
                </div>
              )}
            </div>
          </Grid>
          <Grid item xs={12} md={7}>
            {user.player && (
              <Calendar
                player={user.player}
                handleSubmit={handleCalendarSubmit}
              />
            )}
          </Grid>
        </Grid>
      </div>
    </AuthenticationRequired>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const userIds = await prisma.user.findMany({ select: { id: true } });
  return {
    paths: userIds.map((player) => ({
      params: player
    })),
    fallback: false
  };
};
