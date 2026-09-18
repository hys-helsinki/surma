import GitHubIcon from "@mui/icons-material/GitHub";
import { Box, Link, Stack } from "@mui/material";
import { useTranslation } from "next-i18next";

const linkStyle = {
  color: "white",
  fontSize: "0.75rem",
  "&:hover": {
    textDecoration: "underline",
    opacity: 1
  }
};

export default function Footer() {
  const { t } = useTranslation("common");
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        py: 3,
        px: 2,
        backgroundColor: "#424242",
        borderTop: "1px solid rgba(255, 255, 255, 0.12)",
        color: "white",
        flexShrink: 0
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
          sx={linkStyle}
        >
          <GitHubIcon fontSize="small" />
        </Link>

        <Link
          href="https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot"
          target="_blank"
          rel="noreferrer"
          sx={linkStyle}
        >
          {t("footer.tournamentRules")}
        </Link>
        <Link href="/privacy" sx={linkStyle}>
          {t("footer.privacyPolicy")}
        </Link>
        <Box
          sx={{
            color: "white",
            fontSize: "0.75rem"
          }}
        >
          © {new Date().getFullYear()} {t("common.organizationName")}
        </Box>
      </Stack>
    </Box>
  );
}
