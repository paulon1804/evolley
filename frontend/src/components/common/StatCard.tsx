import {
    Box,
    Card,
    CardContent,
    Typography,
} from "@mui/material";
import type { ReactNode } from "react";

interface StatCardProps {
    titulo: string;
    valor: string | number;
    icone?: ReactNode;
    descricao?: string;
}

function StatCard({
    titulo,
    valor,
    icone,
    descricao,
}: StatCardProps) {
    return (
        <Card sx={{ height: "100%" }}>
            <CardContent>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography color="text.secondary">
                            {titulo}
                        </Typography>

                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                mt: 1,
                            }}
                        >
                            {valor}
                        </Typography>

                        {descricao && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                            >
                                {descricao}
                            </Typography>
                        )}
                    </Box>

                    {icone && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                backgroundColor: "action.hover",
                                color: "primary.main",
                            }}
                        >
                            {icone}
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

export default StatCard;