import LoadingButton from "@mui/lab/LoadingButton";
import { Tournament } from "@prisma/client";

const Settings = ({ tournament }: { tournament: Tournament }) => {
  const deleteTournamentResources = async () => {
    const res = await fetch(`/api/tournament/${tournament.id}/delete`, {
      method: "DELETE"
    });
    console.log(res);
  };
  return (
    <div>
      <LoadingButton onClick={() => deleteTournamentResources()}>
        Poista turnaus
      </LoadingButton>
    </div>
  );
};

export default Settings;
