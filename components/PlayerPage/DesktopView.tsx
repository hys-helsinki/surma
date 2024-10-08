import { Container, Grid } from "@mui/material";
import { Calendar } from "./Calendar";
import Details from "./Details";
import Info from "./Info";

const DesktopView = ({
  user,
  tournament,
  imageUrl,
  currentUserIsUmpire,
  umpires
}) => {
  return (
    <Container>
      <Grid container>
        <Grid item xs={12} md={6}>
          <Info user={user} imageUrl={imageUrl} />
          <Details
            user={user}
            umpires={umpires}
            currentUserIsUmpire={currentUserIsUmpire}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Calendar player={user.player} tournament={tournament} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default DesktopView;
