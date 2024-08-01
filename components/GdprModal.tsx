import { Box, Typography, Button } from "@mui/material/";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import GdprText from "./GdprText";
import styles from "../styles/Home.module.css";
import { useRouter } from 'next/router';

const style = {
  position: "absolute" as "absolute",
  color: "black",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  height: "400px",
  p: 4,
  overflow: "scroll"
};

export default function GDPRModal({ text }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const router = useRouter();

  return (
    <span>
      <a onClick={handleOpen}>
        <u>{text}</u>
      </a>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="privacy-policy-modal"
        aria-describedby="privacy-policy-in-a-nutshell"
      >
        <Box sx={style}>
          <Typography id="privacy-policy" variant="h6">
            <h3>Tietosuojailmoitus</h3>
          </Typography>
          <GdprText />
          <div className={styles.center}>
          <button onClick={handleClose} style={{marginBottom: "50px"}}>Kiitos, tämä riittää minulle!</button>
          <button onClick={() => router.push({pathname: `/pages/privacy`})}>Eikun koko ilmoitus, kiitos!</button>
          </div>
        </Box>
      </Modal>
    </span>
  );
}
