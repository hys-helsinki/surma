import { GetServerSideProps } from "next";
import prisma from "../../../../lib/prisma";
import {
  Alert,
  Button,
  Snackbar,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { AuthenticationRequired } from "../../../../components/AuthenticationRequired";
import { getServerSession } from "next-auth";
import { authConfig } from "../../../api/auth/[...nextauth]";
import DesktopView from "../../../../components/PlayerPage/DesktopView";
import MobileView from "../../../../components/PlayerPage/MobileView";
import PlayerForm from "../../../../components/Registration/PlayerForm";
import { useSession } from "next-auth/react";
import { JSX, useState } from "react";
import { UserProvider } from "../../../../components/UserProvider";
import LoadingSpinner from "../../../../components/Common/LoadingSpinner";
import { useRouterLoading } from "../../../../lib/hooks";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const isCurrentUserAuthorized = async (currentUser, userId, tournamentId) => {
  return (
    currentUser.id == userId ||
    (currentUser != null &&
      currentUser.umpire != null &&
      currentUser.umpire.tournamentId == tournamentId)
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  ...context
}) => {
  const session = await getServerSession(context.req, context.res, authConfig);

  let currentUser = await prisma.user.findUnique({
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
          state: true,
          safetyNotes: true,
          umpire: {
            select: {
              id: true,
              responsibility: true,
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

  let tournament = await prisma.tournament.findUnique({
    where: { id: params.tournamentId as string }
  });

  const umpires = await prisma.umpire.findMany({
    select: {
      id: true,
      responsibility: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          email: true
        }
      }
    }
  });

  const imageUrl = user.player
    ? `surma/${user.tournamentId}/${user.player.id}`
    : "";

  user = JSON.parse(JSON.stringify(user));
  currentUser = JSON.parse(JSON.stringify(currentUser));
  tournament = JSON.parse(JSON.stringify(tournament));

  return {
    props: {
      user,
      tournament,
      imageUrl,
      currentUserIsUmpire: currentUser.umpire != null,
      umpires,
      currentUser,
      ...(await serverSideTranslations(context.locale, ["common"]))
    }
  };
};

export default function User({
  user: u,
  tournament,
  imageUrl: image,
  currentUserIsUmpire,
  umpires,
  currentUser
}): JSX.Element {
  const [user, setUser] = useState(u);
  const [confirmed, setConfirmed] = useState<boolean>(
    user.player ? user.player.confirmed : false
  );
  const [imageUrl, setImageUrl] = useState(image);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const session = useSession();
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));

  const isLoading = useRouterLoading();

  if (session.status === "loading" || isLoading) return <LoadingSpinner />;

  if (!Boolean(user.player) && user.id !== session.data.user.id) {
    return (
      <div style={{ margin: 2 }}>
        <h3>Pelaaja ei ole vielä täyttänyt tietojaan</h3>
        ```
        <p>
          Nimi: {user.firstName} {user.lastName}
        </p>
        <p>Sähköpostiosoite: {user.email}</p>
        <p>Puhelinnumero: {user.phone}</p>
      </div>
    );
  }

  if (!Boolean(user.player)) {
    return (
      <PlayerForm
        tournament={tournament}
        setUser={setUser}
        setImageUrl={setImageUrl}
        setErrorMessage={setErrorMessage}
        setShowError={setShowError}
      />
    );
  }

  const handleConfirmRegistration = async () => {
    const id = user.player.id;
    const data = { confirmed: true };
    await fetch(`/api/player/${id}/confirm`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
    setConfirmed(true);
  };

  return (
    <AuthenticationRequired>
      <UserProvider user={user}>
        {!confirmed && (
          <Alert
            severity="warning"
            sx={{ minHeight: "50px", display: "flex", alignItems: "center" }}
          >
            Tuomaristo ei ole vielä hyväksynyt ilmoittautumista
            {currentUserIsUmpire && (
              <Button
                onClick={() => handleConfirmRegistration()}
                variant="outlined"
                color="error"
                sx={{ ml: 1 }}
                disabled={confirmed}
              >
                Hyväksy ilmoittautuminen
              </Button>
            )}
          </Alert>
        )}
        {isMobileView ? (
          <MobileView
            setUser={setUser}
            tournament={tournament}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            currentUserIsUmpire={currentUserIsUmpire}
            currentUserId={currentUser.id}
            umpires={umpires}
          />
        ) : (
          <DesktopView
            setUser={setUser}
            tournament={tournament}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            currentUserIsUmpire={currentUserIsUmpire}
            currentUserId={currentUser.id}
            umpires={umpires}
          />
        )}
        <Snackbar open={showError} onClose={() => setShowError(false)}>
          <Alert
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
            onClose={() => setShowError(false)}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </UserProvider>
    </AuthenticationRequired>
  );
}
