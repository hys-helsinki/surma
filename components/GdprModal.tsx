import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import GdprText from "./GdprText";

const style = {
  position: "absolute" as "absolute",
  color: "black",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  height: "400px",
  p: 4,
  overflow: "scroll"
};

export default function GDPRModal() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <span>
      <a onClick={handleOpen}>
        <u>tietosuojaselosteen</u>
      </a>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Tietosuojaseloste
          </Typography>

          <GdprText />
        </Box>
      </Modal>
    </span>
  );
}
