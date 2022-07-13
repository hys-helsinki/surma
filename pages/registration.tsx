export default function Registration() { 
    // Ilmolomake on dynaaminen eli siihen tulee jokaiselle turnauksen päivälle oma aikatauluteksti
    const dates = ["1.10.", "2.10", "3.10", "4.10"]
    const handleSubmit = (event) => {
        event.preventDefault()
        const cal = {} 
        dates.forEach((x, i) => cal[x] = event.target.dates[i].value)
        const data = {
            first: event.target.first.value,
            last: event.target.last.value,
            email: event.target.email.value,
            phone: event.target.phone.value,
            calendar: cal
        }
        console.log(data)

    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="first">First name:
                        <input type="text" id="first" name="first"/>
                    </label>
                </div>
                <div>
                    <label htmlFor="last">Last name:
                        <input type="text" id="last" name="last"/>
                    </label>
                </div>
                <div>
                    <label htmlFor="email">Email: 
                        <input type="text" id="email" name="email"/>
                    </label>
                </div>
                <div>
                    <label htmlFor="phone">Phone: 
                        <input type="text" id="phone" name="phone"/>
                    </label>
                </div>
                <div> 
                    {dates.map((d: string, i) =>
                    <div>
                        <label htmlFor={d}>{d}: 
                            <input type="text" id={d} name="dates"/>
                        </label>
                    </div>
                    )}
                </div>
                

                <button type="submit">Ilmoittaudu</button>

            </form>
        </div>
    )

}