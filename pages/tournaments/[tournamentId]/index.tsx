export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: "/personal",
      permanent: false
    }
  };
}

export default function Personal(): JSX.Element {
  return <></>;
}
