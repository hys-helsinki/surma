import { Box, Collapse, IconButton, Stack } from "@mui/material"
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState } from "react";

const TournamentInfoBox = ({tournament}) => {
  const [open, setOpen] = useState(false);
  
  return (
    <Box key={tournament.id} sx={{border: "solid", borderColor: "white", padding: "15px"}}>
      <Stack direction="row" gap={2} alignItems="center">
        <IconButton 
          onClick={() => setOpen(!open)} color="inherit"
        > 
          {open ? <KeyboardArrowUpIcon fontSize="large" /> 
              : <KeyboardArrowDownIcon fontSize="large" />} 
        </IconButton> 
        <Box>{tournament.name}</Box>
        <Box>{tournament.startTime}-
        {tournament.endTime}</Box>
        <button>Ilmoittautuminen auki!</button>
      </Stack>
      <Collapse in={open} timeout="auto"
        unmountOnExit>     
          <Box sx={{m: 5}}>Tähän turnauksen grafiikkaa?? :thinking:</Box>  
          <Box sx={{m: 2}}>Turnauksen kuvaus tähän: (lisää placeholderia) Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ultrices elit ut purus pulvinar dapibus. Nunc fringilla turpis diam. In hac habitasse platea dictumst. Donec vel lectus ac ex viverra sodales. Nullam viverra elementum mauris, nec tempus ante ultrices sit amet. Fusce malesuada massa id orci consectetur tempor. Phasellus ut lorem eget odio hendrerit euismod. Ut in mauris magna. Nulla facilisi. Etiam ac odio elit. Fusce turpis libero, egestas at lobortis non, mattis sed ante. Maecenas tempus facilisis dui, congue imperdiet lorem hendrerit sit amet.</Box>
          <Box sx={{m: 2}}>Ilmoittaumisaika: {tournament.registrationStartTime} - {tournament.registrationEndTime}</Box>
      </Collapse>
    </Box>
  )


}

export default TournamentInfoBox