import React from "react";
import { GetServerSideProps } from "next";
import prisma from "../lib/prisma";
import Link from "next/link";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  let tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true
    }
  });
  tournaments = JSON.parse(JSON.stringify(tournaments));
  return {
    props: { tournaments }
  };
};

export default function Tournaments({ tournaments }) {
  return (
    <div>
      <h2>Ilmoittautuminen avoinna</h2>
      {tournaments.map((tournament) => (
        <div key={tournament.id}>
          <Link href={`/registration/${tournament.id}`}>{tournament.name}</Link>
        </div>
      ))}
    </div>
  );
}
