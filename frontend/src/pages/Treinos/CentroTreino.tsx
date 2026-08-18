import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import StopIcon from "@mui/icons-material/Stop";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    FormControlLabel,
    Paper,
    Typography,
} from "@mui/material";

import type { Atleta } from "../../types/Atleta";
import type { Equipe } from "../../types/Equipe";

import type {
    EventoTreino,
    FundamentoTreino,
    Treino,
} from "../../types/Treino";

const STORAGE_TREINOS =
    "evolley-treinos";

const STORAGE_EVENTOS_TREINO =
    "evolley-treino-eventos";

const STORAGE_ESTADO_CENTRO =
    "evolley-centro-treino";

type ResultadoTecnico =
    | "Ace"
    | "Ponto"
    | "A"
    | "B"
    | "C"
    | "Positivo"
    | "Neutro"
    | "Negativo"
    | "Erro"
    | "Concluído";

interface EstadoCentroTreino {
    treinoId: string;
    atividadeId: string;
    segundosAtividade: number;
    rodando: boolean;
}

function CentroTreino() {
    const { treinoId } =
        useParams();

    const navigate =
        useNavigate();

    const [treinos, setTreinos] =
        useState<Treino[]>([]);

    const [atletas, setAtletas] =
        useState<Atleta[]>([]);

    const [equipes, setEquipes] =
        useState<Equipe[]>([]);

    const [eventos, setEventos] =
        useState<EventoTreino[]>([]);

    const [
        atividadeAtualId,
        setAtividadeAtualId,
    ] = useState("");

    const [
        atletaSelecionadoId,
        setAtletaSelecionadoId,
    ] = useState("");

    const [
        segundosAtividade,
        setSegundosAtividade,
    ] = useState(0);

    const [rodando, setRodando] =
        useState(false);

    const [erro, setErro] =
        useState("");

    useEffect(() => {
        const treinosSalvos =
            localStorage.getItem(
                STORAGE_TREINOS,
            );

        const atletasSalvos =
            localStorage.getItem(
                "evolley-atletas",
            );

        const equipesSalvas =
            localStorage.getItem(
                "evolley-equipes",
            );

        const eventosSalvos =
            localStorage.getItem(
                STORAGE_EVENTOS_TREINO,
            );

        const estadoSalvo =
            localStorage.getItem(
                STORAGE_ESTADO_CENTRO,
            );

        if (treinosSalvos) {
            try {
                const dados: Treino[] =
                    JSON.parse(
                        treinosSalvos,
                    );

                setTreinos(dados);
            } catch {
                localStorage.removeItem(
                    STORAGE_TREINOS,
                );
            }
        }

        if (atletasSalvos) {
            try {
                setAtletas(
                    JSON.parse(
                        atletasSalvos,
                    ),
                );
            } catch {
                localStorage.removeItem(
                    "evolley-atletas",
                );
            }
        }

        if (equipesSalvas) {
            try {
                setEquipes(
                    JSON.parse(
                        equipesSalvas,
                    ),
                );
            } catch {
                localStorage.removeItem(
                    "evolley-equipes",
                );
            }
        }

        if (eventosSalvos) {
            try {
                const dados:
                    EventoTreino[] =
                    JSON.parse(
                        eventosSalvos,
                    );

                setEventos(
                    dados,
                );
            } catch {
                localStorage.removeItem(
                    STORAGE_EVENTOS_TREINO,
                );
            }
        }

        if (estadoSalvo) {
            try {
                const estado:
                    EstadoCentroTreino =
                    JSON.parse(
                        estadoSalvo,
                    );

                if (
                    estado.treinoId ===
                    treinoId
                ) {
                    setAtividadeAtualId(
                        estado.atividadeId,
                    );

                    setSegundosAtividade(
                        estado.segundosAtividade,
                    );

                    setRodando(false);
                }
            } catch {
                localStorage.removeItem(
                    STORAGE_ESTADO_CENTRO,
                );
            }
        }
    }, [treinoId]);

    const treino = useMemo(
        () =>
            treinos.find(
                (item) =>
                    item.id ===
                    treinoId,
            ),
        [treinos, treinoId],
    );

    const equipe = useMemo(
        () =>
            equipes.find(
                (item) =>
                    item.id ===
                    treino?.equipeId,
            ),
        [equipes, treino],
    );

    const participantes = useMemo(() => {
        if (!treino) {
            return [];
        }

        const ids =
            treino.participantes
                .filter(
                    (participante) =>
                        participante.presente,
                )
                .map(
                    (participante) =>
                        participante.atletaId,
                );

        return atletas.filter(
            (atleta) =>
                ids.includes(
                    atleta.id,
                ),
        );
    }, [treino, atletas]);

    const atividadeAtual =
        useMemo(() => {
            if (!treino) {
                return undefined;
            }

            if (
                atividadeAtualId
            ) {
                return treino.atividades.find(
                    (atividade) =>
                        atividade.id ===
                        atividadeAtualId,
                );
            }

            return treino.atividades[0];
        }, [
            treino,
            atividadeAtualId,
        ]);

    const participantesAtividadeIds =
        useMemo(() => {
            if (
                !atividadeAtual
            ) {
                return [];
            }

            /*
             * Compatibilidade com atividades antigas:
             * se não houver lista específica, todos os
             * participantes presentes no treino entram.
             */
            if (
                atividadeAtual
                    .participantesAtividadeIds ===
                undefined
            ) {
                return participantes.map(
                    (atleta) => atleta.id,
                );
            }

            return atividadeAtual
                .participantesAtividadeIds;
        }, [
            atividadeAtual,
            participantes,
        ]);

    const indiceAtividadeAtual =
        useMemo(() => {
            if (
                !treino ||
                !atividadeAtual
            ) {
                return -1;
            }

            return treino.atividades.findIndex(
                (atividade) =>
                    atividade.id ===
                    atividadeAtual.id,
            );
        }, [
            treino,
            atividadeAtual,
        ]);

    useEffect(() => {
        if (
            !treino ||
            treino.atividades.length ===
            0
        ) {
            return;
        }

        if (
            !atividadeAtualId
        ) {
            setAtividadeAtualId(
                treino.atividades[0].id,
            );
        }
    }, [
        treino,
        atividadeAtualId,
    ]);

    useEffect(() => {
        if (
            !atividadeAtual ||
            segundosAtividade > 0
        ) {
            return;
        }

        if (
            atividadeAtual.tempoExecutadoSegundos
        ) {
            setSegundosAtividade(
                atividadeAtual.tempoExecutadoSegundos,
            );
        }
    }, [
        atividadeAtual,
        segundosAtividade,
    ]);

    useEffect(() => {
        if (!rodando) {
            return;
        }

        const timer =
            window.setInterval(
                () => {
                    setSegundosAtividade(
                        (valor) =>
                            valor + 1,
                    );
                },
                1000,
            );

        return () =>
            window.clearInterval(
                timer,
            );
    }, [rodando]);

    useEffect(() => {
        if (
            !treino ||
            !atividadeAtual
        ) {
            return;
        }

        const estado:
            EstadoCentroTreino = {
            treinoId:
                treino.id,
            atividadeId:
                atividadeAtual.id,
            segundosAtividade,
            rodando,
        };

        localStorage.setItem(
            STORAGE_ESTADO_CENTRO,
            JSON.stringify(
                estado,
            ),
        );
    }, [
        treino,
        atividadeAtual,
        segundosAtividade,
        rodando,
    ]);

    function salvarTreinos(
        novaLista: Treino[],
    ) {
        setTreinos(novaLista);

        localStorage.setItem(
            STORAGE_TREINOS,
            JSON.stringify(
                novaLista,
            ),
        );
    }

    function salvarEventos(
        novaLista:
            EventoTreino[],
    ) {
        setEventos(novaLista);

        localStorage.setItem(
            STORAGE_EVENTOS_TREINO,
            JSON.stringify(
                novaLista,
            ),
        );
    }

    function garantirTreinoEmAndamento() {
        if (!treino) {
            return;
        }

        if (
            treino.status ===
            "Em andamento"
        ) {
            return;
        }

        const agora =
            new Date().toISOString();

        salvarTreinos(
            treinos.map((item) =>
                item.id ===
                    treino.id
                    ? {
                        ...item,
                        status:
                            "Em andamento",
                        updatedAt:
                            agora,
                    }
                    : item,
            ),
        );
    }

    function iniciarCronometro() {
        garantirTreinoEmAndamento();
        setRodando(true);
    }

    function pausarCronometro() {
        setRodando(false);
    }

    function zerarCronometro() {
        setRodando(false);
        setSegundosAtividade(0);
    }

    function alternarParticipacaoAtividade(
        atletaId: string,
    ) {
        if (
            !treino ||
            !atividadeAtual
        ) {
            return;
        }

        const listaAtual =
            participantesAtividadeIds;

        const novaLista =
            listaAtual.includes(
                atletaId,
            )
                ? listaAtual.filter(
                    (id) =>
                        id !== atletaId,
                )
                : [
                    ...listaAtual,
                    atletaId,
                ];

        const agora =
            new Date().toISOString();

        const novaListaTreinos =
            treinos.map((item) =>
                item.id === treino.id
                    ? {
                        ...item,
                        atividades:
                            item.atividades.map(
                                (atividade) =>
                                    atividade.id ===
                                        atividadeAtual.id
                                        ? {
                                            ...atividade,
                                            participantesAtividadeIds:
                                                novaLista,
                                        }
                                        : atividade,
                            ),
                        updatedAt:
                            agora,
                    }
                    : item,
            );

        salvarTreinos(
            novaListaTreinos,
        );

        if (
            atletaSelecionadoId ===
            atletaId &&
            !novaLista.includes(
                atletaId,
            )
        ) {
            setAtletaSelecionadoId(
                "",
            );
        }

        setErro("");
    }

    function resultadosPorFundamento(
        fundamento:
            FundamentoTreino,
    ): ResultadoTecnico[] {
        switch (fundamento) {
            case "Saque":
                return [
                    "Ace",
                    "Positivo",
                    "Neutro",
                    "Erro",
                ];

            case "Recepção":
                return [
                    "A",
                    "B",
                    "C",
                    "Erro",
                ];

            case "Ataque":
                return [
                    "Ponto",
                    "Positivo",
                    "Neutro",
                    "Negativo",
                    "Erro",
                ];

            case "Bloqueio":
                return [
                    "Ponto",
                    "Positivo",
                    "Neutro",
                    "Erro",
                ];

            case "Defesa":
                return [
                    "A",
                    "B",
                    "C",
                    "Erro",
                ];

            case "Levantamento":
                return [
                    "A",
                    "B",
                    "C",
                    "Erro",
                ];

            case "Físico":
            case "Tático":
                return [
                    "Concluído",
                    "Positivo",
                    "Neutro",
                    "Negativo",
                ];

            default:
                return [];
        }
    }

    function descricaoResultado(
        fundamento:
            FundamentoTreino,
        resultado:
            ResultadoTecnico,
    ) {
        if (
            fundamento ===
            "Recepção" ||
            fundamento ===
            "Defesa" ||
            fundamento ===
            "Levantamento"
        ) {
            switch (resultado) {
                case "A":
                    return "A · Ótimo";

                case "B":
                    return "B · Intermediário";

                case "C":
                    return "C · Ruim";

                default:
                    return resultado;
            }
        }

        return resultado;
    }

    function registrarAvaliacao(
        resultado:
            ResultadoTecnico,
    ) {
        if (
            !treino ||
            !atividadeAtual
        ) {
            return;
        }

        if (
            !atletaSelecionadoId
        ) {
            setErro(
                "Selecione um atleta para registrar a avaliação.",
            );
            return;
        }

        if (
            !participantesAtividadeIds.includes(
                atletaSelecionadoId,
            )
        ) {
            setErro(
                "Este atleta não está participando da atividade atual.",
            );
            return;
        }

        const novoEvento:
            EventoTreino = {
            id: crypto.randomUUID(),
            treinoId:
                treino.id,
            atividadeId:
                atividadeAtual.id,
            atletaId:
                atletaSelecionadoId,
            fundamento:
                atividadeAtual.fundamento,
            resultado,
            criadoEm:
                new Date().toISOString(),
        };

        salvarEventos([
            ...eventos,
            novoEvento,
        ]);

        setErro("");
    }

    function eventosAtividadeAtleta(
        atletaId: string,
    ) {
        if (
            !treino ||
            !atividadeAtual
        ) {
            return [];
        }

        return eventos.filter(
            (evento) =>
                evento.treinoId ===
                treino.id &&
                evento.atividadeId ===
                atividadeAtual.id &&
                evento.atletaId ===
                atletaId,
        );
    }

    function desfazerUltimaAvaliacao() {
        if (
            !treino ||
            !atividadeAtual
        ) {
            return;
        }

        const eventosAtividade =
            eventos.filter(
                (evento) =>
                    evento.treinoId ===
                    treino.id &&
                    evento.atividadeId ===
                    atividadeAtual.id,
            );

        if (
            eventosAtividade.length ===
            0
        ) {
            setErro(
                "Não há avaliações para desfazer nesta atividade.",
            );
            return;
        }

        const ultimo =
            eventosAtividade[
            eventosAtividade.length -
            1
            ];

        salvarEventos(
            eventos.filter(
                (evento) =>
                    evento.id !==
                    ultimo.id,
            ),
        );

        setErro("");
    }

    function salvarTempoAtividadeAtual() {
        if (
            !treino ||
            !atividadeAtual
        ) {
            return;
        }

        const agora =
            new Date().toISOString();

        const novaLista =
            treinos.map((item) =>
                item.id === treino.id
                    ? {
                        ...item,
                        atividades:
                            item.atividades.map(
                                (atividade) =>
                                    atividade.id ===
                                        atividadeAtual.id
                                        ? {
                                            ...atividade,
                                            tempoExecutadoSegundos:
                                                segundosAtividade,
                                        }
                                        : atividade,
                            ),
                        updatedAt:
                            agora,
                    }
                    : item,
            );

        salvarTreinos(
            novaLista,
        );
    }

    function avancarAtividade() {
        if (
            !treino ||
            !atividadeAtual
        ) {
            return;
        }

        setRodando(false);
        salvarTempoAtividadeAtual();

        const proximoIndice =
            indiceAtividadeAtual + 1;

        if (
            proximoIndice >=
            treino.atividades.length
        ) {
            finalizarTreino();
            return;
        }

        const proximaAtividade =
            treino.atividades[
            proximoIndice
            ];

        setAtividadeAtualId(
            proximaAtividade.id,
        );

        setAtletaSelecionadoId("");
        setSegundosAtividade(
            proximaAtividade.tempoExecutadoSegundos ??
            0,
        );
        setErro("");
    }

    function finalizarTreino() {
        if (
            !treino ||
            !atividadeAtual
        ) {
            return;
        }

        const agora =
            new Date().toISOString();

        const novaLista =
            treinos.map((item) =>
                item.id === treino.id
                    ? {
                        ...item,
                        status:
                            "Finalizado" as const,
                        atividades:
                            item.atividades.map(
                                (atividade) =>
                                    atividade.id ===
                                        atividadeAtual.id
                                        ? {
                                            ...atividade,
                                            tempoExecutadoSegundos:
                                                segundosAtividade,
                                        }
                                        : atividade,
                            ),
                        updatedAt:
                            agora,
                    }
                    : item,
            );

        salvarTreinos(
            novaLista,
        );

        localStorage.removeItem(
            STORAGE_ESTADO_CENTRO,
        );

        setRodando(false);

        navigate(
            `/treinos/${treino.id}/resumo`,
        );
    }

    function formatarTempo(
        segundos: number,
    ) {
        const minutos =
            Math.floor(
                segundos / 60,
            );

        const segundosRestantes =
            segundos % 60;

        return `${String(
            minutos,
        ).padStart(2, "0")}:${String(
            segundosRestantes,
        ).padStart(2, "0")}`;
    }

    if (!treino) {
        return (
            <Alert severity="warning">
                Treino não encontrado.
            </Alert>
        );
    }

    if (!atividadeAtual) {
        return (
            <Alert severity="warning">
                Este treino não possui atividades planejadas.
            </Alert>
        );
    }

    const eventosAtletaAtual =
        atletaSelecionadoId
            ? eventosAtividadeAtleta(
                atletaSelecionadoId,
            )
            : [];

    return (
        <>
            <Button
                startIcon={
                    <ArrowBackIcon />
                }
                onClick={() =>
                    navigate(
                        "/treinos",
                    )
                }
                sx={{ mb: 2 }}
            >
                Voltar para treinos
            </Button>

            {erro && (
                <Alert
                    severity="error"
                    onClose={() =>
                        setErro("")
                    }
                    sx={{ mb: 3 }}
                >
                    {erro}
                </Alert>
            )}

            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: {
                            xs: "flex-start",
                            md: "center",
                        },
                        flexDirection: {
                            xs: "column",
                            md: "row",
                        },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            Centro do Treino
                        </Typography>

                        <Typography
                            color="text.secondary"
                        >
                            {equipe?.nome ??
                                "Equipe"}{" "}
                            · {treino.objetivo}
                        </Typography>
                    </Box>

                    <Chip
                        label={
                            treino.status
                        }
                        color={
                            treino.status ===
                                "Finalizado"
                                ? "success"
                                : "warning"
                        }
                    />
                </Box>
            </Paper>

            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: {
                            xs: "flex-start",
                            md: "center",
                        },
                        flexDirection: {
                            xs: "column",
                            md: "row",
                        },
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Box>
                        <Typography
                            color="text.secondary"
                        >
                            Atividade{" "}
                            {indiceAtividadeAtual +
                                1}{" "}
                            de{" "}
                            {
                                treino.atividades
                                    .length
                            }
                        </Typography>

                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            {
                                atividadeAtual.nome
                            }
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        <Chip
                            label={
                                atividadeAtual.fundamento
                            }
                            color="primary"
                        />

                        <Chip
                            label={`Intensidade: ${atividadeAtual.intensidade}`}
                            variant="outlined"
                        />

                        <Chip
                            label={`${atividadeAtual.duracaoMinutos ?? 0} min planejados`}
                            variant="outlined"
                        />
                    </Box>
                </Box>

                {atividadeAtual.observacoes && (
                    <Typography
                        color="text.secondary"
                        sx={{
                            mb: 2,
                        }}
                    >
                        {
                            atividadeAtual.observacoes
                        }
                    </Typography>
                )}

                <Divider
                    sx={{ my: 2 }}
                />

                <Box
                    sx={{
                        textAlign: "center",
                    }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            mb: 2,
                        }}
                    >
                        {formatarTempo(
                            segundosAtividade,
                        )}
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "center",
                            gap: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        {!rodando ? (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={
                                    <PlayArrowIcon />
                                }
                                onClick={
                                    iniciarCronometro
                                }
                            >
                                Iniciar
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={
                                    <PauseIcon />
                                }
                                onClick={
                                    pausarCronometro
                                }
                            >
                                Pausar
                            </Button>
                        )}

                        <Button
                            variant="outlined"
                            startIcon={
                                <RestartAltIcon />
                            }
                            onClick={
                                zerarCronometro
                            }
                        >
                            Zerar
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: {
                            xs: "flex-start",
                            md: "center",
                        },
                        flexDirection: {
                            xs: "column",
                            md: "row",
                        },
                        gap: 1,
                        mb: 2,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            Participação na atividade
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Marque quem está participando da atividade atual.
                        </Typography>
                    </Box>

                    <Chip
                        label={`${participantesAtividadeIds.length} de ${participantes.length}`}
                        color="primary"
                        variant="outlined"
                    />
                </Box>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                        },
                        gap: 1,
                        mb: 3,
                    }}
                >
                    {participantes.map(
                        (atleta) => {
                            const participa =
                                participantesAtividadeIds.includes(
                                    atleta.id,
                                );

                            return (
                                <Paper
                                    key={atleta.id}
                                    variant="outlined"
                                    sx={{
                                        p: 1,
                                    }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={participa}
                                                onChange={() =>
                                                    alternarParticipacaoAtividade(
                                                        atleta.id,
                                                    )
                                                }
                                            />
                                        }
                                        label={`#${atleta.numero} · ${atleta.nome}`}
                                    />
                                </Paper>
                            );
                        },
                    )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography
                    sx={{
                        fontWeight: 700,
                        mb: 1,
                    }}
                >
                    Selecionar atleta para avaliação
                </Typography>

                {participantesAtividadeIds.length ===
                    0 ? (
                    <Alert severity="warning">
                        Nenhum atleta está participando desta atividade.
                    </Alert>
                ) : (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "repeat(2, 1fr)",
                                sm: "repeat(3, 1fr)",
                                md: "repeat(4, 1fr)",
                            },
                            gap: 1,
                        }}
                    >
                        {participantes
                            .filter(
                                (atleta) =>
                                    participantesAtividadeIds.includes(
                                        atleta.id,
                                    ),
                            )
                            .map(
                                (atleta) => (
                                    <Button
                                        key={
                                            atleta.id
                                        }
                                        variant={
                                            atletaSelecionadoId ===
                                                atleta.id
                                                ? "contained"
                                                : "outlined"
                                        }
                                        onClick={() =>
                                            setAtletaSelecionadoId(
                                                atleta.id,
                                            )
                                        }
                                        sx={{
                                            minHeight: 56,
                                        }}
                                    >
                                        #{atleta.numero}{" "}
                                        {atleta.nome}
                                    </Button>
                                ),
                            )}
                    </Box>
                )}
            </Paper>

            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        mb: 1,
                    }}
                >
                    Avaliação técnica
                </Typography>

                {!atletaSelecionadoId ? (
                    <Alert severity="info">
                        Selecione um atleta para registrar avaliações.
                    </Alert>
                ) : (
                    <>
                        <Typography
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            {
                                participantes.find(
                                    (atleta) =>
                                        atleta.id ===
                                        atletaSelecionadoId,
                                )?.nome
                            }
                            {" · "}
                            {
                                atividadeAtual.fundamento
                            }
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "repeat(2, 1fr)",
                                    sm: "repeat(4, 1fr)",
                                    md: "repeat(5, 1fr)",
                                },
                                gap: 1,
                                mb: 3,
                            }}
                        >
                            {resultadosPorFundamento(
                                atividadeAtual.fundamento,
                            ).map(
                                (resultado) => (
                                    <Button
                                        key={
                                            resultado
                                        }
                                        variant="contained"
                                        color={
                                            resultado ===
                                                "Ace" ||
                                                resultado ===
                                                "Ponto" ||
                                                resultado ===
                                                "A" ||
                                                resultado ===
                                                "Concluído"
                                                ? "success"
                                                : resultado ===
                                                    "Erro"
                                                    ? "error"
                                                    : "primary"
                                        }
                                        onClick={() =>
                                            registrarAvaliacao(
                                                resultado,
                                            )
                                        }
                                        sx={{
                                            minHeight: 64,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {descricaoResultado(
                                            atividadeAtual.fundamento,
                                            resultado,
                                        )}
                                    </Button>
                                ),
                            )}
                        </Box>

                        <Divider
                            sx={{ mb: 2 }}
                        />

                        <Typography
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                            }}
                        >
                            Contadores do atleta
                        </Typography>

                        {eventosAtletaAtual.length ===
                            0 ? (
                            <Typography
                                color="text.secondary"
                            >
                                Nenhuma avaliação registrada.
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                }}
                            >
                                {Array.from(
                                    new Set(
                                        eventosAtletaAtual.map(
                                            (evento) =>
                                                evento.resultado,
                                        ),
                                    ),
                                ).map(
                                    (resultado) => (
                                        <Chip
                                            key={
                                                resultado
                                            }
                                            label={`${resultado}: ${eventosAtletaAtual.filter(
                                                (evento) =>
                                                    evento.resultado ===
                                                    resultado,
                                            ).length
                                                }`}
                                        />
                                    ),
                                )}
                            </Box>
                        )}
                    </>
                )}
            </Paper>

            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        gap: 1,
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={
                            desfazerUltimaAvaliacao
                        }
                    >
                        Desfazer última avaliação
                    </Button>

                    {indiceAtividadeAtual ===
                        treino.atividades.length -
                        1 ? (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={
                                <StopIcon />
                            }
                            onClick={
                                finalizarTreino
                            }
                        >
                            Finalizar treino
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            startIcon={
                                <SkipNextIcon />
                            }
                            onClick={
                                avancarAtividade
                            }
                        >
                            Próxima atividade
                        </Button>
                    )}
                </Box>
            </Paper>
        </>
    );
}

export default CentroTreino;