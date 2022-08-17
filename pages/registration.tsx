import { useRouter } from "next/router";
import { Formik, Form, Field, useField } from "formik";
import React from "react";
import * as Yup from "yup";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import Link from "next/link";

export const getStaticProps: GetStaticProps = async ({ params }) => {
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
          <Link href={`/registration/${tournament.id}`}>
            <a>{tournament.name}</a>
          </Link>
        </div>
      ))}
    </div>
  );
}
