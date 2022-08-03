import { GetStaticProps, GetStaticPaths } from "next";
import { Player } from "@prisma/client";
import { PlayerDetails } from "../../components/PlayerDetails";
import { PlayerContactInfo } from "../../components/PlayerContactInfo";
import prisma from "../../lib/prisma";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
  const [notification, setNotification] = useState("");
  const router = useRouter();
  const id = router.query.id;

  useEffect(() => {
    if (router.query.registration) {
      setNotification("Ilmoittautuminen onnistui!");
      setTimeout(() => {
        router.replace(`/users/${id}`, undefined, { shallow: true });
        setNotification("");
      }, 4000);
    }
  }, []);
  return (
    <div>
      {notification ? (
        <p className="notification">Ilmoittautuminen onnistui!</p>
      ) : null}
      <h1>
        {userData.firstName} {userData.lastName}
      </h1>
      <PlayerContactInfo data={userData} />
      <PlayerDetails data={userData} />
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
