import { Box, Container, Grid } from "@mui/material";
import { Calendar } from "./Calendar";
import Details from "./Details";
import Info from "./Info";

const DesktopView = ({
  user,
  tournament,
  imageUrl,
  currentUserIsUmpire,
  currentUserIsHunter = false,
  umpires
}: {
  user;
  tournament;
  imageUrl;
  currentUserIsUmpire: boolean;
  currentUserIsHunter?: boolean;
  umpires;
}) => {
  return (
    <Container>
      <Grid container>
        <Grid item xs={12} md={6}>
          <Info
            user={user}
            imageUrl={imageUrl}
            showStatusAndAlias={!currentUserIsHunter}
            showImageForm={!currentUserIsHunter && !currentUserIsUmpire}
          />
          <Details
            user={user}
            umpires={umpires}
            currentUserIsUmpire={currentUserIsUmpire}
            currentUserIsHunter={currentUserIsHunter}
          />
        </Grid>
        <Grid item xs={12} md={6} padding={2}>
          <Box sx={{ borderStyle: "solid", borderWidth: "2px" }}>
            <Calendar
              player={user.player}
              tournament={tournament}
              showEditButton={!currentUserIsHunter && !currentUserIsUmpire}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DesktopView;
