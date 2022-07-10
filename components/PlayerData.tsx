export const PlayerData = ({data}): JSX.Element => {

    const cal = []
    for (const x in data.calendar) {
        cal.push([x, data.calendar[x]])
    }
    return (
        <div>
            <p>osoite: {data.address}</p>
            <p>opinahjo: {data.learningInstitution}</p>
            <h3>Kuvaus</h3>
            <p>silmät: {data.description.eyeColor}</p>
            <p>hiukset: {data.description.hair}</p>
            <p>pituus: {data.description.height}</p>
            <p>silmälasit: {data.description.glasses}</p>
            <p>muu: {data.description.other}</p>
            <h3>Kalenteri</h3>
            <ul>
            {cal.map((c, index) =>
                <li key={index}>
                {c[0]}: {c[1]}
                </li>
            )}
            </ul>
        </div>
    )
}