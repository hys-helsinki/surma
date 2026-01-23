import { Dispatch, SetStateAction, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import IconButton from "@mui/material/IconButton";
import { Box, Button, Card, Autocomplete } from "@mui/material";
import { Assignment } from "@prisma/client";
import CreateRingForm from "./CreateRingForm";
import { FieldArray, Form, Formik } from "formik";
import LoadingButton from "@mui/lab/LoadingButton";
import { playerColors } from "../../../lib/constants";
import { getPlayerFullNameById } from "../../utils";
import StyledTextField from "./StyledTextField";
import {
  RingComponentProps,
  RingWithAssignments
} from "../../../types/umpirepage";

const AssignmentCard = ({
  assignment,
  assignments,
  setAssignments,
  setPlayers,
  players,
  setPlayerRings,
  playerRings
}: RingComponentProps & {
  assignment: Assignment;
  assignments: Assignment[];
  setAssignments: Dispatch<SetStateAction<Assignment[]>>;
}) => {
  const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);

  const deleteAssignment = async (id: string) => {
    setIsDeletingAssignment(true);
    if (window.confirm(`Haluatko varmasti poistaa toimeksiannon?`)) {
      const res = await fetch("/api/tournament/assignments", {
        method: "DELETE",
        body: id
      });
      const responseData = await res.json();
      if (responseData.deletedAssignment) {
        setAssignments(
          assignments.filter((assignment) => assignment.id !== id)
        );
        setPlayers(responseData.players);
        const updatedRing = playerRings.find((r) => r.id == assignment.ringId);
        const assignmentsUpdated = {
          ...updatedRing,
          assignments: updatedRing.assignments.filter(
            (assignment) => assignment.id !== id
          )
        };
        setPlayerRings(
          assignmentsUpdated.assignments.length === 0
            ? playerRings.filter((ring) => ring.id !== assignment.ringId)
            : playerRings.map((ring) =>
                ring.id === assignment.ringId ? assignmentsUpdated : ring
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
          players.find((p) => assignment.hunterId === p.id).colorCode
        }, ${players.find((p) => assignment.targetId === p.id).colorCode})`,
        width: "100%"
      }}
    >
      <p>
        <strong>Metsästäjä: </strong>
        {getPlayerFullNameById(assignment.hunterId, players)}
      </p>
      <p>
        <strong>Kohde: </strong>
        {getPlayerFullNameById(assignment.targetId, players)}
      </p>
      <LoadingButton
        onClick={() => deleteAssignment(assignment.id)}
        loading={isDeletingAssignment}
        sx={{ margin: "10px" }}
        variant="contained"
      >
        Poista toimeksianto
      </LoadingButton>
    </Card>
  );
};

const Ring = ({
  ring,
  playerRings,
  setPlayerRings,
  players,
  setPlayers,
  tournament
}: RingComponentProps & { ring: RingWithAssignments }) => {
  const [showRing, setShowRing] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>(
    ring.assignments
  );
  const [isDeletingRing, setIsDeletingRing] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);

  const createAssignments = async (values) => {
    setIsCreatingAssignment(true);
    const newAssignments = values.assignments
      .filter((a) => a.hunterId !== "" && a.targetId !== "")
      .map((a) => ({
        ...a,
        ringId: ring.id
      }));
    if (newAssignments.length === 0) {
      setIsCreatingAssignment(false);
      return;
    }
    try {
      const res = await fetch("/api/tournament/assignments", {
        method: "POST",
        body: JSON.stringify(newAssignments)
      });
      const responseData = await res.json();
      setAssignments(assignments.concat(responseData.savedAssignments));
      setPlayerRings(
        playerRings.map((r) =>
          ring.id == r.id
            ? {
                ...ring,
                assignments: r.assignments.concat(responseData.savedAssignments)
              }
            : { ...r }
        )
      );
      setPlayers(responseData.players);
    } catch (e) {
      console.log(e);
    }
    setIsCreatingAssignment(false);
  };

  const deleteRing = async (id) => {
    setIsDeletingRing(true);
    if (window.confirm(`Haluatko varmasti poistaa ringin ${ring.name}?`)) {
      const res = await fetch("/api/tournament/rings", {
        method: "DELETE",
        body: JSON.stringify({ ringId: id, tournamentId: tournament.id })
      });
      const responseData = await res.json();
      if (responseData.deletedRing) {
        setPlayerRings(
          playerRings.filter((ring) => ring.id !== responseData.deletedRing.id)
        );
        setPlayers(responseData.players);
      }
    }
    setIsDeletingRing(false);
  };

  const playersWithIDAndName = players.map((player) => ({
    id: player.id,
    name: `${player.user.firstName} ${player.user.lastName}`
  }));

  return (
    <Box
      key={ring.id}
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
        {ring.name}
      </Button>
      <IconButton onClick={() => deleteRing(ring.id)}>
        <DeleteOutlineIcon
          htmlColor="#FFFFFF"
          color={isDeletingRing ? "disabled" : "inherit"}
        />
      </IconButton>
      {showRing && (
        <div style={{ paddingLeft: "2rem" }}>
          {assignments.map((assignment) => (
            <AssignmentCard
              assignment={assignment}
              setAssignments={setAssignments}
              setPlayers={setPlayers}
              assignments={assignments}
              players={players}
              key={assignment.id}
              setPlayerRings={setPlayerRings}
              playerRings={playerRings}
            />
          ))}
          <Formik
            initialValues={{
              assignments: [
                {
                  hunterId: "",
                  targetId: ""
                }
              ]
            }}
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
                            options={playersWithIDAndName}
                            getOptionLabel={(player) => player.name}
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
                            value={
                              playersWithIDAndName.find(
                                (p) =>
                                  p.id === values.assignments[index].targetId
                              ) || { name: "", id: "" }
                            }
                            onChange={(e, value) => {
                              setFieldValue(
                                `assignments[${index}].targetId`,
                                value ? value.id : ""
                              );
                            }}
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id || value.id === ""
                            }
                            renderInput={(params) => (
                              <StyledTextField
                                {...params}
                                label="Kohde"
                                name={`assignments[${index}].targetId`}
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
                            hunterId: "",
                            targetId: ""
                          })
                        }
                      >
                        + Lisää
                      </button>
                    </Box>
                  )}
                </FieldArray>
                <Box>
                  <LoadingButton type="submit" loading={isCreatingAssignment}>
                    Tallenna toimeksiannot
                  </LoadingButton>
                </Box>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </Box>
  );
};

export const PlayerRings = ({
  tournament,
  players,
  setPlayers,
  playerRings,
  setPlayerRings
}: RingComponentProps): JSX.Element => {
  const sortedPlayersWithColors = players
    .sort((a, b) => a.user.firstName.localeCompare(b.user.firstName))
    .map((player, index) => ({
      ...player,
      colorCode: playerColors[index]
    }));

  const activePlayers = sortedPlayersWithColors.filter(
    (player) => player.state !== "DEAD"
  );

  return (
    <Box>
      {playerRings.map((ring) => (
        <Ring
          players={activePlayers}
          setPlayers={setPlayers}
          ring={ring}
          tournament={tournament}
          playerRings={playerRings}
          setPlayerRings={setPlayerRings}
          key={ring.id}
        />
      ))}
      <CreateRingForm
        players={activePlayers}
        setPlayers={setPlayers}
        tournament={tournament}
        setPlayerRings={setPlayerRings}
      />
    </Box>
  );
};
