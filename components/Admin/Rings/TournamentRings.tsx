import { useEffect, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import IconButton from "@mui/material/IconButton";
import { Box, Button } from "@mui/material";
import { Player, User, Tournament } from "@prisma/client";
import CreateRingForm from "./CreateRingForm";
import { Field, Form, Formik } from "formik";
import LoadingButton from "@mui/lab/LoadingButton";

interface PlayerWithUser extends Player {
  user: User;
}

const Ring = ({ ring, rings, setRings, players, tournament }) => {
  const [showRing, setShowRing] = useState(false);
  const [assignments, setAssignments] = useState(ring.assignments);
  const [isDeletingRing, setIsDeletingRing] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);

  if (!assignments || !players) return null;

  const deleteAssignment = async (id: string) => {
    setIsDeletingAssignment(true);
    const res = await fetch("/api/tournament/assignments", {
      method: "DELETE",
      body: id
    });
    const ringWithoutDeletedAssigment = await res.json();
    setRings(
      rings.map((r) => (r.id !== ring ? r : ringWithoutDeletedAssigment))
    );
    setAssignments(assignments.filter((assignment) => assignment.id !== id));
    setIsDeletingAssignment(false);
  };

  const createAssignment = async (values) => {
    setIsCreatingAssignment(true);
    if (!values.hunter || !values.target) return;
    const newAssignment = {
      ringId: ring.id,
      hunterId: values.hunter,
      targetId: values.target
    };

    const res = await fetch("/api/tournament/assignments", {
      method: "POST",
      body: JSON.stringify(newAssignment)
    });
    const createdAssignment = await res.json();
    setAssignments(assignments.concat(createdAssignment));
    setIsCreatingAssignment(false);
  };

  const deleteRing = async (id) => {
    setIsDeletingRing(true);
    const res = await fetch("/api/tournament/rings", {
      method: "DELETE",
      body: JSON.stringify({ ringId: id, tournamentId: tournament.id })
    });
    const deletedRing = await res.json();
    setRings(rings.filter((ring) => ring.id !== deletedRing.id));
    setIsDeletingRing(false);
  };

  const getPlayerName = (playerId) => {
    if (!playerId) return;
    const searchedPlayer = players.find((player) => playerId == player.id);

    return `${searchedPlayer.user.firstName} ${searchedPlayer.user.lastName}`;
  };

  return (
    <div key={ring.id}>
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
            <div key={assignment.id}>
              <p>Metsästäjä {getPlayerName(assignment.hunterId)}</p>
              <p>Kohde {getPlayerName(assignment.targetId)}</p>
              <LoadingButton
                onClick={() => deleteAssignment(assignment.id)}
                loading={isDeletingAssignment}
              >
                Poista toimeksianto
              </LoadingButton>
            </div>
          ))}
          <Formik
            initialValues={{ hunterId: "", targetId: "" }}
            onSubmit={(values) => createAssignment(values)}
          >
            {() => (
              <Form>
                <Box>
                  <label>Metsästäjä</label>
                  <Field as="select" name="hunter">
                    <option value="">--</option>
                    {players.map((p) => (
                      <option
                        value={p.id}
                      >{`${p.user.firstName} ${p.user.lastName}`}</option>
                    ))}
                  </Field>
                </Box>
                <Box>
                  <label>Kohde</label>
                  <Field as="select" name="target">
                    <option value="">--</option>
                    {players.map((p) => (
                      <option
                        value={p.id}
                      >{`${p.user.firstName} ${p.user.lastName}`}</option>
                    ))}
                  </Field>
                </Box>

                <LoadingButton type="submit" loading={isCreatingAssignment}>
                  Luo uusi toimeksianto
                </LoadingButton>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
};

export const TournamentRings = ({
  tournament,
  players,
  rings
}: {
  tournament: Tournament;
  players: PlayerWithUser[];
  rings: any;
}): JSX.Element => {
  const [allRings, setRings] = useState(rings);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setRings(rings);
  }, [rings]);

  const sortedPlayers = players.sort((a, b) =>
    a.user.firstName.localeCompare(b.user.firstName)
  );

  return (
    <Box width={{ xs: "100%", md: "25%" }}>
      <h2>Ringit</h2>
      {allRings.map((ring) => (
        <Ring
          players={players}
          ring={ring}
          tournament={tournament}
          rings={allRings}
          setRings={setRings}
          key={ring.id}
        />
      ))}
      <button onClick={() => setShowForm(!showForm)}>
        {!showForm ? "Luo uusi rinki" : "Peruuta"}
      </button>
      {showForm && (
        <CreateRingForm
          players={sortedPlayers}
          tournament={tournament}
          setShowForm={setShowForm}
          setRings={setRings}
        />
      )}
    </Box>
  );
};
