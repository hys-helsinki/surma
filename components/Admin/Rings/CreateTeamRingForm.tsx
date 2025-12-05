import { LoadingButton } from "@mui/lab";
import { Autocomplete, Box } from "@mui/material";
import { Player, User } from "@prisma/client";
import { Field, FieldArray, Form, Formik } from "formik";
import { useState } from "react";
import StyledTextField from "./StyledTextField";

const CreateTeamRingForm = ({
  teams,
  setPlayers,
  tournament,
  setShowForm,
  setRings
}: {
  teams: any;
  setPlayers: any;
  tournament: any;
  setShowForm: any;
  setRings: any;
}) => {
  const [loading, setLoading] = useState(false);
  const createRing = async (values) => {
    setLoading(true);

    if (
      values.assignments.filter(
        (a) => a.huntingTeamId !== "" && a.targetTeamId !== ""
      ).length === 0
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
      const res = await fetch("/api/team-rings/create", {
        method: "POST",
        body: JSON.stringify(newRing)
      });
      const responseData = await res.json();
      setPlayers(responseData.players);
      setRings((prevRings) => prevRings.concat(responseData.createdRing));
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
        huntingTeamId: "",
        targetTeamId: ""
      }
    ]
  };

  const teamsWithIdAndName: {
    id: string;
    name: string;
  }[] = teams.map((team) => ({
    id: team.id,
    name: team.name
  }));

  return (
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
                        options={teamsWithIdAndName}
                        getOptionLabel={(team) => team.name}
                        value={
                          teamsWithIdAndName.find(
                            (p) =>
                              p.id === values.assignments[index].huntingTeamId
                          ) || { name: "", id: "" }
                        }
                        onChange={(e, value) => {
                          setFieldValue(
                            `assignments[${index}].huntingTeamId`,
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
                            name={`assignments[${index}].huntingTeamId`}
                            sx={{ my: 0.6 }}
                          />
                        )}
                      />

                      <Autocomplete
                        options={teamsWithIdAndName}
                        getOptionLabel={(team) => team.name}
                        onChange={(e, value) => {
                          setFieldValue(
                            `assignments[${index}].targetTeamId`,
                            value ? value.id : ""
                          );
                        }}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderInput={(params) => (
                          <StyledTextField
                            {...params}
                            label="Kohde"
                            name={`assignments[${index}].targetTeamId`}
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
                        huntingTeamId:
                          values.assignments[values.assignments.length - 1]
                            .targetTeamId,
                        targetTeamId: ""
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
  );
};

export default CreateTeamRingForm;
