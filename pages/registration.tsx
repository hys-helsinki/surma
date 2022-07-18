export default function Registration() { 
    // Ilmolomake on dynaaminen eli siihen tulee jokaiselle turnauksen päivälle oma aikatauluteksti
    const dates = ["1.10.", "2.10", "3.10", "4.10"]
    const handleSubmit = (event) => {
        event.preventDefault()
        const cal = {} 
        dates.forEach((x, i) => cal[x] = event.target.dates[i].value)
        const data = {
            firstName: event.target.firstName.value,
            lastName: event.target.lastName.value,
            email: event.target.email.value,
            phone: event.target.phone.value,
            address: event.target.address.value,
            learningInstitution: event.target.learningInstitution.value,
            eyeColor: event.target.eyeColor.value,
            hair: event.target.hair.value,
            height: event.target.height.value,
            glasses: event.target.glasses.value,
            other: event.target.other.value,

            calendar: cal
        }
        console.log(data)

    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="firstName">First name:</label>
                    <input type="text" id="firstName" name="firstName"/>
                    
                </div>
                <div>
                    <label htmlFor="lastName">Last name:</label>
                    <input type="text" id="lastName" name="lastName"/>
                    
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="text" id="email" name="email"/>
                </div>
                <div>
                    <label htmlFor="phone">Phone: 
                        <input type="text" id="phone" name="phone"/>
                    </label>
                </div>
                <div>
                    <label htmlFor="address">Address: 
                        <input type="text" id="address" name="address"/>
                    </label>
                </div>
                <div>
                    <label htmlFor="learningInstitution">Learning Institution: 
                        <input type="text" id="learningInstitution" name="learningInstitution"/>
                    </label>
                </div>
                <div>
                    <label htmlFor="eyeColor">Eye Color: 
                        <input type="text" id="eyeColor" name="eyeColor"/>
                    </label>
                </div>
                <div>
                    <label htmlFor="hair">Hair: 
                        <input type="text" id="hair" name="hair"/>
                    </label>
                </div>
                <div>
                    <label htmlFor="height">Height: 
                        <input type="text" id="height" name="height"/>
                    </label>
                </div>
                <div>
                    <label htmlFor="glasses">Glasses: 
                        <input type="text" id="glasses" name="glasses"/>
                    </label>
                </div>
                <div>
                    <label htmlFor="other">Other: 
                        <input type="text" id="other" name="other"/>
                    </label>
                </div>
                <div> 
                    {dates.map((d: string, i) =>
                    <div key={i}>
                        <label htmlFor={d}>{d}: 
                            <textarea id={d} name="dates"/>
                        </label>
                    </div>
                    )}
                </div>

                <button type="submit">Ilmoittaudu</button>

            </form>
        </div>
    )

}