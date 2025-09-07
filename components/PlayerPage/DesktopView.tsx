import { Box, Container, Grid } from "@mui/material";
import { Calendar } from "./Calendar";
import Details from "./Details";
import Info from "./Info";
import { Tournament, Umpire, User } from "@prisma/client";
import { useParams } from "next/navigation";
import { Dispatch } from "react";

interface UmpireWithUser extends Umpire {
  user: User;
}

const DesktopView = ({
  tournament,
  imageUrl,
  currentUserIsUmpire,
  currentUserIsHunter = false,
  currentUserIsDetective = false,
  currentUserId,
  umpires,
  setUser
}: {
  tournament: Tournament;
  imageUrl: string;
  currentUserIsUmpire: boolean;
  currentUserIsHunter?: boolean;
  currentUserIsDetective?: boolean;
  currentUserId: string;
  umpires: UmpireWithUser[];
  setUser: Dispatch<any>;
}) => {
  const { id: userId } = useParams();

  return (
    <Container sx={{ marginBottom: "2rem" }}>
      <Grid container>
        <Grid item xs={12} md={6}>
          <Info
            imageUrl={imageUrl}
            showAlias={
              currentUserIsDetective ||
              currentUserIsUmpire ||
              userId === currentUserId
            }
            showStatus={currentUserIsUmpire || userId === currentUserId}
            showImageForm={userId === currentUserId}
          />
          <Details
            umpires={umpires}
            currentUserIsUmpire={currentUserIsUmpire}
            currentUserIsHunter={currentUserIsHunter}
            setUser={setUser}
          />
        </Grid>
        <Grid item xs={12} md={6} padding={2}>
          <Box sx={{ borderLeft: "solid red 2px" }}>
            <Calendar
              setUser={setUser}
              tournament={tournament}
              showEditButton={userId === currentUserId}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DesktopView;
