import { Alert, Box, Snackbar } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "next-i18next";

const ImageUploadForm = ({ setSelectedFileData }) => {
  const { t } = useTranslation("common");
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
    if (file.size > 4000000) {
      setErrorMessage(t("playerForm.imageTooLarge"));
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
      setErrorMessage(t("playerForm.imageReadError"));
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
        <label htmlFor="image">{t("playerForm.imageUploadLabel")}</label>
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
          <i>{t("playerForm.selectedFile", { fileName: selectedFileName })}</i>
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
