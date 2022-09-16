import Image from "next/image";
import logo from "/public/images/surma_logo.svg";

export default function Confirm() {
  return (
    <div style={{ padding: "15px" }}>
      <Image src={logo} width={50} height={50} />
      <h2>Kiitos ilmoittautumisestasi Salamurhaajien turnaukseen!</h2>
      <p>Saat pian sähköpostiisi automaattisen vahvistusviestin.</p>
      <p>
        Ennen turnauksen alkua saat viestin, jossa on ohjeet tunnusten luomiseen
        turnausjärjestelmään. Lisäksi tuomaristo ottaa vielä yhteyttä ennen
        turnauksen alkua.
      </p>
    </div>
  );
}
