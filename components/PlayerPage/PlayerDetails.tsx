export const PlayerDetails = ({ player }): JSX.Element => {
  return (
    <div>
      <div>
        <p>
          <b>osoite:</b> {player.address}
        </p>
        <p>
          <b>opinahjo:</b> {player.learningInstitution}
        </p>
        <h3>Kuvaus</h3>
        <p>
          <b>silmät:</b> {player.eyeColor}
        </p>
        <p>
          <b>hiukset:</b> {player.hair}
        </p>
        <p>
          <b>pituus:</b> {player.height}
        </p>
        <p>
          <b>silmälasit:</b> {player.glasses}
        </p>
        <p>
          <b>ulkonäkö, kulkuvälineet ja muut lisätiedot:</b> {player.other}
        </p>
      </div>
    </div>
  );
};
