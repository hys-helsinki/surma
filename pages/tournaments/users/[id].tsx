import { GetStaticProps, GetStaticPaths } from "next";
import { Prisma } from "@prisma/client";
import { PlayerDetails } from "../../../components/PlayerDetails";
import { PlayerContactInfo } from "../../../components/PlayerContactInfo";
import prisma from "../../../lib/prisma";
import React, { MouseEventHandler, useEffect } from "react";
import { useState } from "react";
import { UpdateForm } from "../../../components/UpdateForm";
import { useRouter } from "next/router";

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: params.id
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
    props: userData
  };
};

type UserWithPlayer = Prisma.UserGetPayload<{
  include: {
    player: true;
  };
}>;

export default function UserInfo(user: UserWithPlayer): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    setUpdateStatus(true);
  }, []);

  const { id } = router.query;
  const [updateStatus, setUpdateStatus] = useState(true);

  const handleUpdateStatusClick: MouseEventHandler<HTMLButtonElement> = () => {
    if (updateStatus === true) {
      setUpdateStatus(false);
    } else {
      setUpdateStatus(true);
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
    const dates = ["1.10.", "2.10", "3.10", "4.10"];
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

  return (
    <div>
      {updateStatus ? (
        <div>
          <h1>
            {user.firstName} {user.lastName}
          </h1>
          <PlayerContactInfo data={user} />
          <PlayerDetails data={user} />
        </div>
      ) : (
        <div>
          <h1>
            {user.firstName} {user.lastName}
          </h1>
          <PlayerContactInfo data={user} />
          <UpdateForm
            data={user}
            handleSubmit={handleSubmit}
            calendar={user.player.calendar}
          />
        </div>
      )}
      <div>
        <button onClick={handleUpdateStatusClick}>
          {updateStatus ? "muokkaa tietoja" : "peruuta"}
        </button>
      </div>
    </div>
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
