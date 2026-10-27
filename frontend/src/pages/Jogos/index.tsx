import { useEffect, useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AssessmentIcon from "@mui/icons-material/Assessment";
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
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import PageHeader from "../../components/common/PageHeader";
import {
    baixarBackup,
    temDadosParaBackup,
    ultimoBackup,
} from "../../utils/backup";

import TorneioDialog from "./TorneioDialog";
import type { DadosTorneio } from "./TorneioDialog";
import TorneiosLista from "./TorneiosLista";

import type { Atleta } from "../../types/Atleta";
import type { Equipe } from "../../types/Equipe";
import type { ScoutEvent } from "../../types/ScoutEvent";
import { calcularDesempenho, escolherMvp } from "../../utils/mvp";
import type { Torneio } from "../../types/Torneio";
import type {
    MelhorDe,
    Partida,
    PontosPorSet,
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

const formatos: MelhorDe[] = [1, 3, 5];

function rotuloMelhorDe(valor: MelhorDe) {
    return valor === 1
        ? "Set único"
        : `Melhor de ${valor} sets`;
}

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
    adversarioEquipeId: "",
    torneioId: "",
    pontosPorSet: "",
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

    const [torneios, setTorneios] = useState<Torneio[]>([]);
    const [atletas, setAtletas] = useState<Atleta[]>([]);
    const [scoutEvents, setScoutEvents] = useState<ScoutEvent[]>([]);

    const [aba, setAba] = useState<"partidas" | "torneios">(
        "partidas",
    );

    const [modalTorneioAberto, setModalTorneioAberto] =
        useState(false);

    const [torneioEmEdicao, setTorneioEmEdicao] =
        useState<Torneio | null>(null);

    const [ultimoBackupEm, setUltimoBackupEm] = useState<Date | null>(
        ultimoBackup(),
    );

    const [busca, setBusca] = useState("");
    const [mensagemErro, setMensagemErro] = useState("");

    const [formulario, setFormulario] =
        useState(formularioInicial);

    useEffect(() => {
        const partidasSalvas =
            localStorage.getItem("evolley-partidas");

        const equipesSalvas =
            localStorage.getItem("evolley-equipes");

        const torneiosSalvos =
            localStorage.getItem("evolley-torneios");

        try {
            const atletasSalvos =
                localStorage.getItem("evolley-atletas");

            const scoutSalvo =
                localStorage.getItem("evolley-scout-events");

            if (atletasSalvos) {
                setAtletas(JSON.parse(atletasSalvos));
            }

            if (scoutSalvo) {
                setScoutEvents(JSON.parse(scoutSalvo));
            }
        } catch {
            // Sem atletas ou scout legíveis, o MVP simplesmente não aparece.
        }

        if (torneiosSalvos) {
            try {
                const dados: Torneio[] =
                    JSON.parse(torneiosSalvos);

                setTorneios(dados);
            } catch {
                localStorage.removeItem("evolley-torneios");
            }
        }

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

    const equipesDoTorneio = useMemo(
        () =>
            torneios.find(
                (torneio) => torneio.id === formulario.torneioId,
            )?.equipesIds ?? [],
        [torneios, formulario.torneioId],
    );

    // Com torneio escolhido (e equipes alocadas), só elas aparecem.
    const equipesElegiveis = useMemo(
        () =>
            equipes.filter(
                (equipe) =>
                    equipesDoTorneio.length === 0 ||
                    equipesDoTorneio.includes(equipe.id) ||
                    equipe.id === formulario.equipeId,
            ),
        [equipes, equipesDoTorneio, formulario.equipeId],
    );

    const mvpPorPartida = useMemo(() => {
        const resultado: Record<string, string> = {};

        partidas
            .filter((partida) => partida.status === "Finalizada")
            .forEach((partida) => {
                const mvp = escolherMvp(
                    calcularDesempenho(
                        scoutEvents.filter(
                            (evento) =>
                                evento.partidaId === partida.id,
                        ),
                        partida.equipeId,
                    ),
                );

                const atleta = mvp
                    ? atletas.find(
                        (item) => item.id === mvp.atletaId,
                    )
                    : undefined;

                if (atleta) {
                    resultado[partida.id] =
                        `#${atleta.numero} ${atleta.nome}`;
                }
            });

        return resultado;
    }, [partidas, scoutEvents, atletas]);

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
                adversarioEquipeId:
                    partida.adversarioEquipeId ?? "",
                torneioId: partida.torneioId ?? "",
                pontosPorSet: partida.pontosPorSet
                    ? String(partida.pontosPorSet)
                    : "",
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

    function pontosEscolhidos(): PontosPorSet | undefined {
        return formulario.pontosPorSet
            ? (Number(formulario.pontosPorSet) as PontosPorSet)
            : undefined;
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
                        adversarioEquipeId:
                            formulario.adversarioEquipeId || undefined,
                        torneioId:
                            formulario.torneioId || undefined,
                        pontosPorSet: pontosEscolhidos(),
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
                adversarioEquipeId:
                    formulario.adversarioEquipeId || undefined,
                torneioId: formulario.torneioId || undefined,
                pontosPorSet: pontosEscolhidos(),
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
            adversarioEquipeId:
                formulario.adversarioEquipeId || undefined,
            torneioId: formulario.torneioId || undefined,
            pontosPorSet: pontosEscolhidos(),
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

    function salvarTorneiosNoNavegador(
        novaLista: Torneio[],
    ) {
        setTorneios(novaLista);

        localStorage.setItem(
            "evolley-torneios",
            JSON.stringify(novaLista),
        );
    }

    function abrirModalTorneio(torneio?: Torneio) {
        setTorneioEmEdicao(torneio ?? null);
        setModalTorneioAberto(true);
    }

    function fecharModalTorneio() {
        setModalTorneioAberto(false);
        setTorneioEmEdicao(null);
    }

    function salvarTorneio(dados: DadosTorneio) {
        const agora = new Date().toISOString();

        const camposComuns = {
            nome: dados.nome.trim(),
            formato: dados.formato,
            local: dados.local.trim() || undefined,
            dataInicio: dados.dataInicio || undefined,
            dataFim: dados.dataFim || undefined,
            status: dados.status,
            observacoes: dados.observacoes.trim() || undefined,
            equipesIds: dados.equipesIds,
        };

        if (torneioEmEdicao) {
            salvarTorneiosNoNavegador(
                torneios.map((torneio) =>
                    torneio.id === torneioEmEdicao.id
                        ? {
                            ...torneio,
                            ...camposComuns,
                            updatedAt: agora,
                        }
                        : torneio,
                ),
            );

            // Mantém o nome da competição das partidas
            // vinculadas igual ao nome atual do torneio.
            if (camposComuns.nome !== torneioEmEdicao.nome) {
                salvarNoNavegador(
                    partidas.map((partida) =>
                        partida.torneioId === torneioEmEdicao.id
                            ? {
                                ...partida,
                                competicao: camposComuns.nome,
                                updatedAt: agora,
                            }
                            : partida,
                    ),
                );
            }
        } else {
            const novoTorneio: Torneio = {
                id: crypto.randomUUID(),
                ...camposComuns,
                createdAt: agora,
                updatedAt: agora,
            };

            salvarTorneiosNoNavegador([
                ...torneios,
                novoTorneio,
            ]);
        }

        fecharModalTorneio();
    }

    function removerTorneio(torneio: Torneio) {
        const vinculadas = partidas.filter(
            (partida) => partida.torneioId === torneio.id,
        ).length;

        const aviso =
            vinculadas > 0
                ? `Remover o torneio "${torneio.nome}"? As ${vinculadas} partida(s) vinculada(s) não serão apagadas, apenas desvinculadas do torneio.`
                : `Remover o torneio "${torneio.nome}"?`;

        if (!window.confirm(aviso)) {
            return;
        }

        salvarTorneiosNoNavegador(
            torneios.filter((item) => item.id !== torneio.id),
        );

        if (vinculadas > 0) {
            salvarNoNavegador(
                partidas.map((partida) =>
                    partida.torneioId === torneio.id
                        ? { ...partida, torneioId: undefined }
                        : partida,
                ),
            );
        }
    }

    function verPartidasDoTorneio(torneio: Torneio) {
        setBusca(torneio.nome);
        setAba("partidas");
    }

    function novaPartidaNoTorneio(torneio: Torneio) {
        setMensagemErro("");
        setPartidaEmEdicao(null);

        setFormulario({
            ...formularioInicial,
            torneioId: torneio.id,
            competicao: torneio.nome,
            local: torneio.local ?? "",
            melhorDe: 1,
            pontosPorSet: String(torneio.pontosPorSet ?? 15),
        });

        setAba("partidas");
        setModalAberto(true);
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
                subtitulo="Gerencie partidas oficiais, amistosos e torneios."
                textoBotao={
                    aba === "partidas"
                        ? "Nova partida"
                        : "Novo torneio"
                }
                iconeBotao={<AddIcon />}
                aoClicarBotao={() =>
                    aba === "partidas"
                        ? abrirModal()
                        : abrirModalTorneio()
                }
                botaoDesabilitado={
                    aba === "partidas" &&
                    equipesAtivas.length === 0
                }
            />

            {partidas.length > 0 &&
                temDadosParaBackup() &&
                (!ultimoBackupEm ||
                    Date.now() - ultimoBackupEm.getTime() >
                        24 * 60 * 60 * 1000) && (
                    <Alert
                        severity="warning"
                        sx={{ mb: 3 }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    baixarBackup();
                                    setUltimoBackupEm(ultimoBackup());
                                }}
                            >
                                Exportar agora
                            </Button>
                        }
                    >
                        {ultimoBackupEm
                            ? "Seu último backup tem mais de 24 horas."
                            : "Você ainda não fez backup dos seus dados."}{" "}
                        Os dados ficam só neste navegador.
                    </Alert>
                )}

            <Tabs
                value={aba}
                onChange={(_, valor) => setAba(valor)}
                sx={{ mb: 3 }}
            >
                <Tab
                    value="partidas"
                    label={`Partidas (${partidas.length})`}
                />

                <Tab
                    value="torneios"
                    label={`Torneios (${torneios.length})`}
                />
            </Tabs>

            {aba === "torneios" && (
                <TorneiosLista
                    torneios={torneios}
                    equipes={equipes}
                    partidas={partidas}
                    podeCriarPartida={equipesAtivas.length > 0}
                    aoCriar={() => abrirModalTorneio()}
                    aoEditar={abrirModalTorneio}
                    aoRemover={removerTorneio}
                    aoVerPartidas={verPartidasDoTorneio}
                    aoNovaPartida={novaPartidaNoTorneio}
                />
            )}

            {aba === "partidas" && (
                <>

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
                                <TableCell>MVP</TableCell>
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

                                    <TableCell>
                                        {mvpPorPartida[partida.id] ?? "—"}
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

                                        <Tooltip title="Relatório dos jogadores por time">
                                            <IconButton
                                                onClick={() =>
                                                    navigate(`/scout?partida=${partida.id}`)
                                                }
                                            >
                                                <AssessmentIcon />
                                            </IconButton>
                                        </Tooltip>

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
                </>
            )}

            <TorneioDialog
                aberto={modalTorneioAberto}
                equipes={equipes}
                torneio={torneioEmEdicao}
                aoFechar={fecharModalTorneio}
                aoSalvar={salvarTorneio}
            />

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
                            onChange={(evento) => {
                                const equipeId = evento.target.value;
                                const conflito =
                                    equipeId ===
                                    formulario.adversarioEquipeId;

                                setFormulario({
                                    ...formulario,
                                    equipeId,
                                    adversarioEquipeId: conflito
                                        ? ""
                                        : formulario.adversarioEquipeId,
                                    adversario: conflito
                                        ? ""
                                        : formulario.adversario,
                                });
                            }}
                            required
                            fullWidth
                        >
                            {equipesElegiveis.map((equipe) => (
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
                            select
                            label="Equipe adversária"
                            value={formulario.adversarioEquipeId}
                            onChange={(evento) => {
                                const adversarioEquipeId =
                                    evento.target.value;

                                const equipeAdversaria = equipes.find(
                                    (equipe) =>
                                        equipe.id === adversarioEquipeId,
                                );

                                setFormulario({
                                    ...formulario,
                                    adversarioEquipeId,
                                    adversario: equipeAdversaria
                                        ? equipeAdversaria.nome
                                        : formulario.adversarioEquipeId
                                            ? ""
                                            : formulario.adversario,
                                });
                            }}
                            helperText="Escolha uma equipe cadastrada para marcar o scout dos dois times."
                            fullWidth
                        >
                            <MenuItem value="">
                                Outro adversário (digitar nome)
                            </MenuItem>

                            {equipesElegiveis
                                .filter(
                                    (equipe) =>
                                        equipe.id !== formulario.equipeId,
                                )
                                .map((equipe) => (
                                    <MenuItem
                                        key={equipe.id}
                                        value={equipe.id}
                                    >
                                        {equipe.nome} · {equipe.categoria}
                                    </MenuItem>
                                ))}
                        </TextField>

                        <TextField
                            label="Adversário"
                            disabled={formulario.adversarioEquipeId.length > 0}
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
                            select
                            label="Torneio (opcional)"
                            value={formulario.torneioId}
                            onChange={(evento) => {
                                const torneioId = evento.target.value;

                                const torneio = torneios.find(
                                    (item) => item.id === torneioId,
                                );

                                const permitidas =
                                    torneio?.equipesIds ?? [];

                                const restringe = permitidas.length > 0;

                                const casaInvalida =
                                    restringe &&
                                    !permitidas.includes(
                                        formulario.equipeId,
                                    );

                                const visitanteInvalido =
                                    restringe &&
                                    formulario.adversarioEquipeId !== "" &&
                                    !permitidas.includes(
                                        formulario.adversarioEquipeId,
                                    );

                                setFormulario({
                                    ...formulario,
                                    torneioId,
                                    equipeId: casaInvalida
                                        ? ""
                                        : formulario.equipeId,
                                    adversarioEquipeId:
                                        visitanteInvalido || casaInvalida
                                            ? ""
                                            : formulario.adversarioEquipeId,
                                    adversario:
                                        visitanteInvalido || casaInvalida
                                            ? ""
                                            : formulario.adversario,
                                    melhorDe: torneio
                                        ? 1
                                        : formulario.melhorDe,
                                    pontosPorSet: torneio
                                        ? String(torneio.pontosPorSet ?? 15)
                                        : formulario.pontosPorSet,
                                    competicao: torneio
                                        ? torneio.nome
                                        : formulario.competicao,
                                    local:
                                        torneio && !formulario.local.trim()
                                            ? torneio.local ?? ""
                                            : formulario.local,
                                });
                            }}
                            fullWidth
                        >
                            <MenuItem value="">
                                Nenhum
                            </MenuItem>

                            {torneios.map((torneio) => (
                                <MenuItem
                                    key={torneio.id}
                                    value={torneio.id}
                                >
                                    {torneio.nome} · {torneio.formato}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Competição"
                            disabled={formulario.torneioId.length > 0}
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
                                    {rotuloMelhorDe(formato)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Pontos por set"
                            value={formulario.pontosPorSet}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    pontosPorSet: evento.target.value,
                                })
                            }
                            helperText="Padrão: 25 pontos (15 no set decisivo)"
                            fullWidth
                        >
                            <MenuItem value="">
                                Padrão
                            </MenuItem>

                            <MenuItem value="12">
                                12 pontos
                            </MenuItem>

                            <MenuItem value="15">
                                15 pontos
                            </MenuItem>
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