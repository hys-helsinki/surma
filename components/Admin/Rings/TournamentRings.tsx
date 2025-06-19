import { useEffect, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import IconButton from "@mui/material/IconButton";
import { Box, Button, Grid } from "@mui/material";
import {
  Player,
  User,
  Tournament,
  Assignment,
  AssignmentRing
} from "@prisma/client";
import CreateRingForm from "./CreateRingForm";
import { Field, Form, Formik } from "formik";
import LoadingButton from "@mui/lab/LoadingButton";
interface PlayerWithUser extends Player {
  user: User;
  targets: Assignment[];
}
interface RingWithAssignments extends AssignmentRing {
  assignments: Assignment[];
}

const Ring = ({ ring, rings, setRings, players, tournament }) => {
  const [showRing, setShowRing] = useState(false);
  const [assignments, setAssignments] = useState(ring.assignments);
  const [isDeletingRing, setIsDeletingRing] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);

  if (!assignments || !players) return null;

  const getPlayerName = (playerId) => {
    if (!playerId) return;
    const searchedPlayer = players.find((player) => playerId == player.id);

    return `${searchedPlayer.user.firstName} ${searchedPlayer.user.lastName}`;
  };

  const deleteAssignment = async (id: string) => {
    setIsDeletingAssignment(true);
    const res = await fetch("/api/tournament/assignments", {
      method: "DELETE",
      body: id
    });
    const deletedAssignment = await res.json();
    if (deletedAssignment) {
      setAssignments(assignments.filter((assignment) => assignment.id !== id));
    }
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
  const [allRings, setRings] = useState<RingWithAssignments[]>(rings);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setRings(rings);
  }, [rings]);

  const sortedPlayers = players.sort((a, b) =>
    a.user.firstName.localeCompare(b.user.firstName)
  );

  const getPlayerName = (playerId) => {
    if (!playerId) return;
    const searchedPlayer = players.find((player) => playerId == player.id);

    return `${searchedPlayer.user.firstName} ${searchedPlayer.user.lastName}`;
  };

  return (
    <Grid container>
      <Grid item xs={12} md={3}>
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
      </Grid>
      <Grid item xs={12} md={3}>
        <h2>Pelaajien kohteet</h2>
        {players.map((player) => (
          <Box key={player.id}>
            <p>
              {player.user.firstName} {player.user.lastName}
            </p>
            <ul>
              {player.targets.map((assignment) => (
                <li key={assignment.id}>
                  {getPlayerName(assignment.targetId)}
                </li>
              ))}
            </ul>
          </Box>
        ))}
      </Grid>
    </Grid>
  );
};
