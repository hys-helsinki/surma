export const UpdateForm = ({ data, handleSubmit }): JSX.Element => {
  return (
    <div className="updateform">
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
        </div>
        <div>
          <label htmlFor="other">
            Ulkonäkö, kulkuvälineet ja muut lisätiedot
            <input
              type="text"
              id="other"
              name="other"
              defaultValue={data.other}
            />
          </label>
        </div>

        <button type="submit">Tallenna muokkaukset</button>
      </form>
    </div>
  );
};
