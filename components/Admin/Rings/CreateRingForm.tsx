import { LoadingButton } from "@mui/lab";
import { Autocomplete, Box } from "@mui/material";
import { Field, FieldArray, Form, Formik } from "formik";
import { useState } from "react";
import StyledTextField from "./StyledTextField";
import { RingComponentProps } from "../../../types/umpirepage";

const CreateRingForm = ({
  players,
  setPlayers,
  tournament,
  setPlayerRings
}: RingComponentProps) => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const createRing = async (values) => {
    setLoading(true);

    if (
      values.assignments.filter((a) => a.hunterId !== "" && a.targetId !== "")
        .length === 0
    ) {
      setLoading(false);
      return;
    }

    const newRing = {
      assignments: values.assignments,
      name: values.name,
      tournamentId: tournament.id
    };
    try {
      const res = await fetch("/api/tournament/rings", {
        method: "POST",
        body: JSON.stringify(newRing)
      });
      const responseData = await res.json();
      setPlayers(responseData.players);
      setPlayerRings((prevRings) => prevRings.concat(responseData.createdRing));
      setShowForm(false);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const initialValues = {
    name: "",
    assignments: [
      {
        hunterId: "",
        targetId: ""
      }
    ]
  };

  const playersWithIDAndName = players.map((player) => ({
    id: player.id,
    name: `${player.user.firstName} ${player.user.lastName}`
  }));

  return (
    <>
      <button onClick={() => setShowForm(!showForm)}>
        {!showForm ? "Luo uusi rinki" : "Peruuta"}
      </button>
      {showForm && (
        <Box width={{ xs: "100%", md: "80%" }}>
          <Formik
            initialValues={initialValues}
            onSubmit={(values) => createRing(values)}
            enableReinitialize
          >
            {({ values, setFieldValue }) => (
              <Form>
                <label>Ringin nimi</label>
                <Field name="name" />
                <FieldArray name="assignments">
                  {({ push }) => (
                    <Box>
                      {values.assignments.map((_, index) => (
                        <Box sx={{ marginTop: 2 }} key={index}>
                          <Autocomplete
                            options={playersWithIDAndName}
                            getOptionLabel={(player) => player.name}
                            getOptionKey={(player) => player.id}
                            value={
                              playersWithIDAndName.find(
                                (p) =>
                                  p.id === values.assignments[index].hunterId
                              ) || { name: "", id: "" }
                            }
                            onChange={(e, value) => {
                              setFieldValue(
                                `assignments[${index}].hunterId`,
                                value ? value.id : ""
                              );
                            }}
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id || value.id === ""
                            }
                            renderInput={(params) => (
                              <StyledTextField
                                {...params}
                                label="Metsästäjä"
                                name={`assignments[${index}].hunterId`}
                                sx={{ my: 0.6 }}
                              />
                            )}
                          />

                          <Autocomplete
                            options={playersWithIDAndName}
                            getOptionLabel={(player) => player.name}
                            getOptionKey={(player) => player.id}
                            onChange={(e, value) => {
                              setFieldValue(
                                `assignments[${index}].targetId`,
                                value ? value.id : ""
                              );
                            }}
                            isOptionEqualToValue={(option, value) =>
                              option.id === value?.id || value?.id === ""
                            }
                            value={
                              playersWithIDAndName.find(
                                (p) =>
                                  p.id === values.assignments[index].targetId
                              ) || { name: "", id: "" }
                            }
                            renderInput={(params) => (
                              <StyledTextField
                                {...params}
                                label="Kohde"
                                name={`assignments[${index}].targetId`}
                              />
                            )}
                          />
                        </Box>
                      ))}

                      <button
                        type="button"
                        className="secondary"
                        onClick={() =>
                          push({
                            hunterId:
                              values.assignments[values.assignments.length - 1]
                                .targetId,
                            targetId: ""
                          })
                        }
                      >
                        + Lisää
                      </button>
                    </Box>
                  )}
                </FieldArray>
                <LoadingButton type="submit" loading={loading}>
                  Tallenna rinki
                </LoadingButton>
              </Form>
            )}
          </Formik>
        </Box>
      )}
    </>
  );
};

export default CreateRingForm;
