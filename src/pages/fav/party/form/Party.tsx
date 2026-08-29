import { useState } from 'react';
import { Box, Stack, MenuItem } from "@mui/material";
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import Swal from 'sweetalert2';
import { BASE_URL } from '../../../../config';
import {
    AppButton, AppInput, AppSelectOne, AppText, AppDivider, COLORS, RADIUS, mix,
} from '../../../../components/common';
import type { ReactNode } from 'react';

// Every Swal.fire() call in this file spreads this so confirm/cancel
// buttons match the app's theme instead of SweetAlert2's stock blue/gray.
const swalTheme = {
    confirmButtonColor: COLORS.primary,
    cancelButtonColor: COLORS.textLight,
};

function SectionLabel({ icon, title }: { icon: ReactNode; title: string }) {
    return (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 2 }}>
            <Box sx={{
                width: 30, height: 30, borderRadius: RADIUS,
                bgcolor: mix(COLORS.primary, 0.1), display: "flex",
                alignItems: "center", justifyContent: "center", color: COLORS.primary,
            }}>
                {icon}
            </Box>
            <AppText weight={700}>{title}</AppText>
        </Stack>
    );
}

interface WarehouseRegistrationFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function WarehouseRegistrationForm({ onSuccess, onCancel }: WarehouseRegistrationFormProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [subid, setSubid] = useState("");
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState("active");

    const validate = () => {
        if (!name.trim()) {
            Swal.fire({ ...swalTheme, icon: "warning", title: "Missing Field", text: "Warehouse Name is required." });
            return false;
        }
        if (!subid.trim()) {
            Swal.fire({ ...swalTheme, icon: "warning", title: "Missing Field", text: "Warehouse ID is required." });
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/assets/warehouse/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, subid, status, address }),
                credentials: "include",
            });
            const result = await response.json();
            if (response.ok) {
                await Swal.fire({
                    ...swalTheme,
                    title: result.message || "Warehouse registered successfully!",
                    icon: "success", timer: 2000, showConfirmButton: false,
                });
                onSuccess?.();
            } else {
                Swal.fire({ ...swalTheme, icon: "error", title: "Registration Failed", text: result.message || "An error occurred." });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to connect.";
            Swal.fire({ ...swalTheme, icon: "error", title: "Network Error", text: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: COLORS.background }}>

            {/* ── Basic Info ─────────────────────────── */}
            <SectionLabel icon={<WarehouseOutlinedIcon sx={{ fontSize: 16 }} />} title="Basic Information" />

            <Stack spacing={2} sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2}>
                    <AppInput
                        label="Warehouse Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <AppInput
                        label="Warehouse ID"
                        value={subid}
                        onChange={(e) => setSubid(e.target.value)}
                        required
                        slotProps={{
                            input: {
                                startAdornment: <TagOutlinedIcon sx={{ color: COLORS.textMuted, mr: 0.5, fontSize: 17 }} />,
                            },
                        }}
                    />
                </Stack>

                <AppSelectOne label="Status" value={status} onChange={(e) => setStatus(e.target.value as string)}>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                </AppSelectOne>
            </Stack>

            <AppDivider sx={{ mb: 3 }} />

            {/* ── Location ──────────────────────────── */}
            <SectionLabel icon={<LocationOnOutlinedIcon sx={{ fontSize: 16 }} />} title="Location" />

            <AppInput
                label="Warehouse Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                multiline
                minRows={2}
                sx={{ mb: 3 }}
            />

            {/* ── Actions ───────────────────────────── */}
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                <AppButton buttonVariant="outlined" colorType="secondary" onClick={onCancel} startIcon={<CloseOutlinedIcon />}>
                    Cancel
                </AppButton>
                <AppButton onClick={handleSubmit} loading={loading} endIcon={<SaveOutlinedIcon />}>
                    {loading ? "Registering..." : "Register Warehouse"}
                </AppButton>
            </Stack>
        </Box>
    );
}
