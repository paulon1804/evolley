import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Typography,
} from "@mui/material";

import type {
    AcaoJogoRapido,
    EventoJogoRapido,
    FormatoJogoRapido,
    JogoRapido,
    JogadorJogoRapido,
    ResultadoJogoRapido,
} from "../../types/JogoRapido";

const acoes: AcaoJogoRapido[] = [
    "Saque",
    "Passe",
    "Levantamento",
    "Ataque",
    "Bloqueio",
    "Defesa",
];

const STORAGE_JOGO_RAPIDO =
    "evolley-jogo-rapido-atual";

const STORAGE_EVENTOS_JOGO_RAPIDO =
    "evolley-jogo-rapido-eventos";

function JogoRapidoPage() {
    const [formato, setFormato] =
        useState<FormatoJogoRapido | null>(
            null,
        );

    const [jogo, setJogo] =
        useState<JogoRapido | null>(
            null,
        );

    useEffect(() => {
        const jogoSalvo =
            localStorage.getItem(
                STORAGE_JOGO_RAPIDO,
            );

        const eventosSalvos =
            localStorage.getItem(
                STORAGE_EVENTOS_JOGO_RAPIDO,
            );

        if (jogoSalvo) {
            try {
                const dadosJogo: JogoRapido =
                    JSON.parse(jogoSalvo);

                setJogo(dadosJogo);
                setFormato(
                    dadosJogo.formato,
                );
            } catch {
                localStorage.removeItem(
                    STORAGE_JOGO_RAPIDO,
                );
            }
        }

        if (eventosSalvos) {
            try {
                const dadosEventos:
                    EventoJogoRapido[] =
                    JSON.parse(
                        eventosSalvos,
                    );

                setEventos(
                    dadosEventos,
                );
            } catch {
                localStorage.removeItem(
                    STORAGE_EVENTOS_JOGO_RAPIDO,
                );
            }
        }
    }, []);

    const [eventos, setEventos] =
        useState<EventoJogoRapido[]>(
            [],
        );

    const [
        jogadorSelecionado,
        setJogadorSelecionado,
    ] = useState("");

    const [
        acaoSelecionada,
        setAcaoSelecionada,
    ] =
        useState<AcaoJogoRapido | null>(
            null,
        );

    const [erro, setErro] =
        useState("");

    const [mostrarResumo, setMostrarResumo] =
        useState(false);

    const [jogoFinalizado, setJogoFinalizado] =
        useState<JogoRapido | null>(null);

    const [eventosFinalizados, setEventosFinalizados] =
        useState<EventoJogoRapido[]>([]);


    function salvarJogo(
        jogoAtualizado: JogoRapido,
    ) {
        setJogo(jogoAtualizado);

        localStorage.setItem(
            STORAGE_JOGO_RAPIDO,
            JSON.stringify(jogoAtualizado),
        );
    }

    function salvarEventos(
        novaLista: EventoJogoRapido[],
    ) {
        setEventos(novaLista);

        localStorage.setItem(
            STORAGE_EVENTOS_JOGO_RAPIDO,
            JSON.stringify(novaLista),
        );
    }

    function criarJogadores(
        formatoSelecionado:
            FormatoJogoRapido,
    ) {
        const porTime =
            formatoSelecionado ===
                "2x2"
                ? 2
                : 6;

        const jogadores:
            JogadorJogoRapido[] = [];

        for (
            let indice = 1;
            indice <= porTime;
            indice++
        ) {
            jogadores.push({
                id: crypto.randomUUID(),
                numero: indice,
                nome: `Jogador ${indice}`,
                time: "A",
            });
        }

        for (
            let indice = 1;
            indice <= porTime;
            indice++
        ) {
            jogadores.push({
                id: crypto.randomUUID(),
                numero: indice,
                nome: `Jogador ${indice}`,
                time: "B",
            });
        }

        return jogadores;
    }

    function iniciarJogo() {
        if (!formato) {
            setErro(
                "Selecione 2x2 ou 6x6.",
            );

            return;
        }

        const novoJogo: JogoRapido = {
            id: crypto.randomUUID(),
            formato,
            jogadores:
                criarJogadores(formato),
            pontosTimeA: 0,
            pontosTimeB: 0,
            status: "Em andamento",
            iniciadoEm:
                new Date().toISOString(),
        };

        salvarJogo(novoJogo);
        salvarEventos([]);
        setJogadorSelecionado("");
        setAcaoSelecionada(null);
        setErro("");
    }

    function resultadosPorAcao(
        acao: AcaoJogoRapido,
    ): ResultadoJogoRapido[] {
        switch (acao) {
            case "Saque":
                return [
                    "Ace",
                    "Positivo",
                    "Neutro",
                    "Erro",
                ];

            case "Passe":
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
                    "Positivo",
                    "Neutro",
                    "Negativo",
                    "Erro",
                ];

            case "Levantamento":
                return [
                    "Positivo",
                    "Neutro",
                    "Negativo",
                    "Erro",
                ];

            default:
                return [];
        }
    }

    function descricaoResultado(
        acao: AcaoJogoRapido,
        resultado:
            ResultadoJogoRapido,
    ) {
        if (acao === "Passe") {
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

    function impactoResultado(
        resultado:
            ResultadoJogoRapido,
    ):
        | "PontoJogador"
        | "PontoAdversario"
        | "Nenhum" {
        if (
            resultado === "Ace" ||
            resultado === "Ponto"
        ) {
            return "PontoJogador";
        }

        if (
            resultado === "Erro"
        ) {
            return "PontoAdversario";
        }

        return "Nenhum";
    }

    function alterarPlacarManual(
        time: "A" | "B",
        incremento: number,
    ) {
        if (!jogo) {
            return;
        }

        const novoA =
            time === "A"
                ? Math.max(
                    0,
                    jogo.pontosTimeA +
                    incremento,
                )
                : jogo.pontosTimeA;

        const novoB =
            time === "B"
                ? Math.max(
                    0,
                    jogo.pontosTimeB +
                    incremento,
                )
                : jogo.pontosTimeB;

        salvarJogo({
            ...jogo,
            pontosTimeA: novoA,
            pontosTimeB: novoB,
        });
    }

    function registrarEvento(
        resultado:
            ResultadoJogoRapido,
    ) {
        if (
            !jogo ||
            !jogadorSelecionado ||
            !acaoSelecionada
        ) {
            setErro(
                "Selecione jogador e ação.",
            );

            return;
        }

        const jogador =
            jogo.jogadores.find(
                (item) =>
                    item.id ===
                    jogadorSelecionado,
            );

        if (!jogador) {
            return;
        }

        const impacto =
            impactoResultado(
                resultado,
            );

        let novoPlacarA =
            jogo.pontosTimeA;

        let novoPlacarB =
            jogo.pontosTimeB;

        if (
            impacto ===
            "PontoJogador"
        ) {
            if (
                jogador.time === "A"
            ) {
                novoPlacarA += 1;
            } else {
                novoPlacarB += 1;
            }
        }

        if (
            impacto ===
            "PontoAdversario"
        ) {
            if (
                jogador.time === "A"
            ) {
                novoPlacarB += 1;
            } else {
                novoPlacarA += 1;
            }
        }

        const evento:
            EventoJogoRapido = {
            id: crypto.randomUUID(),

            jogoId:
                jogo.id,

            jogadorId:
                jogador.id,

            time:
                jogador.time,

            acao:
                acaoSelecionada,

            resultado,

            pontosTimeAAntes:
                jogo.pontosTimeA,

            pontosTimeBAntes:
                jogo.pontosTimeB,

            pontosTimeADepois:
                novoPlacarA,

            pontosTimeBDepois:
                novoPlacarB,

            criadoEm:
                new Date().toISOString(),
        };

        salvarEventos([
            ...eventos,
            evento,
        ]);

        salvarJogo({
            ...jogo,
            pontosTimeA:
                novoPlacarA,
            pontosTimeB:
                novoPlacarB,
        });

        setErro("");
    }

    function desfazerUltimaAcao() {
        if (
            !jogo ||
            eventos.length === 0
        ) {
            setErro(
                "Não há ações para desfazer.",
            );

            return;
        }

        const ultimoEvento =
            eventos[
            eventos.length - 1
            ];

        salvarEventos(
            eventos.slice(
                0,
                -1,
            ),
        );

        salvarJogo({
            ...jogo,

            pontosTimeA:
                ultimoEvento
                    .pontosTimeAAntes,

            pontosTimeB:
                ultimoEvento
                    .pontosTimeBAntes,
        });

        setErro("");
    }

    function encerrarJogo() {
        if (!jogo) {
            return;
        }

        const jogoEncerrado: JogoRapido = {
            ...jogo,
            status: "Finalizado",
            finalizadoEm:
                new Date().toISOString(),
        };

        setJogoFinalizado(jogoEncerrado);
        setEventosFinalizados(eventos);
        setMostrarResumo(true);

        localStorage.removeItem(
            STORAGE_JOGO_RAPIDO,
        );

        localStorage.removeItem(
            STORAGE_EVENTOS_JOGO_RAPIDO,
        );

        setErro("");
    }

    function salvarJogoFinalizado() {
        if (!jogoFinalizado) {
            return;
        }

        const chaveHistorico =
            "evolley-jogos-rapidos-historico";

        const historicoSalvo =
            localStorage.getItem(
                chaveHistorico,
            );

        let historico: Array<{
            jogo: JogoRapido;
            eventos: EventoJogoRapido[];
        }> = [];

        if (historicoSalvo) {
            try {
                historico =
                    JSON.parse(
                        historicoSalvo,
                    );
            } catch {
                historico = [];
            }
        }

        const jaExiste =
            historico.some(
                (item) =>
                    item.jogo.id ===
                    jogoFinalizado.id,
            );

        if (!jaExiste) {
            historico.push({
                jogo: jogoFinalizado,
                eventos: eventosFinalizados,
            });

            localStorage.setItem(
                chaveHistorico,
                JSON.stringify(
                    historico,
                ),
            );
        }

        setErro("");
    }

    function novoJogoRapido() {
        setMostrarResumo(false);
        setJogoFinalizado(null);
        setEventosFinalizados([]);

        setJogo(null);
        setEventos([]);
        setFormato(null);

        setJogadorSelecionado("");
        setAcaoSelecionada(null);
        setErro("");
    }

    function resumoJogador(
        jogadorId: string,
    ) {
        const eventosJogador =
            eventosFinalizados.filter(
                (evento) =>
                    evento.jogadorId ===
                    jogadorId,
            );

        const porAcao =
            new Map<
                AcaoJogoRapido,
                Map<
                    ResultadoJogoRapido,
                    number
                >
            >();

        eventosJogador.forEach(
            (evento) => {
                if (!porAcao.has(evento.acao)) {
                    porAcao.set(
                        evento.acao,
                        new Map(),
                    );
                }

                const resultados =
                    porAcao.get(
                        evento.acao,
                    )!;

                resultados.set(
                    evento.resultado,
                    (resultados.get(
                        evento.resultado,
                    ) ?? 0) + 1,
                );
            },
        );

        return porAcao;
    }

    const jogadoresTimeA =
        useMemo(
            () =>
                jogo?.jogadores.filter(
                    (jogador) =>
                        jogador.time ===
                        "A",
                ) ?? [],
            [jogo],
        );

    const jogadoresTimeB =
        useMemo(
            () =>
                jogo?.jogadores.filter(
                    (jogador) =>
                        jogador.time ===
                        "B",
                ) ?? [],
            [jogo],
        );

    if (
        mostrarResumo &&
        jogoFinalizado
    ) {
        return (
            <>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        mb: 1,
                    }}
                >
                    Resumo do Jogo
                </Typography>

                <Typography
                    color="text.secondary"
                    sx={{
                        mb: 3,
                    }}
                >
                    Jogo rápido finalizado · {jogoFinalizado.formato}
                </Typography>

                <Paper
                    sx={{
                        p: 3,
                        mb: 3,
                    }}
                >
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns:
                                "1fr auto 1fr",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Box sx={{ textAlign: "center" }}>
                            <Typography sx={{ fontWeight: 700 }}>
                                Time A
                            </Typography>

                            <Typography
                                variant="h2"
                                sx={{ fontWeight: 800 }}
                            >
                                {jogoFinalizado.pontosTimeA}
                            </Typography>
                        </Box>

                        <Typography
                            variant="h4"
                            color="text.secondary"
                        >
                            x
                        </Typography>

                        <Box sx={{ textAlign: "center" }}>
                            <Typography sx={{ fontWeight: 700 }}>
                                Time B
                            </Typography>

                            <Typography
                                variant="h2"
                                sx={{ fontWeight: 800 }}
                            >
                                {jogoFinalizado.pontosTimeB}
                            </Typography>
                        </Box>
                    </Box>
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
                            mb: 2,
                        }}
                    >
                        Estatísticas por jogador
                    </Typography>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                md: "repeat(2, 1fr)",
                            },
                            gap: 2,
                        }}
                    >
                        {jogoFinalizado.jogadores.map(
                            (jogador) => {
                                const resumo =
                                    resumoJogador(
                                        jogador.id,
                                    );

                                return (
                                    <Paper
                                        key={jogador.id}
                                        variant="outlined"
                                        sx={{ p: 2 }}
                                    >
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                mb: 1,
                                            }}
                                        >
                                            {jogador.time}
                                            {jogador.numero}
                                        </Typography>

                                        {resumo.size === 0 ? (
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                Nenhuma ação registrada.
                                            </Typography>
                                        ) : (
                                            <Box
                                                sx={{
                                                    display: "grid",
                                                    gap: 1,
                                                }}
                                            >
                                                {[...resumo.entries()].map(
                                                    ([
                                                        acao,
                                                        resultados,
                                                    ]) => (
                                                        <Box key={acao}>
                                                            <Typography
                                                                sx={{
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {acao}
                                                            </Typography>

                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >
                                                                {[...resultados.entries()]
                                                                    .map(
                                                                        ([
                                                                            resultado,
                                                                            quantidade,
                                                                        ]) =>
                                                                            `${descricaoResultado(
                                                                                acao,
                                                                                resultado,
                                                                            )}: ${quantidade}`,
                                                                    )
                                                                    .join(" · ")}
                                                            </Typography>
                                                        </Box>
                                                    ),
                                                )}
                                            </Box>
                                        )}
                                    </Paper>
                                );
                            },
                        )}
                    </Box>
                </Paper>

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={
                            salvarJogoFinalizado
                        }
                    >
                        Salvar partida
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={
                            novoJogoRapido
                        }
                    >
                        Novo jogo
                    </Button>
                </Box>
            </>
        );
    }

    if (!jogo) {
        return (
            <>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        mb: 1,
                    }}
                >
                    Jogo Rápido
                </Typography>

                <Typography
                    color="text.secondary"
                    sx={{
                        mb: 3,
                    }}
                >
                    Escolha o formato e comece o scout imediatamente.
                </Typography>

                {erro && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                        }}
                    >
                        {erro}
                    </Alert>
                )}

                <Paper
                    sx={{
                        p: 3,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            mb: 2,
                        }}
                    >
                        Formato
                    </Typography>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                            },
                            gap: 2,
                            mb: 3,
                        }}
                    >
                        <Button
                            variant={
                                formato === "2x2"
                                    ? "contained"
                                    : "outlined"
                            }
                            onClick={() =>
                                setFormato(
                                    "2x2",
                                )
                            }
                            sx={{
                                minHeight: 120,
                                fontSize: 28,
                                fontWeight: 700,
                            }}
                        >
                            2 x 2
                        </Button>

                        <Button
                            variant={
                                formato === "6x6"
                                    ? "contained"
                                    : "outlined"
                            }
                            onClick={() =>
                                setFormato(
                                    "6x6",
                                )
                            }
                            sx={{
                                minHeight: 120,
                                fontSize: 28,
                                fontWeight: 700,
                            }}
                        >
                            6 x 6
                        </Button>
                    </Box>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={
                            iniciarJogo
                        }
                        disabled={
                            !formato
                        }
                        fullWidth
                    >
                        Iniciar jogo
                    </Button>
                </Paper>
            </>
        );
    }

    const jogadorAtual =
        jogo.jogadores.find(
            (jogador) =>
                jogador.id ===
                jogadorSelecionado,
        );

    return (
        <>
            {erro && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2,
                    }}
                    onClose={() =>
                        setErro("")
                    }
                >
                    {erro}
                </Alert>
            )}

            {/* PLACAR */}

            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        mb: 2,
                    }}
                >
                    Jogo Rápido · {jogo.formato}
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns:
                            "1fr auto 1fr",
                        alignItems:
                            "center",
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            Time A
                        </Typography>

                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                            }}
                        >
                            {jogo.pontosTimeA}
                        </Typography>
                    </Box>

                    <Typography
                        variant="h4"
                        color="text.secondary"
                    >
                        x
                    </Typography>

                    <Box
                        sx={{
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            Time B
                        </Typography>

                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                            }}
                        >
                            {jogo.pontosTimeB}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        mt: 2,
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                        },
                        gap: 1,
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={() =>
                            alterarPlacarManual(
                                "A",
                                1,
                            )
                        }
                    >
                        +1 Time A
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() =>
                            alterarPlacarManual(
                                "B",
                                1,
                            )
                        }
                    >
                        +1 Time B
                    </Button>

                    <Button
                        variant="outlined"
                        color="warning"
                        disabled={
                            jogo.pontosTimeA ===
                            0
                        }
                        onClick={() =>
                            alterarPlacarManual(
                                "A",
                                -1,
                            )
                        }
                    >
                        Voltar ponto A
                    </Button>

                    <Button
                        variant="outlined"
                        color="warning"
                        disabled={
                            jogo.pontosTimeB ===
                            0
                        }
                        onClick={() =>
                            alterarPlacarManual(
                                "B",
                                -1,
                            )
                        }
                    >
                        Voltar ponto B
                    </Button>
                </Box>
            </Paper>

            {/* JOGADORES */}

            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        mb: 2,
                    }}
                >
                    Jogadores
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 1,
                    }}
                >
                    Time A
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "repeat(2, 1fr)",
                            sm:
                                jogo.formato ===
                                    "6x6"
                                    ? "repeat(6, 1fr)"
                                    : "repeat(2, 1fr)",
                        },
                        gap: 1,
                        mb: 2,
                    }}
                >
                    {jogadoresTimeA.map(
                        (jogador) => (
                            <Button
                                key={
                                    jogador.id
                                }
                                variant={
                                    jogadorSelecionado ===
                                        jogador.id
                                        ? "contained"
                                        : "outlined"
                                }
                                onClick={() =>
                                    setJogadorSelecionado(
                                        jogador.id,
                                    )
                                }
                                sx={{
                                    minHeight: 58,
                                    fontWeight: 700,
                                }}
                            >
                                A{jogador.numero}
                            </Button>
                        ),
                    )}
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 1,
                    }}
                >
                    Time B
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "repeat(2, 1fr)",
                            sm:
                                jogo.formato ===
                                    "6x6"
                                    ? "repeat(6, 1fr)"
                                    : "repeat(2, 1fr)",
                        },
                        gap: 1,
                    }}
                >
                    {jogadoresTimeB.map(
                        (jogador) => (
                            <Button
                                key={
                                    jogador.id
                                }
                                variant={
                                    jogadorSelecionado ===
                                        jogador.id
                                        ? "contained"
                                        : "outlined"
                                }
                                onClick={() =>
                                    setJogadorSelecionado(
                                        jogador.id,
                                    )
                                }
                                sx={{
                                    minHeight: 58,
                                    fontWeight: 700,
                                }}
                            >
                                B{jogador.numero}
                            </Button>
                        ),
                    )}
                </Box>
            </Paper>

            {/* AÇÕES */}

            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        gap: 2,
                        alignItems: "center",
                        flexWrap: "wrap",
                        mb: 2,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        Ações
                    </Typography>

                    {jogadorAtual && (
                        <Chip
                            color="primary"
                            label={`Selecionado: ${jogadorAtual.time}${jogadorAtual.numero}`}
                        />
                    )}
                </Box>

                {!jogadorAtual ? (
                    <Alert severity="info">
                        Selecione um jogador acima.
                    </Alert>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "repeat(2, 1fr)",
                                    sm: "repeat(3, 1fr)",
                                    md: "repeat(6, 1fr)",
                                },
                                gap: 1,
                                mb: 3,
                            }}
                        >
                            {acoes.map(
                                (acao) => (
                                    <Button
                                        key={
                                            acao
                                        }
                                        variant={
                                            acaoSelecionada ===
                                                acao
                                                ? "contained"
                                                : "outlined"
                                        }
                                        onClick={() =>
                                            setAcaoSelecionada(
                                                acao,
                                            )
                                        }
                                        sx={{
                                            minHeight: 64,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {acao}
                                    </Button>
                                ),
                            )}
                        </Box>

                        <Divider
                            sx={{
                                mb: 2,
                            }}
                        />

                        {acaoSelecionada ? (
                            <>
                                <Typography
                                    sx={{
                                        fontWeight: 700,
                                        mb: 2,
                                    }}
                                >
                                    Resultado · {acaoSelecionada}
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
                                    }}
                                >
                                    {resultadosPorAcao(
                                        acaoSelecionada,
                                    ).map(
                                        (
                                            resultado,
                                        ) => (
                                            <Button
                                                key={
                                                    resultado
                                                }
                                                variant="contained"
                                                color={
                                                    resultado ===
                                                        "Ace" ||
                                                        resultado ===
                                                        "Ponto"
                                                        ? "success"
                                                        : resultado ===
                                                            "Erro"
                                                            ? "error"
                                                            : "primary"
                                                }
                                                onClick={() =>
                                                    registrarEvento(
                                                        resultado,
                                                    )
                                                }
                                                sx={{
                                                    minHeight: 70,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {descricaoResultado(
                                                    acaoSelecionada,
                                                    resultado,
                                                )}
                                            </Button>
                                        ),
                                    )}
                                </Box>
                            </>
                        ) : (
                            <Alert severity="info">
                                Escolha uma ação.
                            </Alert>
                        )}
                    </>
                )}
            </Paper>

            {/* ÚLTIMAS AÇÕES */}

            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        mb: 2,
                    }}
                >
                    Últimas ações
                </Typography>

                {eventos.length === 0 ? (
                    <Typography color="text.secondary">
                        Nenhuma ação registrada.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: "grid",
                            gap: 1,
                        }}
                    >
                        {[...eventos]
                            .reverse()
                            .slice(0, 10)
                            .map((evento) => {
                                const jogador =
                                    jogo.jogadores.find(
                                        (item) =>
                                            item.id === evento.jogadorId,
                                    );

                                return (
                                    <Box
                                        key={evento.id}
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: {
                                                xs: "1fr",
                                                sm: "90px 1fr 1fr 100px",
                                            },
                                            gap: 1,
                                            alignItems: "center",
                                            p: 1.5,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Chip
                                            size="small"
                                            label={
                                                jogador
                                                    ? `${jogador.time}${jogador.numero}`
                                                    : `Time ${evento.time}`
                                            }
                                        />

                                        <Typography sx={{ fontWeight: 600 }}>
                                            {evento.acao}
                                        </Typography>

                                        <Typography>
                                            {descricaoResultado(
                                                evento.acao,
                                                evento.resultado,
                                            )}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                textAlign: {
                                                    xs: "left",
                                                    sm: "right",
                                                },
                                            }}
                                        >
                                            {evento.pontosTimeADepois} x{" "}
                                            {evento.pontosTimeBDepois}
                                        </Typography>
                                    </Box>
                                );
                            })}
                    </Box>
                )}
            </Paper>

            {/* CONTROLE */}

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
                        disabled={
                            eventos.length ===
                            0
                        }
                        onClick={
                            desfazerUltimaAcao
                        }
                    >
                        Desfazer última ação
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={
                            encerrarJogo
                        }
                    >
                        Encerrar jogo rápido
                    </Button>
                </Box>
            </Paper>
        </>
    );
}

export default JogoRapidoPage;