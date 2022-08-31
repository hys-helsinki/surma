export const PlayerDetails = ({ player }): JSX.Element => {
  const cal = [];
  for (const x in player.calendar) {
    cal.push([x, player.calendar[x]]);
  }

  return (
    <div>
      <p>osoite: {player.address}</p>
      <p>opinahjo: {player.learningInstitution}</p>
      <h3>Kuvaus</h3>
      <p>silmät: {player.eyeColor}</p>
      <p>hiukset: {player.hair}</p>
      <p>pituus: {player.height}</p>
      <p>silmälasit: {player.glasses}</p>
      <p>muu: {player.other}</p>
      <h3>Kalenteri</h3>
      <ul>
        {cal.map((c, index) => (
          <li key={index}>
            {c[0]}: {c[1]}
          </li>
        ))}
      </ul>
    </div>
  );
};
