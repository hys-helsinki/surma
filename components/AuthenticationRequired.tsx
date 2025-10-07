import { signIn, useSession } from "next-auth/react";
import LoadingSpinner from "./Common/LoadingSpinner";

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
        <button onClick={() => signIn("email", { callbackUrl: "/personal" })}>
          Kirjaudu sisään
        </button>
      </>
    );
  }
};
