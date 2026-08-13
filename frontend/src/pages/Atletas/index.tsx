import { useEffect, useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    MenuItem,
    Paper,
    Switch,
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

import type {
    Atleta,
    BracoDominante,
    PosicaoAtleta,
} from "../../types/Atleta";

import type { Equipe } from "../../types/Equipe";

const posicoes: PosicaoAtleta[] = [
    "Levantador",
    "Oposto",
    "Ponteiro",
    "Central",
    "Líbero",
];

const bracosDominantes: BracoDominante[] = [
    "Direito",
    "Esquerdo",
    "Ambidestro",
];

const formularioInicial = {
    nome: "",
    numero: "",
    posicao: "" as PosicaoAtleta | "",
    dataNascimento: "",
    altura: "",
    peso: "",
    bracoDominante: "Direito" as BracoDominante,
    equipeId: "",
    ativo: true,
    observacoes: "",
};

function Atletas() {
    const [atletas, setAtletas] = useState<Atleta[]>([]);
    const [equipes, setEquipes] = useState<Equipe[]>([]);

    const [modalAberto, setModalAberto] = useState(false);
    const [atletaEmEdicao, setAtletaEmEdicao] =
        useState<Atleta | null>(null);

    const [busca, setBusca] = useState("");
    const [mensagemErro, setMensagemErro] = useState("");

    const [formulario, setFormulario] =
        useState(formularioInicial);

    useEffect(() => {
        const atletasSalvos =
            localStorage.getItem("evolley-atletas");

        const equipesSalvas =
            localStorage.getItem("evolley-equipes");

        if (atletasSalvos) {
            try {
                const dados: Atleta[] =
                    JSON.parse(atletasSalvos);

                setAtletas(dados);
            } catch {
                localStorage.removeItem("evolley-atletas");
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

    const atletasFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        if (!termo) {
            return atletas;
        }

        return atletas.filter((atleta) => {
            const nomeEquipe = buscarNomeEquipe(
                atleta.equipeId,
            ).toLowerCase();

            return [
                atleta.nome,
                atleta.numero.toString(),
                atleta.posicao,
                nomeEquipe,
            ].some((campo) =>
                campo.toLowerCase().includes(termo),
            );
        });
    }, [atletas, busca, equipes]);

    const formularioValido =
        formulario.nome.trim().length > 0 &&
        formulario.numero.length > 0 &&
        formulario.posicao.length > 0 &&
        formulario.equipeId.length > 0;

    function salvarAtletas(novaLista: Atleta[]) {
        setAtletas(novaLista);

        localStorage.setItem(
            "evolley-atletas",
            JSON.stringify(novaLista),
        );
    }

    function abrirModal(atleta?: Atleta) {
        setMensagemErro("");

        if (atleta) {
            setAtletaEmEdicao(atleta);

            setFormulario({
                nome: atleta.nome,
                numero: atleta.numero.toString(),
                posicao: atleta.posicao,
                dataNascimento: atleta.dataNascimento,
                altura: atleta.altura?.toString() ?? "",
                peso: atleta.peso?.toString() ?? "",
                bracoDominante: atleta.bracoDominante,
                equipeId: atleta.equipeId,
                ativo: atleta.ativo,
                observacoes: atleta.observacoes ?? "",
            });
        } else {
            setAtletaEmEdicao(null);
            setFormulario(formularioInicial);
        }

        setModalAberto(true);
    }

    function fecharModal() {
        setModalAberto(false);
        setAtletaEmEdicao(null);
        setFormulario(formularioInicial);
    }

    function salvarAtleta() {
        const nome = formulario.nome.trim();
        const numero = Number(formulario.numero);

        if (
            !nome ||
            !formulario.numero ||
            !formulario.posicao ||
            !formulario.equipeId
        ) {
            return;
        }

        if (
            Number.isNaN(numero) ||
            numero < 0 ||
            numero > 99
        ) {
            setMensagemErro(
                "O número do atleta deve estar entre 0 e 99.",
            );

            return;
        }

        const altura = formulario.altura
            ? Number(formulario.altura)
            : undefined;

        const peso = formulario.peso
            ? Number(formulario.peso)
            : undefined;

        if (atletaEmEdicao) {
            const listaAtualizada = atletas.map((atleta) =>
                atleta.id === atletaEmEdicao.id
                    ? {
                        ...atleta,
                        nome,
                        numero,
                        posicao: formulario.posicao as PosicaoAtleta,
                        dataNascimento: formulario.dataNascimento,
                        altura,
                        peso,
                        bracoDominante: formulario.bracoDominante,
                        equipeId: formulario.equipeId,
                        ativo: formulario.ativo,
                        observacoes:
                            formulario.observacoes.trim() || undefined,
                    }
                    : atleta,
            );

            salvarAtletas(listaAtualizada);
        } else {
            const novoAtleta: Atleta = {
                id: crypto.randomUUID(),
                nome,
                numero,
                posicao: formulario.posicao as PosicaoAtleta,
                dataNascimento: formulario.dataNascimento,
                altura,
                peso,
                bracoDominante: formulario.bracoDominante,
                equipeId: formulario.equipeId,
                ativo: formulario.ativo,
                observacoes:
                    formulario.observacoes.trim() || undefined,
            };

            salvarAtletas([...atletas, novoAtleta]);
        }

        fecharModal();
    }

    function removerAtleta(id: string) {
        const novaLista = atletas.filter(
            (atleta) => atleta.id !== id,
        );

        salvarAtletas(novaLista);
    }

    return (
        <>
            <PageHeader
                titulo="Atletas"
                subtitulo="Cadastre e gerencie os atletas do Evolley."
                textoBotao="Novo atleta"
                iconeBotao={<AddIcon />}
                aoClicarBotao={() => abrirModal()}
                botaoDesabilitado={equipesAtivas.length === 0}
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

            {equipes.length === 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Cadastre uma equipe antes de adicionar atletas.
                </Alert>
            )}

            {atletas.length > 0 && (
                <TextField
                    label="Pesquisar atletas"
                    placeholder="Nome, número, posição ou equipe"
                    value={busca}
                    onChange={(evento) =>
                        setBusca(evento.target.value)
                    }
                    fullWidth
                    sx={{
                        mb: 3,
                        maxWidth: 500,
                    }}
                />
            )}

            {atletas.length === 0 ? (
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
                        Nenhum atleta cadastrado
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 1, mb: 3 }}
                    >
                        Cadastre atletas para iniciar o acompanhamento
                        de jogos, treinos e desempenho.
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => abrirModal()}
                        disabled={equipesAtivas.length === 0}
                    >
                        Cadastrar atleta
                    </Button>
                </Paper>
            ) : atletasFiltrados.length === 0 ? (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 4,
                        textAlign: "center",
                    }}
                >
                    <Typography sx={{ fontWeight: 600 }}>
                        Nenhum atleta encontrado
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Tente pesquisar por outro nome, número,
                        posição ou equipe.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Número</TableCell>
                                <TableCell>Nome</TableCell>
                                <TableCell>Posição</TableCell>
                                <TableCell>Equipe</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">
                                    Ações
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {atletasFiltrados.map((atleta) => (
                                <TableRow key={atleta.id} hover>
                                    <TableCell>{atleta.numero}</TableCell>

                                    <TableCell sx={{ fontWeight: 600 }}>
                                        {atleta.nome}
                                    </TableCell>

                                    <TableCell>
                                        {atleta.posicao}
                                    </TableCell>

                                    <TableCell>
                                        {buscarNomeEquipe(atleta.equipeId)}
                                    </TableCell>

                                    <TableCell>
                                        {atleta.ativo ? "Ativo" : "Inativo"}
                                    </TableCell>

                                    <TableCell align="right">
                                        <Tooltip title="Editar atleta">
                                            <IconButton
                                                color="primary"
                                                onClick={() => abrirModal(atleta)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Remover atleta">
                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    removerAtleta(atleta.id)
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
                    {atletaEmEdicao
                        ? "Editar atleta"
                        : "Novo atleta"}
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
                            label="Nome completo"
                            value={formulario.nome}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    nome: evento.target.value,
                                })
                            }
                            required
                            autoFocus
                            fullWidth
                        />

                        <TextField
                            label="Número"
                            type="number"
                            value={formulario.numero}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    numero: evento.target.value,
                                })
                            }
                            slotProps={{
                                htmlInput: {
                                    min: 0,
                                    max: 99,
                                },
                            }}
                            required
                            fullWidth
                        />

                        <TextField
                            select
                            label="Posição"
                            value={formulario.posicao}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    posicao:
                                        evento.target.value as PosicaoAtleta,
                                })
                            }
                            required
                            fullWidth
                        >
                            {posicoes.map((posicao) => (
                                <MenuItem
                                    key={posicao}
                                    value={posicao}
                                >
                                    {posicao}
                                </MenuItem>
                            ))}
                        </TextField>

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
                                        equipe.id !== formulario.equipeId
                                    }
                                >
                                    {equipe.nome} · {equipe.categoria}
                                    {!equipe.ativa ? " · Inativa" : ""}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Data de nascimento"
                            type="date"
                            value={formulario.dataNascimento}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    dataNascimento: evento.target.value,
                                })
                            }
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            fullWidth
                        />

                        <TextField
                            select
                            label="Braço dominante"
                            value={formulario.bracoDominante}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    bracoDominante:
                                        evento.target.value as BracoDominante,
                                })
                            }
                            fullWidth
                        >
                            {bracosDominantes.map((braco) => (
                                <MenuItem
                                    key={braco}
                                    value={braco}
                                >
                                    {braco}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Altura"
                            type="number"
                            value={formulario.altura}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    altura: evento.target.value,
                                })
                            }
                            helperText="Informe em centímetros"
                            slotProps={{
                                htmlInput: {
                                    min: 100,
                                    max: 250,
                                    step: 1,
                                },
                            }}
                            fullWidth
                        />

                        <TextField
                            label="Peso"
                            type="number"
                            value={formulario.peso}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    peso: evento.target.value,
                                })
                            }
                            helperText="Informe em quilogramas"
                            slotProps={{
                                htmlInput: {
                                    min: 30,
                                    max: 250,
                                    step: 0.1,
                                },
                            }}
                            fullWidth
                        />

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

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formulario.ativo}
                                    onChange={(evento) =>
                                        setFormulario({
                                            ...formulario,
                                            ativo: evento.target.checked,
                                        })
                                    }
                                />
                            }
                            label="Atleta ativo"
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={fecharModal}>
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        onClick={salvarAtleta}
                        disabled={!formularioValido}
                    >
                        {atletaEmEdicao
                            ? "Salvar alterações"
                            : "Salvar atleta"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Atletas;