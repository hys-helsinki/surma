import { signIn, useSession } from "next-auth/react";
import LoadingSpinner from "./Common/LoadingSpinner";
import { JSX } from "react";
import { t } from "i18next";

export const AuthenticationRequired = (props): JSX.Element => {
  const { data: session, status } = useSession();

  if (status === "loading") return <LoadingSpinner />;
  else if (session) {
    return <>{props.children}</>;
  } else {
    return (
      <>
        {t("authenticationRequired.loginPrompt")}
        <br />
        <button onClick={() => signIn()}>
          {t("authenticationRequired.notLoggedInMessage")}
        </button>
      </>
    );
  }
};
