import { Box } from "@mui/material"
import { Form, Formik } from "formik"
import * as Yup from "yup";
import Image from "next/image";
import logo from "/public/images/surma_logo.svg";
import TextInput from "./TextInput";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Tournament } from "@prisma/client";

const UserForm = ({tournament}: {tournament: Tournament}) => {
    
    const [isLoading, setIsLoading] = useState(false) 

    const submitForm = async (values: { firstName: string; lastName: string; email: string; }) => {
        setIsLoading(true)
        const formdata = {tournamentId: tournament.id, ...values}
        console.log(formdata.email)
        const response = await fetch("/api/user/create", {
          method: "POST",
          body: JSON.stringify(formdata)
        })
        const createdUser = await response.json()
        console.log(createdUser)
        signIn("email", { callbackUrl: `/personal`, email: createdUser.email})
      }

    return (
      <div className="registration-form">
        <div style={{ float: "left", width: "10%" }}>
          <Image src={logo} width={60} height={60} alt="logo" />
        </div>
        <h1 className="registration-form-title">Ilmoittautuminen</h1>
        <Box sx={{my: 5}}>
          <Formik
            enableReinitialize={true}
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              phone: ""
            }}
            validationSchema={Yup.object({
              firstName: Yup.string().required("Pakollinen"),
              lastName: Yup.string().required("Pakollinen"),
              email: Yup.string()
                .email("Epäkelpo sähköpostiosoite")
                .required("Pakollinen"),
              phone: Yup.number()
              .required("Pakollinen")
              .positive("Puhelinnumero ei voi sisältää negatiivisia lukuja")
              .integer("Syötä vain numeroita"),
            })}
            onSubmit={(values) => {
                submitForm(values)
            }}
          >
            <Form>
              <TextInput label="Etunimi" name="firstName" type="text" />
              <TextInput label="Sukunimi" name="lastName" type="text" />
              <TextInput label="Sähköpostiosoite" name="email" type="email" />
              <TextInput label="Puhelinnumero" name="phone" type="text" />
              <LoadingButton loading={isLoading} type="submit">
                Ilmoittaudu
              </LoadingButton>
            </Form>
          </Formik>
        </Box>
      </div>

    )
    
}

export default UserForm