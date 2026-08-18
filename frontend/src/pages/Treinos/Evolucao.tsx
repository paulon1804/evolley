import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
    Alert,
    Box,
    Button,
    Chip,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

import type { Atleta } from "../../types/Atleta";

import type {
    EventoTreino,
    FundamentoTreino,
    Treino,
} from "../../types/Treino";

const STORAGE_TREINOS =
    "evolley-treinos";

const STORAGE_EVENTOS =
    "evolley-treino-eventos";

const fundamentos: (
    | "Todos"
    | FundamentoTreino
)[] = [
        "Todos",
        "Saque",
        "Recepção",
        "Levantamento",
        "Ataque",
        "Bloqueio",
        "Defesa",
        "Físico",
        "Tático",
    ];

function EvolucaoTreinos() {
    const navigate =
        useNavigate();

    const [treinos, setTreinos] =
        useState<Treino[]>([]);

    const [eventos, setEventos] =
        useState<EventoTreino[]>([]);

    const [atletas, setAtletas] =
        useState<Atleta[]>([]);

    const [
        atletaSelecionadoId,
        setAtletaSelecionadoId,
    ] = useState("");

    const [
        fundamentoSelecionado,
        setFundamentoSelecionado,
    ] =
        useState<
            "Todos" | FundamentoTreino
        >("Todos");

    useEffect(() => {
        const treinosSalvos =
            localStorage.getItem(
                STORAGE_TREINOS,
            );

        const eventosSalvos =
            localStorage.getItem(
                STORAGE_EVENTOS,
            );

        const atletasSalvos =
            localStorage.getItem(
                "evolley-atletas",
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
                    STORAGE_EVENTOS,
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
    }, []);

    const atletaSelecionado =
        useMemo(
            () =>
                atletas.find(
                    (atleta) =>
                        atleta.id ===
                        atletaSelecionadoId,
                ),
            [
                atletas,
                atletaSelecionadoId,
            ],
        );

    const eventosAtleta =
        useMemo(() => {
            if (
                !atletaSelecionadoId
            ) {
                return [];
            }

            return eventos.filter(
                (evento) =>
                    evento.atletaId ===
                    atletaSelecionadoId &&
                    (fundamentoSelecionado ===
                        "Todos" ||
                        evento.fundamento ===
                        fundamentoSelecionado),
            );
        }, [
            eventos,
            atletaSelecionadoId,
            fundamentoSelecionado,
        ]);

    const treinosDoAtleta =
        useMemo(() => {
            if (
                !atletaSelecionadoId
            ) {
                return [];
            }

            return treinos
                .filter(
                    (treino) =>
                        treino.participantes.some(
                            (participante) =>
                                participante.atletaId ===
                                atletaSelecionadoId &&
                                participante.presente,
                        ),
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.data,
                        ).getTime() -
                        new Date(
                            a.data,
                        ).getTime(),
                );
        }, [
            treinos,
            atletaSelecionadoId,
        ]);

    const resumoResultados =
        useMemo(() => {
            const mapa =
                new Map<
                    string,
                    number
                >();

            eventosAtleta.forEach(
                (evento) => {
                    mapa.set(
                        evento.resultado,
                        (mapa.get(
                            evento.resultado,
                        ) ?? 0) + 1,
                    );
                },
            );

            return [...mapa.entries()].sort(
                (a, b) =>
                    b[1] - a[1],
            );
        }, [eventosAtleta]);

    const fundamentosAtleta =
        useMemo(() => {
            const mapa =
                new Map<
                    FundamentoTreino,
                    number
                >();

            eventos
                .filter(
                    (evento) =>
                        evento.atletaId ===
                        atletaSelecionadoId,
                )
                .forEach(
                    (evento) => {
                        mapa.set(
                            evento.fundamento,
                            (mapa.get(
                                evento.fundamento,
                            ) ?? 0) + 1,
                        );
                    },
                );

            return [...mapa.entries()].sort(
                (a, b) =>
                    b[1] - a[1],
            );
        }, [
            eventos,
            atletaSelecionadoId,
        ]);

    function eventosDoTreino(
        treinoId: string,
    ) {
        return eventosAtleta.filter(
            (evento) =>
                evento.treinoId ===
                treinoId,
        );
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

    function percentual(
        quantidade: number,
        total: number,
    ) {
        if (total === 0) {
            return 0;
        }

        return Math.round(
            (quantidade / total) * 100,
        );
    }

    function resultadosDoTreino(
        treinoId: string,
    ) {
        const eventosTreino =
            eventosDoTreino(
                treinoId,
            );

        const mapa =
            new Map<
                string,
                number
            >();

        eventosTreino.forEach(
            (evento) => {
                mapa.set(
                    evento.resultado,
                    (mapa.get(
                        evento.resultado,
                    ) ?? 0) + 1,
                );
            },
        );

        return mapa;
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

            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                    }}
                >
                    Evolução dos Atletas
                </Typography>

                <Typography
                    color="text.secondary"
                >
                    Acompanhe o volume de avaliações e o desempenho técnico ao longo dos treinos.
                </Typography>
            </Box>

            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "2fr 1fr",
                        },
                        gap: 2,
                    }}
                >
                    <TextField
                        select
                        label="Atleta"
                        value={
                            atletaSelecionadoId
                        }
                        onChange={(evento) =>
                            setAtletaSelecionadoId(
                                evento.target.value,
                            )
                        }
                        fullWidth
                    >
                        {atletas
                            .filter(
                                (atleta) =>
                                    atleta.ativo,
                            )
                            .sort(
                                (a, b) =>
                                    a.nome.localeCompare(
                                        b.nome,
                                    ),
                            )
                            .map(
                                (atleta) => (
                                    <MenuItem
                                        key={
                                            atleta.id
                                        }
                                        value={
                                            atleta.id
                                        }
                                    >
                                        #
                                        {
                                            atleta.numero
                                        }{" "}
                                        {
                                            atleta.nome
                                        }
                                        {" · "}
                                        {
                                            atleta.posicao
                                        }
                                    </MenuItem>
                                ),
                            )}
                    </TextField>

                    <TextField
                        select
                        label="Fundamento"
                        value={
                            fundamentoSelecionado
                        }
                        onChange={(evento) =>
                            setFundamentoSelecionado(
                                evento.target
                                    .value as
                                | "Todos"
                                | FundamentoTreino,
                            )
                        }
                        fullWidth
                    >
                        {fundamentos.map(
                            (fundamento) => (
                                <MenuItem
                                    key={
                                        fundamento
                                    }
                                    value={
                                        fundamento
                                    }
                                >
                                    {fundamento}
                                </MenuItem>
                            ),
                        )}
                    </TextField>
                </Box>
            </Paper>

            {!atletaSelecionado ? (
                <Alert severity="info">
                    Selecione um atleta para visualizar a evolução.
                </Alert>
            ) : (
                <>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                                lg: "repeat(4, 1fr)",
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
                                Treinos
                            </Typography>

                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                }}
                            >
                                {
                                    treinosDoAtleta.length
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
                                Avaliações
                            </Typography>

                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                }}
                            >
                                {
                                    eventosAtleta.length
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
                                Fundamentos avaliados
                            </Typography>

                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                }}
                            >
                                {
                                    fundamentosAtleta.length
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
                                Filtro atual
                            </Typography>

                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    mt: 1,
                                }}
                            >
                                {
                                    fundamentoSelecionado
                                }
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
                            Resultados acumulados
                        </Typography>

                        {resumoResultados.length ===
                            0 ? (
                            <Typography
                                color="text.secondary"
                            >
                                Nenhuma avaliação encontrada para o filtro atual.
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                }}
                            >
                                {resumoResultados.map(
                                    ([
                                        resultado,
                                        quantidade,
                                    ]) => (
                                        <Chip
                                            key={
                                                resultado
                                            }
                                            label={`${resultado}: ${quantidade} · ${percentual(
                                                quantidade,
                                                eventosAtleta.length,
                                            )}%`}
                                            color={
                                                resultado ===
                                                    "A" ||
                                                    resultado ===
                                                    "Ace" ||
                                                    resultado ===
                                                    "Ponto" ||
                                                    resultado ===
                                                    "Concluído"
                                                    ? "success"
                                                    : resultado ===
                                                        "Erro"
                                                        ? "error"
                                                        : "default"
                                            }
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
                            Qualidade em percentual
                        </Typography>

                        {resumoResultados.length ===
                            0 ? (
                            <Typography
                                color="text.secondary"
                            >
                                Nenhuma avaliação disponível para calcular percentuais.
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "repeat(2, 1fr)",
                                        md: "repeat(4, 1fr)",
                                    },
                                    gap: 2,
                                }}
                            >
                                {resumoResultados.map(
                                    ([
                                        resultado,
                                        quantidade,
                                    ]) => (
                                        <Paper
                                            key={
                                                resultado
                                            }
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                            }}
                                        >
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                {resultado}
                                            </Typography>

                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {percentual(
                                                    quantidade,
                                                    eventosAtleta.length,
                                                )}
                                                %
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {quantidade} de{" "}
                                                {eventosAtleta.length}
                                            </Typography>
                                        </Paper>
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
                            Volume por fundamento
                        </Typography>

                        {fundamentosAtleta.length ===
                            0 ? (
                            <Typography
                                color="text.secondary"
                            >
                                Nenhum fundamento avaliado.
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                }}
                            >
                                {fundamentosAtleta.map(
                                    ([
                                        fundamento,
                                        quantidade,
                                    ]) => (
                                        <Chip
                                            key={
                                                fundamento
                                            }
                                            variant="outlined"
                                            color="primary"
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
                            Comparação entre treinos
                        </Typography>

                        {treinosDoAtleta.length ===
                            0 ? (
                            <Typography
                                color="text.secondary"
                            >
                                Nenhum treino disponível para comparação.
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    display: "grid",
                                    gap: 1.5,
                                }}
                            >
                                {treinosDoAtleta.map(
                                    (treino) => {
                                        const eventosTreino =
                                            eventosDoTreino(
                                                treino.id,
                                            );

                                        const resultadosTreino =
                                            resultadosDoTreino(
                                                treino.id,
                                            );

                                        return (
                                            <Paper
                                                key={
                                                    treino.id
                                                }
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight: 700,
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {formatarData(
                                                        treino.data,
                                                    )}
                                                    {" · "}
                                                    {treino.objetivo}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        mb: 1,
                                                    }}
                                                >
                                                    {eventosTreino.length} avaliações
                                                </Typography>

                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        gap: 1,
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    {[...resultadosTreino.entries()].map(
                                                        ([
                                                            resultado,
                                                            quantidade,
                                                        ]) => (
                                                            <Chip
                                                                key={
                                                                    resultado
                                                                }
                                                                size="small"
                                                                variant="outlined"
                                                                label={`${resultado}: ${percentual(
                                                                    quantidade,
                                                                    eventosTreino.length,
                                                                )}%`}
                                                            />
                                                        ),
                                                    )}
                                                </Box>
                                            </Paper>
                                        );
                                    },
                                )}
                            </Box>
                        )}
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
                            Histórico por treino
                        </Typography>

                        {treinosDoAtleta.length ===
                            0 ? (
                            <Typography
                                color="text.secondary"
                            >
                                Nenhum treino encontrado para este atleta.
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    display: "grid",
                                    gap: 1.5,
                                }}
                            >
                                {treinosDoAtleta.map(
                                    (treino) => {
                                        const eventosTreino =
                                            eventosDoTreino(
                                                treino.id,
                                            );

                                        const resultadosTreino =
                                            resultadosDoTreino(
                                                treino.id,
                                            );

                                        const totalTreino =
                                            eventosTreino.length;

                                        return (
                                            <Paper
                                                key={
                                                    treino.id
                                                }
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display:
                                                            "flex",
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
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography
                                                            sx={{
                                                                fontWeight:
                                                                    700,
                                                            }}
                                                        >
                                                            {
                                                                treino.objetivo
                                                            }
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {formatarData(
                                                                treino.data,
                                                            )}
                                                            {" · "}
                                                            {
                                                                eventosTreino.length
                                                            }{" "}
                                                            avaliações
                                                        </Typography>
                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            display:
                                                                "flex",
                                                            gap: 1,
                                                            flexWrap:
                                                                "wrap",
                                                        }}
                                                    >
                                                        {[...resultadosTreino.entries()].map(
                                                            ([
                                                                resultado,
                                                                quantidade,
                                                            ]) => (
                                                                <Chip
                                                                    key={
                                                                        resultado
                                                                    }
                                                                    size="small"
                                                                    label={`${resultado}: ${quantidade} · ${percentual(
                                                                        quantidade,
                                                                        totalTreino,
                                                                    )}%`}
                                                                />
                                                            ),
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        );
                                    },
                                )}
                            </Box>
                        )}
                    </Paper>
                </>
            )}
        </>
    );
}

export default EvolucaoTreinos;