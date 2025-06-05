import { Box, Button } from "@mui/material";
import { Player, User } from "@prisma/client";
import { Field, Form, Formik } from "formik";

interface PlayerWithUser extends Player {
  user: User;
}

const CreateRingForm = ({
  players,
  tournament,
  setShowForm,
  setRings
}: {
  players: PlayerWithUser[];
  tournament: any;
  setShowForm: any;
  setRings: any;
}) => {
  const createRing = async (values) => {
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
    const createdRing = await res.json();
    setShowForm(false);
    setRings((prevRings) => prevRings.concat(createdRing));
  };

  return (
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
              <label>{`${hunter.user.firstName} ${hunter.user.lastName}`}</label>
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
          <Button type="submit">Tallenna</Button>
        </Form>
      )}
    </Formik>
  );
};

export default CreateRingForm;
