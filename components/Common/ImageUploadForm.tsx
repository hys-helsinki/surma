import { Alert, Box, Snackbar } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { useTranslation } from "next-i18next";
import { CldUploadWidget } from "next-cloudinary";

const ImageUploadForm = ({
  setImageUrl,
  tournamentId,
  userId,
  uploadLabel
}: {
  setImageUrl: Dispatch<SetStateAction<string>>;
  tournamentId: string;
  userId: string;
  uploadLabel: string;
}) => {
  const { t } = useTranslation("common");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleUploadSuccess = (result, widget) => {
    if (!result.info || !result.info.secure_url) {
      setErrorMessage(t("imageUpload.uploadError"));
      setShowError(true);
      widget.hide();
    }
    setImageUrl(result.info.secure_url);
    widget.hide();
  };

  const handleUploadError = (error) => {
    console.error("Upload error:", error);
    setErrorMessage(t("imageUpload.uploadError"));
    setShowError(true);
  };
  return (
    <Box>
      <CldUploadWidget
        uploadPreset="hys_surma"
        options={{
          maxFiles: 1,
          publicId: `${userId}`,
          folder: `hys_surma/${tournamentId}`,
          maxImageFileSize: 10000000
        }}
        signatureEndpoint="/api/sign-cloudinary-params"
        onSuccess={handleUploadSuccess}
        onError={handleUploadError}
      >
        {({ open }) => {
          return (
            <button
              // type="button"
              onClick={() => {
                // event.preventDefault();
                open();
              }}
            >
              {uploadLabel}
            </button>
          );
        }}
      </CldUploadWidget>
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
