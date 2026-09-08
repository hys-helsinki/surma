import { modifyDate } from "../../utils";

const ConfirmationMessage = ({ tournament, umpires }) => {
  return (
    <div>
      <h1>Turnauksen luominen onnistui!</h1>
      <p>
        Tuomarit voivat nyt kirjautua Surmaan lomakkeeseen syötetyillä
        sähköposteilla. Alla vielä vahvistuksena luodun turnauksen ja
        tuomareiden tiedot.
      </p>
      <p>Voit nyt kirjautua ulos sovelluksesta.</p>
      <h3>Turnaus</h3>
      <ul>
        <li>Nimi: {tournament.name}</li>
        <li>Alkaa: {modifyDate(tournament.startTime.toString())}</li>
        <li>Päättyy: {modifyDate(tournament.endTime.toString())}</li>
        <li>
          Ilmo alkaa: {modifyDate(tournament.registrationStartTime.toString())}
        </li>
        <li>
          Ilmo päättyy: {modifyDate(tournament.registrationEndTime.toString())}
        </li>
        <li>Joukkueturnaus: {tournament.teamGame ? "Kyllä" : "Ei"}</li>
      </ul>
      <h3>Tuomarit</h3>
      {umpires.map((umpire) => (
        <div key={umpire.user.email}>
          <p>
            {umpire.user.firstName} {umpire.user.lastName}
          </p>
          <ul>
            <li>Sähköposti: {umpire.user.email}</li>
            <li>Puhelinnumero: {umpire.user.phone}</li>
            <li>Vastuualue: {umpire.responsibility}</li>
            <li>Päätuomari: {umpire.mainUmpire ? "Kyllä" : "Ei"}</li>
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ConfirmationMessage;
