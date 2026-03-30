import { Box, Container } from "@mui/material";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const getTranslationArray = (data: any): string[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (typeof data === "object" && data !== null) {
    return Object.values(data).filter(
      (item) => typeof item === "string"
    ) as string[];
  }
  return [];
};

export async function getServerSideProps(context) {
  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common"]))
    }
  };
}

export default function Privacy() {
  const { t } = useTranslation("common");

  return (
    <Container maxWidth="md">
      <Box>
        <h1>{t("privacy.title")}</h1>
        <Box sx={{ paddingTop: "5px" }}>
          <h2>{t("privacy.whatIsSurma.title")}</h2>
          <p>
            {t("privacy.whatIsSurma.content")}{" "}
            <a href="https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot">
              {t("privacy.whatIsSurma.link")}
            </a>
            .
          </p>

          <h2>{t("privacy.dataSources.title")}</h2>
          <p>{t("privacy.dataSources.content")}</p>

          <h2>{t("privacy.collectedData.title")}</h2>
          <p>{t("privacy.collectedData.registrationFormTitle")}</p>
          <ul>
            {getTranslationArray(
              t("privacy.collectedData.registrationFormItems", {
                returnObjects: true
              })
            ).map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <p>{t("privacy.collectedData.participationFormTitle")}</p>
          <ul>
            {getTranslationArray(
              t("privacy.collectedData.participationFormItems", {
                returnObjects: true
              })
            ).map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <p>{t("privacy.collectedData.cookiesTitle")}</p>
          <ul>
            {getTranslationArray(
              t("privacy.collectedData.cookiesItems", {
                returnObjects: true
              })
            ).map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <h2>{t("privacy.groundsAndPurposes.title")}</h2>
          <p>{t("privacy.groundsAndPurposes.administrators.title")}</p>
          <ul>
            {getTranslationArray(
              t("privacy.groundsAndPurposes.administrators.items", {
                returnObjects: true
              })
            ).map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <p>
            {t("privacy.groundsAndPurposes.administratorsAndUmpires.title")}
          </p>
          <ul>
            {getTranslationArray(
              t("privacy.groundsAndPurposes.administratorsAndUmpires.items", {
                returnObjects: true
              })
            ).map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <p>{t("privacy.groundsAndPurposes.umpires.title")}</p>
          <ul>
            {getTranslationArray(
              t("privacy.groundsAndPurposes.umpires.items", {
                returnObjects: true
              })
            ).map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <p>{t("privacy.groundsAndPurposes.umpiresPublic.title")}</p>
          <ul>
            {getTranslationArray(
              t("privacy.groundsAndPurposes.umpiresPublic.items", {
                returnObjects: true
              })
            ).map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <p>{t("privacy.groundsAndPurposes.umpiresAndPlayers.title")}</p>
          <ul>
            {getTranslationArray(
              t("privacy.groundsAndPurposes.umpiresAndPlayers.items", {
                returnObjects: true
              })
            ).map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <h2>{t("privacy.retentionPeriod.title")}</h2>
          <p>{t("privacy.retentionPeriod.content")}</p>

          <h2>{t("privacy.userRights.title")}</h2>
          <h3>{t("privacy.userRights.rightToKnow.title")}</h3>
          <p>{t("privacy.userRights.rightToKnow.content")}</p>

          <h3>{t("privacy.userRights.rightToRectify.title")}</h3>
          <p>{t("privacy.userRights.rightToRectify.content")}</p>

          <h3>{t("privacy.userRights.rightToBeForotten.title")}</h3>
          <p>{t("privacy.userRights.rightToBeForotten.content")}</p>

          <h3>{t("privacy.userRights.rightToObject.title")}</h3>
          <p>{t("privacy.userRights.rightToObject.content")}</p>

          <h2>{t("privacy.thirdParties.title")}</h2>
          <p>
            <a href="https://eur-lex.europa.eu/legal-content/FI/TXT/?uri=CELEX%3A32016R0679">
              Euroopan unionin tietosuoja-asetus
            </a>{" "}
            {t("privacy.thirdParties.intro")}
          </p>

          <p>{t("privacy.thirdParties.dataTransfer")}</p>

          <p>{t("privacy.thirdParties.playerData")}</p>

          <p>{t("privacy.thirdParties.databaseInfo")}</p>

          <p>
            <a href="https://vercel.com/legal/privacy-policy">
              {t("privacy.thirdParties.vercelLink")}
            </a>
            .
          </p>

          <p>
            {t("privacy.thirdParties.hostingInfo")}
            <a href="https://suncomet.fi/osoitteet/">
              {t("privacy.thirdParties.sunCometLink")}
            </a>
            .
          </p>

          <p>{t("privacy.thirdParties.eventPageInfo")}</p>

          <p>
            <a href="https://wordpress.org/about/privacy/">
              {t("privacy.thirdParties.wordPressLink")}
            </a>
            .
          </p>

          <p>
            <a href="https://salamurhaajat.net/tietosuojakaytanto">
              {t("privacy.thirdParties.hysinLink")}
            </a>
            .
          </p>

          <p>{t("privacy.thirdParties.dataDisclosure")}</p>
          <ul>
            {getTranslationArray(
              t("privacy.thirdParties.disclosureReasons", {
                returnObjects: true
              })
            ).map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <h2>{t("privacy.contact.title")}</h2>
          <p>{t("privacy.contact.intro")}</p>

          <ul>
            <li>{t("privacy.contact.dataController")}</li>
            <ul>
              <li>{t("privacy.contact.dataControllerOrg")}</li>
              <li>{t("privacy.contact.dataControllerOrgId")}</li>
              <li>{t("privacy.contact.dataControllerAddress")}</li>
              <li>
                {t("privacy.contact.dataControllerDpo")}{" "}
                <a href="mailto:gdpr@salamurhaajat.net">
                  gdpr@salamurhaajat.net
                </a>
              </li>
            </ul>
            <li>{t("privacy.contact.processors")}</li>
            <ul>
              <li>
                {t("privacy.contact.processorsSurma")}{" "}
                <a href="mailto:surma@salamurhaajat.net">
                  surma@salamurhaajat.net
                </a>
              </li>
              <li>
                {t("privacy.contact.processorsUmpires")}{" "}
                <a href="mailto:tuomaristo@salamurhaajat.net">
                  tuomaristo@salamurhaajat.net
                </a>
              </li>
            </ul>
          </ul>

          <p>
            {t("privacy.contact.complaint")}
            <a href="https://tietosuoja.fi/etusivu">
              {t("privacy.contact.ombudsmanLink")}
            </a>
            .
          </p>
        </Box>
      </Box>
    </Container>
  );
}
