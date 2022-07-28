import { GetStaticProps, GetStaticPaths } from "next";
import { Player } from "@prisma/client";
import { PlayerDetails } from "../../components/PlayerDetails";
import { PlayerContactInfo } from "../../components/PlayerContactInfo";
import prisma from "../../lib/prisma";
import { MouseEventHandler } from "react";
import { useState } from "react";
import { UpdateForm } from "../../components/UpdateForm";

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

export default function User(userData: Player): JSX.Element {
  const [updateStatus, setUpdateStatus] = useState(true);

  const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
    if (updateStatus === true) {
      setUpdateStatus(false);
    } else {
      setUpdateStatus(true);
    }
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
          <UpdateForm data={userData} />
        </div>
      )}
      <div>
        <button onClick={handleClick}>
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
