import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import styles from "../../styles/Home.module.css";
import Link from "next/link";
import { useTranslation } from "next-i18next";

const InfoAccordion = () => {
  const { t } = useTranslation("common");
  return (
    <div>
      <Accordion variant="outlined">
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon style={{ color: "white" }} />}
          aria-controls="info-from-Slaughter"
          id="surma-panel"
          sx={{
            backgroundColor: "rgb(34, 23, 23)",
            color: "white"
          }}
        >
          <h2 className={styles.accordionText}>{t("landingPage.infoAccordion.whatIsSurmaTitle")}</h2>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "rgb(34, 23, 23)",
            color: "white"
          }}
        >
          {t("landingPage.infoAccordion.whatIsSurmaContent")}
          <a href="https://github.com/hys-helsinki">
            {t("landingPage.infoAccordion.hysinOrgLink")}
          </a>
          {t("landingPage.infoAccordion.whatIsSurmaContent2")}
        </AccordionDetails>
      </Accordion>
      <Accordion variant="outlined">
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon style={{ color: "white" }} />}
          aria-controls="info-from-assassination-tournaments"
          id="tournament-panel"
          sx={{
            backgroundColor: "rgb(34, 23, 23)",
            color: "white"
          }}
        >
          <h2 className={styles.accordionText}>{t("landingPage.infoAccordion.whatIsAssassinationTournamentTitle")}</h2>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "rgb(34, 23, 23)",
            color: "white"
          }}
        >
          <p>
            {t("landingPage.infoAccordion.whatIsAssassinationTournamentContent1")}
          </p>
          <p>
            {t("landingPage.infoAccordion.whatIsAssassinationTournamentContent2")}
          </p>
          <p>
            {t("landingPage.infoAccordion.whatIsAssassinationTournamentContent3")}
            <Link href="/privacy">{t("landingPage.infoAccordion.privacyPolicyLink")}</Link>.
          </p>
          <p>
            {t("landingPage.infoAccordion.whatIsAssassinationTournamentContent4")}
            <a href="https://salamurhaajat.net/mika-salamurhapeli">
              {t("landingPage.infoAccordion.hysinRulesLink")}
            </a>
            .
          </p>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
export default InfoAccordion;
