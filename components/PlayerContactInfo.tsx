export const PlayerContactInfo = ({ user }): JSX.Element => {
  return (
    <div>
      <p>
        <b>puhelinnumero:</b> {user.phone}
      </p>
      <p>
        <b>email:</b> {user.email}
      </p>
    </div>
  );
};
