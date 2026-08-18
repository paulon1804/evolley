import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import VisibilityIcon from "@mui/icons-material/Visibility";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import {

    Alert,

    Box,

    Button,

    Card,

    CardContent,

    Chip,

    Paper,

    Typography,

} from "@mui/material";

import type { Equipe } from "../../types/Equipe";

import type { Treino } from "../../types/Treino";

const STORAGE_TREINOS = "evolley-treinos";

const STORAGE_EQUIPES = "evolley-equipes";

function Treinos() {

    const navigate = useNavigate();

    const [treinos, setTreinos] = useState<Treino[]>([]);

    const [equipes, setEquipes] = useState<Equipe[]>([]);

    useEffect(() => {

        const treinosSalvos =

            localStorage.getItem(STORAGE_TREINOS);

        const equipesSalvas =

            localStorage.getItem(STORAGE_EQUIPES);

        if (treinosSalvos) {

            try {

                setTreinos(JSON.parse(treinosSalvos));

            } catch {

                localStorage.removeItem(STORAGE_TREINOS);

            }

        }

        if (equipesSalvas) {

            try {

                setEquipes(JSON.parse(equipesSalvas));

            } catch {

                localStorage.removeItem(STORAGE_EQUIPES);

            }

        }

    }, []);

    const resumo = useMemo(() => {

        const planejados = treinos.filter(

            (treino) => treino.status === "Planejado",

        ).length;

        const emAndamento = treinos.filter(

            (treino) => treino.status === "Em andamento",

        ).length;

        const finalizados = treinos.filter(

            (treino) => treino.status === "Finalizado",

        ).length;

        const minutosTreinados = treinos

            .filter(

                (treino) => treino.status === "Finalizado",

            )

            .reduce(

                (total, treino) =>

                    total +

                    treino.atividades.reduce(

                        (subtotal, atividade) =>

                            subtotal +

                            (atividade.duracaoMinutos ?? 0),

                        0,

                    ),

                0,

            );

        return {

            planejados,

            emAndamento,

            finalizados,

            minutosTreinados,

        };

    }, [treinos]);

    const treinosOrdenados = useMemo(

        () =>

            [...treinos].sort(

                (a, b) =>

                    new Date(b.data).getTime() -

                    new Date(a.data).getTime(),

            ),

        [treinos],

    );

    function nomeEquipe(equipeId: string) {

        return (

            equipes.find(

                (equipe) => equipe.id === equipeId,

            )?.nome ?? "Equipe não encontrada"

        );

    }

    function minutosPlanejados(treino: Treino) {

        return treino.atividades.reduce(

            (total, atividade) =>

                total +

                (atividade.duracaoMinutos ?? 0),

            0,

        );

    }

    function formatarData(data: string) {

        return new Intl.DateTimeFormat(

            "pt-BR",

            {

                dateStyle: "short",

            },

        ).format(new Date(`${data}T12:00:00`));

    }

    return (

        <>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: {
                        xs: "flex-start",
                        md: "center",
                    },
                    flexDirection: {
                        xs: "column",
                        md: "row",
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700 }}
                    >
                        Treinos
                    </Typography>

                    <Typography color="text.secondary">
                        Planeje, execute e acompanhe os treinamentos da equipe.
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        variant="outlined"
                        startIcon={<TrendingUpIcon />}
                        onClick={() =>
                            navigate("/treinos/analises")
                        }
                    >
                        Análises
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() =>
                            navigate("/treinos/novo")
                        }
                    >
                        Novo treino
                    </Button>
                </Box>
            </Box>

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
                <Card>

                    <CardContent>

                        <Typography color="text.secondary">

                            Planejados

                        </Typography>

                        <Typography

                            variant="h3"

                            sx={{ fontWeight: 700 }}

                        >

                            {resumo.planejados}

                        </Typography>

                    </CardContent>

                </Card>

                <Card>

                    <CardContent>

                        <Typography color="text.secondary">

                            Em andamento

                        </Typography>

                        <Typography

                            variant="h3"

                            sx={{ fontWeight: 700 }}

                        >

                            {resumo.emAndamento}

                        </Typography>

                    </CardContent>

                </Card>

                <Card>

                    <CardContent>

                        <Typography color="text.secondary">

                            Finalizados

                        </Typography>

                        <Typography

                            variant="h3"

                            sx={{ fontWeight: 700 }}

                        >

                            {resumo.finalizados}

                        </Typography>

                    </CardContent>

                </Card>

                <Card>

                    <CardContent>

                        <Typography color="text.secondary">

                            Minutos finalizados

                        </Typography>

                        <Typography

                            variant="h3"

                            sx={{ fontWeight: 700 }}

                        >

                            {resumo.minutosTreinados}

                        </Typography>

                    </CardContent>

                </Card>

            </Box>

            {

                treinosOrdenados.length === 0 ? (

                    <Paper

                        variant="outlined"

                        sx={{

                            p: 5,

                            textAlign: "center",

                        }}

                    >

                        <Typography

                            variant="h6"

                            sx={{ fontWeight: 700 }}

                        >

                            Nenhum treino cadastrado

                        </Typography>

                        <Typography

                            color="text.secondary"

                            sx={{ mt: 1, mb: 3 }}

                        >

                            Crie o primeiro planejamento de treino da equipe.

                        </Typography>

                        <Button

                            variant="contained"

                            startIcon={<AddIcon />}

                            onClick={() =>

                                navigate("/treinos/novo")

                            }

                        >

                            Criar treino

                        </Button>

                    </Paper>

                ) : (

                    <Box

                        sx={{

                            display: "grid",

                            gap: 2,

                        }}

                    >

                        {treinosOrdenados.map(

                            (treino) => (

                                <Paper

                                    key={treino.id}

                                    variant="outlined"

                                    sx={{ p: 3 }}

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

                                            <Box

                                                sx={{

                                                    display: "flex",

                                                    gap: 1,

                                                    flexWrap: "wrap",

                                                    alignItems: "center",

                                                    mb: 1,

                                                }}

                                            >

                                                <Typography

                                                    variant="h6"

                                                    sx={{

                                                        fontWeight: 700,

                                                    }}

                                                >

                                                    {nomeEquipe(

                                                        treino.equipeId,

                                                    )}

                                                </Typography>

                                                <Chip

                                                    size="small"

                                                    label={treino.status}

                                                    color={

                                                        treino.status ===

                                                            "Finalizado"

                                                            ? "success"

                                                            : treino.status ===

                                                                "Em andamento"

                                                                ? "warning"

                                                                : "info"

                                                    }

                                                />

                                            </Box>

                                            <Typography

                                                sx={{

                                                    fontWeight: 600,

                                                }}

                                            >

                                                {treino.objetivo}

                                            </Typography>

                                            <Typography

                                                variant="body2"

                                                color="text.secondary"

                                                sx={{ mt: 0.5 }}

                                            >

                                                {formatarData(treino.data)}

                                                {" · "}

                                                {

                                                    treino.atividades

                                                        .length

                                                }{" "}

                                                atividades

                                                {" · "}

                                                {minutosPlanejados(

                                                    treino,

                                                )}{" "}

                                                min

                                            </Typography>

                                            <Typography

                                                variant="body2"

                                                color="text.secondary"

                                            >

                                                {

                                                    treino.participantes.filter(

                                                        (participante) =>

                                                            participante.presente,

                                                    ).length

                                                }{" "}

                                                participantes

                                            </Typography>

                                        </Box>

                                        <Box

                                            sx={{

                                                display: "flex",

                                                gap: 1,

                                                flexWrap: "wrap",

                                            }}

                                        >

                                            {treino.status ===

                                                "Em andamento" && (

                                                    <Button

                                                        variant="contained"

                                                        startIcon={

                                                            <PlayArrowIcon />

                                                        }

                                                        onClick={() =>

                                                            navigate(

                                                                `/treinos/${treino.id}/centro`,
                                                            )
                                                        }
                                                    >
                                                        Continuar
                                                    </Button>
                                                )}
                                            {treino.status ===
                                                "Planejado" && (
                                                    <Button
                                                        variant="contained"
                                                        startIcon={
                                                            <PlayArrowIcon />
                                                        }
                                                        onClick={() =>
                                                            navigate(
                                                                `/treinos/${treino.id}/centro`,
                                                            )
                                                        }
                                                    >
                                                        Iniciar
                                                    </Button>
                                                )}
                                            {treino.status ===
                                                "Finalizado" && (

                                                    <Button
                                                        variant="outlined"
                                                        startIcon={
                                                            <VisibilityIcon />
                                                        }
                                                        onClick={() =>
                                                            navigate(
                                                                `/treinos/${treino.id}/resumo`,
                                                            )
                                                        }
                                                    >
                                                        Ver resumo
                                                    </Button>
                                                )}
                                        </Box>
                                    </Box>
                                </Paper>
                            ),
                        )}
                    </Box>
                )
            }
            {
                equipes.filter(

                    (equipe) => equipe.ativa,

                ).length === 0 && (

                    <Alert

                        severity="warning"

                        sx={{ mt: 3 }}

                    >
                        Não há equipe ativa cadastrada. Cadastre ou ative uma equipe antes de criar um treino.

                    </Alert>

                )

            }

        </>

    );

}

export default Treinos;