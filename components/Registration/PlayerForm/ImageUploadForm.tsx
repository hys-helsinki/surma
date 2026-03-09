import { Box, Snackbar } from "@mui/material";
import { useState } from "react";

const ImageUploadForm = ({
  setSelectedFile,
  setSelectedFileName,
  setFileInputState,
  selectedFileName,
  fileInputState
}) => {
  const [showImageFileTooBigMessage, setShowImageFileTooBigMessage] =
    useState(false);
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file == undefined) {
      setFileInputState("");
      setSelectedFile(null);
      setSelectedFileName("");
      return;
    }
    if (file.size > 4000000) {
      setShowImageFileTooBigMessage(true);
      return;
    }
    setSelectedFile(file);
    setSelectedFileName(file.name);
    setFileInputState(event.target.value);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <form>
        <label htmlFor="image">Valitse kuva itsestäsi (max. 4 Mt)</label>
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
        open={showImageFileTooBigMessage}
        onClose={() => setShowImageFileTooBigMessage(false)}
        autoHideDuration={4000}
        message="Kuva liian suuri (yli 4 Mt)"
      />
    </Box>
  );
};

export default ImageUploadForm;
