import { Dispatch, JSX, SetStateAction, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import IconButton from "@mui/material/IconButton";
import { Button } from "@mui/material";
import { TeamAssignment } from "@prisma/client";
import CreateTeamRingForm from "./CreateTeamRingForm";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { Box, Card, Autocomplete } from "@mui/material";
import { FieldArray, Form, Formik } from "formik";
import StyledTextField from "./StyledTextField";
import { playerColors } from "../../../lib/constants";
import {
  RingComponentProps,
  TeamRingWithAssignments
} from "../../../types/umpirepage";

const AssignmentCard = ({
  assignment,
  setAssignments,
  setPlayers,
  assignments,
  setTeamRings,
  teamRings,
  teams,
  setPlayerRings
}: RingComponentProps & {
  assignment: TeamAssignment;
  assignments: TeamAssignment[];
  setAssignments: Dispatch<SetStateAction<TeamAssignment[]>>;
}) => {
  const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);

  const deleteAssignment = async (id: string) => {
    setIsDeletingAssignment(true);
    if (window.confirm(`Haluatko varmasti poistaa toimeksiannon?`)) {
      const res = await fetch("/api/team-assignments/delete", {
        method: "DELETE",
        body: id
      });
      const responseData = await res.json();
      if (responseData.deletedTeamAssignment) {
        setAssignments(
          assignments.filter((assignment) => assignment.id !== id)
        );
        setPlayers(responseData.players);
        setPlayerRings(responseData.playerRings);
        const updatedRing = teamRings.find(
          (r) => r.id == assignment.teamAssignmentRingId
        );
        const assignmentsUpdated = {
          ...updatedRing,
          assignments: updatedRing.assignments.filter(
            (assignment) => assignment.id !== id
          )
        };
        setTeamRings(
          assignmentsUpdated.assignments.length === 0
            ? teamRings.filter(
                (ring) => ring.id !== assignment.teamAssignmentRingId
              )
            : teamRings.map((ring) =>
                ring.id === assignment.teamAssignmentRingId
                  ? assignmentsUpdated
                  : ring
              )
        );
      }
    }
    setIsDeletingAssignment(false);
  };

  return (
    <Card
      sx={{
        pl: 2,
        mr: 2,
        my: 2,
        backgroundImage: `linear-gradient(${
          teams.find((team) => assignment.huntingTeamId === team.id).colorCode
        }, ${
          teams.find((team) => assignment.targetTeamId === team.id).colorCode
        })`,
        backgroundColor: "whitesmoke",
        width: "100%"
      }}
    >
      <p>
        <strong>Metsästäjä: </strong>
        {teams.find((team) => team.id === assignment.huntingTeamId).name}
      </p>
      <p>
        <strong>Kohde: </strong>
        {teams.find((team) => team.id === assignment.targetTeamId).name}
      </p>
      <Button
        onClick={() => deleteAssignment(assignment.id)}
        loading={isDeletingAssignment}
        sx={{ margin: "10px" }}
        variant="contained"
        className="loadingButton"
      >
        Poista toimeksianto
      </Button>
    </Card>
  );
};

const Ring = ({
  teamRing,
  teamRings,
  setTeamRings,
  teams,
  setPlayers,
  tournament,
  setPlayerRings
}: RingComponentProps & { teamRing: TeamRingWithAssignments }) => {
  const [showRing, setShowRing] = useState(false);
  const [assignments, setAssignments] = useState(teamRing.assignments);
  const [isDeletingRing, setIsDeletingRing] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);

  const createAssignments = async (values) => {
    setIsCreatingAssignment(true);
    const newAssignments = values.assignments
      .filter((a) => a.huntingTeamId !== "" && a.targetTeamId !== "")
      .map((a) => ({
        ...a,
        teamAssignmentRingId: teamRing.id
      }));

    if (newAssignments.length === 0) {
      setIsCreatingAssignment(false);
      return;
    }
    try {
      const res = await fetch("/api/team-assignments/create", {
        method: "POST",
        body: JSON.stringify(newAssignments)
      });
      const responseData = await res.json();
      setAssignments(assignments.concat(responseData.savedTeamAssignments));
      setPlayers(responseData.players);
      setPlayerRings(responseData.playerRings);
      setTeamRings(
        teamRings.map((r) =>
          teamRing.id == r.id
            ? {
                ...r,
                assignments: assignments.concat(
                  responseData.savedTeamAssignments
                )
              }
            : { ...r }
        )
      );
    } catch (e) {
      console.log(e);
    }
    setIsCreatingAssignment(false);
  };

  const deleteRing = async (id) => {
    setIsDeletingRing(true);
    if (window.confirm(`Haluatko varmasti poistaa ringin ${teamRing.name}?`)) {
      const res = await fetch("/api/team-rings/delete", {
        method: "DELETE",
        body: JSON.stringify({ ringId: id, tournamentId: tournament.id })
      });
      const responseData = await res.json();
      if (responseData.deletedRing) {
        setTeamRings(
          teamRings.filter((ring) => ring.id !== responseData.deletedRing.id)
        );
        setPlayers(responseData.players);
        setPlayerRings(responseData.playerRings);
      }
    }
    setIsDeletingRing(false);
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
    <Box
      key={teamRing.id}
      sx={{
        width: { xs: "100%", md: "80%" }
      }}
    >
      <Button
        onClick={() => setShowRing(!showRing)}
        startIcon={
          showRing ? (
            <KeyboardArrowUpRoundedIcon />
          ) : (
            <KeyboardArrowDownRoundedIcon />
          )
        }
        sx={{
          fontFamily: "inherit",
          fontSize: "inherit",
          color: "inherit"
        }}
      >
        {teamRing.name}
      </Button>
      <IconButton onClick={() => deleteRing(teamRing.id)}>
        <DeleteOutlineIcon
          htmlColor="#FFFFFF"
          color={isDeletingRing ? "disabled" : "inherit"}
        />
      </IconButton>
      {showRing && (
        <div style={{ paddingLeft: "2rem" }}>
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              setAssignments={setAssignments}
              setPlayers={setPlayers}
              assignments={assignments}
              teams={teams}
              setPlayerRings={setPlayerRings}
              setTeamRings={setTeamRings}
              teamRings={teamRings}
            />
          ))}
          <Formik
            initialValues={initialValues}
            onSubmit={async (values, { resetForm }) => {
              await createAssignments(values);
              resetForm();
            }}
            enableReinitialize
          >
            {({ values, setFieldValue }) => (
              <Form>
                <FieldArray name="assignments">
                  {({ push }) => (
                    <Box>
                      {values.assignments.map((_, index) => (
                        <Box sx={{ marginTop: 2 }} key={index}>
                          <Autocomplete
                            options={teamsWithIdAndName}
                            getOptionLabel={(team) => team.name}
                            getOptionKey={(team) => team.id}
                            value={
                              teamsWithIdAndName.find(
                                (p) =>
                                  p.id ===
                                  values.assignments[index].huntingTeamId
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
                            getOptionKey={(team) => team.id}
                            value={
                              teamsWithIdAndName.find(
                                (p) =>
                                  p.id ===
                                  values.assignments[index].targetTeamId
                              ) || { name: "", id: "" }
                            }
                            onChange={(e, value) => {
                              setFieldValue(
                                `assignments[${index}].targetTeamId`,
                                value ? value.id : ""
                              );
                            }}
                            isOptionEqualToValue={(option, value) =>
                              option.id === value?.id || value?.id === ""
                            }
                            renderInput={(params) => (
                              <StyledTextField
                                {...params}
                                label="Kohde"
                                name={`assignments[${index}].targetTeamId`}
                                sx={{ my: 0.6 }}
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
                            huntingTeamId: "",
                            targetTeamId: ""
                          })
                        }
                      >
                        + Lisää
                      </button>
                    </Box>
                  )}
                </FieldArray>
                <Box>
                  <Button type="submit" loading={isCreatingAssignment}>
                    Tallenna toimeksiannot
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </Box>
  );
};

export const TeamRings = ({
  tournament,
  teamRings,
  teams,
  setTeamRings,
  setPlayers,
  setPlayerRings
}: RingComponentProps): JSX.Element => {
  const teamsWithColors = teams
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((team, index) => ({
      ...team,
      colorCode: playerColors[index]
    }));

  return (
    <Box>
      {teamRings.map((ring) => (
        <Ring
          key={ring.id}
          teamRing={ring}
          teamRings={teamRings}
          setTeamRings={setTeamRings}
          teams={teamsWithColors}
          tournament={tournament}
          setPlayers={setPlayers}
          setPlayerRings={setPlayerRings}
        />
      ))}
      <CreateTeamRingForm
        teams={teams}
        setPlayers={setPlayers}
        tournament={tournament}
        setTeamRings={setTeamRings}
        setPlayerRings={setPlayerRings}
      />
    </Box>
  );
};
