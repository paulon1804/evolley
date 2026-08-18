import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";

import {
    Alert,
    Box,
    Button,
    Chip,
    LinearProgress,
    MenuItem,
    Paper,
    TextField,
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

type ModoAnalise =
    | "Atleta"
    | "Equipe";

interface ResultadoPercentual {
    resultado: string;
    quantidade: number;
    percentual: number;
}

function AnalisesTreinos() {
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

    const [modo, setModo] =
        useState<ModoAnalise>(
            "Atleta",
        );

    const [
        atletaSelecionadoId,
        setAtletaSelecionadoId,
    ] = useState("");

    const [
        equipeSelecionadaId,
        setEquipeSelecionadaId,
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

    const equipeSelecionada =
        useMemo(
            () =>
                equipes.find(
                    (equipe) =>
                        equipe.id ===
                        equipeSelecionadaId,
                ),
            [
                equipes,
                equipeSelecionadaId,
            ],
        );

    const atletasEquipe =
        useMemo(
            () =>
                atletas.filter(
                    (atleta) =>
                        atleta.equipeId ===
                        equipeSelecionadaId,
                ),
            [
                atletas,
                equipeSelecionadaId,
            ],
        );

    const idsAnalise =
        useMemo(() => {
            if (
                modo === "Atleta"
            ) {
                return atletaSelecionadoId
                    ? [
                        atletaSelecionadoId,
                    ]
                    : [];
            }

            return atletasEquipe.map(
                (atleta) =>
                    atleta.id,
            );
        }, [
            modo,
            atletaSelecionadoId,
            atletasEquipe,
        ]);

    const eventosAnalise =
        useMemo(() => {
            if (
                idsAnalise.length === 0
            ) {
                return [];
            }

            return eventos.filter(
                (evento) =>
                    idsAnalise.includes(
                        evento.atletaId,
                    ) &&
                    (fundamentoSelecionado ===
                        "Todos" ||
                        evento.fundamento ===
                        fundamentoSelecionado),
            );
        }, [
            eventos,
            idsAnalise,
            fundamentoSelecionado,
        ]);

    const treinosAnalise =
        useMemo(() => {
            if (
                idsAnalise.length === 0
            ) {
                return [];
            }

            return treinos
                .filter(
                    (treino) =>
                        treino.participantes.some(
                            (participante) =>
                                idsAnalise.includes(
                                    participante.atletaId,
                                ) &&
                                participante.presente,
                        ),
                )
                .sort(
                    (a, b) =>
                        new Date(
                            a.data,
                        ).getTime() -
                        new Date(
                            b.data,
                        ).getTime(),
                );
        }, [
            treinos,
            idsAnalise,
        ]);

    const resultadosPercentuais =
        useMemo<
            ResultadoPercentual[]
        >(() => {
            const total =
                eventosAnalise.length;

            const mapa =
                new Map<
                    string,
                    number
                >();

            eventosAnalise.forEach(
                (evento) => {
                    mapa.set(
                        evento.resultado,
                        (mapa.get(
                            evento.resultado,
                        ) ?? 0) + 1,
                    );
                },
            );

            return [...mapa.entries()]
                .map(
                    ([
                        resultado,
                        quantidade,
                    ]) => ({
                        resultado,
                        quantidade,
                        percentual:
                            total === 0
                                ? 0
                                : Math.round(
                                    (quantidade /
                                        total) *
                                    100,
                                ),
                    }),
                )
                .sort(
                    (a, b) =>
                        b.quantidade -
                        a.quantidade,
                );
        }, [
            eventosAnalise,
        ]);

    const volumeFundamentos =
        useMemo(() => {
            const mapa =
                new Map<
                    FundamentoTreino,
                    number
                >();

            eventos
                .filter(
                    (evento) =>
                        idsAnalise.includes(
                            evento.atletaId,
                        ),
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

            return [...mapa.entries()]
                .sort(
                    (a, b) =>
                        b[1] - a[1],
                );
        }, [
            eventos,
            idsAnalise,
        ]);

    const maiorVolumeFundamento =
        useMemo(
            () =>
                Math.max(
                    1,
                    ...volumeFundamentos.map(
                        ([, quantidade]) =>
                            quantidade,
                    ),
                ),
            [volumeFundamentos],
        );

    function resultadosTreino(
        treinoId: string,
    ) {
        const eventosTreino =
            eventosAnalise.filter(
                (evento) =>
                    evento.treinoId ===
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

        return {
            total:
                eventosTreino.length,
            resultados:
                [...mapa.entries()],
        };
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

    function descricaoResultado(
        resultado: string,
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

    const distribuicaoPorFundamento =
        useMemo(() => {
            const mapa = new Map<
                FundamentoTreino,
                {
                    total: number;
                    resultados: Map<
                        string,
                        number
                    >;
                }
            >();

            eventosAnalise.forEach(
                (evento) => {
                    if (
                        !mapa.has(
                            evento.fundamento,
                        )
                    ) {
                        mapa.set(
                            evento.fundamento,
                            {
                                total: 0,
                                resultados:
                                    new Map(),
                            },
                        );
                    }

                    const grupo =
                        mapa.get(
                            evento.fundamento,
                        )!;

                    grupo.total += 1;

                    grupo.resultados.set(
                        evento.resultado,
                        (grupo.resultados.get(
                            evento.resultado,
                        ) ?? 0) + 1,
                    );
                },
            );

            return [...mapa.entries()]
                .map(
                    ([
                        fundamento,
                        grupo,
                    ]) => ({
                        fundamento,
                        total:
                            grupo.total,
                        resultados:
                            [...grupo.resultados.entries()]
                                .map(
                                    ([
                                        resultado,
                                        quantidade,
                                    ]) => ({
                                        resultado,
                                        quantidade,
                                        percentual:
                                            grupo.total === 0
                                                ? 0
                                                : Math.round(
                                                    (quantidade /
                                                        grupo.total) *
                                                    100,
                                                ),
                                    }),
                                )
                                .sort(
                                    (a, b) =>
                                        b.quantidade -
                                        a.quantidade,
                                ),
                    }),
                )
                .sort(
                    (a, b) =>
                        b.total - a.total,
                );
        }, [eventosAnalise]);

    const resultadosDisponiveis =
        useMemo(() => {
            const conjunto =
                new Set<string>();

            eventosAnalise.forEach(
                (evento) =>
                    conjunto.add(
                        evento.resultado,
                    ),
            );

            return [...conjunto];
        }, [eventosAnalise]);

    const serieTemporal =
        useMemo(() => {
            return treinosAnalise.map(
                (treino) => {
                    const dados =
                        resultadosTreino(
                            treino.id,
                        );

                    const percentuais =
                        new Map<
                            string,
                            number
                        >();

                    dados.resultados.forEach(
                        ([
                            resultado,
                            quantidade,
                        ]) => {
                            percentuais.set(
                                resultado,
                                dados.total === 0
                                    ? 0
                                    : Math.round(
                                        (quantidade /
                                            dados.total) *
                                        100,
                                    ),
                            );
                        },
                    );

                    return {
                        treino,
                        total:
                            dados.total,
                        percentuais,
                    };
                },
            );
        }, [
            treinosAnalise,
            eventosAnalise,
        ]);

    const tituloAnalise =
        modo === "Atleta"
            ? atletaSelecionado?.nome
            : equipeSelecionada?.nome;

    const selecaoValida =
        modo === "Atleta"
            ? Boolean(
                atletaSelecionadoId,
            )
            : Boolean(
                equipeSelecionadaId,
            );

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
                sx={{
                    mb: 2,
                }}
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
                    Análises de Treino
                </Typography>

                <Typography
                    color="text.secondary"
                >
                    Central de gráficos por atleta ou por equipe.
                </Typography>
            </Box>

            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                }}
            >
                <Typography
                    sx={{
                        fontWeight: 700,
                        mb: 2,
                    }}
                >
                    Tipo de análise
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                        },
                        gap: 1,
                        mb: 3,
                    }}
                >
                    <Button
                        variant={
                            modo === "Atleta"
                                ? "contained"
                                : "outlined"
                        }
                        startIcon={
                            <PersonIcon />
                        }
                        onClick={() => {
                            setModo(
                                "Atleta",
                            );
                            setEquipeSelecionadaId(
                                "",
                            );
                        }}
                        sx={{
                            minHeight: 60,
                        }}
                    >
                        Por atleta
                    </Button>

                    <Button
                        variant={
                            modo === "Equipe"
                                ? "contained"
                                : "outlined"
                        }
                        startIcon={
                            <GroupsIcon />
                        }
                        onClick={() => {
                            setModo(
                                "Equipe",
                            );
                            setAtletaSelecionadoId(
                                "",
                            );
                        }}
                        sx={{
                            minHeight: 60,
                        }}
                    >
                        Por equipe
                    </Button>
                </Box>

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
                    {modo ===
                        "Atleta" ? (
                        <TextField
                            select
                            label="Atleta"
                            value={
                                atletaSelecionadoId
                            }
                            onChange={(
                                evento,
                            ) =>
                                setAtletaSelecionadoId(
                                    evento
                                        .target
                                        .value,
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
                    ) : (
                        <TextField
                            select
                            label="Equipe"
                            value={
                                equipeSelecionadaId
                            }
                            onChange={(
                                evento,
                            ) =>
                                setEquipeSelecionadaId(
                                    evento
                                        .target
                                        .value,
                                )
                            }
                            fullWidth
                        >
                            {equipes
                                .filter(
                                    (equipe) =>
                                        equipe.ativa,
                                )
                                .sort(
                                    (a, b) =>
                                        a.nome.localeCompare(
                                            b.nome,
                                        ),
                                )
                                .map(
                                    (equipe) => (
                                        <MenuItem
                                            key={
                                                equipe.id
                                            }
                                            value={
                                                equipe.id
                                            }
                                        >
                                            {
                                                equipe.nome
                                            }
                                            {" · "}
                                            {
                                                equipe.categoria
                                            }
                                        </MenuItem>
                                    ),
                                )}
                        </TextField>
                    )}

                    <TextField
                        select
                        label="Fundamento"
                        value={
                            fundamentoSelecionado
                        }
                        onChange={(
                            evento,
                        ) =>
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

            {!selecaoValida ? (
                <Alert severity="info">
                    Escolha um{" "}
                    {modo === "Atleta"
                        ? "atleta"
                        : "time"}{" "}
                    para abrir os gráficos.
                </Alert>
            ) : (
                <>
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
                            mb: 3,
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                }}
                            >
                                {tituloAnalise}
                            </Typography>

                            <Typography
                                color="text.secondary"
                            >
                                {fundamentoSelecionado}
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
                                label={`${treinosAnalise.length} treinos`}
                            />

                            <Chip
                                label={`${eventosAnalise.length} avaliações`}
                                color="primary"
                            />

                            {modo ===
                                "Equipe" && (
                                    <Chip
                                        label={`${atletasEquipe.length} atletas`}
                                    />
                                )}
                        </Box>
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
                                mb: 1,
                            }}
                        >
                            {fundamentoSelecionado ===
                                "Todos"
                                ? "Distribuição dos resultados por fundamento"
                                : `Distribuição de ${fundamentoSelecionado}`}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mb: 3,
                            }}
                        >
                            {fundamentoSelecionado ===
                                "Todos"
                                ? "Cada percentual é calculado dentro do próprio fundamento."
                                : `Os percentuais abaixo consideram apenas as avaliações de ${fundamentoSelecionado}.`}
                        </Typography>

                        {eventosAnalise.length ===
                            0 ? (
                            <Typography
                                color="text.secondary"
                            >
                                Nenhuma avaliação encontrada para este filtro.
                            </Typography>
                        ) : fundamentoSelecionado ===
                            "Todos" ? (
                            <Box
                                sx={{
                                    display: "grid",
                                    gap: 3,
                                }}
                            >
                                {distribuicaoPorFundamento.map(
                                    (grupo) => (
                                        <Paper
                                            key={
                                                grupo.fundamento
                                            }
                                            variant="outlined"
                                            sx={{
                                                p: 2.5,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: {
                                                        xs: "flex-start",
                                                        sm: "center",
                                                    },
                                                    flexDirection: {
                                                        xs: "column",
                                                        sm: "row",
                                                    },
                                                    gap: 1,
                                                    mb: 2,
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {
                                                        grupo.fundamento
                                                    }
                                                </Typography>

                                                <Chip
                                                    size="small"
                                                    label={`${grupo.total} avaliações`}
                                                />
                                            </Box>

                                            <Box
                                                sx={{
                                                    display: "grid",
                                                    gap: 2,
                                                }}
                                            >
                                                {grupo.resultados.map(
                                                    (item) => (
                                                        <Box
                                                            key={
                                                                item.resultado
                                                            }
                                                        >
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        "flex",
                                                                    justifyContent:
                                                                        "space-between",
                                                                    gap: 2,
                                                                    mb: 0.5,
                                                                }}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight:
                                                                            600,
                                                                    }}
                                                                >
                                                                    {descricaoResultado(
                                                                        item.resultado,
                                                                    )}
                                                                </Typography>

                                                                <Typography
                                                                    sx={{
                                                                        fontWeight:
                                                                            700,
                                                                    }}
                                                                >
                                                                    {
                                                                        item.percentual
                                                                    }
                                                                    %
                                                                </Typography>
                                                            </Box>

                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={
                                                                    item.percentual
                                                                }
                                                                sx={{
                                                                    height: 10,
                                                                    borderRadius:
                                                                        10,
                                                                }}
                                                            />

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {
                                                                    item.quantidade
                                                                }{" "}
                                                                de{" "}
                                                                {
                                                                    grupo.total
                                                                }{" "}
                                                                avaliações de{" "}
                                                                {
                                                                    grupo.fundamento
                                                                }
                                                            </Typography>
                                                        </Box>
                                                    ),
                                                )}
                                            </Box>
                                        </Paper>
                                    ),
                                )}
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: "grid",
                                    gap: 2,
                                }}
                            >
                                {resultadosPercentuais.map(
                                    (
                                        item,
                                    ) => (
                                        <Box
                                            key={
                                                item.resultado
                                            }
                                        >
                                            <Box
                                                sx={{
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    gap: 2,
                                                    mb: 0.5,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight:
                                                            600,
                                                    }}
                                                >
                                                    {descricaoResultado(
                                                        item.resultado,
                                                    )}
                                                </Typography>

                                                <Typography
                                                    sx={{
                                                        fontWeight:
                                                            700,
                                                    }}
                                                >
                                                    {
                                                        item.percentual
                                                    }
                                                    %
                                                </Typography>
                                            </Box>

                                            <LinearProgress
                                                variant="determinate"
                                                value={
                                                    item.percentual
                                                }
                                                sx={{
                                                    height: 12,
                                                    borderRadius:
                                                        10,
                                                }}
                                            />

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {
                                                    item.quantidade
                                                }{" "}
                                                de{" "}
                                                {
                                                    eventosAnalise.length
                                                }{" "}
                                                avaliações de{" "}
                                                {
                                                    fundamentoSelecionado
                                                }
                                            </Typography>
                                        </Box>
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
                                mb: 3,
                            }}
                        >
                            Volume por fundamento
                        </Typography>

                        {volumeFundamentos.length ===
                            0 ? (
                            <Typography
                                color="text.secondary"
                            >
                                Nenhum dado disponível.
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    display: "grid",
                                    gap: 2,
                                }}
                            >
                                {volumeFundamentos.map(
                                    ([
                                        fundamento,
                                        quantidade,
                                    ]) => {
                                        const percentual =
                                            Math.round(
                                                (quantidade /
                                                    maiorVolumeFundamento) *
                                                100,
                                            );

                                        return (
                                            <Box
                                                key={
                                                    fundamento
                                                }
                                            >
                                                <Box
                                                    sx={{
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    <Typography>
                                                        {
                                                            fundamento
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontWeight:
                                                                700,
                                                        }}
                                                    >
                                                        {
                                                            quantidade
                                                        }
                                                    </Typography>
                                                </Box>

                                                <LinearProgress
                                                    variant="determinate"
                                                    value={
                                                        percentual
                                                    }
                                                    sx={{
                                                        height: 10,
                                                        borderRadius:
                                                            10,
                                                    }}
                                                />
                                            </Box>
                                        );
                                    },
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
                            Tendência ao longo dos treinos
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mb: 3,
                            }}
                        >
                            Cada coluna representa o percentual daquele resultado em um treino.
                        </Typography>

                        {serieTemporal.length ===
                            0 ||
                            resultadosDisponiveis.length ===
                            0 ? (
                            <Typography
                                color="text.secondary"
                            >
                                Ainda não há avaliações suficientes para montar a tendência.
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    display: "grid",
                                    gap: 3,
                                }}
                            >
                                {resultadosDisponiveis.map(
                                    (resultado) => (
                                        <Box
                                            key={
                                                resultado
                                            }
                                        >
                                            <Box
                                                sx={{
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems:
                                                        "center",
                                                    gap: 1,
                                                    mb: 1,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight:
                                                            700,
                                                    }}
                                                >
                                                    {descricaoResultado(
                                                        resultado,
                                                    )}
                                                </Typography>

                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    label={`${serieTemporal.length} treinos`}
                                                />
                                            </Box>

                                            <Box
                                                sx={{
                                                    display:
                                                        "grid",
                                                    gridTemplateColumns: `repeat(${Math.max(
                                                        serieTemporal.length,
                                                        1,
                                                    )}, minmax(56px, 1fr))`,
                                                    gap: 1,
                                                    alignItems:
                                                        "end",
                                                    minHeight:
                                                        180,
                                                    overflowX:
                                                        "auto",
                                                    pb: 1,
                                                }}
                                            >
                                                {serieTemporal.map(
                                                    (
                                                        ponto,
                                                    ) => {
                                                        const valor =
                                                            ponto.percentuais.get(
                                                                resultado,
                                                            ) ??
                                                            0;

                                                        return (
                                                            <Box
                                                                key={
                                                                    ponto
                                                                        .treino
                                                                        .id
                                                                }
                                                                sx={{
                                                                    display:
                                                                        "flex",
                                                                    flexDirection:
                                                                        "column",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "flex-end",
                                                                    minWidth:
                                                                        56,
                                                                    height:
                                                                        170,
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        fontWeight:
                                                                            700,
                                                                        mb: 0.5,
                                                                    }}
                                                                >
                                                                    {
                                                                        valor
                                                                    }
                                                                    %
                                                                </Typography>

                                                                <Box
                                                                    sx={{
                                                                        width:
                                                                            "70%",
                                                                        height: `${Math.max(
                                                                            valor,
                                                                            2,
                                                                        )}%`,
                                                                        minHeight:
                                                                            4,
                                                                        bgcolor:
                                                                            "primary.main",
                                                                        borderRadius:
                                                                            "6px 6px 0 0",
                                                                        transition:
                                                                            "height 0.2s ease",
                                                                    }}
                                                                />

                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        mt: 0.75,
                                                                        textAlign:
                                                                            "center",
                                                                        whiteSpace:
                                                                            "nowrap",
                                                                    }}
                                                                >
                                                                    {formatarData(
                                                                        ponto
                                                                            .treino
                                                                            .data,
                                                                    )}
                                                                </Typography>
                                                            </Box>
                                                        );
                                                    },
                                                )}
                                            </Box>
                                        </Box>
                                    ),
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
                            Evolução por treino
                        </Typography>

                        {treinosAnalise.length ===
                            0 ? (
                            <Typography
                                color="text.secondary"
                            >
                                Nenhum treino disponível.
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    display: "grid",
                                    gap: 2,
                                }}
                            >
                                {treinosAnalise.map(
                                    (treino) => {
                                        const dados =
                                            resultadosTreino(
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
                                                        mb: 2,
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography
                                                            sx={{
                                                                fontWeight:
                                                                    700,
                                                            }}
                                                        >
                                                            {formatarData(
                                                                treino.data,
                                                            )}
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {
                                                                treino.objetivo
                                                            }
                                                        </Typography>
                                                    </Box>

                                                    <Chip
                                                        size="small"
                                                        label={`${dados.total} avaliações`}
                                                    />
                                                </Box>

                                                {dados.total ===
                                                    0 ? (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        Sem avaliações para o filtro atual.
                                                    </Typography>
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            display:
                                                                "grid",
                                                            gap: 1.5,
                                                        }}
                                                    >
                                                        {dados.resultados.map(
                                                            ([
                                                                resultado,
                                                                quantidade,
                                                            ]) => {
                                                                const percentual =
                                                                    Math.round(
                                                                        (quantidade /
                                                                            dados.total) *
                                                                        100,
                                                                    );

                                                                return (
                                                                    <Box
                                                                        key={
                                                                            resultado
                                                                        }
                                                                    >
                                                                        <Box
                                                                            sx={{
                                                                                display:
                                                                                    "flex",
                                                                                justifyContent:
                                                                                    "space-between",
                                                                                mb: 0.5,
                                                                            }}
                                                                        >
                                                                            <Typography
                                                                                variant="body2"
                                                                            >
                                                                                {descricaoResultado(
                                                                                    resultado,
                                                                                )}
                                                                            </Typography>

                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{
                                                                                    fontWeight:
                                                                                        700,
                                                                                }}
                                                                            >
                                                                                {
                                                                                    percentual
                                                                                }
                                                                                %
                                                                            </Typography>
                                                                        </Box>

                                                                        <LinearProgress
                                                                            variant="determinate"
                                                                            value={
                                                                                percentual
                                                                            }
                                                                            sx={{
                                                                                height: 8,
                                                                                borderRadius:
                                                                                    10,
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                );
                                                            },
                                                        )}
                                                    </Box>
                                                )}
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

export default AnalisesTreinos;