export const PlayerContactInfo = ({ user }): JSX.Element => {
  return (
    <div>
      <h2>alias: {user.player.alias}</h2>
      <p>
        <b>puhelinnumero:</b> {user.phone}
      </p>
      <p>
        <b>email:</b> {user.email}
      </p>
    </div>
  );
};
