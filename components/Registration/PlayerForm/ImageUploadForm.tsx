import { Alert, Box, Snackbar } from "@mui/material";
import { useState } from "react";

const ImageUploadForm = ({ setSelectedFileData }) => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fileInputState, setFileInputState] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file == undefined) {
      setFileInputState("");
      setSelectedFileData(null);
      setSelectedFileName("");
      return;
    }
    if (file.size > 10000000) {
      setErrorMessage("Kuva liian suuri (yli 10 Mt)");
      setShowError(true);
      return;
    }

    setSelectedFileName(file.name);
    setFileInputState(event.target.value);

    const reader = new FileReader();
    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.log(error);
      setErrorMessage(
        "Kuvatiedoston lukeminen epäonnistui. Kokeile toista tiedostoa"
      );
      setShowError(true);
      setFileInputState("");
      setSelectedFileName("");
      return;
    }

    reader.onload = () => {
      setSelectedFileData(reader.result);
    };
  };

  return (
    <Box sx={{ mb: 2 }}>
      <form>
        <label htmlFor="image">Valitse kuva itsestäsi (max. 10 Mt)</label>
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
      <Snackbar open={showError} onClose={() => setShowError(false)}>
        <Alert
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
          onClose={() => setShowError(false)}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImageUploadForm;
