import { LoadingButton } from "@mui/lab";
import { Box } from "@mui/material";
import { Player, User } from "@prisma/client";
import { Field, Form, Formik } from "formik";
import { useState } from "react";

interface PlayerWithUser extends Player {
  user: User;
}

const CreateRingForm = ({
  players,
  setPlayers,
  tournament,
  setShowForm,
  setRings
}: {
  players: PlayerWithUser[];
  setPlayers: any;
  tournament: any;
  setShowForm: any;
  setRings: any;
}) => {
  const [loading, setLoading] = useState(false);
  const createRing = async (values) => {
    setLoading(true);
    const assignments = Object.entries(values)
      .filter((entry) => entry[0] !== "name")
      .map((entry) => ({
        hunterId: entry[0],
        targetId: entry[1] as string
      }));

    const newRing = {
      assignments,
      name: values.name,
      tournamentId: tournament.id
    };

    const res = await fetch("/api/tournament/rings", {
      method: "POST",
      body: JSON.stringify(newRing)
    });
    const responseData = await res.json();
    setPlayers(responseData.players);
    setRings((prevRings) => prevRings.concat(responseData.createdRing));
    setShowForm(false);
    setLoading(false);
  };

  return (
    <Box width={{ xs: "100%", md: "80%" }}>
      <Formik
        initialValues={{ name: "" }}
        onSubmit={(values) => createRing(values)}
      >
        {() => (
          <Form>
            <Box>
              <label>Ringin nimi</label>
              <Field name="name" />
            </Box>
            {players.map((hunter) => (
              <Box key={hunter.id}>
                <label>{`${hunter.user.firstName} ${hunter.user.lastName} -->`}</label>
                <Field as="select" name={hunter.id}>
                  <option value="">--</option>
                  {players.map((target) => (
                    <option
                      value={target.id}
                      key={target.id}
                    >{`${target.user.firstName} ${target.user.lastName}`}</option>
                  ))}
                </Field>
              </Box>
            ))}
            <LoadingButton type="submit" loading={loading}>
              Tallenna
            </LoadingButton>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default CreateRingForm;
