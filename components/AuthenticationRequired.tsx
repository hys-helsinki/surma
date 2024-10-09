import { signIn, useSession } from "next-auth/react";

export const AuthenticationRequired = (props): JSX.Element => {
  const { data: session } = useSession();
  if (session) {
    return <>{props.children}</>;
  } else {
    return (
      <>
        Et ole kirjautunut sisään.
        <br />
        <button onClick={() => signIn(undefined, { callbackUrl: "/personal" })}>
          Kirjaudu sisään
        </button>
      </>
    );
  }
};
