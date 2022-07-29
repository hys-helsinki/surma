export const UpdateForm = ({ data, handleSubmit, calendar }): JSX.Element => {
  const cal = [];
  for (const x in calendar) {
    cal.push([x, calendar[x]]);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="address">
            Kotiosoite:
            <input
              type="text"
              id="address"
              name="address"
              defaultValue={data.address}
            />
          </label>
        </div>
        <div>
          <label htmlFor="learningInstitution">
            Oppilaitos:
            <input
              type="text"
              id="learningInstitution"
              name="learningInstitution"
              defaultValue={data.learningInstitution}
            />
          </label>
        </div>
        <h3>Kuvaus</h3>
        <div>
          <label htmlFor="eyeColor">
            Silmät:
            <input
              type="text"
              id="eyeColor"
              name="eyeColor"
              defaultValue={data.eyeColor}
            />
          </label>
        </div>
        <div>
          <label htmlFor="hair">
            Hiukset:
            <input type="text" id="hair" name="hair" defaultValue={data.hair} />
          </label>
        </div>
        <div>
          <label htmlFor="height">
            Pituus:
            <input
              type="text"
              id="height"
              name="height"
              defaultValue={data.height}
            />
          </label>
        </div>
        <div>
          <label htmlFor="glasses">
            Silmälasit:
            <input
              type="text"
              id="glasses"
              name="glasses"
              defaultValue={data.glasses}
            />
          </label>
        </div>
        <div>
          <label htmlFor="other">
            Muu:
            <input
              type="text"
              id="other"
              name="other"
              defaultValue={data.other}
            />
          </label>
        </div>
        <div>
          <h3>Kalenteri</h3>
          {cal.sort().map((c, i) => (
            <div key={i}>
              <label htmlFor={c[0]}>
                {c[0]}:
                <textarea id={c[0]} name="dates" defaultValue={c[1]} />
              </label>
            </div>
          ))}
        </div>

        <button type="submit">Tallenna muokkaukset</button>
      </form>
    </div>
  );
};
