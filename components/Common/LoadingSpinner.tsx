import { Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

export default function LoadingSpinner() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "5rem"
      }}
    >
      <CircularProgress color="inherit" />
    </Box>
  );
}
