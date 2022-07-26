export const PlayerDetails = ({data}): JSX.Element => {

    const cal = []
    for (const x in data.calendar) {
        cal.push([x, data.calendar[x]])
    }
    
    return (
        <div>
            <p>osoite: {data.address}</p>
            <p>opinahjo: {data.learningInstitution}</p>
            <h3>Kuvaus</h3>
            <p>silmät: {data.eyeColor}</p>
            <p>hiukset: {data.hair}</p>
            <p>pituus: {data.height}</p>
            <p>silmälasit: {data.glasses}</p>
            <p>muu: {data.other}</p>
            <h3>Kalenteri</h3>
            <ul>
            {cal.sort().map((c, index) =>
                <li key={index}>
                {c[0]}: {c[1]}
                </li>
            )}
            </ul>
        </div>
    )
}