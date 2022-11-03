import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Image from "next/image";
import logo from "/public/images/surma_logo.svg";
import Link from "next/link";

const NavigationBar = ({ targets, userId, tournamentId, umpire }) => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const [anchorElTarget, setAnchorElTarget] = React.useState(null);

  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenTargetMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElTarget(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseTargetMenu = () => {
    setAnchorElTarget(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl" sx={{ backgroundColor: "#424242" }}>
        <Toolbar disableGutters>
          <Image src={logo} alt="testi" width={45} height={45} />
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".4rem",
              color: "inherit",
              textDecoration: "none"
            }}
          >
            SURMA
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left"
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left"
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
                width: "300px"
              }}
            >
              <List
                sx={{
                  width: "100%",
                  maxWidth: 300,
                  bgcolor: "background.paper"
                }}
                component="nav"
                aria-labelledby="nested-list-subheader"
              >
                <ListItemButton onClick={handleClick}>
                  <ListItemText primary="Kohteet" />
                  {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {targets.length == 0 ? (
                      <ListItemText>Ei kohteita</ListItemText>
                    ) : (
                      targets.map((target, i) => (
                        <ListItemButton key={i} sx={{ pl: 4 }}>
                          <Link
                            href={`/tournaments/${tournamentId}/targets/${target.id}`}
                          >
                            <a>
                              {target.firstName} {target.lastName}
                            </a>
                          </Link>
                        </ListItemButton>
                      ))
                    )}
                  </List>
                </Collapse>
                <ListItemButton>
                  <Link href={`/tournaments/users/${userId}`}>Oma sivu</Link>
                </ListItemButton>
                {umpire && (
                  <ListItemButton>
                    <Link href={`/admin/${tournamentId}`}>Admin</Link>
                  </ListItemButton>
                )}
              </List>
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".4rem",
              color: "inherit",
              textDecoration: "none"
            }}
          >
            SURMA
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Button
              onClick={handleOpenTargetMenu}
              sx={{ minWidth: 100, my: 2, color: "white", display: "block" }}
            >
              Kohteet
            </Button>
            <Menu
              id="menu-appbar-one"
              anchorEl={anchorElTarget}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center"
              }}
              keepMounted
              open={Boolean(anchorElTarget)}
              onClose={handleCloseTargetMenu}
            >
              {targets.length == 0 ? (
                <MenuItem>Ei kohteita</MenuItem>
              ) : (
                targets.map((target) => (
                  <MenuItem key={target.id}>
                    <Link
                      href={`/tournaments/${tournamentId}/targets/${target.id}`}
                    >
                      <a>
                        {target.firstName} {target.lastName}
                      </a>
                    </Link>
                  </MenuItem>
                ))
              )}
            </Menu>
            <Button
              sx={{ minWidth: 100, my: 2, color: "white", display: "block" }}
            >
              <Link href={`/tournaments/users/${userId}`}>Oma sivu</Link>
            </Button>
            {umpire && (
              <Button
                sx={{ minWidth: 100, my: 2, color: "white", display: "block" }}
              >
                <Link href={`/admin/${tournamentId}`}>Admin</Link>
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default NavigationBar;
