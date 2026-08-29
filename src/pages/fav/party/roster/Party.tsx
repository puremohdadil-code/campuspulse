import { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Stack } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { BASE_URL } from "../../../../config";
import WarehouseDetails from '../view/Party.tsx';
import WarehouseRegistrationForm from '../form/Party.tsx';
import Swal from 'sweetalert2';
import {
    AppButton, AppIconButton, AppTooltip, AppText, AppChip, AppTable, AppInput,
    AppDialog, AppSectionHeader, AppCard, AppTableEmptyState, COLORS,
} from '../../../../components/common';

const swalTheme = {
    confirmButtonColor: COLORS.primary,
    cancelButtonColor: COLORS.textLight,
};

interface Warehouse {
    _id?: string;
    subid?: string;
    name?: string;
    status?: string;
    address?: string;
}

interface WarehouseRow {
    id: string;
    col1?: string;
    col2?: string;
    col3?: string;
    col4?: string;
}

export default function WarehouseList() {
    const [openRegi, setOpenRegi] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/assets/warehouse/roster`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Server error");
            const data = await res.json();
            setWarehouses(data.warehouses || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Deferred a microtask so the fetch's own `setLoading(true)` runs
        // asynchronously rather than synchronously inside the effect body.
        void Promise.resolve().then(fetchData);
    }, [fetchData]);

    // Filtered rows are derived from `warehouses` + `search` — no effect
    // needed, this just recomputes whenever either input changes.
    const rows: WarehouseRow[] = useMemo(() => {
        const filtered = warehouses.filter(w =>
            !search ||
            w.subid?.toLowerCase().includes(search.toLowerCase()) ||
            w.name?.toLowerCase().includes(search.toLowerCase())
        );
        return filtered.map((item, index) => ({
            id: item._id || String(index),
            col1: item.subid,
            col2: item.name,
            col3: item.status,
            col4: item.address,
        }));
    }, [warehouses, search]);

    const totalCount = warehouses.length;

    const handleOpenDetails = (id: string) => {
        setSelectedId(id);
        setOpenDetails(true);
    };

    const handleCloseDetails = () => {
        setOpenDetails(false);
        setSelectedId(null);
        fetchData();
    };

    const handleRegiSuccess = () => {
        setOpenRegi(false);
        fetchData();
    };

    const handleToggleStatus = async (row: WarehouseRow) => {
        const isActive = row.col3 === "active";
        const action = isActive ? "Inactivate" : "Activate";
        const ac = isActive ? "inactive" : "active";
        const endpoint = `${BASE_URL}/assets/warehouse/status/${ac}/${row.id}`;

        const result = await Swal.fire({
            ...swalTheme,
            title: `${action} this warehouse?`,
            text: "You can revert this later.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Yes, ${action}!`,
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const res = await response.json();

            if (response.ok) {
                const newStatus = ac;
                setWarehouses(prev => prev.map(w => w._id === row.id ? { ...w, status: newStatus } : w));
                Swal.fire({ ...swalTheme, title: "Done!", text: `Warehouse marked as ${newStatus}.`, icon: "success" });
            } else {
                Swal.fire({ ...swalTheme, title: "Error", text: res.message || "Request failed.", icon: "error" });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to connect.";
            Swal.fire({ ...swalTheme, title: "Network Error", text: message, icon: "error" });
        }
    };

    const handleDeletion = async (id: string) => {
        const result = await Swal.fire({
            ...swalTheme,
            title: "Are you sure?",
            text: "You will be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        });
        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`${BASE_URL}/assets/warehouse/soft_delete/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (response.ok) {
                setWarehouses(prev => prev.filter(w => w._id !== id));
                Swal.fire({ ...swalTheme, title: "Deleted!", text: "Warehouse deleted successfully.", icon: "success" });
            } else {
                Swal.fire({ ...swalTheme, title: "Error", text: "Delete request failed.", icon: "error" });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to connect.";
            Swal.fire({ ...swalTheme, title: "Network Error", text: message, icon: "error" });
        }
    };

    const columns: GridColDef<WarehouseRow>[] = [
        {
            field: "col1", headerName: "Warehouse ID", flex: 0.9,
            renderCell: (p: GridRenderCellParams<WarehouseRow>) => (
                <AppText weight={700} sx={{ fontFamily: "monospace", color: COLORS.primary }}>{p.value}</AppText>
            ),
        },
        {
            field: "col2", headerName: "Name", flex: 1.2,
            renderCell: (p: GridRenderCellParams<WarehouseRow>) => <AppText weight={600}>{p.value}</AppText>,
        },
        {
            field: "col3", headerName: "Status", flex: 0.7,
            renderCell: (p: GridRenderCellParams<WarehouseRow>) => (
                <AppChip label={p.value} colorType={p.value === "active" ? "success" : "error"} />
            ),
        },
        {
            field: "col4", headerName: "Address", flex: 1.3,
            renderCell: (p: GridRenderCellParams<WarehouseRow>) => <AppText colorType="secondary">{p.value || "—"}</AppText>,
        },
        {
            field: "actions", headerName: "Actions", width: 160, sortable: false,
            renderCell: (params: GridRenderCellParams<WarehouseRow>) => (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                    <AppTooltip title="Delete">
                        <AppIconButton colorType="danger" onClick={() => handleDeletion(params.row.id)} aria-label="Delete">
                            <DeleteIcon fontSize="small" />
                        </AppIconButton>
                    </AppTooltip>
                    <AppTooltip title={params.row.col3 === "active" ? "Inactivate" : "Activate"}>
                        <AppIconButton colorType="secondary" onClick={() => handleToggleStatus(params.row)} aria-label="Toggle status">
                            {params.row.col3 === "active"
                                ? <ToggleOnOutlinedIcon fontSize="small" />
                                : <ToggleOffOutlinedIcon fontSize="small" />}
                        </AppIconButton>
                    </AppTooltip>
                    <AppTooltip title="Show Details">
                        <AppIconButton colorType="primary" onClick={() => handleOpenDetails(String(params.id))} aria-label="Show details">
                            <InfoOutlinedIcon fontSize="small" />
                        </AppIconButton>
                    </AppTooltip>
                </Stack>
            ),
        },
    ];

    return (
        <Box sx={{ mt: 3, width: "100%", minWidth: 0, maxWidth: "100%", overflowX: "hidden", p: 3, boxSizing: "border-box" }}>

            {/* ── Header ─────────────────────────── */}
            <AppSectionHeader
                title="Warehouse List"
                subtitle={`${totalCount} warehouses registered`}
                actions={
                    <>
                        <AppInput
                            label="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or ID…"
                            sx={{ width: 220 }}
                            slotProps={{ input: { startAdornment: <SearchOutlinedIcon sx={{ fontSize: 18, color: COLORS.textMuted, mr: 0.5 }} /> } }}
                        />
                        <AppButton startIcon={<AddOutlinedIcon />} onClick={() => setOpenRegi(true)}>
                            New Warehouse
                        </AppButton>
                        <AppButton buttonVariant="outlined" colorType="secondary" startIcon={<FileUploadOutlinedIcon />}>
                            Export
                        </AppButton>
                    </>
                }
            />

            {/* ── Table ─────────────────────────────────── */}
            <AppCard dense>
                <AppTable
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    disableColumnMenu
                    disableRowSelectionOnClick
                    pageSizeOptions={[8, 15, 25]}
                    emptyState={
                        <AppTableEmptyState
                            title="Your List is Still Empty"
                            description={<>No warehouses have been added yet. Start by adding a <strong>warehouse</strong>.</>}
                            tip={<>Use the <strong>&quot;New Warehouse&quot;</strong> button to begin.</>}
                        />
                    }
                />
            </AppCard>

            {/* ── Registration Dialog ───────────────────── */}
            <AppDialog open={openRegi} onClose={() => setOpenRegi(false)} maxWidth="sm" fullWidth title="New Warehouse">
                <WarehouseRegistrationForm onSuccess={handleRegiSuccess} onCancel={() => setOpenRegi(false)} />
            </AppDialog>

            {/* ── Details Dialog ────────────────────────── */}
            <AppDialog open={openDetails} onClose={handleCloseDetails} maxWidth="lg" fullWidth title="Warehouse Details">
                {selectedId && <WarehouseDetails id={selectedId} onClose={handleCloseDetails} />}
            </AppDialog>

        </Box>
    );
}
