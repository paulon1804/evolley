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
import type { Equipe } from "../../types/Equipe";

const categorias = [
    "Sub-13",
    "Sub-15",
    "Sub-17",
    "Sub-19",
    "Adulto",
    "Master",
];

const equipeInicial = {
    nome: "",
    categoria: "",
    tecnico: "",
    ativa: true,
};

function Equipes() {
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [equipeEmEdicao, setEquipeEmEdicao] =
        useState<Equipe | null>(null);

    const [busca, setBusca] = useState("");
    const [mensagemErro, setMensagemErro] = useState("");
    const [formulario, setFormulario] = useState(equipeInicial);

    useEffect(() => {
        const equipesSalvas = localStorage.getItem("evolley-equipes");

        if (!equipesSalvas) {
            return;
        }

        try {
            const dados: Equipe[] = JSON.parse(equipesSalvas);
            setEquipes(dados);
        } catch {
            localStorage.removeItem("evolley-equipes");
        }
    }, []);

    const equipesFiltradas = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        if (!termo) {
            return equipes;
        }

        return equipes.filter((equipe) =>
            [equipe.nome, equipe.categoria, equipe.tecnico].some((campo) =>
                campo.toLowerCase().includes(termo),
            ),
        );
    }, [busca, equipes]);

    const formularioValido =
        formulario.nome.trim().length > 0 &&
        formulario.categoria.length > 0;

    function salvarNoNavegador(novaLista: Equipe[]) {
        setEquipes(novaLista);

        localStorage.setItem(
            "evolley-equipes",
            JSON.stringify(novaLista),
        );
    }

    function abrirModal(equipe?: Equipe) {
        setMensagemErro("");

        if (equipe) {
            setEquipeEmEdicao(equipe);

            setFormulario({
                nome: equipe.nome,
                categoria: equipe.categoria,
                tecnico: equipe.tecnico,
                ativa: equipe.ativa,
            });
        } else {
            setEquipeEmEdicao(null);
            setFormulario(equipeInicial);
        }

        setModalAberto(true);
    }

    function fecharModal() {
        setModalAberto(false);
        setEquipeEmEdicao(null);
        setFormulario(equipeInicial);
    }

    function salvarEquipe() {
        const nome = formulario.nome.trim();
        const tecnico = formulario.tecnico.trim();

        if (!nome || !formulario.categoria) {
            return;
        }

        if (equipeEmEdicao) {
            const listaAtualizada = equipes.map((equipe) =>
                equipe.id === equipeEmEdicao.id
                    ? {
                        ...equipe,
                        nome,
                        categoria: formulario.categoria,
                        tecnico,
                        ativa: formulario.ativa,
                    }
                    : equipe,
            );

            salvarNoNavegador(listaAtualizada);
        } else {
            const novaEquipe: Equipe = {
                id: crypto.randomUUID(),
                nome,
                categoria: formulario.categoria,
                tecnico,
                ativa: formulario.ativa,
            };

            salvarNoNavegador([...equipes, novaEquipe]);
        }

        fecharModal();
    }

    function removerEquipe(id: string) {
        setMensagemErro("");

        const atletasSalvos = localStorage.getItem("evolley-atletas");

        if (atletasSalvos) {
            try {
                const atletas: { equipeId: string }[] =
                    JSON.parse(atletasSalvos);

                const possuiAtletas = atletas.some(
                    (atleta) => atleta.equipeId === id,
                );

                if (possuiAtletas) {
                    setMensagemErro(
                        "Esta equipe possui atletas vinculados e não pode ser removida.",
                    );

                    return;
                }
            } catch {
                localStorage.removeItem("evolley-atletas");
            }
        }

        const novaLista = equipes.filter(
            (equipe) => equipe.id !== id,
        );

        salvarNoNavegador(novaLista);
    }

    return (
        <>
            <PageHeader
                titulo="Equipes"
                subtitulo="Cadastre e gerencie as equipes do Evolley."
                textoBotao="Nova equipe"
                iconeBotao={<AddIcon />}
                aoClicarBotao={() => abrirModal()}
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

            {equipes.length > 0 && (
                <TextField
                    label="Pesquisar equipes"
                    placeholder="Nome, categoria ou técnico"
                    value={busca}
                    onChange={(evento) => setBusca(evento.target.value)}
                    fullWidth
                    sx={{
                        mb: 3,
                        maxWidth: 500,
                    }}
                />
            )}

            {equipes.length === 0 ? (
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
                        Nenhuma equipe cadastrada
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 1, mb: 3 }}
                    >
                        Cadastre a primeira equipe para começar a
                        organizar atletas, jogos e treinos.
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => abrirModal()}
                    >
                        Cadastrar equipe
                    </Button>
                </Paper>
            ) : equipesFiltradas.length === 0 ? (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 4,
                        textAlign: "center",
                    }}
                >
                    <Typography sx={{ fontWeight: 600 }}>
                        Nenhuma equipe encontrada
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Tente pesquisar usando outro nome, categoria ou técnico.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Equipe</TableCell>
                                <TableCell>Categoria</TableCell>
                                <TableCell>Técnico</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {equipesFiltradas.map((equipe) => (
                                <TableRow
                                    key={equipe.id}
                                    hover
                                >
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        {equipe.nome}
                                    </TableCell>

                                    <TableCell>
                                        {equipe.categoria}
                                    </TableCell>

                                    <TableCell>
                                        {equipe.tecnico || "Não informado"}
                                    </TableCell>

                                    <TableCell>
                                        {equipe.ativa ? "Ativa" : "Inativa"}
                                    </TableCell>

                                    <TableCell align="right">
                                        <Tooltip title="Editar equipe">
                                            <IconButton
                                                color="primary"
                                                onClick={() => abrirModal(equipe)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Remover equipe">
                                            <IconButton
                                                color="error"
                                                onClick={() => removerEquipe(equipe.id)}
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
                maxWidth="sm"
            >
                <DialogTitle>
                    {equipeEmEdicao ? "Editar equipe" : "Nova equipe"}
                </DialogTitle>

                <DialogContent>
                    <Box
                        sx={{
                            display: "grid",
                            gap: 2,
                            mt: 1,
                        }}
                    >
                        <TextField
                            label="Nome da equipe"
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
                            select
                            label="Categoria"
                            value={formulario.categoria}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    categoria: evento.target.value,
                                })
                            }
                            required
                            fullWidth
                        >
                            {categorias.map((categoria) => (
                                <MenuItem
                                    key={categoria}
                                    value={categoria}
                                >
                                    {categoria}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Técnico responsável"
                            value={formulario.tecnico}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    tecnico: evento.target.value,
                                })
                            }
                            fullWidth
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formulario.ativa}
                                    onChange={(evento) =>
                                        setFormulario({
                                            ...formulario,
                                            ativa: evento.target.checked,
                                        })
                                    }
                                />
                            }
                            label="Equipe ativa"
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={fecharModal}>
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        onClick={salvarEquipe}
                        disabled={!formularioValido}
                    >
                        {equipeEmEdicao
                            ? "Salvar alterações"
                            : "Salvar equipe"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Equipes;