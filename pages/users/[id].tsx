import { GetStaticProps, GetStaticPaths } from "next";
import { Player } from "@prisma/client";
import { PlayerDetails } from "../../components/PlayerDetails";
import { PlayerContactInfo } from "../../components/PlayerContactInfo";
import prisma from "../../lib/prisma";
import { MouseEventHandler, useEffect } from "react";
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
  const handleSubmit = async (event) => {
    const dates = ["1.10.", "2.10", "3.10", "4.10"];
    const cal = {};
    dates.forEach((x, i) => (cal[x] = event.target.dates[i].value));
    event.preventDefault();
    const data = {
      address: event.target.address.value,
      learningInstitution: event.target.learningInstitution.value,
      eyeColor: event.target.eyeColor.value,
      hair: event.target.hair.value,
      height: parseInt(event.target.height.value),
      glasses: event.target.glasses.value,
      other: event.target.other.value,
      calendar: cal
    };
    console.log(data);
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
