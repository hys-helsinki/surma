import { GetStaticProps, GetStaticPaths } from "next";
import { Prisma, Tournament } from "@prisma/client";
import { PlayerDetails } from "../../../components/PlayerDetails";
import { PlayerContactInfo } from "../../../components/PlayerContactInfo";
import prisma from "../../../lib/prisma";
import React, { MouseEventHandler, useEffect } from "react";
import { useState } from "react";
import { UpdateForm } from "../../../components/UpdateForm";
import { useRouter } from "next/router";
import Image from "next/image";
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
      registrationEndTime: true
    }
  });
  tournament = JSON.parse(JSON.stringify(tournament)); // avoid Next.js serialization error
  const user = await prisma.user.findUnique({
    where: {
      id: params.id as string
    },
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      player: {
        select: {
          alias: true,
          address: true,
          learningInstitution: true,
          eyeColor: true,
          hair: true,
          height: true,
          glasses: true,
          other: true,
          calendar: true
        }
      }
    }
  });
  return {
    props: { user, tournament, imageUrl }
  };
};

type UserWithPlayer = Prisma.UserGetPayload<{
  include: {
    player: true;
    tournament: true;
  };
}>;

export default function UserInfo({
  user,
  tournament,
  imageUrl
}: {
  user: UserWithPlayer;
  tournament: Tournament;
  imageUrl: string;
}): JSX.Element {
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
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
        {notification ? (
          <p className="notification">Ilmoittautuminen onnistui!</p>
        ) : null}
        {isUpdated ? (
          <div>
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

            <PlayerContactInfo user={user} />
            <PlayerDetails player={user.player} />
          </div>
        ) : (
          <div>
            <h1>
              {user.firstName} {user.lastName}
            </h1>
            <PlayerContactInfo user={user} />
            <UpdateForm
              data={user.player}
              handleSubmit={handleSubmit}
              calendar={user.player.calendar}
            />
          </div>
        )}
        <div>
          <button onClick={handleUpdateStatusClick}>
            {isUpdated ? "muokkaa tietoja" : "peruuta"}
          </button>
        </div>
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
