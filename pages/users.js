import Link from 'next/link';
import fsPromises from 'fs/promises';
import path from 'path';

export async function getStaticProps() {
  // fetches data from the .json file and makes it props
  const filePath = path.join(process.cwd(), 'pelaajat.json');
  const jsonData = await fsPromises.readFile(filePath);
  const objects = JSON.parse(jsonData);

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
        {objects.map(o =>
          <li key={o.id}>
            <Link href={`/users/${o.id}`}><a>{o.firstName} {o.lastName} ({o.alias})</a></Link>
          </li>
        )}
      </ul>
    </>
  )
}
