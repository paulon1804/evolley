import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    IconButton,
    MenuItem,
    Paper,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import type { Atleta } from "../../types/Atleta";
import type { Equipe } from "../../types/Equipe";

import type {
    AtividadeTreino,
    FundamentoTreino,
    IntensidadeAtividade,
    Treino,
} from "../../types/Treino";

const STORAGE_TREINOS = "evolley-treinos";
const STORAGE_EQUIPES = "evolley-equipes";
const STORAGE_ATLETAS = "evolley-atletas";

const fundamentos: FundamentoTreino[] = [
    "Saque",
    "Recepção",
    "Levantamento",
    "Ataque",
    "Bloqueio",
    "Defesa",
    "Físico",
    "Tático",
];

const intensidades: IntensidadeAtividade[] = [
    "Leve",
    "Moderada",
    "Alta",
    "Máxima",
];

const atividadeInicial = {
    nome: "",
    fundamento: "Recepção" as FundamentoTreino,
    intensidade: "Moderada" as IntensidadeAtividade,
    duracaoMinutos: "20",
    observacoes: "",
};

function NovoTreino() {
    const navigate = useNavigate();

    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [atletas, setAtletas] = useState<Atleta[]>([]);
    const [treinos, setTreinos] = useState<Treino[]>([]);

    const [equipeId, setEquipeId] = useState("");
    const [data, setData] = useState(
        new Date().toISOString().slice(0, 10),
    );
    const [objetivo, setObjetivo] = useState("");
    const [observacoes, setObservacoes] = useState("");

    const [participantesSelecionados, setParticipantesSelecionados] =
        useState<string[]>([]);

    const [atividades, setAtividades] =
        useState<AtividadeTreino[]>([]);

    const [atividade, setAtividade] =
        useState(atividadeInicial);

    const [erro, setErro] = useState("");

    useEffect(() => {
        const equipesSalvas =
            localStorage.getItem(STORAGE_EQUIPES);

        const atletasSalvos =
            localStorage.getItem(STORAGE_ATLETAS);

        const treinosSalvos =
            localStorage.getItem(STORAGE_TREINOS);

        if (equipesSalvas) {
            try {
                setEquipes(
                    JSON.parse(equipesSalvas),
                );
            } catch {
                localStorage.removeItem(
                    STORAGE_EQUIPES,
                );
            }
        }

        if (atletasSalvos) {
            try {
                setAtletas(
                    JSON.parse(atletasSalvos),
                );
            } catch {
                localStorage.removeItem(
                    STORAGE_ATLETAS,
                );
            }
        }

        if (treinosSalvos) {
            try {
                setTreinos(
                    JSON.parse(treinosSalvos),
                );
            } catch {
                localStorage.removeItem(
                    STORAGE_TREINOS,
                );
            }
        }
    }, []);

    const equipesAtivas = useMemo(
        () =>
            equipes.filter(
                (equipe) => equipe.ativa,
            ),
        [equipes],
    );

    const atletasDaEquipe = useMemo(
        () =>
            atletas.filter(
                (atleta) =>
                    atleta.equipeId === equipeId &&
                    atleta.ativo,
            ),
        [atletas, equipeId],
    );

    const minutosTotais = useMemo(
        () =>
            atividades.reduce(
                (total, item) =>
                    total +
                    (item.duracaoMinutos ?? 0),
                0,
            ),
        [atividades],
    );

    function selecionarEquipe(
        novaEquipeId: string,
    ) {
        setEquipeId(novaEquipeId);

        const idsAtletas =
            atletas
                .filter(
                    (atleta) =>
                        atleta.equipeId ===
                            novaEquipeId &&
                        atleta.ativo,
                )
                .map(
                    (atleta) => atleta.id,
                );

        setParticipantesSelecionados(
            idsAtletas,
        );

        setErro("");
    }

    function alternarParticipante(
        atletaId: string,
    ) {
        setParticipantesSelecionados(
            (listaAtual) =>
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
                      ],
        );
    }

    function adicionarAtividade() {
        const nome =
            atividade.nome.trim();

        const duracao =
            Number(
                atividade.duracaoMinutos,
            );

        if (!nome) {
            setErro(
                "Informe o nome da atividade.",
            );
            return;
        }

        if (
            Number.isNaN(duracao) ||
            duracao <= 0
        ) {
            setErro(
                "Informe uma duração válida para a atividade.",
            );
            return;
        }

        const novaAtividade:
            AtividadeTreino = {
            id: crypto.randomUUID(),
            nome,
            fundamento:
                atividade.fundamento,
            intensidade:
                atividade.intensidade,
            duracaoMinutos:
                duracao,
            observacoes:
                atividade.observacoes.trim() ||
                undefined,
        };

        setAtividades(
            (listaAtual) => [
                ...listaAtual,
                novaAtividade,
            ],
        );

        setAtividade(
            atividadeInicial,
        );

        setErro("");
    }

    function removerAtividade(
        atividadeId: string,
    ) {
        setAtividades(
            (listaAtual) =>
                listaAtual.filter(
                    (item) =>
                        item.id !==
                        atividadeId,
                ),
        );
    }

    function salvarTreino(
        status:
            | "Planejado"
            | "Em andamento",
    ) {
        if (!equipeId) {
            setErro(
                "Selecione uma equipe.",
            );
            return;
        }

        if (!data) {
            setErro(
                "Informe a data do treino.",
            );
            return;
        }

        if (!objetivo.trim()) {
            setErro(
                "Informe o objetivo do treino.",
            );
            return;
        }

        if (
            participantesSelecionados.length ===
            0
        ) {
            setErro(
                "Selecione pelo menos um participante.",
            );
            return;
        }

        if (atividades.length === 0) {
            setErro(
                "Adicione pelo menos uma atividade.",
            );
            return;
        }

        const agora =
            new Date().toISOString();

        const novoTreino: Treino = {
            id: crypto.randomUUID(),
            equipeId,
            data,
            objetivo:
                objetivo.trim(),
            observacoes:
                observacoes.trim(),
            status,
            participantes:
                participantesSelecionados.map(
                    (atletaId) => ({
                        atletaId,
                        presente: true,
                    }),
                ),
            atividades,
            createdAt: agora,
            updatedAt: agora,
        };

        const novaLista = [
            ...treinos,
            novoTreino,
        ];

        localStorage.setItem(
            STORAGE_TREINOS,
            JSON.stringify(novaLista),
        );

        if (
            status === "Em andamento"
        ) {
            navigate(
                `/treinos/${novoTreino.id}/centro`,
            );
            return;
        }

        navigate("/treinos");
    }

    return (
        <>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() =>
                    navigate("/treinos")
                }
                sx={{ mb: 2 }}
            >
                Voltar para treinos
            </Button>

            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="h4"
                    sx={{ fontWeight: 700 }}
                >
                    Novo Treino
                </Typography>

                <Typography color="text.secondary">
                    Planeje participantes, atividades, intensidade e duração.
                </Typography>
            </Box>

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
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        mb: 2,
                    }}
                >
                    Informações do treino
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "1fr 1fr",
                        },
                        gap: 2,
                    }}
                >
                    <TextField
                        select
                        label="Equipe"
                        value={equipeId}
                        onChange={(evento) =>
                            selecionarEquipe(
                                evento.target.value,
                            )
                        }
                        fullWidth
                        required
                    >
                        {equipesAtivas.map(
                            (equipe) => (
                                <MenuItem
                                    key={equipe.id}
                                    value={equipe.id}
                                >
                                    {equipe.nome}
                                    {" · "}
                                    {equipe.categoria}
                                </MenuItem>
                            ),
                        )}
                    </TextField>

                    <TextField
                        label="Data"
                        type="date"
                        value={data}
                        onChange={(evento) =>
                            setData(
                                evento.target.value,
                            )
                        }
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Objetivo"
                        value={objetivo}
                        onChange={(evento) =>
                            setObjetivo(
                                evento.target.value,
                            )
                        }
                        placeholder="Ex.: recepção e transição ofensiva"
                        fullWidth
                        required
                        sx={{
                            gridColumn: {
                                xs: "1",
                                md: "1 / -1",
                            },
                        }}
                    />

                    <TextField
                        label="Observações gerais"
                        value={observacoes}
                        onChange={(evento) =>
                            setObservacoes(
                                evento.target.value,
                            )
                        }
                        multiline
                        minRows={3}
                        fullWidth
                        sx={{
                            gridColumn: {
                                xs: "1",
                                md: "1 / -1",
                            },
                        }}
                    />
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
                        mb: 1,
                    }}
                >
                    Participantes
                </Typography>

                <Typography
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    Ao selecionar a equipe, os atletas ativos são marcados automaticamente.
                </Typography>

                {!equipeId ? (
                    <Alert severity="info">
                        Selecione uma equipe para carregar os atletas.
                    </Alert>
                ) : atletasDaEquipe.length ===
                  0 ? (
                    <Alert severity="warning">
                        Esta equipe não possui atletas ativos.
                    </Alert>
                ) : (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                                md: "repeat(3, 1fr)",
                            },
                            gap: 1,
                        }}
                    >
                        {atletasDaEquipe.map(
                            (atleta) => (
                                <Paper
                                    key={atleta.id}
                                    variant="outlined"
                                    sx={{ p: 1.5 }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={
                                                    participantesSelecionados.includes(
                                                        atleta.id,
                                                    )
                                                }
                                                onChange={() =>
                                                    alternarParticipante(
                                                        atleta.id,
                                                    )
                                                }
                                            />
                                        }
                                        label={`#${atleta.numero} · ${atleta.nome} · ${atleta.posicao}`}
                                    />
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
                    Nova atividade
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "2fr 1fr 1fr 1fr",
                        },
                        gap: 2,
                    }}
                >
                    <TextField
                        label="Nome da atividade"
                        value={atividade.nome}
                        onChange={(evento) =>
                            setAtividade({
                                ...atividade,
                                nome:
                                    evento.target.value,
                            })
                        }
                        placeholder="Ex.: recepção direcionada"
                        fullWidth
                    />

                    <TextField
                        select
                        label="Fundamento"
                        value={
                            atividade.fundamento
                        }
                        onChange={(evento) =>
                            setAtividade({
                                ...atividade,
                                fundamento:
                                    evento.target
                                        .value as FundamentoTreino,
                            })
                        }
                        fullWidth
                    >
                        {fundamentos.map(
                            (fundamento) => (
                                <MenuItem
                                    key={fundamento}
                                    value={fundamento}
                                >
                                    {fundamento}
                                </MenuItem>
                            ),
                        )}
                    </TextField>

                    <TextField
                        select
                        label="Intensidade"
                        value={
                            atividade.intensidade
                        }
                        onChange={(evento) =>
                            setAtividade({
                                ...atividade,
                                intensidade:
                                    evento.target
                                        .value as IntensidadeAtividade,
                            })
                        }
                        fullWidth
                    >
                        {intensidades.map(
                            (intensidade) => (
                                <MenuItem
                                    key={intensidade}
                                    value={intensidade}
                                >
                                    {intensidade}
                                </MenuItem>
                            ),
                        )}
                    </TextField>

                    <TextField
                        label="Duração (min)"
                        type="number"
                        value={
                            atividade.duracaoMinutos
                        }
                        onChange={(evento) =>
                            setAtividade({
                                ...atividade,
                                duracaoMinutos:
                                    evento.target.value,
                            })
                        }
                        slotProps={{
                            htmlInput: {
                                min: 1,
                            },
                        }}
                        fullWidth
                    />

                    <TextField
                        label="Observações da atividade"
                        value={
                            atividade.observacoes
                        }
                        onChange={(evento) =>
                            setAtividade({
                                ...atividade,
                                observacoes:
                                    evento.target.value,
                            })
                        }
                        multiline
                        minRows={2}
                        fullWidth
                        sx={{
                            gridColumn: {
                                xs: "1",
                                md: "1 / -1",
                            },
                        }}
                    />
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={adicionarAtividade}
                    sx={{ mt: 2 }}
                >
                    Adicionar atividade
                </Button>
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
                        gap: 2,
                        flexWrap: "wrap",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 700 }}
                    >
                        Atividades planejadas
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        {atividades.length} atividades
                        {" · "}
                        {minutosTotais} min
                    </Typography>
                </Box>

                {atividades.length === 0 ? (
                    <Typography color="text.secondary">
                        Nenhuma atividade adicionada.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: "grid",
                            gap: 1.5,
                        }}
                    >
                        {atividades.map(
                            (
                                item,
                                indice,
                            ) => (
                                <Paper
                                    key={item.id}
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr",
                                            md: "1fr auto",
                                        },
                                        gap: 2,
                                        alignItems: "center",
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                            }}
                                        >
                                            {indice + 1}.{" "}
                                            {item.nome}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {item.fundamento}
                                            {" · "}
                                            {item.intensidade}
                                            {" · "}
                                            {item.duracaoMinutos} min
                                        </Typography>

                                        {item.observacoes && (
                                            <Typography
                                                variant="body2"
                                                sx={{ mt: 0.5 }}
                                            >
                                                {item.observacoes}
                                            </Typography>
                                        )}
                                    </Box>

                                    <Tooltip title="Remover atividade">
                                        <IconButton
                                            color="error"
                                            onClick={() =>
                                                removerAtividade(
                                                    item.id,
                                                )
                                            }
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Paper>
                            ),
                        )}
                    </Box>
                )}
            </Paper>

            <Box
                sx={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={() =>
                        salvarTreino(
                            "Planejado",
                        )
                    }
                >
                    Salvar planejamento
                </Button>

                <Button
                    variant="contained"
                    color="success"
                    startIcon={<PlayArrowIcon />}
                    onClick={() =>
                        salvarTreino(
                            "Em andamento",
                        )
                    }
                >
                    Iniciar treino
                </Button>
            </Box>
        </>
    );
}

export default NovoTreino;
