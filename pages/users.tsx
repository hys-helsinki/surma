import Link from 'next/link';
import { GetStaticProps } from 'next';
import prisma from '../lib/prisma';

export const getStaticProps: GetStaticProps = async () => {
  const objects = await prisma.player.findMany();

  return {
    props: {
      objects
    }
  }
}

export default function UserList({objects}) {

  return (
    <>
      <h1>List of users</h1>
      <ul>
        {objects.map((o: { id: string; firstName: string; lastName: string; alias: string }) =>
          {
            return <li key={o.id}>
              <Link href={`/users/${o.id}`}><a>{o.firstName} {o.lastName} ({o.alias})</a></Link>
            </li>;
          }
        )}
      </ul>
    </>
  )
}
