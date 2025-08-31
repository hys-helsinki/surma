import { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import IconButton from "@mui/material/IconButton";
import { Box, Button, Grid, Card } from "@mui/material";
import { Player, User, Tournament, Assignment } from "@prisma/client";
import CreateRingForm from "./CreateRingForm";
import { Field, Form, Formik } from "formik";
import LoadingButton from "@mui/lab/LoadingButton";
import { playerColors } from "../../../lib/constants";
import PlayersWithTargets from "./PlayersWithTargets";
import { getPlayerFullNameById } from "../../utils";
interface PlayerWithUser extends Player {
  user: User;
  targets: Assignment[];
}

const AssignmentCard = ({
  assignment,
  setAssignments,
  setPlayers,
  assignments,
  players
}) => {
  const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);

  const deleteAssignment = async (id: string) => {
    setIsDeletingAssignment(true);
    const res = await fetch("/api/tournament/assignments", {
      method: "DELETE",
      body: id
    });
    const responseData = await res.json();
    if (responseData.deletedAssignment) {
      setAssignments(assignments.filter((assignment) => assignment.id !== id));
      setPlayers(responseData.players);
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
        width: { xs: "100%", md: "70%" }
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

const Ring = ({ ring, rings, setRings, players, setPlayers, tournament }) => {
  const [showRing, setShowRing] = useState(false);
  const [assignments, setAssignments] = useState(ring.assignments);
  const [isDeletingRing, setIsDeletingRing] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);

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
    const responseData = await res.json();
    setAssignments(assignments.concat(responseData.savedAssignment));
    setIsCreatingAssignment(false);
    setPlayers(responseData.players);
  };

  const deleteRing = async (id) => {
    setIsDeletingRing(true);
    const res = await fetch("/api/tournament/rings", {
      method: "DELETE",
      body: JSON.stringify({ ringId: id, tournamentId: tournament.id })
    });
    const responseData = await res.json();
    if (responseData.deletedRing) {
      setRings(rings.filter((ring) => ring.id !== responseData.deletedRing.id));
      setPlayers(responseData.players);
    }
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
            <AssignmentCard
              assignment={assignment}
              setAssignments={setAssignments}
              setPlayers={setPlayers}
              assignments={assignments}
              players={players}
              key={assignment.id}
            />
          ))}
          <Formik
            initialValues={{ hunter: "", target: "" }}
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
                        key={p.id}
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
                        key={p.id}
                      >{`${p.user.firstName} ${p.user.lastName}`}</option>
                    ))}
                  </Field>
                </Box>
                <Box width={{ xs: "100%", md: "60%" }}>
                  <LoadingButton type="submit" loading={isCreatingAssignment}>
                    Luo uusi toimeksianto
                  </LoadingButton>
                </Box>
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
  setPlayers,
  rings,
  setRings
}: {
  tournament: Tournament;
  players: PlayerWithUser[];
  setPlayers: any;
  rings: any;
  setRings: any;
}): JSX.Element => {
  const [showForm, setShowForm] = useState(false);

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
    <Grid container>
      <Grid item xs={12} md={4}>
        <h2>Ringit</h2>
        {rings.map((ring) => (
          <Ring
            players={activePlayers}
            setPlayers={setPlayers}
            ring={ring}
            tournament={tournament}
            rings={rings}
            setRings={setRings}
            key={ring.id}
          />
        ))}
        <button onClick={() => setShowForm(!showForm)}>
          {!showForm ? "Luo uusi rinki" : "Peruuta"}
        </button>
        {showForm && (
          <CreateRingForm
            players={activePlayers}
            setPlayers={setPlayers}
            tournament={tournament}
            setShowForm={setShowForm}
            setRings={setRings}
          />
        )}
      </Grid>
      <Grid item xs={12} md={4}>
        <PlayersWithTargets players={players} />
      </Grid>
    </Grid>
  );
};
