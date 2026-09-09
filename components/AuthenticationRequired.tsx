import { signIn, useSession } from "next-auth/react";
import LoadingSpinner from "./Common/LoadingSpinner";
import { JSX } from "react";
import { useTranslation } from "next-i18next";
import SurmaButton from "./Common/SurmaButton";

export const AuthenticationRequired = (props): JSX.Element => {
  const { data: session, status } = useSession();
  const { t } = useTranslation("common");

  if (status === "loading") return <LoadingSpinner />;
  else if (session) {
    return <>{props.children}</>;
  } else {
    return (
      <>
        {t("authenticationRequired.loginPrompt")}
        <br />
        <SurmaButton onClick={() => signIn()}>
          {t("authenticationRequired.notLoggedInMessage")}
        </SurmaButton>
      </>
    );
  }
};
