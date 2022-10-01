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

const isCurrentUserAuthorized = async (userId, context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authConfig
  );

  if (session.user.id == userId) {
    return true;
  } else {
    // TODO add tournamentId to where clause
    const umpire = await prisma.umpire.findUnique({
      where: {
        userId: session.user.id
      }
    });
    return umpire != null;
  }
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  ...context
}) => {
  if (!(await isCurrentUserAuthorized(params.id, context)))
    return { redirect: { destination: "/personal", permanent: false } };

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

  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authConfig
  );

  const currentUser = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      id: true,
      player: {
        select: {
          targets: true
        }
      }
    }
  });

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
          targets: true,
          umpire: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });
  user = JSON.parse(JSON.stringify(user));

  if (
    new Date().getTime() < new Date(tournament.startTime).getTime() &&
    user.player
  ) {
    user.player.targets = [];
  }
  return {
    props: { user, tournament, imageUrl, currentUser }
  };
};

export default function UserInfo({
  user,
  tournament,
  imageUrl,
  currentUser
}): JSX.Element {
  const [isUpdated, setIsUpdated] = useState(true);
  const [showPicture, setShowPicture] = useState(false);
  const [fileInputState, setFileInputState] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [selectedFileName, setSelectedFileName] = useState("");

  const router = useRouter();
  const { id } = router.query;

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

  const uploadImage = async (event, id: string) => {
    event.preventDefault();
    if (!selectedFile) return;
    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        await fetch("/api/upload", {
          method: "POST",
          body: JSON.stringify({
            url: reader.result,
            publicId: id
          })
        });
      };
      setFileInputState("");
      setSelectedFileName("");
      setSelectedFile(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file == undefined) {
      setFileInputState("");
      setSelectedFile(null);
      setSelectedFileName("");
    } else {
      setSelectedFile(file);
      setSelectedFileName(file.name);
      setFileInputState(event.target.value);
    }
  };

  const togglePicture: MouseEventHandler = () => {
    if (showPicture === true) {
      setShowPicture(false);
    } else {
      setShowPicture(true);
    }
  };
  let targetUsers = [];
  if (currentUser.player) {
    const targetPlayerIds = [
      // everything works fine but vscode says that targets, players and users don't exist.

      currentUser.player.targets.map(
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
        <NavigationBar targets={targetUsers} userId={currentUser.id} />
        <Grid container>
          <Grid item xs={12} md={5}>
            <div
              style={{
                paddingLeft: "10px",
                display: "inline-block"
              }}
            >
              <h1>
                {user.firstName} {user.lastName}
              </h1>
              {imageUrl !== "" ? (
                <div>
                  {showPicture ? (
                    <div>
                      <Image
                        src={imageUrl}
                        width={200}
                        height={100}
                        alt="profile picture"
                      ></Image>
                    </div>
                  ) : null}
                  <button onClick={togglePicture}>
                    {showPicture ? "piilota" : "näytä kuva"}
                  </button>
                </div>
              ) : (
                <div>
                  <p>Ei kuvaa</p>
                  <form
                    onSubmit={(e) => uploadImage(e, user.id)}
                    style={{ width: "50%" }}
                  >
                    <label>Valitse kuva itsestäsi</label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      value={fileInputState}
                    />
                    <button type="submit">Lähetä kuva</button>
                  </form>
                  {selectedFileName ? (
                    <p>Valittu tiedosto: {selectedFileName}</p>
                  ) : null}
                  <p>
                    Päivitä sivu kuvan lähettämisen jälkeen. Kuvalla saattaa
                    kestää jonkin aikaa latautua, mutta jos se ei hetken päästä
                    näy, ota yhteyttä tuomaristoon.
                  </p>
                </div>
              )}

              <div>
                <button onClick={handleUpdateStatusClick}>
                  {isUpdated ? "muokkaa tietoja" : "peruuta"}
                </button>
              </div>
              {user.player.umpire && (
                <div>
                  <h3>Pelaajan tuomari</h3>
                  <p>
                    {user.player.umpire.user.firstName}{" "}
                    {user.player.umpire.user.lastName}
                  </p>
                  <p>{user.player.umpire.user.phone}</p>
                  <p>{user.player.umpire.user.email}</p>
                </div>
              )}
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
