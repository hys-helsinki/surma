import { LoadingButton } from "@mui/lab";
import { Grid } from "@mui/material";
import { Field, Form, Formik } from "formik";
import { useState } from "react";

const UmpireSelect = ({
  umpires,
  players,
  teamGame
}: {
  umpires: any[];
  players: any[];
  teamGame: boolean;
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
      setShowSuccessText(true);
    }
    setIsLoading(false);
  };

  const formInitials = Object.assign(
    {},
    ...players.map((player) => ({
      [`${player.id}`]: player.umpire ? player.umpire.id : ""
    }))
  );

  const sortedPlayers = teamGame
    ? players.sort((a, b) => a.team.name - b.team.name)
    : players.sort((a, b) => a.firstName - b.firstName);

  return (
    <Grid container>
      <Grid item xs={12} md={3}>
        <h2> Pelaajien tuomarit</h2>
        <Formik
          enableReinitialize={true}
          initialValues={formInitials}
          onSubmit={(values) => {
            handleSaveUmpires(values);
          }}
        >
          <Form>
            {sortedPlayers.map((player) => (
              <div key={player.id}>
                <div>
                  <label htmlFor={`${player.id}`}>
                    {player.user.firstName} {player.user.lastName}{" "}
                    {teamGame && `(${player.team.name})`}
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
            <LoadingButton type="submit" loading={isLoading}>
              Tallenna tuomarit
            </LoadingButton>
            <p style={{ visibility: showSuccessText ? "visible" : "hidden" }}>
              Tuomarien tallentaminen onnistui!
            </p>
          </Form>
        </Formik>
      </Grid>
    </Grid>
  );
};

export default UmpireSelect;
