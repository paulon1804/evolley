import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

import Dashboard from "../pages/Dashboard";
import Equipes from "../pages/Equipes";
import Atletas from "../pages/Atletas";
import Jogos from "../pages/Jogos";
import Scout from "../pages/Scout";
import Treinos from "../pages/Treinos";
import NovoTreino from "../pages/Treinos/NovoTreino";
import CentroTreino from "../pages/Treinos/CentroTreino";
import ResumoTreino from "../pages/Treinos/ResumoTreino";
import EvolucaoTreinos from "../pages/Treinos/Evolucao";
import AnalisesTreinos from "../pages/Treinos/Analises";
import Configuracoes from "../pages/Configuracoes";
import CentroPartida from "../pages/CentroPartida";
import JogoRapidoPage from "../pages/JogoRapido";
import HistoricoJogosRapidos from "../pages/HistoricoJogosRapidos";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/equipes" element={<Equipes />} />
                    <Route path="/atletas" element={<Atletas />} />
                    <Route path="/jogos" element={<Jogos />} />
                    <Route path="/scout" element={<Scout />} />

                    <Route
                        path="/jogo-rapido"
                        element={<JogoRapidoPage />}
                    />

                    <Route
                        path="/jogos-rapidos/historico"
                        element={<HistoricoJogosRapidos />}
                    />

                    <Route
                        path="/treinos"
                        element={<Treinos />}
                    />

                    <Route
                        path="/treinos/novo"
                        element={<NovoTreino />}
                    />

                    <Route
                        path="/treinos/:treinoId/centro"
                        element={<CentroTreino />}
                    />

                    <Route
                        path="/treinos/:treinoId/resumo"
                        element={<ResumoTreino />}
                    />

                    <Route
                        path="/treinos/evolucao"
                        element={<EvolucaoTreinos />}
                    />

                    <Route
                        path="/treinos/analises"
                        element={<AnalisesTreinos />}
                    />

                    <Route
                        path="/configuracoes"
                        element={<Configuracoes />}
                    />

                    <Route
                        path="/jogos/:partidaId/centro"
                        element={<CentroPartida />}
                    />
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;