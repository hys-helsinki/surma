export const PlayerContactInfo = ({ user }): JSX.Element => {
  return (
    <div>
      {user.player && <h2>alias: {user.player.alias}</h2>}
      <p>puhelinnumero: {user.phone}</p>
      <p>email: {user.email}</p>
    </div>
  );
};
