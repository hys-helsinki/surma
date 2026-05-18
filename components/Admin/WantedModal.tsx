import { Box, Modal, Snackbar, Button, Alert } from "@mui/material";
import { Formik, Form, Field } from "formik";
import { getPlayerFullNameById } from "../utils";
import { Dispatch, SetStateAction, useState } from "react";
import { RingWithAssignments, UmpirePagePlayer } from "../../types/umpirepage";
import { Tournament } from "@prisma/client";

const style = {
  position: "absolute" as "absolute",
  color: "white",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#221717ff",
  border: "2px solid #000",
  boxShadow: 24,
  height: "600px",
  p: 4,
  overflow: "scroll"
};

const WantedModal = ({
  players,
  wantedPlayerId,
  open,
  setRings,
  setPlayers,
  setOpenModal,
  tournament
}: {
  players: UmpirePagePlayer[];
  wantedPlayerId: string;
  open: boolean;
  setRings: Dispatch<SetStateAction<RingWithAssignments[]>>;
  setPlayers?: Dispatch<SetStateAction<UmpirePagePlayer[]>>;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  tournament: Tournament;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessText, setShowSuccessText] = useState(false);

  const detectivePlayers = players
    .filter((player) => player.state === "DETECTIVE")
    .sort((a, b) => a.user.firstName.localeCompare(b.user.firstName));

  const wantedPlayerName = getPlayerFullNameById(wantedPlayerId, players);

  const handleMakeWanted = async (values) => {
    setIsLoading(true);

    try {
      const assignments = values.selectedPlayers.map((playerId) => ({
        hunterId: playerId,
        targetId: wantedPlayerId
      }));

      const newRing = {
        assignments,
        name: `Etsintäkuulutus ${wantedPlayerName}`,
        tournamentId: tournament.id
      };

      const res = await fetch("/api/tournament/rings", {
        method: "POST",
        body: JSON.stringify(newRing)
      });
      const responseData = await res.json();
      setPlayers(responseData.players);
      setRings((prevRings) => prevRings.concat(responseData.createdRing));
      setShowSuccessText(true);
      setOpenModal(false);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Modal open={open}>
        <Box sx={style}>
          <Formik
            initialValues={{ selectedPlayers: [] }}
            onSubmit={(values) => handleMakeWanted(values)}
          >
            {({ values, setFieldValue }) => {
              const allSelected =
                values.selectedPlayers.length === detectivePlayers.length;

              const handleSelectAll = () => {
                if (allSelected) {
                  setFieldValue("selectedPlayers", []);
                } else {
                  const allIds = detectivePlayers.map((p) => String(p.id));
                  setFieldValue("selectedPlayers", allIds);
                }
              };
              return (
                <Form>
                  <p>
                    Keille etsiville annat kohteeksi pelaajan {wantedPlayerName}
                    ?
                  </p>
                  {detectivePlayers.length === 0 && <i>Ei etsiviä :(</i>}
                  {detectivePlayers.length > 0 && (
                    <Box>
                      <button type="button" onClick={handleSelectAll}>
                        {allSelected ? "Tyhjennä" : "Valitse kaikki"}
                      </button>
                    </Box>
                  )}
                  {detectivePlayers.map((player) => (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "left"
                      }}
                      key={player.id}
                    >
                      <Field
                        type="checkbox"
                        name="selectedPlayers"
                        value={player.id}
                        style={{ width: "unset", marginRight: "1rem" }}
                      />
                      <label key={player.id}>
                        <p>
                          {player.user.firstName} {player.user.lastName}
                        </p>
                      </label>
                    </Box>
                  ))}

                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={
                      detectivePlayers.length === 0 ||
                      values.selectedPlayers.length === 0
                    }
                  >
                    Etsintäkuuluta
                  </Button>
                  <button onClick={() => setOpenModal(false)}>Peruuta</button>
                </Form>
              );
            }}
          </Formik>
        </Box>
      </Modal>
      <Snackbar
        open={showSuccessText}
        onClose={() => setShowSuccessText(false)}
        autoHideDuration={4000}
        message="Etsintäkuuluttaminen onnistui!"
      />
      <Snackbar
        open={showSuccessText}
        onClose={() => setShowSuccessText(false)}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
          onClose={() => setShowSuccessText(false)}
        >
          Etsintäkuuluttaminen onnistui!
        </Alert>
      </Snackbar>
    </>
  );
};

export default WantedModal;
