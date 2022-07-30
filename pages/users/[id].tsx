import { GetStaticProps, GetStaticPaths } from "next";
import { Player } from "@prisma/client";
import { PlayerDetails } from "../../components/PlayerDetails";
import { PlayerContactInfo } from "../../components/PlayerContactInfo";
import prisma from "../../lib/prisma";
import React, { MouseEventHandler, useEffect } from "react";
import { useState } from "react";
import { UpdateForm } from "../../components/UpdateForm";
import { useRouter } from "next/router";

export default function User(userData: Player): JSX.Element {
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
            {userData.firstName} {userData.lastName}
          </h1>
          <PlayerContactInfo data={userData} />
          <PlayerDetails data={userData} />
        </div>
      ) : (
        <div>
          <h1>
            {userData.firstName} {userData.lastName}
          </h1>
          <PlayerContactInfo data={userData} />
          <UpdateForm
            data={userData}
            handleSubmit={handleSubmit}
            calendar={userData.calendar}
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
  const playerIds = await prisma.player.findMany({ select: { id: true } });
  return {
    paths: playerIds.map((player) => ({
      params: player
    })),
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const userData = await prisma.player.findUnique({
    where: {
      id: params.id
    }
  });
  return {
    props: userData
  };
};
