import { signIn, useSession } from "next-auth/react";
import LoadingSpinner from "./Common/LoadingSpinner";
import { JSX } from "react";

export const AuthenticationRequired = (props): JSX.Element => {
  const { data: session, status } = useSession();

  if (status === "loading") return <LoadingSpinner />;
  else if (session) {
    return <>{props.children}</>;
  } else {
    return (
      <>
        Et ole kirjautunut sisään.
        <br />
        <button onClick={() => signIn()}>Kirjaudu sisään</button>
      </>
    );
  }
};
