import { Box, Button, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageHeaderProps {
    titulo: string;
    subtitulo?: string;
    textoBotao?: string;
    iconeBotao?: ReactNode;
    aoClicarBotao?: () => void;
    botaoDesabilitado?: boolean;
}

function PageHeader({
    titulo,
    subtitulo,
    textoBotao,
    iconeBotao,
    aoClicarBotao,
    botaoDesabilitado,
}: PageHeaderProps) {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: {
                    xs: "flex-start",
                    sm: "center",
                },
                flexDirection: {
                    xs: "column",
                    sm: "row",
                },
                gap: 2,
                mb: 3,
            }}
        >
            <Box>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{ fontWeight: 700 }}
                >
                    {titulo}
                </Typography>

                {subtitulo && (
                    <Typography color="text.secondary">
                        {subtitulo}
                    </Typography>
                )}
            </Box>

            {textoBotao && (
                <Button
                    variant="contained"
                    startIcon={iconeBotao}
                    onClick={aoClicarBotao}
                    disabled={botaoDesabilitado}
                >
                    {textoBotao}
                </Button>
            )}
        </Box>
    );
}

export default PageHeader;