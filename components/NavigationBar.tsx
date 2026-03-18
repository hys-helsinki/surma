import Image from "next/image";
import logo from "/public/images/surma_logo.svg";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LanguageIcon from "@mui/icons-material/Language";
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
  Collapse,
  Divider
} from "@mui/material";
import { Player, Tournament, Umpire, User } from "@prisma/client";
interface PlayerWithTargets extends Player {
  targets: { id: string; firstName: string; lastName: string }[];
}
interface NavBarUser extends User {
  player: PlayerWithTargets;
  tournament: Tournament;
  umpire: Umpire;
}

const LANGUAGE_LABELS: Record<string, string> = {
  fi: "Suomi",
  en: "English"
};

const MobileView = ({ tournamentId, userId, targets, currentUserIsUmpire }) => {
  const { t } = useTranslation("common");
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data } = useSession();

  const handleClick = () => {
    setOpen(!open);
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLanguageChange = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <Toolbar disableGutters>
      <Box
        sx={{ flexGrow: 1, display: "flex", justifyContent: "space-between" }}
      >
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
                  {t("navigation.targets")}
                  {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {targets.map((user) => (
                      <ListItemButton key={user.id} sx={{ pl: 4 }}>
                        <a
                          href={`/tournaments/${tournamentId}/targets/${user.id}`}
                        >
                          {user.firstName} {user.lastName}
                        </a>
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            )}
            {userId && (
              <ListItemButton>
                <a href={`/tournaments/${tournamentId}/users/${userId}`}>
                  {t("navigation.myPage")}
                </a>
              </ListItemButton>
            )}
            {currentUserIsUmpire && (
              <ListItemButton>
                <Link href={`/admin/${tournamentId}`}>
                  {t("navigation.admin")}
                </Link>
              </ListItemButton>
            )}
            <ListItemButton>
              <Link href="https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot">
                {t("navigation.tournamentRules")}
              </Link>
              <OpenInNewIcon />
            </ListItemButton>
            <Divider />
            {router.locales.map((locale) => (
              <ListItemButton
                key={locale}
                selected={router.locale === locale}
                onClick={() => handleLanguageChange(locale)}
              >
                {LANGUAGE_LABELS[locale] ?? locale}
              </ListItemButton>
            ))}
          </List>
        </Menu>

        <Image
          src={logo}
          alt="logo"
          width={45}
          height={45}
          style={{
            maxWidth: "100%",
            height: "auto",
            marginRight: 0
          }}
        />

        {!data && (
          <Button
            onClick={() => signIn()}
            sx={{
              color: "black",
              backgroundColor: "white",
              p: 0,
              width: "30%"
            }}
          >
            {t("navigation.signIn")}
          </Button>
        )}
      </Box>
    </Toolbar>
  );
};

const DesktopView = ({
  tournamentId,
  userId,
  targets,
  currentUserIsUmpire
}) => {
  const { t } = useTranslation("common");
  const { data } = useSession();
  const [anchorElTarget, setAnchorElTarget] = useState(null);
  const [anchorElLang, setAnchorElLang] = useState(null);
  const router = useRouter();

  const handleOpenTargetMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElTarget(event.currentTarget);
  };

  const handleCloseTargetMenu = () => {
    setAnchorElTarget(null);
  };

  const handleOpenLangMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElLang(event.currentTarget);
  };

  const handleCloseLangMenu = () => {
    setAnchorElLang(null);
  };

  const handleLanguageChange = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
    handleCloseLangMenu();
  };

  return (
    <Toolbar disableGutters>
      <Box sx={{ display: "flex", justifyContent: "flex-start", flexGrow: 1 }}>
        <Image
          src={logo}
          alt="logo"
          width={45}
          height={45}
          style={{
            maxWidth: "100%",
            height: "auto",
            marginRight: "1rem"
          }}
        />

        <Typography
          variant="h5"
          noWrap
          sx={{
            mr: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // flexGrow: 1,
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".4rem",
            color: "inherit",
            textDecoration: "none"
          }}
        >
          {t("common.appName").toUpperCase()}
        </Typography>
        {targets.length != 0 && (
          <Button
            onClick={handleOpenTargetMenu}
            sx={{ minWidth: 100, my: 2, color: "white", display: "block" }}
          >
            {t("navigation.targets")}
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
          {targets.map((user) => (
            <MenuItem key={user.id}>
              <a href={`/tournaments/${tournamentId}/targets/${user.id}`}>
                {user.firstName} {user.lastName}
              </a>
            </MenuItem>
          ))}
        </Menu>
        {userId && (
          <Button
            sx={{ minWidth: 100, my: 2, color: "white", display: "block" }}
          >
            <a href={`/tournaments/${tournamentId}/users/${userId}`}>
              {t("navigation.myPage")}
            </a>
          </Button>
        )}
        {currentUserIsUmpire && (
          <Button
            sx={{ minWidth: 100, my: 2, color: "white", display: "block" }}
          >
            <Link href={`/admin/${tournamentId}`}>{t("navigation.admin")}</Link>
          </Button>
        )}
        <Button sx={{ minWidth: 100, my: 2, color: "white" }}>
          <Link href="https://salamurhaajat.net/mika-salamurhapeli/turnaussaannot">
            {t("navigation.tournamentRules")}
          </Link>
          <OpenInNewIcon />
        </Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginRight: "20px"
        }}
      >
        <Button
          onClick={handleOpenLangMenu}
          sx={{ color: "white", minWidth: 0, px: 1 }}
          startIcon={<LanguageIcon />}
        >
          {(router.locale ?? router.defaultLocale ?? "").toUpperCase()}
        </Button>
        <Menu
          anchorEl={anchorElLang}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          keepMounted
          open={Boolean(anchorElLang)}
          onClose={handleCloseLangMenu}
        >
          {router.locales.map((locale) => (
            <MenuItem
              key={locale}
              selected={router.locale === locale}
              onClick={() => handleLanguageChange(locale)}
            >
              {LANGUAGE_LABELS[locale] ?? locale}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      {!data && (
        <Button
          onClick={() => signIn()}
          sx={{
            color: "black",
            backgroundColor: "white",
            p: 1
          }}
        >
          {t("navigation.signIn")}
        </Button>
      )}
    </Toolbar>
  );
};

const NavigationBar = () => {
  const { data } = useSession();
  const [user, setUser] = useState<NavBarUser>(null);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (data) {
      fetch(`/api/user/${data.user.id}/navbar_data`)
        .then((response) => response.json())
        .then((json) => setUser(json));
    }
  }, [data]);

  const tournamentId = data ? data.user.tournamentId : "";
  const userId = data ? data.user.id : "";
  const targets = user ? user.player.targets : [];
  const currentUserIsUmpire = user ? user.umpire : false;

  return (
    <AppBar position="static">
      <Container maxWidth={false} sx={{ backgroundColor: "#424242" }}>
        {isMobileView ? (
          <MobileView
            tournamentId={tournamentId}
            userId={userId}
            targets={targets}
            currentUserIsUmpire={currentUserIsUmpire}
          />
        ) : (
          <DesktopView
            tournamentId={tournamentId}
            userId={userId}
            targets={targets}
            currentUserIsUmpire={currentUserIsUmpire}
          />
        )}
      </Container>
    </AppBar>
  );
};
export default NavigationBar;
