import {
    AppBar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import SportsVolleyballIcon from "@mui/icons-material/SportsVolleyball";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SettingsIcon from "@mui/icons-material/Settings";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import HistoryIcon from "@mui/icons-material/History";

import { NavLink, Outlet } from "react-router-dom";

const larguraMenu = 240;

const itensMenu = [
    {
        texto: "Dashboard",
        caminho: "/",
        icone: <DashboardIcon />,
    },
    {
        texto: "Equipes",
        caminho: "/equipes",
        icone: <GroupsIcon />,
    },
    {
        texto: "Atletas",
        caminho: "/atletas",
        icone: <PersonIcon />,
    },
    {
        texto: "Jogos",
        caminho: "/jogos",
        icone: <SportsVolleyballIcon />,
    },
    {
        texto: "Jogo Rápido",
        caminho: "/jogo-rapido",
        icone: <FlashOnIcon />,
    },
    {
        texto: "Histórico Rápido",
        caminho: "/jogos-rapidos/historico",
        icone: <HistoryIcon />,
    },
    {
        texto: "Scout",
        caminho: "/scout",
        icone: <AssessmentIcon />,
    },
    {
        texto: "Treinos",
        caminho: "/treinos",
        icone: <FitnessCenterIcon />,
    },
    {
        texto: "Configurações",
        caminho: "/configuracoes",
        icone: <SettingsIcon />,
    },
];

function MainLayout() {
    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            <AppBar
                position="fixed"
                sx={{
                    zIndex: (tema) =>
                        tema.zIndex.drawer + 1,
                }}
            >
                <Toolbar>
                    <SportsVolleyballIcon
                        sx={{ mr: 1 }}
                    />

                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        Evolley
                    </Typography>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: larguraMenu,
                    flexShrink: 0,

                    "& .MuiDrawer-paper": {
                        width: larguraMenu,
                        boxSizing:
                            "border-box",
                    },
                }}
            >
                <Toolbar />

                <Box
                    sx={{
                        overflow: "auto",
                    }}
                >
                    <List>
                        {itensMenu.map(
                            (item) => (
                                <ListItemButton
                                    key={
                                        item.caminho
                                    }
                                    component={
                                        NavLink
                                    }
                                    to={
                                        item.caminho
                                    }
                                    end={
                                        item.caminho ===
                                        "/"
                                    }
                                    sx={{
                                        "&.active":
                                        {
                                            backgroundColor:
                                                "primary.main",

                                            color:
                                                "primary.contrastText",

                                            "& .MuiListItemIcon-root":
                                            {
                                                color:
                                                    "primary.contrastText",
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        {
                                            item.icone
                                        }
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={
                                            item.texto
                                        }
                                    />
                                </ListItemButton>
                            ),
                        )}
                    </List>

                    <Divider />
                </Box>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minHeight: "100vh",
                    backgroundColor:
                        "background.default",
                    p: 3,
                }}
            >
                <Toolbar />

                <Outlet />
            </Box>
        </Box>
    );
}

export default MainLayout;