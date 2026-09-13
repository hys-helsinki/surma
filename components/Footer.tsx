import { OpenInNew } from "@mui/icons-material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Box, Link, Stack } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        py: 3,
        px: 2,
        backgroundColor: "#424242",
        borderTop: "1px solid rgba(255, 255, 255, 0.12)",
        color: "white"
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
      >
        <Link
          href="https://github.com/hys-helsinki/surma"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            color: "white",
            opacity: 0.9,
            "&:hover": { opacity: 1 }
          }}
        >
          <GitHubIcon fontSize="small" />
        </Link>

        <Link
          href="https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot"
          sx={{
            color: "white",
            fontSize: "0.75rem",
            "&:hover": {
              textDecoration: "underline",
              opacity: 1
            }
          }}
        >
          Turnaussäännöt
        </Link>
        <Link
          href="/privacy"
          sx={{
            color: "white",
            fontSize: "0.75rem",
            "&:hover": {
              textDecoration: "underline",
              opacity: 1
            }
          }}
        >
          Tietosuojaseloste
        </Link>
        <Box
          sx={{
            color: "white",
            fontSize: "0.75rem"
          }}
        >
          © {new Date().getFullYear()} Helsingin yliopiston salamurhaajat
        </Box>
      </Stack>
    </Box>
  );
}
