import { Box } from "@mui/material";

import GroupsIcon from "@mui/icons-material/Groups";
import SportsVolleyballIcon from "@mui/icons-material/SportsVolleyball";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PersonIcon from "@mui/icons-material/Person";

import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

function Dashboard() {
    return (
        <>
            <PageHeader
                titulo="Dashboard"
                subtitulo="Visão geral do desempenho esportivo no Evolley."
            />

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(4, 1fr)",
                    },
                    gap: 2,
                }}
            >
                <StatCard
                    titulo="Atletas"
                    valor={0}
                    descricao="Atletas cadastrados"
                    icone={<PersonIcon />}
                />

                <StatCard
                    titulo="Equipes"
                    valor={0}
                    descricao="Equipes ativas"
                    icone={<GroupsIcon />}
                />

                <StatCard
                    titulo="Jogos"
                    valor={0}
                    descricao="Partidas registradas"
                    icone={<SportsVolleyballIcon />}
                />

                <StatCard
                    titulo="Treinos"
                    valor={0}
                    descricao="Treinos realizados"
                    icone={<FitnessCenterIcon />}
                />
            </Box>
        </>
    );
}

export default Dashboard;