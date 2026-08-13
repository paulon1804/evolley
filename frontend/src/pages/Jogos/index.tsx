import { useEffect, useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import PageHeader from "../../components/common/PageHeader";

import type { Equipe } from "../../types/Equipe";
import type {
    MelhorDe,
    Partida,
    StatusPartida,
    TipoPartida,
} from "../../types/Partida";

const tiposPartida: TipoPartida[] = [
    "Oficial",
    "Amistoso",
];

const statusPartida: StatusPartida[] = [
    "Agendada",
    "Em andamento",
    "Finalizada",
    "Cancelada",
];

const formatos: MelhorDe[] = [3, 5];

function dataAtual() {
    return new Date().toISOString().slice(0, 10);
}

function horaAtual() {
    return new Date().toTimeString().slice(0, 5);
}

const formularioInicial = {
    equipeId: "",
    tipo: "Oficial" as TipoPartida,
    adversario: "",
    competicao: "",
    local: "",
    data: "",
    hora: "",
    melhorDe: 3 as MelhorDe,
    status: "Agendada" as StatusPartida,
    observacoes: "",
};

function Jogos() {
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [modalAberto, setModalAberto] = useState(false);
    const navigate = useNavigate();

    const [partidaEmEdicao, setPartidaEmEdicao] =
        useState<Partida | null>(null);

    const [busca, setBusca] = useState("");
    const [mensagemErro, setMensagemErro] = useState("");

    const [formulario, setFormulario] =
        useState(formularioInicial);

    useEffect(() => {
        const partidasSalvas =
            localStorage.getItem("evolley-partidas");

        const equipesSalvas =
            localStorage.getItem("evolley-equipes");

        if (partidasSalvas) {
            try {
                const dados: Partida[] =
                    JSON.parse(partidasSalvas);

                setPartidas(dados);
            } catch {
                localStorage.removeItem("evolley-partidas");
            }
        }

        if (equipesSalvas) {
            try {
                const dados: Equipe[] =
                    JSON.parse(equipesSalvas);

                setEquipes(dados);
            } catch {
                localStorage.removeItem("evolley-equipes");
            }
        }
    }, []);

    const equipesAtivas = useMemo(
        () => equipes.filter((equipe) => equipe.ativa),
        [equipes],
    );

    function buscarNomeEquipe(equipeId: string) {
        return (
            equipes.find((equipe) => equipe.id === equipeId)?.nome ??
            "Equipe não encontrada"
        );
    }

    const partidasFiltradas = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        if (!termo) {
            return partidas;
        }

        return partidas.filter((partida) => {
            const nomeEquipe = buscarNomeEquipe(
                partida.equipeId,
            ).toLowerCase();

            const campos = [
                nomeEquipe,
                partida.tipo,
                partida.adversario,
                partida.competicao ?? "",
                partida.local ?? "",
                partida.status,
                partida.data ?? "",
            ];

            return campos.some((campo) =>
                campo.toLowerCase().includes(termo),
            );
        });
    }, [busca, partidas, equipes]);

    const partidaOficial =
        formulario.tipo === "Oficial";

    const formularioValido =
        formulario.equipeId.length > 0 &&
        formulario.adversario.trim().length > 0 &&
        (!partidaOficial ||
            (formulario.competicao.trim().length > 0 &&
                formulario.data.length > 0 &&
                formulario.hora.length > 0));

    function salvarNoNavegador(
        novaLista: Partida[],
    ) {
        setPartidas(novaLista);

        localStorage.setItem(
            "evolley-partidas",
            JSON.stringify(novaLista),
        );
    }

    function abrirModal(partida?: Partida) {
        setMensagemErro("");

        if (partida) {
            setPartidaEmEdicao(partida);

            setFormulario({
                equipeId: partida.equipeId,
                tipo: partida.tipo,
                adversario: partida.adversario,
                competicao: partida.competicao ?? "",
                local: partida.local ?? "",
                data: partida.data ?? "",
                hora: partida.hora ?? "",
                melhorDe: partida.melhorDe,
                status: partida.status,
                observacoes: partida.observacoes ?? "",
            });
        } else {
            setPartidaEmEdicao(null);
            setFormulario(formularioInicial);
        }

        setModalAberto(true);
    }

    function fecharModal() {
        setModalAberto(false);
        setPartidaEmEdicao(null);
        setFormulario(formularioInicial);
    }

    function salvarPartida() {
        if (!formularioValido) {
            return;
        }

        const agora = new Date().toISOString();

        if (partidaEmEdicao) {
            const listaAtualizada = partidas.map((partida) =>
                partida.id === partidaEmEdicao.id
                    ? {
                        ...partida,
                        equipeId: formulario.equipeId,
                        tipo: formulario.tipo,
                        adversario:
                            formulario.adversario.trim(),
                        competicao:
                            formulario.competicao.trim() ||
                            undefined,
                        local:
                            formulario.local.trim() || undefined,
                        data: formulario.data || undefined,
                        hora: formulario.hora || undefined,
                        melhorDe: formulario.melhorDe,
                        status: formulario.status,
                        observacoes:
                            formulario.observacoes.trim() ||
                            undefined,
                        updatedAt: agora,
                    }
                    : partida,
            );

            salvarNoNavegador(listaAtualizada);
        } else {
            const novaPartida: Partida = {
                id: crypto.randomUUID(),
                equipeId: formulario.equipeId,
                tipo: formulario.tipo,
                adversario: formulario.adversario.trim(),
                competicao:
                    formulario.competicao.trim() || undefined,
                local: formulario.local.trim() || undefined,
                data: formulario.data || undefined,
                hora: formulario.hora || undefined,
                melhorDe: formulario.melhorDe,
                status: formulario.status,
                observacoes:
                    formulario.observacoes.trim() || undefined,
                createdAt: agora,
                updatedAt: agora,
            };

            salvarNoNavegador([
                ...partidas,
                novaPartida,
            ]);
        }

        fecharModal();
    }

    function iniciarAmistosoAgora() {
        if (
            !formulario.equipeId ||
            !formulario.adversario.trim()
        ) {
            setMensagemErro(
                "Selecione a equipe e informe o adversário.",
            );

            return;
        }

        const agora = new Date().toISOString();

        const novaPartida: Partida = {
            id: crypto.randomUUID(),
            equipeId: formulario.equipeId,
            tipo: "Amistoso",
            adversario: formulario.adversario.trim(),
            competicao:
                formulario.competicao.trim() || undefined,
            local: formulario.local.trim() || undefined,
            data: formulario.data || dataAtual(),
            hora: formulario.hora || horaAtual(),
            melhorDe: formulario.melhorDe,
            status: "Em andamento",
            observacoes:
                formulario.observacoes.trim() || undefined,
            createdAt: agora,
            updatedAt: agora,
        };

        salvarNoNavegador([
            ...partidas,
            novaPartida,
        ]);

        fecharModal();

        navigate(`/jogos/${novaPartida.id}/centro`);
    }

    function removerPartida(id: string) {
        const novaLista = partidas.filter(
            (partida) => partida.id !== id,
        );

        salvarNoNavegador(novaLista);
    }

    function formatarData(data?: string) {
        if (!data) {
            return "Não informada";
        }

        return new Intl.DateTimeFormat("pt-BR", {
            timeZone: "UTC",
        }).format(new Date(`${data}T00:00:00`));
    }

    function corStatus(
        status: StatusPartida,
    ):
        | "default"
        | "info"
        | "warning"
        | "success"
        | "error" {
        switch (status) {
            case "Agendada":
                return "info";

            case "Em andamento":
                return "warning";

            case "Finalizada":
                return "success";

            case "Cancelada":
                return "error";

            default:
                return "default";
        }
    }

    return (
        <>
            <PageHeader
                titulo="Jogos"
                subtitulo="Gerencie partidas oficiais e amistosos."
                textoBotao="Nova partida"
                iconeBotao={<AddIcon />}
                aoClicarBotao={() => abrirModal()}
                botaoDesabilitado={
                    equipesAtivas.length === 0
                }
            />

            {mensagemErro && (
                <Alert
                    severity="error"
                    onClose={() => setMensagemErro("")}
                    sx={{ mb: 2 }}
                >
                    {mensagemErro}
                </Alert>
            )}

            {equipesAtivas.length === 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Cadastre ou ative uma equipe antes de criar
                    partidas.
                </Alert>
            )}

            {partidas.length > 0 && (
                <TextField
                    label="Pesquisar partidas"
                    placeholder="Equipe, adversário, competição, local ou status"
                    value={busca}
                    onChange={(evento) =>
                        setBusca(evento.target.value)
                    }
                    fullWidth
                    sx={{
                        mb: 3,
                        maxWidth: 600,
                    }}
                />
            )}

            {partidas.length === 0 ? (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 5,
                        textAlign: "center",
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 600 }}
                    >
                        Nenhuma partida cadastrada
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 1, mb: 3 }}
                    >
                        Agende um jogo ou inicie um amistoso
                        imediatamente.
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => abrirModal()}
                        disabled={
                            equipesAtivas.length === 0
                        }
                    >
                        Criar partida
                    </Button>
                </Paper>
            ) : partidasFiltradas.length === 0 ? (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 4,
                        textAlign: "center",
                    }}
                >
                    <Typography sx={{ fontWeight: 600 }}>
                        Nenhuma partida encontrada
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Tente usar outro termo de pesquisa.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Data</TableCell>
                                <TableCell>Equipe</TableCell>
                                <TableCell>Adversário</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Competição</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">
                                    Ações
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {partidasFiltradas.map((partida) => (
                                <TableRow
                                    key={partida.id}
                                    hover
                                >
                                    <TableCell>
                                        {formatarData(partida.data)}
                                        {partida.hora
                                            ? ` · ${partida.hora}`
                                            : ""}
                                    </TableCell>

                                    <TableCell sx={{ fontWeight: 600 }}>
                                        {buscarNomeEquipe(
                                            partida.equipeId,
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {partida.adversario}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={partida.tipo}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>

                                    <TableCell>
                                        {partida.competicao ||
                                            "Não informada"}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={partida.status}
                                            size="small"
                                            color={corStatus(
                                                partida.status,
                                            )}
                                        />
                                    </TableCell>

                                    <TableCell align="right">
                                        {(partida.status === "Agendada" ||
                                            partida.status === "Em andamento") && (
                                                <Tooltip
                                                    title={
                                                        partida.status === "Agendada"
                                                            ? "Iniciar partida"
                                                            : "Entrar na partida"
                                                    }
                                                >
                                                    <IconButton
                                                        color="success"
                                                        onClick={() =>
                                                            navigate(`/jogos/${partida.id}/centro`)
                                                        }
                                                    >
                                                        <PlayArrowIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                        <Tooltip title="Editar partida">
                                            <IconButton
                                                color="primary"
                                                onClick={() =>
                                                    abrirModal(partida)
                                                }
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Remover partida">
                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    removerPartida(partida.id)
                                                }
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={modalAberto}
                onClose={fecharModal}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    {partidaEmEdicao
                        ? "Editar partida"
                        : "Nova partida"}
                </DialogTitle>

                <DialogContent>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                            },
                            gap: 2,
                            mt: 1,
                        }}
                    >
                        <TextField
                            select
                            label="Equipe"
                            value={formulario.equipeId}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    equipeId: evento.target.value,
                                })
                            }
                            required
                            fullWidth
                        >
                            {equipes.map((equipe) => (
                                <MenuItem
                                    key={equipe.id}
                                    value={equipe.id}
                                    disabled={
                                        !equipe.ativa &&
                                        equipe.id !==
                                        formulario.equipeId
                                    }
                                >
                                    {equipe.nome} · {equipe.categoria}
                                    {!equipe.ativa
                                        ? " · Inativa"
                                        : ""}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Tipo da partida"
                            value={formulario.tipo}
                            onChange={(evento) => {
                                const tipo =
                                    evento.target.value as TipoPartida;

                                setFormulario({
                                    ...formulario,
                                    tipo,
                                    competicao:
                                        tipo === "Amistoso"
                                            ? formulario.competicao
                                            : formulario.competicao,
                                });
                            }}
                            fullWidth
                        >
                            {tiposPartida.map((tipo) => (
                                <MenuItem key={tipo} value={tipo}>
                                    {tipo}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Adversário"
                            value={formulario.adversario}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    adversario: evento.target.value,
                                })
                            }
                            required
                            autoFocus
                            fullWidth
                        />

                        <TextField
                            label="Competição"
                            value={formulario.competicao}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    competicao: evento.target.value,
                                })
                            }
                            required={partidaOficial}
                            helperText={
                                partidaOficial
                                    ? "Obrigatória para jogos oficiais"
                                    : "Opcional para amistosos"
                            }
                            fullWidth
                        />

                        <TextField
                            label="Local"
                            value={formulario.local}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    local: evento.target.value,
                                })
                            }
                            fullWidth
                        />

                        <TextField
                            select
                            label="Melhor de"
                            value={formulario.melhorDe}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    melhorDe: Number(
                                        evento.target.value,
                                    ) as MelhorDe,
                                })
                            }
                            fullWidth
                        >
                            {formatos.map((formato) => (
                                <MenuItem
                                    key={formato}
                                    value={formato}
                                >
                                    Melhor de {formato} sets
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Data"
                            type="date"
                            value={formulario.data}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    data: evento.target.value,
                                })
                            }
                            required={partidaOficial}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            fullWidth
                        />

                        <TextField
                            label="Hora"
                            type="time"
                            value={formulario.hora}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    hora: evento.target.value,
                                })
                            }
                            required={partidaOficial}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            fullWidth
                        />

                        <TextField
                            select
                            label="Status"
                            value={formulario.status}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    status:
                                        evento.target
                                            .value as StatusPartida,
                                })
                            }
                            fullWidth
                        >
                            {statusPartida.map((status) => (
                                <MenuItem
                                    key={status}
                                    value={status}
                                >
                                    {status}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Observações"
                            value={formulario.observacoes}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    observacoes: evento.target.value,
                                })
                            }
                            multiline
                            minRows={3}
                            fullWidth
                            sx={{
                                gridColumn: {
                                    xs: "1",
                                    sm: "1 / -1",
                                },
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{
                        justifyContent: "space-between",
                        px: 3,
                        pb: 2,
                    }}
                >
                    <Box>
                        {!partidaEmEdicao &&
                            formulario.tipo === "Amistoso" && (
                                <Button
                                    color="success"
                                    variant="contained"
                                    startIcon={<PlayArrowIcon />}
                                    onClick={iniciarAmistosoAgora}
                                    disabled={
                                        !formulario.equipeId ||
                                        !formulario.adversario.trim()
                                    }
                                >
                                    Iniciar amistoso agora
                                </Button>
                            )}
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button onClick={fecharModal}>
                            Cancelar
                        </Button>

                        <Button
                            variant="contained"
                            onClick={salvarPartida}
                            disabled={!formularioValido}
                        >
                            {partidaEmEdicao
                                ? "Salvar alterações"
                                : "Salvar partida"}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Jogos;