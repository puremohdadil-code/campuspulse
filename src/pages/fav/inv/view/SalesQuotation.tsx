import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Box, MenuItem, Snackbar } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SettingsBackupRestoreOutlinedIcon from "@mui/icons-material/SettingsBackupRestoreOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import { DateTime } from "luxon";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../../config";
import useServerCalculation from "../../../../utils/useServerCalculation";
import {
    AppButton, AppText, AppCard, AppInput, AppSelectOne, AppDatePicker,
    AppChip, AppAlert, AppInfoRow, AppSkeletonRows, AppLineItemsTable, AppSummaryRow,
    AppAvatar, COLORS, mix,
} from "../../../../components/common";
import type { AppLineItemColumn } from "../../../../components/common";

const swalTheme = {
    confirmButtonColor: COLORS.primary,
    cancelButtonColor: COLORS.textLight,
};

const STATUS_OPTIONS = ["draft", "sent", "accepted", "rejected", "expired"];

interface Customer {
    _id: string;
    name: string;
}

interface Product {
    _id: string;
    name: string;
    subid?: string;
    sale_price?: number;
    status?: string;
}

interface QuotationItemLine {
    item?: { _id?: string; name?: string; subid?: string };
    quantity: number;
    price: number;
    subTotal?: number;
    discountShare?: number;
    vat?: number;
    total?: number;
}

interface Quotation {
    _id?: string;
    quotationNumber?: string;
    customer?: { _id?: string; name?: string };
    currency?: string;
    exchangeRate?: number;
    items?: QuotationItemLine[];
    subTotal?: number;
    discountAmount?: number;
    vat?: number;
    total?: number;
    status?: string;
    validUntil?: string;
    note?: string;
    deleted?: boolean;
}

interface FormState {
    customer: string;
    currency: string;
    exchangeRate: number | string;
    validUntil: DateTime | null;
    note: string;
    discount: number;
    status: string;
    deleted: boolean;
}

interface Row {
    _id: string;
    id: string;
    product: string;
    quantity: number;
    price: number;
}

interface EditDisplayRow extends Row {
    subtotal: number;
    discount: number;
    vat: number;
    total: number;
}

interface ViewDisplayRow {
    id: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    discount: number;
    vat: number;
    total: number;
}

interface CalcLineItem {
    subTotal?: number;
    discountShare?: number;
    vat?: number;
    total?: number;
}

interface CalcResult {
    items?: CalcLineItem[];
    subTotal?: number;
    vat?: number;
    discountAmount?: number;
    grandTotal?: number;
    total?: number;
}

const emptyRow = (): Row => ({ _id: "", id: "", product: "", quantity: 1, price: 0 });

interface SalesQuotationDetailsProps {
    id?: string | null;
    onClose?: () => void;
}

// Receives id + onClose as props (rendered inside a dialog / drawer from a
// quotations roster) instead of reading useParams, matching WarehouseDetails.
export default function SalesQuotationDetails({ id, onClose }: SalesQuotationDetailsProps) {
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snack, setSnack] = useState<{ open: boolean; type: "success" | "error"; msg: string }>({ open: false, type: "success", msg: "" });
    const [quotation, setQuotation] = useState<Quotation | null>(null);

    const [getCustomer, setGetCustomer] = useState<Customer[]>([]);
    const [getProducts, setGetProducts] = useState<Product[]>([]);

    const [form, setForm] = useState<FormState>({
        customer: "", currency: "", exchangeRate: 1, validUntil: null, note: "", discount: 0, status: "draft", deleted: false,
    });
    const [rows, setRows] = useState<Row[]>([emptyRow()]);

    const setField = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const applyQuotation = (q: Quotation) => {
        setQuotation(q);
        setForm({
            customer: q.customer?._id || "",
            currency: q.currency || "",
            exchangeRate: q.exchangeRate ?? 1,
            validUntil: q.validUntil ? DateTime.fromISO(q.validUntil) : null,
            note: q.note || "",
            // This screen always edits discount as a percentage (matching the
            // create form) — reconstruct it from the stored flat amount so an
            // existing quotation's discount % survives entering edit mode.
            discount: (q.subTotal || 0) > 0 ? (Number(q.discountAmount || 0) / (q.subTotal as number)) * 100 : 0,
            status: q.status || "draft",
            deleted: q.deleted || false,
        });
        setRows(
            (q.items || []).map((line) => ({
                _id: line.item?._id || "",
                id: line.item?.subid || "",
                product: line.item?._id || "",
                quantity: line.quantity,
                price: line.price,
            }))
        );
    };

    useEffect(() => {
        if (!id) return;
        // `loading` already starts `true` — no need to set it again here.
        Promise.all([
            fetch(`${BASE_URL}/sales/quotation/${id}`, { credentials: "include" }).then((r) => r.json()),
            fetch(`${BASE_URL}/sales/create_invoice/internalSales/info`, { credentials: "include" }).then((r) => r.json()),
            fetch(`${BASE_URL}/item/roster`, { credentials: "include" }).then((r) => r.json()),
        ])
            .then(([quotationRes, infoRes, itemsRes]) => {
                if (quotationRes.quotation) applyQuotation(quotationRes.quotation);
                setGetCustomer(infoRes.data?.customers || []);
                setGetProducts((itemsRes.items || []).filter((i: Product) => i.status !== "INACTIVE" && i.status !== "DELETED"));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const validRows = useMemo(() => rows.filter((r) => r._id), [rows]);
    const calcPayload = useMemo(() => ({
        products: validRows.map((r) => r._id),
        quantities: validRows.map((r) => Number(r.quantity || 0)),
        prices: validRows.map((r) => Number(r.price || 0)),
        discountType: "percent",
        discount: Number(form.discount || 0),
        exchangeRate: Number(form.exchangeRate || 1),
    }), [validRows, form.discount, form.exchangeRate]);

    const { result: calc, loading: calcLoading } = useServerCalculation<typeof calcPayload, CalcResult>(
        "/sales/create_invoice/internalSales/calculate", calcPayload, { enabled: editMode && validRows.length > 0 }
    );

    // While editing, totals come live from the recalculation preview; at rest
    // they're whatever the quotation already has saved.
    const totals = editMode && calc
        ? { subTotal: calc.subTotal || 0, vat: calc.vat || 0, discountAmount: calc.discountAmount || 0, grandTotal: calc.grandTotal || calc.total || 0 }
        : { subTotal: quotation?.subTotal || 0, vat: quotation?.vat || 0, discountAmount: quotation?.discountAmount || 0, grandTotal: quotation?.total || 0 };

    const viewRows: ViewDisplayRow[] = useMemo(() => (quotation?.items || []).map((line) => ({
        id: line.item?.subid || "",
        name: line.item?.name || "—",
        quantity: line.quantity,
        price: line.price,
        subtotal: line.subTotal || 0,
        discount: line.discountShare || 0,
        vat: line.vat || 0,
        total: line.total || 0,
    })), [quotation]);

    const editRows: EditDisplayRow[] = useMemo(() => {
        return rows.map((row) => {
            if (!row._id) return { ...row, subtotal: 0, discount: 0, vat: 0, total: 0 };
            const line = calc?.items?.[validRows.indexOf(row)];
            return {
                ...row,
                subtotal: line?.subTotal || 0,
                discount: line?.discountShare || 0,
                vat: line?.vat || 0,
                total: line?.total || 0,
            };
        });
    }, [rows, calc, validRows]);

    const handleRowChange = (index: number, field: "product" | "quantity" | "price", value: string) => {
        const updated = [...rows];
        updated[index] = { ...updated[index], [field]: field === "quantity" ? Number(value) : value };
        if (field === "product") {
            const product = getProducts.find((p) => p._id === updated[index].product);
            if (product) {
                updated[index] = { ...updated[index], price: Number(product.sale_price || 0), _id: product._id, id: product.subid || "" };
            }
        }
        setRows(updated);
    };

    const handleAddRow = () => setRows([...rows, emptyRow()]);
    const handleDeleteRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

    const handleSave = async () => {
        if (!form.customer) {
            setSnack({ open: true, type: "error", msg: "Please select a customer." });
            return;
        }
        if (validRows.length === 0) {
            setSnack({ open: true, type: "error", msg: "Add at least one product." });
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`${BASE_URL}/sales/quotation/update/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    customer: form.customer,
                    currency: form.currency,
                    exchangeRate: Number(form.exchangeRate || 1),
                    products: validRows.map((r) => r._id),
                    quantities: validRows.map((r) => Number(r.quantity || 0)),
                    prices: validRows.map((r) => Number(r.price || 0)),
                    discountType: "percent",
                    discount: Number(form.discount || 0),
                    validUntil: form.validUntil?.toISODate() ?? null,
                    note: form.note,
                }),
            });
            const result = await res.json();
            if (res.ok) {
                applyQuotation(result.quotation);
                setEditMode(false);
                setSnack({ open: true, type: "success", msg: result.message || "Quotation updated successfully." });
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
        if (quotation) applyQuotation(quotation);
        setEditMode(false);
    };

    const handleStatusChange = async (e: SelectChangeEvent<unknown>) => {
        const status = e.target.value as string;
        setForm((f) => ({ ...f, status }));
        try {
            const res = await fetch(`${BASE_URL}/sales/quotation/${id}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status }),
            });
            const result = await res.json();
            if (res.ok) {
                setQuotation((prev) => (prev ? { ...prev, status } : prev));
                setSnack({ open: true, type: "success", msg: "Status updated." });
            } else {
                setSnack({ open: true, type: "error", msg: result.message || "Status update failed." });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Status update failed.";
            setSnack({ open: true, type: "error", msg: message });
        }
    };

    const handleDelete = async () => {
        const confirm = await Swal.fire({
            ...swalTheme,
            title: "Permanently delete this quotation?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: COLORS.error,
            confirmButtonText: "Yes, delete it!",
        });
        if (!confirm.isConfirmed) return;
        try {
            const res = await fetch(`${BASE_URL}/sales/quotation/hard_delete/${id}`, { method: "DELETE", credentials: "include" });
            const result = await res.json();
            if (res.ok) {
                await Swal.fire({ ...swalTheme, title: "Deleted!", text: "Quotation has been permanently deleted.", icon: "success" });
                onClose?.();
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
            const res = await fetch(`${BASE_URL}/sales/quotation/restore/${id}`, { method: "PATCH", credentials: "include" });
            const result = await res.json();
            if (res.ok) {
                setForm((f) => ({ ...f, deleted: false }));
                setQuotation((prev) => (prev ? { ...prev, deleted: false } : prev));
                Swal.fire({ ...swalTheme, title: "Restored!", text: "Quotation has been restored.", icon: "success" });
            } else {
                Swal.fire({ ...swalTheme, title: "Error", text: result.message, icon: "error" });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to connect.";
            Swal.fire({ ...swalTheme, title: "Network Error", text: message, icon: "error" });
        }
    };

    if (loading)
        return (
            <Box sx={{ p: 3 }}>
                <AppSkeletonRows rows={1} height={100} />
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Box sx={{ flex: 2 }}><AppSkeletonRows rows={1} height={280} /></Box>
                    <Box sx={{ flex: 1 }}><AppSkeletonRows rows={1} height={280} /></Box>
                </Box>
            </Box>
        );

    if (!quotation)
        return (
            <Box sx={{ p: 3 }}>
                <AppAlert severity="error">Sales Quotation not found.</AppAlert>
            </Box>
        );

    const readOnlyColumns: AppLineItemColumn<ViewDisplayRow>[] = [
        { key: "id", header: "Product ID", width: 110, render: (row) => <AppText colorType="secondary" sx={{ fontFamily: "monospace" }}>{row.id || "—"}</AppText> },
        { key: "name", header: "Product", render: (row) => <AppText weight={600}>{row.name}</AppText> },
        { key: "quantity", header: "Qty", width: 70, render: (row) => <AppText>{row.quantity}</AppText> },
        { key: "price", header: "Unit Price", width: 100, render: (row) => <AppText>${Number(row.price).toFixed(2)}</AppText> },
        { key: "subtotal", header: "Subtotal", width: 90, render: (row) => <AppText colorType="secondary">${row.subtotal.toFixed(2)}</AppText> },
        { key: "vat", header: "VAT", width: 90, render: (row) => <AppText colorType="secondary">${row.vat.toFixed(2)}</AppText> },
        { key: "total", header: "Total", width: 100, render: (row) => <AppText weight={700}>${row.total.toFixed(2)}</AppText> },
    ];

    const editableColumns: AppLineItemColumn<EditDisplayRow>[] = [
        { key: "id", header: "Product ID", width: 110, render: (row) => <AppInput label="" value={row.id} disabled placeholder="Auto" /> },
        {
            key: "product", header: "Product",
            render: (row, i) => (
                <AppSelectOne label="" value={row.product || ""} onChange={(e) => handleRowChange(i, "product", e.target.value as string)} displayEmpty>
                    <MenuItem value="" disabled>Select product</MenuItem>
                    {getProducts.map((p) => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                </AppSelectOne>
            ),
        },
        { key: "quantity", header: "Qty", width: 90, render: (row, i) => <AppInput label="" type="number" value={row.quantity} onChange={(e) => handleRowChange(i, "quantity", e.target.value)} slotProps={{ htmlInput: { min: 1 } }} /> },
        { key: "price", header: "Unit Price", width: 110, render: (row, i) => <AppInput label="" type="number" value={row.price} onChange={(e) => handleRowChange(i, "price", e.target.value)} slotProps={{ htmlInput: { min: 0 } }} /> },
        { key: "subtotal", header: "Subtotal", width: 90, render: (row) => <AppText colorType="secondary">${row.subtotal.toFixed(2)}</AppText> },
        { key: "vat", header: "VAT", width: 90, render: (row) => <AppText colorType="secondary">${row.vat.toFixed(2)}</AppText> },
        { key: "total", header: "Total", width: 100, render: (row) => <AppText weight={700}>${row.total.toFixed(2)}</AppText> },
    ];

    const customerName = quotation.customer?.name || "—";
    const initials = customerName.slice(0, 2).toUpperCase();

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>

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
                    This quotation has been deleted.
                </AppAlert>
            )}

            {/* ── Action Bar ── */}
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

            {/* ── Hero ── */}
            <Box sx={{
                border: `1.5px solid ${COLORS.border}`, borderRadius: "18px", mb: 3, overflow: "hidden",
                boxShadow: `0 8px 24px -4px ${COLORS.shadow}`,
                background: `linear-gradient(135deg, ${mix(COLORS.primary, 0.08)} 0%, ${COLORS.card} 60%)`,
            }}>
                <Box sx={{ p: 3, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2.5, alignItems: { xs: "flex-start", sm: "center" } }}>
                    <AppAvatar sx={{ width: 76, height: 76, fontSize: "26px" }}>{initials}</AppAvatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                            <RequestQuoteOutlinedIcon sx={{ fontSize: 16, color: COLORS.primary }} />
                            <AppText colorType="secondary" sx={{ fontFamily: "monospace" }}>{quotation.quotationNumber}</AppText>
                        </Box>
                        <AppText weight={800} sx={{ fontSize: "24px", letterSpacing: "-0.02em" }}>{customerName}</AppText>
                    </Box>
                    <AppChip
                        label={form.status?.toUpperCase()}
                        colorType={form.status === "accepted" ? "success" : form.status === "rejected" || form.status === "expired" ? "error" : form.status === "sent" ? "info" : "default"}
                    />
                </Box>
            </Box>

            {/* ── Body ── */}
            <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", alignItems: "flex-start" }}>
                <Box sx={{ flex: "1 1 480px", minWidth: 0 }}>
                    <Box sx={{ mb: 2.5 }}>
                        <AppCard title="Quotation Details">
                            {editMode ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <AppSelectOne label="Customer" value={form.customer} onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value as string }))}>
                                        {getCustomer.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                                    </AppSelectOne>
                                    <Box sx={{ display: "flex", gap: 2 }}>
                                        <AppInput label="Currency" value={form.currency} onChange={setField("currency")} />
                                        <AppInput label="Exchange Rate" type="number" value={form.exchangeRate} onChange={setField("exchangeRate")} slotProps={{ htmlInput: { min: 0, step: "0.0001" } }} />
                                    </Box>
                                    <AppDatePicker label="Valid Until" value={form.validUntil} onChange={(v) => setForm((f) => ({ ...f, validUntil: v }))} />
                                    <AppInput label="Notes" value={form.note} onChange={setField("note")} multiline minRows={2} />
                                </Box>
                            ) : (
                                <>
                                    <AppInfoRow label="Currency" value={quotation.currency} />
                                    <AppInfoRow label="Exchange Rate" value={quotation.exchangeRate} />
                                    <AppInfoRow label="Valid Until" value={quotation.validUntil ? DateTime.fromISO(quotation.validUntil).toFormat("dd LLL yyyy") : "—"} />
                                    <AppInfoRow label="Notes" value={quotation.note || "—"} />
                                </>
                            )}
                        </AppCard>
                    </Box>

                    <AppCard title="Line Items">
                        {editMode ? (
                            <AppLineItemsTable columns={editableColumns} rows={editRows} onAddRow={handleAddRow} onDeleteRow={handleDeleteRow} />
                        ) : (
                            <AppLineItemsTable columns={readOnlyColumns} rows={viewRows} emptyLabel="No line items" />
                        )}
                    </AppCard>
                </Box>

                <Box sx={{ flex: "0 0 280px" }}>
                    <Box sx={{ mb: 2.5 }}>
                        <AppCard title="Status">
                            <AppSelectOne label="Status" value={form.status} onChange={handleStatusChange}>
                                {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
                            </AppSelectOne>
                        </AppCard>
                    </Box>

                    <AppCard title="Summary">
                        {editMode && calcLoading && <AppText colorType="secondary" sx={{ mb: 1 }}>Recalculating…</AppText>}
                        <AppSummaryRow label="Subtotal" value={totals.subTotal} prefix="$" />
                        <AppSummaryRow label="VAT" value={totals.vat} prefix="$" />
                        {editMode ? (
                            <AppSummaryRow label="Discount (%)" value={form.discount} editable onChange={(v) => setForm((f) => ({ ...f, discount: v }))} suffix="%" />
                        ) : (
                            <AppSummaryRow label="Discount Amount" value={totals.discountAmount} prefix="-$" />
                        )}
                        <AppSummaryRow label="Grand Total" value={totals.grandTotal} prefix="$" emphasis />
                    </AppCard>
                </Box>
            </Box>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <AppAlert severity={snack.type} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
                    {snack.msg}
                </AppAlert>
            </Snackbar>
        </Box>
    );
}
