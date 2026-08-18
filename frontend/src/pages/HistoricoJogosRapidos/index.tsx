import {

    useEffect,

    useMemo,

    useState,

} from "react";

import {

    Box,

    Button,

    Chip,

    Dialog,

    DialogActions,

    DialogContent,

    DialogTitle,

    Divider,

    MenuItem,

    Paper,

    TextField,

    Typography,

} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import VisibilityIcon from "@mui/icons-material/Visibility";

import type {

    AcaoJogoRapido,

    EventoJogoRapido,

    JogoRapido,

    ResultadoJogoRapido,

} from "../../types/JogoRapido";

const STORAGE_HISTORICO =

    "evolley-jogos-rapidos-historico";

interface RegistroJogoRapido {

    jogo: JogoRapido;

    eventos: EventoJogoRapido[];

}

function descricaoResultado(

    acao: AcaoJogoRapido,

    resultado: ResultadoJogoRapido,

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

function HistoricoJogosRapidos() {

    const [

        historico,

        setHistorico,

    ] =

        useState<RegistroJogoRapido[]>([]);

    const [

        registroSelecionado,

        setRegistroSelecionado,

    ] =

        useState<RegistroJogoRapido | null>(

            null,

        );


    const [busca, setBusca] =
        useState("");

    const [filtroFormato, setFiltroFormato] =
        useState<"Todos" | "2x2" | "6x6">(
            "Todos",
        );
    useEffect(() => {

        const dadosSalvos =

            localStorage.getItem(

                STORAGE_HISTORICO,

            );

        if (!dadosSalvos) {

            return;

        }

        try {

            const dados:

                RegistroJogoRapido[] =

                JSON.parse(

                    dadosSalvos,

                );

            setHistorico(

                dados,

            );

        } catch {

            localStorage.removeItem(

                STORAGE_HISTORICO,

            );

        }

    }, []);

    function salvarHistorico(

        novaLista:

            RegistroJogoRapido[],

    ) {

        setHistorico(

            novaLista,

        );

        localStorage.setItem(

            STORAGE_HISTORICO,

            JSON.stringify(

                novaLista,

            ),

        );

    }

    function removerJogo(

        jogoId: string,

    ) {

        const confirmar =

            window.confirm(

                "Deseja realmente remover este jogo do histórico?",

            );

        if (!confirmar) {

            return;

        }

        const novaLista =

            historico.filter(

                (registro) =>

                    registro.jogo.id !==

                    jogoId,

            );

        salvarHistorico(

            novaLista,

        );

        if (

            registroSelecionado?.jogo.id ===

            jogoId

        ) {

            setRegistroSelecionado(

                null,

            );

        }

    }

    function formatarData(

        dataIso?: string,

    ) {

        if (!dataIso) {

            return "Data não informada";

        }

        return new Intl.DateTimeFormat(

            "pt-BR",

            {

                dateStyle: "short",

                timeStyle: "short",

            },

        ).format(

            new Date(dataIso),

        );

    }

    function vencedor(

        jogo: JogoRapido,

    ) {

        if (

            jogo.pontosTimeA >

            jogo.pontosTimeB

        ) {

            return jogo.nomeTimeA || "Time A";

        }

        if (

            jogo.pontosTimeB >

            jogo.pontosTimeA

        ) {

            return jogo.nomeTimeB || "Time B";

        }

        return "Empate";

    }

    const historicoOrdenado =

        useMemo(

            () =>

                [...historico].sort(

                    (a, b) =>

                        new Date(

                            b.jogo.finalizadoEm ??

                            b.jogo.iniciadoEm,

                        ).getTime() -

                        new Date(

                            a.jogo.finalizadoEm ??

                            a.jogo.iniciadoEm,

                        ).getTime(),

                ),

            [historico],

        );

    const resumoGeral = useMemo(() => {
        const totalJogos =
            historico.length;

        const totalAcoes =
            historico.reduce(
                (total, registro) =>
                    total +
                    registro.eventos.length,
                0,
            );

        const vitoriasTimeA =
            historico.filter(
                (registro) =>
                    registro.jogo.pontosTimeA >
                    registro.jogo.pontosTimeB,
            ).length;

        const vitoriasTimeB =
            historico.filter(
                (registro) =>
                    registro.jogo.pontosTimeB >
                    registro.jogo.pontosTimeA,
            ).length;

        return {
            totalJogos,
            totalAcoes,
            vitoriasTimeA,
            vitoriasTimeB,
        };
    }, [historico]);

    const historicoFiltrado = useMemo(() => {
        const termo =
            busca.trim().toLowerCase();

        return historicoOrdenado.filter(
            (registro) => {
                const formatoCombina =
                    filtroFormato === "Todos" ||
                    registro.jogo.formato ===
                    filtroFormato;

                if (!formatoCombina) {
                    return false;
                }

                if (!termo) {
                    return true;
                }

                const nomesTimes = [
                    registro.jogo.nomeTimeA ||
                    "Time A",
                    registro.jogo.nomeTimeB ||
                    "Time B",
                ];

                const nomesJogadores =
                    registro.jogo.jogadores.map(
                        (jogador) =>
                            jogador.nome ||
                            `${jogador.time}${jogador.numero}`,
                    );

                return [
                    ...nomesTimes,
                    ...nomesJogadores,
                    registro.jogo.formato,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(termo);
            },
        );
    }, [
        historicoOrdenado,
        busca,
        filtroFormato,
    ]);

    function resumoJogador(

        registro:

            RegistroJogoRapido,

        jogadorId: string,

    ) {

        const eventosJogador =

            registro.eventos.filter(

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

                if (

                    !porAcao.has(

                        evento.acao,

                    )

                ) {

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

    return (

        <>

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

                    Histórico de Jogos Rápidos

                </Typography>

                <Typography

                    color="text.secondary"

                >

                    Consulte os jogos rápidos salvos e suas estatísticas.

                </Typography>

            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(4, 1fr)",
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Jogos salvos
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700 }}
                    >
                        {resumoGeral.totalJogos}
                    </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Ações registradas
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700 }}
                    >
                        {resumoGeral.totalAcoes}
                    </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Vitórias Time A
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700 }}
                    >
                        {resumoGeral.vitoriasTimeA}
                    </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Vitórias Time B
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700 }}
                    >
                        {resumoGeral.vitoriasTimeB}
                    </Typography>
                </Paper>
            </Box>

            <Paper
                variant="outlined"
                sx={{
                    p: 2,
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
                        label="Buscar time ou jogador"
                        value={busca}
                        onChange={(evento) =>
                            setBusca(
                                evento.target.value,
                            )
                        }
                        fullWidth
                    />

                    <TextField
                        select
                        label="Formato"
                        value={filtroFormato}
                        onChange={(evento) =>
                            setFiltroFormato(
                                evento.target.value as
                                | "Todos"
                                | "2x2"
                                | "6x6",
                            )
                        }
                        fullWidth
                    >
                        <MenuItem value="Todos">
                            Todos
                        </MenuItem>

                        <MenuItem value="2x2">
                            2x2
                        </MenuItem>

                        <MenuItem value="6x6">
                            6x6
                        </MenuItem>
                    </TextField>
                </Box>
            </Paper>

            {historico.length ===

                0 ? (

                <Paper

                    variant="outlined"

                    sx={{

                        p: 5,

                        textAlign:

                            "center",

                    }}

                >

                    <Typography

                        variant="h6"

                        sx={{

                            fontWeight: 700,

                        }}

                    >

                        Nenhum jogo salvo

                    </Typography>

                    <Typography

                        color="text.secondary"

                        sx={{

                            mt: 1,

                        }}

                    >

                        Finalize um Jogo Rápido e escolha Salvar partida.

                    </Typography>

                </Paper>

            ) : (

                <Box

                    sx={{

                        display: "grid",

                        gap: 2,

                    }}

                >

                    {historicoFiltrado.map(

                        (

                            registro,

                        ) => {

                            const {

                                jogo,

                                eventos,

                            } =

                                registro;

                            return (

                                <Paper

                                    key={

                                        jogo.id

                                    }

                                    variant="outlined"

                                    sx={{

                                        p: 3,

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

                                            flexDirection:

                                            {

                                                xs: "column",

                                                md: "row",

                                            },

                                            gap: 2,

                                        }}

                                    >

                                        <Box>

                                            <Box

                                                sx={{

                                                    display:

                                                        "flex",

                                                    gap: 1,

                                                    flexWrap:

                                                        "wrap",

                                                    alignItems:

                                                        "center",

                                                    mb: 1,

                                                }}

                                            >

                                                <Typography

                                                    variant="h6"

                                                    sx={{

                                                        fontWeight:

                                                            700,

                                                    }}

                                                >

                                                    {jogo.nomeTimeA || "Time A"}{" "}

                                                    {

                                                        jogo.pontosTimeA

                                                    }{" "}

                                                    x{" "}

                                                    {

                                                        jogo.pontosTimeB

                                                    }{" "}

                                                    {jogo.nomeTimeB || "Time B"}

                                                </Typography>

                                                <Chip

                                                    size="small"

                                                    label={

                                                        jogo.formato

                                                    }

                                                />

                                                <Chip

                                                    size="small"

                                                    variant="outlined"

                                                    label={vencedor(

                                                        jogo,

                                                    )}

                                                />

                                            </Box>

                                            <Typography

                                                variant="body2"

                                                color="text.secondary"

                                            >

                                                {formatarData(

                                                    jogo.finalizadoEm ??

                                                    jogo.iniciadoEm,

                                                )}

                                            </Typography>

                                            <Typography

                                                variant="body2"

                                                color="text.secondary"

                                            >

                                                {

                                                    eventos.length

                                                }{" "}

                                                ações registradas

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

                                            <Button

                                                variant="contained"

                                                startIcon={

                                                    <VisibilityIcon />

                                                }

                                                onClick={() =>

                                                    setRegistroSelecionado(

                                                        registro,

                                                    )

                                                }

                                            >

                                                Ver resumo

                                            </Button>

                                            <Button

                                                variant="outlined"

                                                color="error"

                                                startIcon={

                                                    <DeleteIcon />

                                                }

                                                onClick={() =>

                                                    removerJogo(

                                                        jogo.id,

                                                    )

                                                }

                                            >

                                                Remover

                                            </Button>

                                        </Box>

                                    </Box>

                                </Paper>

                            );

                        },

                    )}

                </Box>

            )}

            <Dialog

                open={

                    Boolean(

                        registroSelecionado,

                    )

                }

                onClose={() =>

                    setRegistroSelecionado(

                        null,

                    )

                }

                fullWidth

                maxWidth="md"

            >

                {registroSelecionado && (

                    <>

                        <DialogTitle>

                            Resumo do Jogo

                        </DialogTitle>

                        <DialogContent>

                            <Box

                                sx={{

                                    display:

                                        "grid",

                                    gridTemplateColumns:

                                        "1fr auto 1fr",

                                    alignItems:

                                        "center",

                                    gap: 2,

                                    mb: 3,

                                }}

                            >

                                <Box

                                    sx={{

                                        textAlign:

                                            "center",

                                    }}

                                >

                                    <Typography

                                        sx={{

                                            fontWeight:

                                                700,

                                        }}

                                    >

                                        {registroSelecionado.jogo.nomeTimeA || "Time A"}

                                    </Typography>

                                    <Typography

                                        variant="h2"

                                        sx={{

                                            fontWeight:

                                                800,

                                        }}

                                    >

                                        {

                                            registroSelecionado

                                                .jogo

                                                .pontosTimeA

                                        }

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

                                        textAlign:

                                            "center",

                                    }}

                                >

                                    <Typography

                                        sx={{

                                            fontWeight:

                                                700,

                                        }}

                                    >

                                        {registroSelecionado.jogo.nomeTimeB || "Time B"}

                                    </Typography>

                                    <Typography

                                        variant="h2"

                                        sx={{

                                            fontWeight:

                                                800,

                                        }}

                                    >

                                        {

                                            registroSelecionado

                                                .jogo

                                                .pontosTimeB

                                        }

                                    </Typography>

                                </Box>

                            </Box>

                            <Divider

                                sx={{

                                    mb: 3,

                                }}

                            />

                            <Typography

                                variant="h6"

                                sx={{

                                    fontWeight:

                                        700,

                                    mb: 2,

                                }}

                            >

                                Estatísticas por jogador

                            </Typography>

                            <Box

                                sx={{

                                    display:

                                        "grid",

                                    gridTemplateColumns:

                                    {

                                        xs: "1fr",

                                        md: "repeat(2, 1fr)",

                                    },

                                    gap: 2,

                                }}

                            >

                                {registroSelecionado.jogo.jogadores.map(

                                    (

                                        jogador,

                                    ) => {

                                        const resumo =

                                            resumoJogador(

                                                registroSelecionado,

                                                jogador.id,

                                            );

                                        return (

                                            <Paper

                                                key={

                                                    jogador.id

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

                                                        alignItems:

                                                            "center",

                                                        mb: 1,

                                                    }}

                                                >

                                                    <Typography

                                                        sx={{

                                                            fontWeight:

                                                                700,

                                                        }}

                                                    >

                                                        {

                                                            jogador.time

                                                        }

                                                        {

                                                            jogador.numero

                                                        }

                                                    </Typography>

                                                    <Chip

                                                        size="small"

                                                        label={
                                                            jogador.time === "A"
                                                                ? registroSelecionado.jogo.nomeTimeA || "Time A"
                                                                : registroSelecionado.jogo.nomeTimeB || "Time B"
                                                        }

                                                    />

                                                </Box>

                                                {resumo.size ===

                                                    0 ? (

                                                    <Typography

                                                        variant="body2"

                                                        color="text.secondary"

                                                    >

                                                        Nenhuma ação registrada.

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

                                                                acao,

                                                                resultados,

                                                            ]) => (

                                                                <Box

                                                                    key={

                                                                        acao

                                                                    }

                                                                >

                                                                    <Typography

                                                                        sx={{

                                                                            fontWeight:

                                                                                600,

                                                                        }}

                                                                    >

                                                                        {

                                                                            acao

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

                                                                                        acao,

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

                            <Divider

                                sx={{

                                    my: 3,

                                }}

                            />

                            <Typography

                                variant="h6"

                                sx={{

                                    fontWeight:

                                        700,

                                    mb: 2,

                                }}

                            >

                                Últimas ações

                            </Typography>

                            {registroSelecionado.eventos.length ===

                                0 ? (

                                <Typography

                                    color="text.secondary"

                                >

                                    Nenhuma ação registrada.

                                </Typography>

                            ) : (

                                <Box

                                    sx={{

                                        display:

                                            "grid",

                                        gap: 1,

                                    }}

                                >

                                    {[

                                        ...registroSelecionado.eventos,

                                    ]

                                        .reverse()

                                        .slice(

                                            0,

                                            20,

                                        )

                                        .map(

                                            (

                                                evento,

                                            ) => {

                                                const jogador =

                                                    registroSelecionado.jogo.jogadores.find(

                                                        (

                                                            item,

                                                        ) =>

                                                            item.id ===

                                                            evento.jogadorId,

                                                    );

                                                return (

                                                    <Box

                                                        key={

                                                            evento.id

                                                        }

                                                        sx={{

                                                            display:

                                                                "grid",

                                                            gridTemplateColumns:

                                                            {

                                                                xs: "1fr",

                                                                sm: "80px 1fr 1fr 100px",

                                                            },

                                                            gap: 1,

                                                            alignItems:

                                                                "center",

                                                            border:

                                                                "1px solid",

                                                            borderColor:

                                                                "divider",

                                                            borderRadius:

                                                                1,

                                                            p: 1.5,

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

                                                        <Typography

                                                            sx={{

                                                                fontWeight:

                                                                    600,

                                                            }}

                                                        >

                                                            {

                                                                evento.acao

                                                            }

                                                        </Typography>

                                                        <Typography>

                                                            {descricaoResultado(

                                                                evento.acao,

                                                                evento.resultado,

                                                            )}

                                                        </Typography>

                                                        <Typography

                                                            sx={{

                                                                fontWeight:

                                                                    700,

                                                                textAlign:

                                                                {

                                                                    xs: "left",

                                                                    sm: "right",

                                                                },

                                                            }}

                                                        >

                                                            {

                                                                evento.pontosTimeADepois

                                                            }{" "}

                                                            x{" "}

                                                            {

                                                                evento.pontosTimeBDepois

                                                            }

                                                        </Typography>

                                                    </Box>

                                                );

                                            },

                                        )}

                                </Box>

                            )}

                        </DialogContent>

                        <DialogActions>

                            <Button

                                onClick={() =>

                                    setRegistroSelecionado(

                                        null,

                                    )

                                }

                            >

                                Fechar

                            </Button>

                        </DialogActions>

                    </>

                )}

            </Dialog>

        </>

    );

}

export default HistoricoJogosRapidos;