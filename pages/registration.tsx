import prisma from "../lib/prisma";
import { useRouter } from "next/router";

export default function Registration() {
  // Ilmolomake on dynaaminen eli siihen tulee jokaiselle turnauksen päivälle oma aikatauluteksti
  const router = useRouter();
  const dates = ["1.10.", "2.10", "3.10", "4.10"];
  const handleSubmit = async (event) => {
    event.preventDefault();
    const cal = {};
    dates.forEach((x, i) => (cal[x] = event.target.dates[i].value));
    const data = {
      firstName: event.target.firstName.value,
      lastName: event.target.lastName.value,
      alias: event.target.alias.value,
      email: event.target.email.value,
      phone: event.target.phone.value,
      address: event.target.address.value,
      learningInstitution: event.target.learningInstitution.value,
      eyeColor: event.target.eyeColor.value,
      hair: event.target.hair.value,
      height: parseInt(event.target.height.value),
      glasses: event.target.glasses.value,
      other: event.target.other.value,
      calendar: cal,
    };
    fetch("/api/user/create", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((d) => {
        router.push(`/users/${d.id}`);
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Ilmoittautumislomake</h2>
        <div>
          <label htmlFor="firstName">Etunimi:</label>
          <input type="text" id="firstName" name="firstName" />
        </div>
        <div>
          <label htmlFor="lastName">Sukunimi:</label>
          <input type="text" id="lastName" name="lastName" />
        </div>
        <div>
          <label htmlFor="alias">Alias:</label>
          <input type="text" id="alias" name="alias" />
        </div>
        <div>
          <label htmlFor="email">Sähköpostiosoite:</label>
          <input type="text" id="email" name="email" />
        </div>
        <div>
          <label htmlFor="phone">
            Puhelinnumero:
            <input type="text" id="phone" name="phone" />
          </label>
        </div>
        <div>
          <label htmlFor="address">
            Kotiosoite:
            <input type="text" id="address" name="address" />
          </label>
        </div>
        <div>
          <label htmlFor="learningInstitution">
            Oppilaitos:
            <input
              type="text"
              id="learningInstitution"
              name="learningInstitution"
            />
          </label>
        </div>
        <div>
          <label htmlFor="eyeColor">
            Silmät:
            <input type="text" id="eyeColor" name="eyeColor" />
          </label>
        </div>
        <div>
          <label htmlFor="hair">
            Hiukset:
            <input type="text" id="hair" name="hair" />
          </label>
        </div>
        <div>
          <label htmlFor="height">
            Pituus:
            <input type="text" id="height" name="height" />
          </label>
        </div>
        <div>
          <label htmlFor="glasses">
            Silmälasit:
            <input type="text" id="glasses" name="glasses" />
          </label>
        </div>
        <div>
          <label htmlFor="other">
            Muu:
            <input type="text" id="other" name="other" />
          </label>
        </div>
        <div>
          <p>Kalenteritiedot</p>
          {dates.map((d: string, i) => (
            <div key={i}>
              <label htmlFor={d}>
                {d}:
                <textarea id={d} name="dates" />
              </label>
            </div>
          ))}
        </div>

        <button type="submit">Ilmoittaudu</button>
      </form>
    </div>
  );
}
