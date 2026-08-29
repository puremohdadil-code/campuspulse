import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import { Box, Snackbar, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    AccountTree as AccountTreeIcon,
    FilterList as FilterListIcon,
    Refresh as RefreshIcon,
    Edit as EditIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../../config";
import {
    AppButton, AppIconButton, AppTooltip, AppText, AppChip, AppTable, AppInput, AppSelectOne,
    AppDialog, AppSectionHeader, AppCard, AppAlert, AppDivider, AppTableEmptyState, COLORS, mix, RADIUS,
} from "../../../../components/common";

const swalTheme = {
    confirmButtonColor: COLORS.primary,
    cancelButtonColor: COLORS.textLight,
};

// ─── Account Categories ──────────────────────────────────────────────────────
interface Category {
    key: string;
    type: string;
    color: string;
}

const CATEGORIES: Category[] = [
    { key: "Assets", type: "Asset", color: COLORS.primary },
    { key: "Liabilities", type: "Liability", color: COLORS.warning },
    { key: "Equity", type: "Equity", color: COLORS.success },
    { key: "Revenues", type: "Revenue", color: COLORS.info },
    { key: "Expenses", type: "Expense", color: COLORS.error },
];

const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
const ACCOUNT_NATURES = ["Debit", "Credit"];

type StatusColor = "default" | "primary" | "success" | "warning" | "error" | "info";
const TYPE_COLOR: Record<string, StatusColor> = { Asset: "primary", Liability: "warning", Equity: "success", Revenue: "info", Expense: "error" };

const TypeChip = ({ value }: { value?: string }) => <AppChip label={value || "—"} colorType={(value && TYPE_COLOR[value]) || "default"} />;
const NatureChip = ({ value }: { value?: string }) => (
    <AppChip
        label={value === "Debit" ? "▲ Dr" : value === "Credit" ? "▼ Cr" : "—"}
        colorType={value === "Debit" ? "warning" : value === "Credit" ? "success" : "default"}
    />
);

// ─── Add / Edit Guide Dialog ────────────────────────────────────────────────
interface Guide {
    _id: string;
    code?: string;
    name?: string;
    type?: string;
    nature?: string;
    parent?: { _id?: string; name?: string; code?: string } | string;
}

interface GuideForm {
    code: string;
    name: string;
    type: string;
    nature: string;
    parent: string;
}

const emptyGuideForm: GuideForm = { code: "", name: "", type: "", nature: "", parent: "" };

// Pure derivation of the dialog's starting form state from a guide (or none,
// for "New Account"). Used as the `useState` initializer — the parent
// remounts this component with a fresh `key` whenever the target guide
// changes, so there's no need for an effect to reset state after the fact.
const computeInitialForm = (guide?: Guide | null): GuideForm =>
    guide
        ? {
            code: guide.code ?? "",
            name: guide.name || "",
            type: guide.type || "",
            nature: guide.nature ? guide.nature[0].toUpperCase() + guide.nature.slice(1) : "",
            parent: (typeof guide.parent === "string" ? guide.parent : guide.parent?._id) || "",
        }
        : emptyGuideForm;

interface AddGuideDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    guide?: Guide | null;
}

const AddGuideDialog = ({ open, onClose, onSuccess, guide }: AddGuideDialogProps) => {
    const isEdit = Boolean(guide);
    const [form, setForm] = useState<GuideForm>(() => computeInitialForm(guide));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (field: keyof GuideForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<unknown>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value as string }));

    const handleSave = async () => {
        if (!form.code || !form.name || !form.type || !form.nature) {
            setError("Please fill all required fields.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const url = isEdit
                ? `${BASE_URL}/accountant/guide/update/${guide?._id}`
                : `${BASE_URL}/accountant/guide/create`;
            const res = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || `Failed to ${isEdit ? "update" : "create"} account`);
            onSuccess();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <AppDialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            title={isEdit ? "Edit Account" : "New Account"}
            actions={
                <>
                    <AppButton buttonVariant="outlined" colorType="secondary" onClick={handleClose}>
                        Cancel
                    </AppButton>
                    <AppButton onClick={handleSave} loading={loading}>
                        {isEdit ? "Save Changes" : "Create Account"}
                    </AppButton>
                </>
            }
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 0.5 }}>
                {error && <AppAlert severity="error">{error}</AppAlert>}

                <Box sx={{ display: "flex", gap: 2 }}>
                    <AppInput label="Account Code *" value={form.code} onChange={handleChange("code")} placeholder="e.g. 1010" />
                    <AppInput label="Account Name *" value={form.name} onChange={handleChange("name")} placeholder="e.g. Cash & Equivalents" />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <AppSelectOne label="Type *" value={form.type} onChange={handleChange("type")}>
                        {ACCOUNT_TYPES.map((t) => (
                            <MenuItem key={t} value={t}><TypeChip value={t} /></MenuItem>
                        ))}
                    </AppSelectOne>
                    <AppSelectOne label="Normal Balance *" value={form.nature} onChange={handleChange("nature")}>
                        {ACCOUNT_NATURES.map((n) => (
                            <MenuItem key={n} value={n}><NatureChip value={n} /></MenuItem>
                        ))}
                    </AppSelectOne>
                </Box>

                <AppInput label="Parent Account (optional)" value={form.parent} onChange={handleChange("parent")} placeholder="Leave blank for top-level account" />
            </Box>
        </AppDialog>
    );
};

interface GuideRow {
    id: string;
    code: string;
    name: string;
    type: string;
    nature: string;
    parent: string;
    createdBy: string;
    _raw: Guide;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChartOfAccounts() {
    const [rows, setRows] = useState<GuideRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [filterType, setFilterType] = useState("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);
    const [openAdd, setOpenAdd] = useState(false);
    const [snack, setSnack] = useState<{ open: boolean; type: "success" | "error"; msg: string }>({ open: false, type: "success", msg: "" });
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editGuide, setEditGuide] = useState<Guide | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const fetchGuides = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page + 1),
                limit: String(pageSize),
                search,
                sortField: "code",
                sortOrder: "asc",
            });
            if (filterType) params.append("type", filterType);
            const res = await fetch(`${BASE_URL}/accountant/guide/roster?${params.toString()}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const json = await res.json();

            const formatted: GuideRow[] = (json.data || []).map((g: Guide & { user?: { name?: string } }) => ({
                id: g._id,
                code: g.code || "",
                name: g.name || "",
                type: g.type || "",
                nature: g.nature || "",
                parent: (typeof g.parent === "string" ? g.parent : g.parent?.name || g.parent?.code) || "—",
                createdBy: g.user?.name || "System",
                _raw: g,
            }));
            setRows(formatted);
            setTotal(json.meta?.total || 0);
        } catch (err) {
            console.error("Failed to fetch guides:", err);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, filterType]);

    useEffect(() => {
        // Deferred a microtask so fetchGuides' own `setLoading(true)` runs
        // asynchronously rather than synchronously inside the effect body.
        void Promise.resolve().then(fetchGuides);
    }, [fetchGuides, refreshKey]);

    const CATEGORY_TYPE_MAP: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.type]));

    const handleCategoryClick = (cat: string) => {
        const isActive = cat === activeCategory;
        setActiveCategory(isActive ? null : cat);
        setFilterType(isActive ? "" : CATEGORY_TYPE_MAP[cat] || "");
        setPage(0);
    };

    const handleDelete = async (row: GuideRow) => {
        const result = await Swal.fire({
            ...swalTheme,
            title: `Delete account "${row.name}"?`,
            text: "You can restore it later if needed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        });
        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`${BASE_URL}/accountant/guide/soft-delete/${row.id}`, {
                method: "PATCH",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Delete failed");
            setSnack({ open: true, type: "success", msg: `Account "${row.name}" deleted.` });
            setRefreshKey((k) => k + 1);
        } catch {
            setSnack({ open: true, type: "error", msg: "Failed to delete." });
        }
    };

    const handleEdit = (row: GuideRow) => setEditGuide(row._raw);

    const columns: GridColDef<GuideRow>[] = [
        {
            field: "code", headerName: "Code", width: 100,
            renderCell: (p: GridRenderCellParams<GuideRow>) => <AppText weight={700} sx={{ fontFamily: "monospace", color: COLORS.primary }}>{p.value}</AppText>,
        },
        {
            field: "name", headerName: "Account Name", flex: 2,
            renderCell: (p: GridRenderCellParams<GuideRow>) => <AppText weight={600}>{p.value}</AppText>,
        },
        { field: "type", headerName: "Type", flex: 1, renderCell: (p: GridRenderCellParams<GuideRow>) => <TypeChip value={p.value} /> },
        { field: "nature", headerName: "Balance", flex: 1, renderCell: (p: GridRenderCellParams<GuideRow>) => <NatureChip value={p.value} /> },
        {
            field: "parent", headerName: "Parent Account", flex: 1.5,
            renderCell: (p: GridRenderCellParams<GuideRow>) => <AppText colorType="secondary">{p.value}</AppText>,
        },
        {
            field: "createdBy", headerName: "Created By", flex: 1,
            renderCell: (p: GridRenderCellParams<GuideRow>) => <AppText colorType="secondary">{p.value}</AppText>,
        },
        {
            field: "actions", headerName: "", width: 100, sortable: false,
            renderCell: (p: GridRenderCellParams<GuideRow>) => (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    <AppTooltip title="Edit">
                        <AppIconButton colorType="primary" onClick={() => handleEdit(p.row)} aria-label="Edit">
                            <EditIcon sx={{ fontSize: 16 }} />
                        </AppIconButton>
                    </AppTooltip>
                    <AppTooltip title="Delete">
                        <AppIconButton colorType="danger" onClick={() => handleDelete(p.row)} aria-label="Delete">
                            <DeleteIcon sx={{ fontSize: 16 }} />
                        </AppIconButton>
                    </AppTooltip>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", maxWidth: "100%", overflowX: "hidden", backgroundColor: COLORS.background }}>

            {/* ── Sidebar ── */}
            <Box sx={{
                width: 210, flexShrink: 0, backgroundColor: COLORS.card,
                borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column",
            }}>
                <Box sx={{ px: 2.5, py: 2.5, borderBottom: `1px solid ${COLORS.border}` }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 0.3 }}>
                        <AccountTreeIcon sx={{ fontSize: 16, color: COLORS.primary }} />
                        <AppText weight={800} colorType="primary" sx={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            Accounts
                        </AppText>
                    </Box>
                    <AppText colorType="secondary" sx={{ fontSize: "0.7rem" }}>Filter by category</AppText>
                </Box>

                <Box sx={{ flexGrow: 1, overflowY: "auto", py: 1.5, px: 1.5 }}>
                    <AppText colorType="secondary" weight={700} sx={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", px: 0.5, mb: 1 }}>
                        Categories
                    </AppText>
                    {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.key;
                        return (
                            <Box
                                key={cat.key}
                                onClick={() => handleCategoryClick(cat.key)}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1.5,
                                    px: 1.5, py: 1.1, borderRadius: RADIUS, mb: 0.5,
                                    cursor: "pointer", transition: "all 0.15s ease",
                                    backgroundColor: isActive ? mix(cat.color, 0.12) : "transparent",
                                    border: `1px solid ${isActive ? mix(cat.color, 0.3) : "transparent"}`,
                                    "&:hover": { backgroundColor: mix(cat.color, 0.1) },
                                }}
                            >
                                <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: cat.color, flexShrink: 0, opacity: isActive ? 1 : 0.4 }} />
                                <AppText weight={isActive ? 700 : 500} sx={{ fontSize: "0.8rem", color: isActive ? cat.color : COLORS.textLight, flex: 1 }}>
                                    {cat.key}
                                </AppText>
                                {isActive && (
                                    <Box sx={{ fontSize: "0.6rem", fontWeight: 700, backgroundColor: cat.color, color: COLORS.onPrimary, borderRadius: "4px", px: 0.6, py: 0.1 }}>
                                        ON
                                    </Box>
                                )}
                            </Box>
                        );
                    })}

                    <AppDivider sx={{ my: 2 }} />

                    <Box
                        onClick={() => { setActiveCategory(null); setFilterType(""); }}
                        sx={{
                            display: "flex", alignItems: "center", gap: 1.5,
                            px: 1.5, py: 1.1, borderRadius: RADIUS, cursor: "pointer",
                            backgroundColor: !activeCategory ? mix(COLORS.primary, 0.1) : "transparent",
                            border: `1px solid ${!activeCategory ? mix(COLORS.primary, 0.2) : "transparent"}`,
                            "&:hover": { backgroundColor: mix(COLORS.primary, 0.1) },
                        }}
                    >
                        <FilterListIcon sx={{ fontSize: 14, color: !activeCategory ? COLORS.primary : COLORS.textMuted }} />
                        <AppText weight={!activeCategory ? 700 : 500} sx={{ fontSize: "0.8rem", color: !activeCategory ? COLORS.primary : COLORS.textLight }}>
                            All Accounts
                        </AppText>
                    </Box>
                </Box>

                <Box sx={{ px: 2, py: 2, borderTop: `1px solid ${COLORS.border}` }}>
                    <AppText colorType="secondary" sx={{ fontSize: "0.67rem", textAlign: "center" }}>
                        Eagle Corporation ERP
                    </AppText>
                </Box>
            </Box>

            {/* ── Main Content ──
                minWidth: 0 is load-bearing here: without it, a flex child
                refuses to shrink below its content's intrinsic width (the
                DataGrid's natural column width), which pushed this whole
                page wider than the viewport instead of letting the table
                scroll internally. */}
            <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column", p: 3 }}>

                <AppSectionHeader
                    title="Chart of Accounts"
                    subtitle={`${total.toLocaleString()} accounts total${activeCategory ? ` · filtered by ${activeCategory}` : ""}`}
                    actions={
                        <>
                            <AppInput
                                label="Search"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search accounts…"
                                sx={{ width: 220 }}
                            />
                            <AppTooltip title="Refresh">
                                <AppIconButton colorType="secondary" onClick={() => setRefreshKey((k) => k + 1)} aria-label="Refresh">
                                    <RefreshIcon sx={{ fontSize: 17 }} />
                                </AppIconButton>
                            </AppTooltip>
                            <AppButton startIcon={<AddIcon />} onClick={() => setOpenAdd(true)}>
                                New Account
                            </AppButton>
                        </>
                    }
                />

                {(activeCategory || search) && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
                        <FilterListIcon sx={{ fontSize: 14, color: COLORS.primary }} />
                        <AppText colorType="primary" weight={600} sx={{ fontSize: "0.75rem" }}>Active filters:</AppText>
                        {activeCategory && (
                            <AppChip label={`Type: ${activeCategory}`} colorType="primary" onDelete={() => { setActiveCategory(null); setFilterType(""); }} />
                        )}
                        {search && (
                            <AppChip label={`Search: "${search}"`} colorType="primary" onDelete={() => { setSearch(""); setSearchInput(""); }} />
                        )}
                    </Box>
                )}

                <AppCard dense>
                    <AppTable
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        paginationMode="server"
                        rowCount={total}
                        paginationModel={{ page, pageSize }}
                        onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
                        pageSizeOptions={[10, 20, 50]}
                        disableColumnMenu
                        disableRowSelectionOnClick
                        emptyState={
                            <AppTableEmptyState
                                title="No Accounts Yet"
                                description="No accounts have been added yet. Start by adding your first account."
                                tip={<>Use the <strong>&quot;New Account&quot;</strong> button to begin.</>}
                            />
                        }
                    />
                </AppCard>
            </Box>

            <AddGuideDialog
                key={openAdd ? "add-open" : "add-closed"}
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={() => {
                    setSnack({ open: true, type: "success", msg: "Account created successfully." });
                    setRefreshKey((k) => k + 1);
                }}
            />

            <AddGuideDialog
                key={editGuide?._id ?? "edit-closed"}
                open={Boolean(editGuide)}
                guide={editGuide}
                onClose={() => setEditGuide(null)}
                onSuccess={() => {
                    setSnack({ open: true, type: "success", msg: "Account updated successfully." });
                    setRefreshKey((k) => k + 1);
                }}
            />

            <Snackbar
                open={snack.open}
                autoHideDuration={3500}
                onClose={() => setSnack({ open: false, type: "success", msg: "" })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <AppAlert severity={snack.type} onClose={() => setSnack({ open: false, type: "success", msg: "" })}>
                    {snack.msg}
                </AppAlert>
            </Snackbar>
        </Box>
    );
}
