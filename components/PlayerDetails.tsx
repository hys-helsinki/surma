export const PlayerDetails = ({ player }): JSX.Element => {
  return (
    <div>
      <div>
        <p>osoite: {player.address}</p>
        <p>opinahjo: {player.learningInstitution}</p>
        <h3>Kuvaus</h3>
        <p>silmät: {player.eyeColor}</p>
        <p>hiukset: {player.hair}</p>
        <p>pituus: {player.height}</p>
        <p>silmälasit: {player.glasses}</p>
        <p>muu: {player.other}</p>
      </div>
    </div>
  );
};
