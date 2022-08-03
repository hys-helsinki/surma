export default function CreateTournament() {
    const handleSubmit = async (event) => {
        event.preventDefault()
        const data = {
            name: event.target.tournament_label.value,
            start: event.target.start.value,
            end: event.target.end.value,
            registrationStart: event.target.registration_start.value,
            registrationEnd: event.target.registration_end.value,
            registrationTimeStart: event.target.registration_time_start.value,
            registrationTimeEnd: event.target.registration_time_end.value
    
        }
        console.log(data)
    }
    return (
        <div>
            <h2>Turnauksen luominen</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="tournament_label">Turnauksen nimi:
                    <input type="text" id="tournament_label" name="tournament_label"></input>
                </label>
                <label htmlFor="start">Aloituspäivämäärä:
                    <input type="date" id="start" name="start"></input>
                </label>
                <label htmlFor="end">Lopetuspäivämäärä:
                    <input type="date" id="end" name="end"></input>
                </label>
                <h3>Ilmoittautuminen</h3>
                <label htmlFor="registration_start">alkaa
                    <input type="date" id="registration_start" name="registration_start"></input>
                    <input type="time" id="registration_time_start" name="registration_time_start" ></input>
                </label>
                <label htmlFor="registration_end">päättyy
                    <input type="date" id="registration_end" name="registration_end"></input>
                    <input type="time" id="registration_time_end" name="registration_time_end"></input>
                </label>
                <button type="submit">Luo turnaus</button>
            </form>
        </div>
    )
}