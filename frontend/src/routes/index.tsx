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
                    <Route path="/treinos" element={<Treinos />} />

                    <Route
                        path="/jogo-rapido"
                        element={<JogoRapidoPage />}
                    />

                    <Route
                        path="/jogos-rapidos/historico"
                        element={<HistoricoJogosRapidos />}
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

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;