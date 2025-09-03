import { Box, Snackbar } from "@mui/material";
import { useState } from "react";

const ImageUploadForm = ({
  setSelectedFile,
  setSelectedFileName,
  setFileInputState,
  selectedFileName,
  fileInputState
}) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file == undefined) {
      setFileInputState("");
      setSelectedFile(null);
      setSelectedFileName("");
      return;
    }
    if (file.size > 10000000) {
      setOpenSnackbar(true);
      return;
    }
    setSelectedFile(file);
    setSelectedFileName(file.name);
    setFileInputState(event.target.value);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <form>
        <label htmlFor="image">Valitse kuva itsestäsi (max. 10MB)</label>
        <input
          type="file"
          name="image"
          id="image"
          accept="image/*"
          onChange={handleFileInputChange}
          value={fileInputState}
        />
      </form>
      {selectedFileName ? (
        <p>
          <i>Valittu tiedosto: {selectedFileName}</i>
        </p>
      ) : null}
      <Snackbar
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        autoHideDuration={4000}
        message="Kuva liian suuri"
      />
    </Box>
  );
};

export default ImageUploadForm;
