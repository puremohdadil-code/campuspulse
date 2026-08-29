import { useEffect, useState, useMemo } from 'react';
import { Box, MenuItem, Snackbar, LinearProgress } from "@mui/material";
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import { DateTime } from "luxon";
import { BASE_URL } from "../../../../config";
import Swal from 'sweetalert2';
import useServerCalculation from "../../../../utils/useServerCalculation";
import {
    AppCard, AppInput, AppSelectOne, AppDatePicker, AppButton, AppAlert, AppText,
    AppDivider, AppLineItemsTable, AppSummaryRow, COLORS, mix, RADIUS,
} from "../../../../components/common";
import type { AppLineItemColumn } from "../../../../components/common";

const swalTheme = {
    confirmButtonColor: COLORS.primary,
    cancelButtonColor: COLORS.textLight,
};

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

interface QuotationRow {
    _id: string;
    id: string;
    product: string;
    quantity: number;
    price: number;
}

interface DisplayRow extends QuotationRow {
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
    baseCurrencyTotal?: number;
}

const emptyRow = (): QuotationRow => ({ _id: "", id: "", product: "", quantity: 1, price: 0 });

export default function SalesQuotation() {
    const [alert, setAlert] = useState<{ open: boolean; type: "success" | "error" | "info" | "warning"; message: string }>({ open: false, type: "info", message: "" });
    const [loading, setLoading] = useState(false);

    const [customer, setCustomer] = useState("");
    const [getCustomer, setGetCustomer] = useState<Customer[]>([]);
    const [getProducts, setGetProducts] = useState<Product[]>([]);

    const [currency, setCurrency] = useState("");
    const [exchangeRate, setExchangeRate] = useState<number | string>(1);
    const [validUntil, setValidUntil] = useState<DateTime | null>(null);
    const [note, setNote] = useState("");
    const [discount, setDiscount] = useState(0);

    const [rows, setRows] = useState<QuotationRow[]>([emptyRow()]);

    const showAlert = (type: "success" | "error", message: string) => setAlert({ open: true, type, message });

    /* ── Fetch initial data ──
       Reuses the same "create invoice" info endpoint — it already returns
       everything a quotation needs (customers), no separate endpoint required. */
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [infoRes, itemsRes] = await Promise.all([
                    fetch(`${BASE_URL}/sales/create_invoice/internalSales/info`, { credentials: "include" }),
                    fetch(`${BASE_URL}/item/roster`, { credentials: "include" }),
                ]);
                if (!infoRes.ok || !itemsRes.ok) throw new Error("Server error");
                const info = await infoRes.json();
                const itemsData = await itemsRes.json();
                setGetCustomer(info.data.customers || []);
                setGetProducts((itemsData.items || []).filter((i: Product) => i.status !== "INACTIVE" && i.status !== "DELETED"));
                showAlert("success", "Resources loaded successfully.");
            } catch {
                showAlert("error", "Failed to load resources. You cannot create a quotation at this time.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    /* ── Server-side calculation — same calculateSaleLineItems() the invoice
       preview and create_sales_quotation itself use, so the totals shown here
       can never disagree with what gets saved. ── */
    const validRows = useMemo(() => rows.filter(r => r._id), [rows]);
    const calcPayload = useMemo(() => ({
        products: validRows.map(r => r._id),
        quantities: validRows.map(r => Number(r.quantity || 0)),
        prices: validRows.map(r => Number(r.price || 0)),
        discountType: "percent",
        discount: Number(discount || 0),
        exchangeRate: Number(exchangeRate || 1),
    }), [validRows, discount, exchangeRate]);

    const { result: calc, loading: calcLoading } = useServerCalculation<typeof calcPayload, CalcResult>(
        "/sales/create_invoice/internalSales/calculate", calcPayload, { enabled: validRows.length > 0 }
    );

    const displayRows: DisplayRow[] = useMemo(() => {
        return rows.map(row => {
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

    const totals = useMemo(() => ({ subtotal: calc?.subTotal || 0, vat: calc?.vat || 0 }), [calc]);
    const discountAmount = calc?.discountAmount || 0;
    const grandTotal = calc?.grandTotal || calc?.total || 0;
    const baseCurrencyTotal = calc?.baseCurrencyTotal || 0;

    const handleChange = (index: number, field: "product" | "quantity" | "price", value: string) => {
        const updated = [...rows];
        updated[index] = { ...updated[index], [field]: field === "quantity" ? Number(value) : value };
        if (field === "product") {
            const product = getProducts.find(p => p._id === updated[index].product);
            if (product) {
                updated[index] = {
                    ...updated[index],
                    price: Number(product.sale_price || 0),
                    _id: product._id,
                    id: product.subid || "",
                };
            }
        }
        setRows(updated);
    };

    const handleAddRow = () => setRows([...rows, emptyRow()]);
    const handleDeleteRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

    const handleSubmit = async () => {
        if (!customer) {
            Swal.fire({ ...swalTheme, title: "Customer required", icon: "warning" });
            return;
        }
        if (validRows.length === 0) {
            Swal.fire({ ...swalTheme, title: "No Products Added", text: "Please add at least one product.", icon: "warning" });
            return;
        }

        setLoading(true);
        const payload = {
            customer,
            currency,
            exchangeRate: Number(exchangeRate || 1),
            products: validRows.map(r => r._id),
            quantities: validRows.map(r => Number(r.quantity || 0)),
            prices: validRows.map(r => Number(r.price || 0)),
            discountType: "percent",
            discount: Number(discount || 0),
            validUntil: validUntil?.toISODate() ?? null,
            note,
        };

        try {
            const response = await fetch(`${BASE_URL}/sales/quotation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (response.ok) {
                Swal.fire({ ...swalTheme, title: "Quotation Created!", text: result.message, icon: "success" });
                setCustomer(""); setRows([emptyRow()]);
                setDiscount(0); setNote(""); setValidUntil(null);
            } else {
                Swal.fire({ ...swalTheme, icon: "error", title: "Failed to Save Quotation", text: result.message });
            }
        } catch {
            Swal.fire({ ...swalTheme, icon: "error", title: "Network Error", text: "Unable to connect to the server." });
        } finally {
            setLoading(false);
        }
    };

    const lineItemColumns: AppLineItemColumn<DisplayRow>[] = [
        {
            key: "id", header: "Product ID", width: 110,
            render: (row) => <AppInput label="" value={row.id} disabled placeholder="Auto" />,
        },
        {
            key: "product", header: "Product",
            render: (row, i) => (
                <AppSelectOne label="" value={row.product || ""} onChange={(e) => handleChange(i, "product", e.target.value as string)} displayEmpty>
                    <MenuItem value="" disabled>Select product</MenuItem>
                    {getProducts.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                </AppSelectOne>
            ),
        },
        {
            key: "quantity", header: "Qty", width: 90,
            render: (row, i) => (
                <AppInput label="" type="number" value={row.quantity} onChange={(e) => handleChange(i, "quantity", e.target.value)} slotProps={{ htmlInput: { min: 1 } }} />
            ),
        },
        {
            key: "price", header: "Unit Price", width: 110,
            render: (row, i) => (
                <AppInput label="" type="number" value={row.price} onChange={(e) => handleChange(i, "price", e.target.value)} slotProps={{ htmlInput: { min: 0 } }} />
            ),
        },
        { key: "subtotal", header: "Subtotal", width: 90, render: (row) => <AppText colorType="secondary">${row.subtotal.toFixed(2)}</AppText> },
        { key: "discount", header: "Discount", width: 90, render: (row) => <AppText colorType="secondary">${row.discount.toFixed(2)}</AppText> },
        { key: "vat", header: "VAT", width: 90, render: (row) => <AppText colorType="secondary">${row.vat.toFixed(2)}</AppText> },
        { key: "total", header: "Total", width: 100, render: (row) => <AppText weight={700}>${row.total.toFixed(2)}</AppText> },
    ];

    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", width: "100%", minWidth: 0, gap: 3, p: 2, boxSizing: "border-box" }}>
            <Box sx={{ flex: "1 1 640px", minWidth: 0 }}>
                <AppCard>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
                        <Box>
                            <Box sx={{
                                width: 64, height: 64, borderRadius: RADIUS, mb: 1,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                backgroundColor: mix(COLORS.primary, 0.12), color: COLORS.primary,
                                fontWeight: 800, fontSize: "1.4rem",
                            }}>
                                E
                            </Box>
                            <AppText weight={600}>Eagle Corporation</AppText>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 240 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <RequestQuoteOutlinedIcon sx={{ fontSize: 18, color: COLORS.primary }} />
                                <AppText weight={700} sx={{ fontSize: "1.1rem" }}>Sales Quotation</AppText>
                            </Box>

                            <AppDatePicker label="Valid Until" value={validUntil} onChange={setValidUntil} />

                            <Box sx={{ display: "flex", gap: 1 }}>
                                <AppInput label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
                                <AppInput label="Exchange Rate" type="number" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} slotProps={{ htmlInput: { min: 0, step: "0.0001" } }} />
                            </Box>
                        </Box>
                    </Box>

                    <AppDivider sx={{ mb: 3 }} />

                    <Box sx={{ maxWidth: 320, mb: 3 }}>
                        <AppSelectOne label="Select Customer *" value={customer} onChange={(e) => setCustomer(e.target.value as string)}>
                            {getCustomer.length > 0
                                ? getCustomer.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)
                                : <MenuItem disabled>No customers found</MenuItem>}
                        </AppSelectOne>
                    </Box>

                    <AppLineItemsTable
                        columns={lineItemColumns}
                        rows={displayRows}
                        onAddRow={handleAddRow}
                        onDeleteRow={handleDeleteRow}
                        addLabel="Add Row"
                    />

                    <AppInput label="Notes (optional)" multiline rows={2} value={note} onChange={(e) => setNote(e.target.value)} sx={{ mt: 3 }} />

                    <Box sx={{ mt: 4, maxWidth: 380, ml: "auto" }}>
                        <AppText weight={700} colorType="secondary" sx={{ letterSpacing: "0.08em", textTransform: "uppercase", mb: 1 }}>
                            Summary
                        </AppText>
                        {calcLoading && <LinearProgress sx={{ mb: 1.5, borderRadius: 1, height: 3 }} />}
                        <AppSummaryRow label="Subtotal" value={totals.subtotal} prefix="$" />
                        <AppSummaryRow label="VAT" value={totals.vat} prefix="$" />
                        <AppSummaryRow label="Discount (%)" value={discount} editable onChange={setDiscount} suffix="%" />
                        {discount > 0 && <AppSummaryRow label="Discount Amount" value={-discountAmount} prefix="-$" />}
                        {Number(exchangeRate) !== 1 && (
                            <AppAlert severity="info" sx={{ my: 1 }}>
                                Base currency total: <strong>${baseCurrencyTotal.toFixed(2)}</strong>
                            </AppAlert>
                        )}
                        <AppSummaryRow label="Grand Total" value={grandTotal} prefix="$" emphasis />
                    </Box>
                </AppCard>
            </Box>

            <Box sx={{ flex: "0 1 260px", minWidth: 0 }}>
                <AppCard title="Actions">
                    <AppButton startIcon={<SaveOutlinedIcon />} onClick={handleSubmit} loading={loading} sx={{ width: "100%" }}>
                        {loading ? "Saving…" : "Save Quotation"}
                    </AppButton>
                </AppCard>
            </Box>

            <Snackbar open={alert.open} autoHideDuration={4000} onClose={() => setAlert(a => ({ ...a, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <AppAlert severity={alert.type} onClose={() => setAlert(a => ({ ...a, open: false }))}>
                    {alert.message}
                </AppAlert>
            </Snackbar>
        </Box>
    );
}
