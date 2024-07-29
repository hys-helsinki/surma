import { GetServerSideProps } from "next";
import { PlayerDetails } from "../../../../components/PlayerPage/PlayerDetails";
import { PlayerContactInfo } from "../../../../components/PlayerPage/PlayerContactInfo";
import prisma from "../../../../lib/prisma";
import { useState } from "react";
import { UpdateForm } from "../../../../components/PlayerPage/UpdateForm";
import { useRouter } from "next/router";
import NavigationBar from "../../../../components/NavigationBar";
import { Calendar } from "../../../../components/Calendar";
import { Grid, Alert, Button, Container } from "@mui/material";
import { AuthenticationRequired } from "../../../../components/AuthenticationRequired";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../../api/auth/[...nextauth]";
import { v2 as cloudinary } from "cloudinary";
import PlayerForm from "../../../../components/Registration/PlayerForm";
import InfoBox from "../../../../components/PlayerPage/InfoBox";
import ImageUploadForm from "../../../../components/Registration/PlayerForm/ImageUploadForm";
import ImageComponent from "../../../../components/PlayerPage/ImageComponent";

type FormData = {
  address: string;
  learningInstitution: string;
  eyeColor: string;
  hair: string;
  height: number;
  other: string;
};

const isCurrentUserAuthorized = async (currentUser, userId, tournamentId) => {
  if (currentUser.id == userId) {
    return true;
  } else {
    return (
      currentUser.umpire != null &&
      currentUser.umpire.tournamentId == tournamentId
    );
  }
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  ...context
}) => {
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
      umpire: true
    }
  });

  if (
    !(await isCurrentUserAuthorized(
      currentUser,
      params.id,
      params.tournamentId
    ))
  )
    return { redirect: { destination: "/personal", permanent: false } };

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
      tournamentId: true,
      player: {
        select: {
          id: true,
          alias: true,
          address: true,
          learningInstitution: true,
          eyeColor: true,
          hair: true,
          height: true,
          other: true,
          calendar: true,
          lastVisit: true,
          title: true,
          confirmed: true,
          targets: {
            select: {
              target: {
                select: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          },
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
      },
      tournament: {
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
          registrationStartTime: true,
          registrationEndTime: true
        }
      }
    }
  });

  let imageUrl = "";
  try {
    const result = await cloudinary.api.resource(user.player.id as string);
    imageUrl = result.url;
  } catch (error) {
    console.log(error);
  }

  user = JSON.parse(JSON.stringify(user));
  const tournament = user.tournament;
  let targets = [];

  if (
    user.player &&
    new Date().getTime() > new Date(tournament.startTime).getTime()
  ) {
    targets = user.player.targets;
  }
  
  return {
    props: {
      user,
      tournament,
      imageUrl,
      targets,
      currentUserIsUmpire: currentUser.umpire != null
    }
  };
};

export default function UserInfo({
  user,
  tournament,
  imageUrl,
  targets = [],
  currentUserIsUmpire
}): JSX.Element {
  const [isUpdated, setIsUpdated] = useState(true);
  const [fileInputState, setFileInputState] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [selectedFileName, setSelectedFileName] = useState("");
  const [confirmed, setConfirmed] = useState(user.player ? user.player.confirmed : false)

  const router = useRouter();
  const { id } = router.query;

  if (!Boolean(user.player)) {
    return <PlayerForm tournament={user.tournament} />
  }

  const start = new Date(tournament.startTime);
  const end = new Date(tournament.endTime);
  let dates: Array<any> = [];
  dates.push(`${start.getDate()}.${start.getMonth() + 1}.`);
  let loopDay = start;
  while (loopDay < end) {
    loopDay.setDate(loopDay.getDate() + 1);
    dates.push(`${loopDay.getDate()}.${loopDay.getMonth() + 1}.`);
  }

  const handleDetailsSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const data: FormData = {
      address: event.currentTarget.address.value,
      learningInstitution: event.currentTarget.learningInstitution.value,
      eyeColor: event.currentTarget.eyeColor.value,
      hair: event.currentTarget.hair.value,
      height: parseInt(event.currentTarget.height.value),
      other: event.currentTarget.other.value
    };
    try {
      await fetch(`/api/user/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      })
      router.reload()
    } catch (error) {
      console.log(error)
    }
  };

  const handleCalendarSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    const cal = {};
    dates.forEach((x, i) => (cal[x] = event.currentTarget.dates[i].value));
    event.preventDefault();
    const data = {
      calendar: cal
    };
    
    try {
      await fetch(`/api/user/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    })
    router.reload()
    } catch (error) {
      console.log(error)
    }
  };

  const uploadImage = async (event) => {
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
            publicId: user.player.id
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

  let targetUsers = [];
  if (targets.length > 0) {
    targetUsers = user.player.targets.map(
      (assignment) => assignment.target.user
    );
  }

  const handleConfirm = async () => {

    const id = user.player.id
    const data = { confirmed: true };
    await fetch(`/api/player/${id}/confirm`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
    setConfirmed(true)

  }

  return (
    <AuthenticationRequired>
      <div>
        <NavigationBar
          targets={targetUsers}
          userId={user.id}
          tournamentId={user.tournamentId}
        />
        {
          !user.player.confirmed && 
            <Alert severity="warning" sx={{minHeight: "50px",   
              display: "flex",
              alignItems: "center"}}>
              Tuomaristo ei ole vielä hyväksynyt ilmoittautumista
              {currentUserIsUmpire && <Button onClick={() => handleConfirm()} variant="outlined" color="error" sx={{ml: 1}} disabled={confirmed}>Hyväksy ilmoittautuminen</Button>}
            </Alert>
        }
        <Container>
          <Grid container>
            <Grid item xs={12} md={6}>
              <div
                style={{
                  paddingLeft: "10px",
                  display: "inline-block"
                }}
              >
                <h1>
                  {user.player.title} {user.firstName} {user.lastName}
                </h1>
                {imageUrl == "" ? (
                  <ImageComponent imageUrl={imageUrl} />
                ) : (
                  <>
                    <ImageUploadForm setSelectedFile={setSelectedFile} setSelectedFileName={setSelectedFileName} setFileInputState={setFileInputState} selectedFileName={selectedFileName} fileInputState={fileInputState} />
                    {selectedFile && <button onClick={(e) => uploadImage(e)}>Lisää kuva</button>}
                  </>
                )}
                <InfoBox user={user} currentUserIsUmpire={currentUserIsUmpire}/>
                <PlayerContactInfo user={user} />
                {isUpdated ? (             
                   <PlayerDetails player={user.player} />
                ) : (       
                  <UpdateForm
                    data={user.player}
                    handleSubmit={handleDetailsSubmit}
                  />
                )}
                <button onClick={() => setIsUpdated(!isUpdated)}>
                  {isUpdated ? "Muokkaa tietoja" : "Peruuta"}
                </button>
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              {user.player && (
                <Calendar
                  player={user.player}
                  handleSubmit={handleCalendarSubmit}
                />
              )}
            </Grid>
          </Grid>
        </Container>
      </div>
    </AuthenticationRequired>
  );
}
