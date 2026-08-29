import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { Box, Snackbar, MenuItem } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SettingsBackupRestoreOutlinedIcon from "@mui/icons-material/SettingsBackupRestoreOutlined";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";
import { BASE_URL } from "../../../../config";
import Swal from "sweetalert2";
import {
    AppButton, AppText, AppCard, AppInput, AppSelectOne,
    AppAvatar, AppChip, AppAlert, AppInfoRow, AppSkeletonRows,
    COLORS, mix,
} from "../../../../components/common";

const swalTheme = {
    confirmButtonColor: COLORS.primary,
    cancelButtonColor: COLORS.textLight,
};

interface Warehouse {
    _id?: string;
    name?: string;
    subid?: string;
    address?: string;
    status?: string;
    deleted?: boolean;
}

interface WarehouseForm {
    name: string;
    subid: string;
    address: string;
    status: string;
    deleted: boolean;
}

interface WarehouseDetailsProps {
    id?: string | null;
    onClose?: () => void;
}

// ─── Main Component ─────────────────────────────────────────────────────────────
// Receives id + onClose as props (rendered inside a dialog from the roster page)
// instead of reading useParams, so it can be reused outside a router route too.
export default function WarehouseDetails({ id, onClose }: WarehouseDetailsProps) {
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snack, setSnack] = useState<{ open: boolean; type: "success" | "error"; msg: string }>({ open: false, type: "success", msg: "" });
    const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
    const [form, setForm] = useState<WarehouseForm>({ name: "", subid: "", address: "", status: "active", deleted: false });

    const setField = (key: keyof WarehouseForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    useEffect(() => {
        if (!id) return;
        // `loading` already starts `true` — no need to set it again here.
        fetch(`${BASE_URL}/assets/warehouse/${id}`, { method: "GET", credentials: "include" })
            .then((r) => r.json())
            .then((data) => {
                const w: Warehouse = data.warehouse || data;
                setWarehouse(w);
                setForm({
                    name: w.name || "",
                    subid: w.subid || "",
                    address: w.address || "",
                    status: w.status || "active",
                    deleted: w.deleted || false,
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${BASE_URL}/assets/warehouse/update/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });
            const result = await res.json();
            if (res.ok) {
                setWarehouse((prev) => ({ ...prev, ...form }));
                setEditMode(false);
                setSnack({ open: true, type: "success", msg: result.message || "Warehouse updated successfully." });
            } else {
                setSnack({ open: true, type: "error", msg: result.message || "Update failed." });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Update failed.";
            setSnack({ open: true, type: "error", msg: message });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (warehouse) {
            setForm({
                name: warehouse.name || "",
                subid: warehouse.subid || "",
                address: warehouse.address || "",
                status: warehouse.status || "active",
                deleted: warehouse.deleted || false,
            });
        }
        setEditMode(false);
    };

    const handleDelete = async () => {
        const confirm = await Swal.fire({
            ...swalTheme,
            title: "Permanently delete this warehouse?",
            text: "This action cannot be undone. All associated data will be lost.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: COLORS.error,
            confirmButtonText: "Yes, delete it!",
        });
        if (!confirm.isConfirmed) return;
        try {
            const res = await fetch(`${BASE_URL}/assets/warehouse/hard_delete/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const result = await res.json();
            if (res.ok) {
                await Swal.fire({ ...swalTheme, title: "Deleted!", text: "Warehouse has been permanently deleted.", icon: "success" });
                onClose?.(); // closes the dialog and returns to the roster list
            } else {
                Swal.fire({ ...swalTheme, title: "Error", text: result.message, icon: "error" });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to connect.";
            Swal.fire({ ...swalTheme, title: "Network Error", text: message, icon: "error" });
        }
    };

    const handleRestore = async () => {
        try {
            const res = await fetch(`${BASE_URL}/assets/warehouse/restore/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const result = await res.json();
            if (res.ok) {
                Swal.fire({ ...swalTheme, title: "Restored!", text: "Warehouse has been restored successfully.", icon: "success" });
                setForm((f) => ({ ...f, deleted: false }));
                setWarehouse((prev) => (prev ? { ...prev, deleted: false } : prev));
            } else {
                Swal.fire({ ...swalTheme, title: "Error", text: result.message, icon: "error" });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to connect.";
            Swal.fire({ ...swalTheme, title: "Network Error", text: message, icon: "error" });
        }
    };

    // ─── Loading ───────────────────────────────────────────────────────────────
    if (loading)
        return (
            <Box sx={{ p: 3, bgcolor: COLORS.background }}>
                <AppSkeletonRows rows={1} height={100} />
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Box sx={{ flex: 2 }}><AppSkeletonRows rows={1} height={220} /></Box>
                    <Box sx={{ flex: 1 }}><AppSkeletonRows rows={1} height={220} /></Box>
                </Box>
            </Box>
        );

    if (!warehouse)
        return (
            <Box sx={{ p: 3 }}>
                <AppAlert severity="error">Warehouse not found.</AppAlert>
            </Box>
        );

    const isActive = (editMode ? form.status : warehouse.status)?.toLowerCase() === "active";
    const initials = (warehouse.name || "W").slice(0, 2).toUpperCase();

    return (
        <Box sx={{ bgcolor: COLORS.background, p: { xs: 2, md: 3 } }}>

            {/* ── Deleted Banner ──────────────────────────────────────────── */}
            {form.deleted && (
                <AppAlert
                    severity="warning"
                    sx={{ mb: 2 }}
                    action={
                        <AppButton buttonVariant="ghost" colorType="success" onClick={handleRestore} startIcon={<SettingsBackupRestoreOutlinedIcon />}>
                            Restore
                        </AppButton>
                    }
                >
                    This warehouse has been soft-deleted and is currently inactive.
                </AppAlert>
            )}

            {/* ── Action Bar ──────────────────────────────────────────────── */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.2, mb: 2.5, flexWrap: "wrap" }}>
                {editMode ? (
                    <>
                        <AppButton buttonVariant="outlined" colorType="secondary" startIcon={<CloseOutlined />} onClick={handleCancel}>
                            Cancel
                        </AppButton>
                        <AppButton startIcon={<SaveOutlinedIcon />} onClick={handleSave} loading={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </AppButton>
                    </>
                ) : (
                    <AppButton startIcon={<EditOutlinedIcon />} onClick={() => setEditMode(true)}>
                        Edit
                    </AppButton>
                )}

                <AppButton colorType="danger" startIcon={<DeleteOutlinedIcon />} onClick={handleDelete}>
                    Delete Permanently
                </AppButton>

                {form.deleted && (
                    <AppButton colorType="success" startIcon={<SettingsBackupRestoreOutlinedIcon />} onClick={handleRestore}>
                        Restore
                    </AppButton>
                )}
            </Box>

            {/* ── Hero Card ────────────────────────────────────────────────── */}
            <Box sx={{
                border: `1.5px solid ${COLORS.border}`, borderRadius: "18px", mb: 3, overflow: "hidden",
                boxShadow: `0 8px 24px -4px ${COLORS.shadow}`,
                background: `linear-gradient(135deg, ${mix(COLORS.primary, 0.08)} 0%, ${COLORS.card} 60%)`,
            }}>
                <Box sx={{ p: 3, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2.5, alignItems: { xs: "flex-start", sm: "center" } }}>
                    <AppAvatar sx={{ width: 76, height: 76, fontSize: "26px" }}>{initials}</AppAvatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {editMode ? (
                            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                                <AppInput label="Warehouse Name" value={form.name} onChange={setField("name")} sx={{ minWidth: 200 }} />
                                <AppInput disabled label="Warehouse ID" value={form.subid} onChange={setField("subid")} sx={{ minWidth: 140 }} />
                            </Box>
                        ) : (
                            <>
                                <AppText weight={800} sx={{ fontSize: "24px", letterSpacing: "-0.02em" }}>
                                    {warehouse.name || "—"}
                                </AppText>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
                                    <TagOutlinedIcon sx={{ fontSize: 15, color: COLORS.textMuted }} />
                                    <AppText colorType="secondary" sx={{ fontFamily: "monospace" }}>
                                        {warehouse.subid || "No ID assigned"}
                                    </AppText>
                                </Box>
                            </>
                        )}
                    </Box>

                    <AppChip label={isActive ? "ACTIVE" : "INACTIVE"} colorType={isActive ? "success" : "error"} />
                </Box>
            </Box>

            {/* ── Body ─────────────────────────────────────────────────────── */}
            <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", alignItems: "flex-start" }}>

                {/* Left Column */}
                <Box sx={{ flex: "1 1 420px", minWidth: 0 }}>
                    <Box sx={{ mb: 2.5 }}>
                        <AppCard title="Warehouse Information">
                            {editMode ? (
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 2 }}>
                                    <AppInput label="Warehouse Name" value={form.name} onChange={setField("name")} required />
                                    <AppInput label="Warehouse ID" disabled value={form.subid} onChange={setField("subid")} />
                                </Box>
                            ) : (
                                <>
                                    <AppInfoRow label="Warehouse Name" value={warehouse.name} />
                                    <AppInfoRow label="Warehouse ID" value={warehouse.subid} />
                                </>
                            )}
                        </AppCard>
                    </Box>

                    <AppCard title="Location">
                        {editMode ? (
                            <AppInput label="Warehouse Address" value={form.address} onChange={setField("address")} multiline minRows={2} />
                        ) : (
                            <AppInfoRow label="Address" value={warehouse.address} />
                        )}
                    </AppCard>
                </Box>

                {/* Right Column */}
                <Box sx={{ flex: "0 0 260px" }}>
                    <Box sx={{ mb: 2.5 }}>
                        <AppCard title="Classification">
                            {editMode ? (
                                <AppSelectOne label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as string }))}>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </AppSelectOne>
                            ) : (
                                <AppInfoRow
                                    label="Status"
                                    value={<AppChip label={warehouse.status} colorType={isActive ? "success" : "error"} />}
                                />
                            )}
                        </AppCard>
                    </Box>

                    <AppCard title="Quick Summary">
                        <AppInfoRow label="Warehouse ID" value={warehouse.subid || "—"} />
                        <AppInfoRow label="Status" value={warehouse.status || "—"} />
                        <AppInfoRow label="Has Address" value={warehouse.address ? "Yes" : "No"} />
                    </AppCard>
                </Box>
            </Box>

            {/* ── Snackbar ─────────────────────────────────────────────────── */}
            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <AppAlert severity={snack.type} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
                    {snack.msg}
                </AppAlert>
            </Snackbar>
        </Box>
    );
}
