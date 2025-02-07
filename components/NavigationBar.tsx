import Image from "next/image";
import logo from "/public/images/surma_logo.svg";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {
  AppBar,
  Box,
  useMediaQuery,
  useTheme,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  List,
  ListItemButton,
  ListItemText,
  Collapse
} from "@mui/material";

const NavigationBar = () => {
  const { data } = useSession();
  const [user, setUser] = useState(null);
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElTarget, setAnchorElTarget] = useState(null);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (data) {
      fetch(`/api/user/${data.user.id}/navbar_data`)
        .then((response) => response.json())
        .then((json) => setUser(json));
    }
  }, [data]);

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

  const tournamentId = data ? data.user.tournamentId : "";
  const userId = data ? data.user.id : "";
  const targets = user ? user.player.targets : [];
  const currentUserIsUmpire = user ? user.umpire : false;

  return (
    <AppBar position="static">
      <Container maxWidth={false} sx={{ backgroundColor: "#424242" }}>
        <Toolbar disableGutters>
          <Image
            src={logo}
            alt="logo"
            width={45}
            height={45}
            style={{
              maxWidth: "100%",
              height: "auto",
              marginRight: isMobileView ? 0 : "1rem"
            }}
          />
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
                {targets.length != 0 && (
                  <>
                    <ListItemButton onClick={handleClick}>
                      Kohteet
                      {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {targets.map((target) => (
                          <ListItemButton key={target.id} sx={{ pl: 4 }}>
                            <Link
                              href={`/tournaments/${tournamentId}/targets/${target.id}`}
                            >
                              {target.target.user.firstName}{" "}
                              {target.target.user.lastName}
                            </Link>
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  </>
                )}
                {userId && (
                  <ListItemButton>
                    <Link href={`/tournaments/${tournamentId}/users/${userId}`}>
                      Oma sivu
                    </Link>
                  </ListItemButton>
                )}
                {currentUserIsUmpire && (
                  <ListItemButton>
                    <Link href={`/admin/${tournamentId}`}>Ylläpito</Link>
                  </ListItemButton>
                )}
                <ListItemButton>
                  <Link href="https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot">
                    Turnaussäännöt
                  </Link>
                  <OpenInNewIcon />
                </ListItemButton>
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
            {targets.length != 0 && (
              <Button
                onClick={handleOpenTargetMenu}
                sx={{ minWidth: 100, my: 2, color: "white", display: "block" }}
              >
                Kohteet
              </Button>
            )}
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
              {targets.map((target) => (
                <MenuItem key={target.id}>
                  <Link
                    href={`/tournaments/${tournamentId}/targets/${target.id}`}
                  >
                    {target.target.user.firstName} {target.target.user.lastName}
                  </Link>
                </MenuItem>
              ))}
            </Menu>
            {userId && (
              <Button
                sx={{ minWidth: 100, my: 2, color: "white", display: "block" }}
              >
                <Link href={`/tournaments/${tournamentId}/users/${userId}`}>
                  Oma sivu
                </Link>
              </Button>
            )}
            {currentUserIsUmpire && (
              <Button
                sx={{ minWidth: 100, my: 2, color: "white", display: "block" }}
              >
                <Link href={`/admin/${tournamentId}`}>Ylläpito</Link>
              </Button>
            )}
            <Button sx={{ minWidth: 100, my: 2, color: "white" }}>
              <Link href="https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot">
                Turnaussäännöt
              </Link>
              <OpenInNewIcon />
            </Button>
          </Box>
          {!data && (
            <Button
              onClick={() => signIn("email", { callbackUrl: "/personal" })}
              sx={{
                color: "black",
                backgroundColor: "white",
                p: isMobileView ? 0 : 1
              }}
            >
              Kirjaudu sisään
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default NavigationBar;
