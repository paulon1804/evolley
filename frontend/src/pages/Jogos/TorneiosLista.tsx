import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ListAltIcon from "@mui/icons-material/ListAlt";

import {
    Button,
    Chip,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";

import type { Equipe } from "../../types/Equipe";
import type { Partida } from "../../types/Partida";
import type { StatusTorneio, Torneio } from "../../types/Torneio";

interface TorneiosListaProps {
    torneios: Torneio[];
    equipes: Equipe[];
    partidas: Partida[];
    podeCriarPartida: boolean;
    aoCriar: () => void;
    aoEditar: (torneio: Torneio) => void;
    aoRemover: (torneio: Torneio) => void;
    aoVerPartidas: (torneio: Torneio) => void;
    aoNovaPartida: (torneio: Torneio) => void;
}

function formatarData(data?: string) {
    if (!data) {
        return "";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "UTC",
    }).format(new Date(`${data}T00:00:00`));
}

function formatarPeriodo(torneio: Torneio) {
    const inicio = formatarData(torneio.dataInicio);
    const fim = formatarData(torneio.dataFim);

    if (inicio && fim && inicio !== fim) {
        return `${inicio} a ${fim}`;
    }

    return inicio || fim || "Não informado";
}

function corStatus(
    status: StatusTorneio,
): "info" | "warning" | "success" | "error" {
    switch (status) {
        case "Em andamento":
            return "warning";

        case "Finalizado":
            return "success";

        case "Cancelado":
            return "error";

        default:
            return "info";
    }
}

function TorneiosLista({
    torneios,
    equipes,
    partidas,
    podeCriarPartida,
    aoCriar,
    aoEditar,
    aoRemover,
    aoVerPartidas,
    aoNovaPartida,
}: TorneiosListaProps) {
    if (torneios.length === 0) {
        return (
            <Paper
                variant="outlined"
                sx={{ p: 5, textAlign: "center" }}
            >
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 600 }}
                >
                    Nenhum torneio cadastrado
                </Typography>

                <Typography
                    color="text.secondary"
                    sx={{ mt: 1, mb: 3 }}
                >
                    Cadastre um torneio para agrupar as partidas
                    da competição.
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={aoCriar}
                >
                    Criar torneio
                </Button>
            </Paper>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Torneio</TableCell>
                        <TableCell>Período</TableCell>
                        <TableCell>Local</TableCell>
                        <TableCell>Formato</TableCell>
                        <TableCell>Equipes</TableCell>
                        <TableCell>Partidas</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Ações</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {torneios.map((torneio) => {
                        const total = partidas.filter(
                            (partida) =>
                                partida.torneioId === torneio.id,
                        ).length;

                        return (
                            <TableRow key={torneio.id} hover>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    {torneio.nome}
                                </TableCell>

                                <TableCell>
                                    {formatarPeriodo(torneio)}
                                </TableCell>

                                <TableCell>
                                    {torneio.local || "Não informado"}
                                </TableCell>

                                <TableCell>
                                    <Chip
                                        label={`${torneio.formato} · ${torneio.pontosPorSet ?? 15} pts`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>

                                <TableCell>
                                    <Tooltip
                                        title={
                                            (torneio.equipesIds ?? [])
                                                .map(
                                                    (id) =>
                                                        equipes.find(
                                                            (equipe) =>
                                                                equipe.id === id,
                                                        )?.nome ?? "Equipe removida",
                                                )
                                                .join(", ") ||
                                            "Nenhuma equipe alocada"
                                        }
                                    >
                                        <span>
                                            {(torneio.equipesIds ?? []).length}
                                        </span>
                                    </Tooltip>
                                </TableCell>

                                <TableCell>{total}</TableCell>

                                <TableCell>
                                    <Chip
                                        label={torneio.status}
                                        size="small"
                                        color={corStatus(torneio.status)}
                                    />
                                </TableCell>

                                <TableCell align="right">
                                    <Tooltip title="Nova partida neste torneio">
                                        <span>
                                            <IconButton
                                                color="success"
                                                disabled={!podeCriarPartida}
                                                onClick={() =>
                                                    aoNovaPartida(torneio)
                                                }
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </span>
                                    </Tooltip>

                                    <Tooltip title="Ver partidas do torneio">
                                        <IconButton
                                            onClick={() =>
                                                aoVerPartidas(torneio)
                                            }
                                        >
                                            <ListAltIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Editar torneio">
                                        <IconButton
                                            color="primary"
                                            onClick={() =>
                                                aoEditar(torneio)
                                            }
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Remover torneio">
                                        <IconButton
                                            color="error"
                                            onClick={() =>
                                                aoRemover(torneio)
                                            }
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default TorneiosLista;
