import { useEffect, useMemo, useState } from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
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

type ResultadoResumo =
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

function ResumoTreino() {
    const { treinoId } =
        useParams();

    const navigate =
        useNavigate();

    const [treinos, setTreinos] =
        useState<Treino[]>([]);

    const [eventos, setEventos] =
        useState<EventoTreino[]>([]);

    const [atletas, setAtletas] =
        useState<Atleta[]>([]);

    const [equipes, setEquipes] =
        useState<Equipe[]>([]);

    useEffect(() => {
        const treinosSalvos =
            localStorage.getItem(
                STORAGE_TREINOS,
            );

        const eventosSalvos =
            localStorage.getItem(
                STORAGE_EVENTOS_TREINO,
            );

        const atletasSalvos =
            localStorage.getItem(
                "evolley-atletas",
            );

        const equipesSalvas =
            localStorage.getItem(
                "evolley-equipes",
            );

        if (treinosSalvos) {
            try {
                setTreinos(
                    JSON.parse(
                        treinosSalvos,
                    ),
                );
            } catch {
                localStorage.removeItem(
                    STORAGE_TREINOS,
                );
            }
        }

        if (eventosSalvos) {
            try {
                setEventos(
                    JSON.parse(
                        eventosSalvos,
                    ),
                );
            } catch {
                localStorage.removeItem(
                    STORAGE_EVENTOS_TREINO,
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
    }, []);

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

    const eventosDoTreino =
        useMemo(
            () =>
                eventos.filter(
                    (evento) =>
                        evento.treinoId ===
                        treinoId,
                ),
            [eventos, treinoId],
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

    const minutosPlanejados =
        useMemo(() => {
            if (!treino) {
                return 0;
            }

            return treino.atividades.reduce(
                (total, atividade) =>
                    total +
                    (atividade.duracaoMinutos ??
                        0),
                0,
            );
        }, [treino]);

    const segundosExecutados =
        useMemo(() => {
            if (!treino) {
                return 0;
            }

            return treino.atividades.reduce(
                (total, atividade) =>
                    total +
                    (atividade.tempoExecutadoSegundos ??
                        0),
                0,
            );
        }, [treino]);

    const intensidadeExecutada =
        useMemo(() => {
            if (!treino) {
                return [];
            }

            const mapa = new Map<
                string,
                number
            >();

            treino.atividades.forEach(
                (atividade) => {
                    const atual =
                        mapa.get(
                            atividade.intensidade,
                        ) ?? 0;

                    mapa.set(
                        atividade.intensidade,
                        atual +
                        (atividade.tempoExecutadoSegundos ??
                            0),
                    );
                },
            );

            return [...mapa.entries()];
        }, [treino]);

    const intensidadeResumo =
        useMemo(() => {
            if (!treino) {
                return [];
            }

            const mapa = new Map<
                string,
                number
            >();

            treino.atividades.forEach(
                (atividade) => {
                    const atual =
                        mapa.get(
                            atividade.intensidade,
                        ) ?? 0;

                    mapa.set(
                        atividade.intensidade,
                        atual +
                        (atividade.duracaoMinutos ??
                            0),
                    );
                },
            );

            return [...mapa.entries()];
        }, [treino]);

    const fundamentoResumo =
        useMemo(() => {
            const mapa = new Map<
                FundamentoTreino,
                number
            >();

            eventosDoTreino.forEach(
                (evento) => {
                    mapa.set(
                        evento.fundamento,
                        (mapa.get(
                            evento.fundamento,
                        ) ?? 0) + 1,
                    );
                },
            );

            return [...mapa.entries()];
        }, [eventosDoTreino]);

    function participantesDaAtividade(
        atividadeId: string,
    ) {
        const atividade =
            treino?.atividades.find(
                (item) =>
                    item.id ===
                    atividadeId,
            );

        if (
            !atividade ||
            !treino
        ) {
            return [];
        }

        const ids =
            atividade.participantesAtividadeIds ??
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
    }

    function quantidadeAtividadesAtleta(
        atletaId: string,
    ) {
        if (!treino) {
            return 0;
        }

        return treino.atividades.filter(
            (atividade) => {
                const ids =
                    atividade.participantesAtividadeIds ??
                    treino.participantes
                        .filter(
                            (participante) =>
                                participante.presente,
                        )
                        .map(
                            (participante) =>
                                participante.atletaId,
                        );

                return ids.includes(
                    atletaId,
                );
            },
        ).length;
    }

    function eventosAtleta(
        atletaId: string,
    ) {
        return eventosDoTreino.filter(
            (evento) =>
                evento.atletaId ===
                atletaId,
        );
    }

    function resumoAtleta(
        atletaId: string,
    ) {
        const eventosJogador =
            eventosAtleta(
                atletaId,
            );

        const porFundamento =
            new Map<
                FundamentoTreino,
                Map<
                    string,
                    number
                >
            >();

        eventosJogador.forEach(
            (evento) => {
                if (
                    !porFundamento.has(
                        evento.fundamento,
                    )
                ) {
                    porFundamento.set(
                        evento.fundamento,
                        new Map(),
                    );
                }

                const resultados =
                    porFundamento.get(
                        evento.fundamento,
                    )!;

                resultados.set(
                    evento.resultado,
                    (resultados.get(
                        evento.resultado,
                    ) ?? 0) + 1,
                );
            },
        );

        return porFundamento;
    }

    function descricaoResultado(
        resultado: string,
    ) {
        const resultadoTipado =
            resultado as ResultadoResumo;

        switch (resultadoTipado) {
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

    function formatarTempo(
        segundos: number,
    ) {
        const minutos =
            Math.floor(
                segundos / 60,
            );

        const segundosRestantes =
            segundos % 60;

        return `${minutos} min ${String(
            segundosRestantes,
        ).padStart(2, "0")} s`;
    }

    function formatarData(
        data: string,
    ) {
        return new Intl.DateTimeFormat(
            "pt-BR",
            {
                dateStyle: "short",
            },
        ).format(
            new Date(
                `${data}T12:00:00`,
            ),
        );
    }

    if (!treino) {
        return (
            <Alert severity="warning">
                Treino não encontrado.
            </Alert>
        );
    }

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

            <Box
                sx={{
                    mb: 3,
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                    }}
                >
                    Resumo do Treino
                </Typography>

                <Typography
                    color="text.secondary"
                >
                    {equipe?.nome ??
                        "Equipe"}{" "}
                    ·{" "}
                    {formatarData(
                        treino.data,
                    )}
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(5, 1fr)",
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                <Paper
                    variant="outlined"
                    sx={{ p: 2 }}
                >
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        Objetivo
                    </Typography>

                    <Typography
                        sx={{
                            fontWeight: 700,
                            mt: 1,
                        }}
                    >
                        {treino.objetivo}
                    </Typography>
                </Paper>

                <Paper
                    variant="outlined"
                    sx={{ p: 2 }}
                >
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        Participantes
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        {
                            participantes.length
                        }
                    </Typography>
                </Paper>

                <Paper
                    variant="outlined"
                    sx={{ p: 2 }}
                >
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        Atividades
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        {
                            treino.atividades
                                .length
                        }
                    </Typography>
                </Paper>

                <Paper
                    variant="outlined"
                    sx={{ p: 2 }}
                >
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        Minutos planejados
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        {
                            minutosPlanejados
                        }
                    </Typography>
                </Paper>

                <Paper
                    variant="outlined"
                    sx={{ p: 2 }}
                >
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        Tempo executado
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            mt: 1,
                        }}
                    >
                        {formatarTempo(
                            segundosExecutados,
                        )}
                    </Typography>
                </Paper>
            </Box>

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
                    Distribuição de intensidade
                </Typography>

                {intensidadeResumo.length ===
                    0 ? (
                    <Typography
                        color="text.secondary"
                    >
                        Nenhuma atividade planejada.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        {intensidadeResumo.map(
                            ([
                                intensidade,
                                minutos,
                            ]) => (
                                <Chip
                                    key={
                                        intensidade
                                    }
                                    label={`${intensidade}: ${minutos} min`}
                                />
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
                        mb: 2,
                    }}
                >
                    Intensidade executada
                </Typography>

                {intensidadeExecutada.length ===
                    0 ? (
                    <Typography
                        color="text.secondary"
                    >
                        Nenhum tempo executado foi registrado.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        {intensidadeExecutada.map(
                            ([
                                intensidade,
                                segundos,
                            ]) => (
                                <Chip
                                    key={
                                        intensidade
                                    }
                                    color="secondary"
                                    variant="outlined"
                                    label={`${intensidade}: ${formatarTempo(
                                        segundos,
                                    )}`}
                                />
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
                        mb: 2,
                    }}
                >
                    Avaliações por fundamento
                </Typography>

                {fundamentoResumo.length ===
                    0 ? (
                    <Typography
                        color="text.secondary"
                    >
                        Nenhuma avaliação técnica foi registrada.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        {fundamentoResumo.map(
                            ([
                                fundamento,
                                quantidade,
                            ]) => (
                                <Chip
                                    key={
                                        fundamento
                                    }
                                    color="primary"
                                    variant="outlined"
                                    label={`${fundamento}: ${quantidade}`}
                                />
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
                        mb: 2,
                    }}
                >
                    Desempenho por atleta
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
                    {participantes.map(
                        (atleta) => {
                            const resumo =
                                resumoAtleta(
                                    atleta.id,
                                );

                            const total =
                                eventosAtleta(
                                    atleta.id,
                                ).length;

                            return (
                                <Paper
                                    key={
                                        atleta.id
                                    }
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
                                            alignItems:
                                                "center",
                                            mb: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                #
                                                {
                                                    atleta.numero
                                                }{" "}
                                                {
                                                    atleta.nome
                                                }
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {
                                                    atleta.posicao
                                                }
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 1,
                                                flexWrap: "wrap",
                                                justifyContent: "flex-end",
                                            }}
                                        >
                                            <Chip
                                                size="small"
                                                label={`${quantidadeAtividadesAtleta(
                                                    atleta.id,
                                                )}/${treino.atividades.length} atividades`}
                                            />

                                            <Chip
                                                size="small"
                                                label={`${total} avaliações`}
                                            />
                                        </Box>
                                    </Box>

                                    <Divider
                                        sx={{
                                            mb: 1.5,
                                        }}
                                    />

                                    {resumo.size ===
                                        0 ? (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Nenhuma avaliação registrada.
                                        </Typography>
                                    ) : (
                                        <Box
                                            sx={{
                                                display:
                                                    "grid",
                                                gap: 1.5,
                                            }}
                                        >
                                            {[...resumo.entries()].map(
                                                ([
                                                    fundamento,
                                                    resultados,
                                                ]) => (
                                                    <Box
                                                        key={
                                                            fundamento
                                                        }
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight:
                                                                    600,
                                                            }}
                                                        >
                                                            {
                                                                fundamento
                                                            }
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
                                                                            resultado,
                                                                        )}: ${quantidade}`,
                                                                )
                                                                .join(
                                                                    " · ",
                                                                )}
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
                    Atividades realizadas
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gap: 1.5,
                    }}
                >
                    {treino.atividades.map(
                        (
                            atividade,
                            indice,
                        ) => {
                            const quantidadeEventos =
                                eventosDoTreino.filter(
                                    (evento) =>
                                        evento.atividadeId ===
                                        atividade.id,
                                ).length;

                            const participantesAtividade =
                                participantesDaAtividade(
                                    atividade.id,
                                );

                            return (
                                <Paper
                                    key={
                                        atividade.id
                                    }
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        {indice +
                                            1}
                                        .{" "}
                                        {
                                            atividade.nome
                                        }
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {
                                            atividade.fundamento
                                        }
                                        {" · "}
                                        {
                                            atividade.intensidade
                                        }
                                        {" · "}
                                        Planejado:{" "}
                                        {
                                            atividade.duracaoMinutos
                                        }{" "}
                                        min
                                        {" · "}
                                        Executado:{" "}
                                        {formatarTempo(
                                            atividade.tempoExecutadoSegundos ??
                                            0,
                                        )}
                                        {" · "}
                                        {
                                            quantidadeEventos
                                        }{" "}
                                        avaliações
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mt: 0.75,
                                        }}
                                    >
                                        Participantes:{" "}
                                        {participantesAtividade.length ===
                                            0
                                            ? "Nenhum"
                                            : participantesAtividade
                                                .map(
                                                    (atleta) =>
                                                        atleta.nome,
                                                )
                                                .join(
                                                    ", ",
                                                )}
                                    </Typography>
                                </Paper>
                            );
                        },
                    )}
                </Box>
            </Paper>
        </>
    );
}

export default ResumoTreino;