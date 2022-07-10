export const PlayerContact = ({data}): JSX.Element => {
    return (
        <div>
            <h2>alias: {data.alias}</h2>
            <p>puhelinnumero: {data.phone}</p>
            <p>email: {data.email}</p>
        </div>
    )
}