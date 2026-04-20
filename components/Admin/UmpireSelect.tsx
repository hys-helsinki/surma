import { Box, Button, Grid, Snackbar } from "@mui/material";
import { Field, Form, Formik } from "formik";
import { Dispatch, SetStateAction, useState } from "react";
import { UmpirePagePlayer, UmpirePageUser } from "../../types/umpirepage";

const UmpireSelect = ({
  umpires,
  players,
  teamGame,
  setPlayers
}: {
  umpires: UmpirePageUser[];
  players: UmpirePagePlayer[];
  teamGame: boolean;
  setPlayers: Dispatch<SetStateAction<UmpirePagePlayer[]>>;
}) => {
  const [showSuccessText, setShowSuccessText] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSaveUmpires = async (values) => {
    setIsLoading(true);
    const res = await fetch(`/api/player/umpires`, {
      method: "PATCH",
      body: JSON.stringify(values)
    });

    if (res.status === 200) {
      const updatedPlayerList = players.map((player) => {
        const umpireId = values[player.id];
        if (!umpireId) return player;
        const selectedUmpire = umpires.find((u) => u.umpire.id === umpireId);
        return {
          ...player,
          umpire: { ...selectedUmpire.umpire, user: selectedUmpire }
        };
      });
      setPlayers(updatedPlayerList);
      setShowSuccessText(true);
    }
    setIsLoading(false);
  };

  const initialValues = Object.assign(
    {},
    ...players.map((player) => ({
      [`${player.id}`]: player.umpire ? player.umpire.id : ""
    }))
  );

  const sortedPlayers = teamGame
    ? players.sort(
        (a, b) =>
          a.team.name.localeCompare(b.team.name) ||
          a.user.firstName.localeCompare(b.user.firstName)
      )
    : players.sort((a, b) => a.user.firstName.localeCompare(b.user.firstName));

  return (
    <Grid container>
      <Grid size={{ xs: 12, md: 6 }}>
        <h2> Pelaajien tuomarit</h2>
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          onSubmit={(values) => {
            handleSaveUmpires(values);
          }}
        >
          <Form>
            {sortedPlayers.map((player) => (
              <div key={player.id}>
                <div>
                  <label htmlFor={`${player.id}`}>
                    {teamGame && `${player.team.name}: `}
                    {player.user.firstName} {player.user.lastName}{" "}
                    {`(${player.alias})`}
                  </label>
                </div>
                <Field name={`${player.id}`} id={`${player.id}`} as="select">
                  <option></option>
                  {umpires.map((user) => (
                    <option value={user.umpire.id} key={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </Field>
              </div>
            ))}
            <Box width={{ xs: "100%", md: "60%" }}>
              <Button type="submit" loading={isLoading}>
                Tallenna tuomarit
              </Button>
            </Box>
            <Snackbar
              open={showSuccessText}
              onClose={() => setShowSuccessText(false)}
              autoHideDuration={4000}
              message="Tuomarien asettaminen onnistui!"
            />
          </Form>
        </Formik>
      </Grid>
    </Grid>
  );
};

export default UmpireSelect;
