"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { exportSalesExcel } from "../service/exportSalesExcel";
import { exportSalesCsv } from "../service/exportSalesCsv";

type ExportFormat = "excel" | "csv";
type ExportMode = "range" | "all";

interface SalesExportDialogProps {
	children?: React.ReactNode;
	dateRange?: {
		from?: string;
		to?: string;
		timeFrom?: string;
		timeTo?: string;
	};
}

const SalesExportDialog = ({ children, dateRange }: SalesExportDialogProps) => {
	const [open, setOpen] = useState(false);
	const [format, setFormat] = useState<ExportFormat>("excel");
	const [mode, setMode] = useState<ExportMode>("range");
	const [loading, setLoading] = useState(false);
	const [successFile, setSuccessFile] = useState<string | null>(null);

	const handleExport = async () => {
		setLoading(true);
		setSuccessFile(null);
		try {
			const date = mode === "range" ? dateRange : undefined;
			const name =
				format === "excel"
					? await exportSalesExcel(date)
					: await exportSalesCsv(date);
			setSuccessFile(name);
		} catch (err) {
			console.error("Error al exportar ventas:", err);
		} finally {
			setLoading(false);
		}
	};

	const rangeLabel =
		dateRange?.from && dateRange?.to
			? `${dateRange.from} → ${dateRange.to}${dateRange.timeFrom && dateRange.timeTo ? ` (${dateRange.timeFrom} - ${dateRange.timeTo})` : ""}`
			: null;

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				setOpen(v);
				if (!v) setSuccessFile(null);
			}}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>Exportar ventas</DialogTitle>
				</DialogHeader>

				<div className="flex rounded-md border border-border overflow-hidden">
					<button
						type="button"
						className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
							mode === "range"
								? "bg-primary text-primary-foreground"
								: "bg-muted/50 text-muted-foreground hover:bg-muted"
						}`}
						onClick={() => setMode("range")}
					>
						Exportar por rango
					</button>
					<button
						type="button"
						className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
							mode === "all"
								? "bg-primary text-primary-foreground"
								: "bg-muted/50 text-muted-foreground hover:bg-muted"
						}`}
						onClick={() => setMode("all")}
					>
						Exportar todos
					</button>
				</div>

				{mode === "range" && rangeLabel && (
					<p className="text-xs text-muted-foreground text-center">
						{rangeLabel}
					</p>
				)}

				{mode === "range" && !rangeLabel && (
					<p className="text-xs text-destructive text-center">
						No hay rango de fechas seleccionado
					</p>
				)}

				<div className="flex flex-col gap-2">
					<label
						className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
							format === "excel"
								? "border-primary bg-primary/5"
								: "border-border"
						}`}
					>
						<input
							type="radio"
							name="export-format-sales"
							value="excel"
							checked={format === "excel"}
							onChange={() => setFormat("excel")}
							className="accent-primary"
						/>
						<div>
							<p className="text-sm font-medium">Excel</p>
							<p className="text-xs text-muted-foreground">
								Libro de Excel (.xlsx) — 2 hojas: Sales y SaleItems
							</p>
						</div>
					</label>

					<label
						className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
							format === "csv" ? "border-primary bg-primary/5" : "border-border"
						}`}
					>
						<input
							type="radio"
							name="export-format-sales"
							value="csv"
							checked={format === "csv"}
							onChange={() => setFormat("csv")}
							className="accent-primary"
						/>
						<div>
							<p className="text-sm font-medium">CSV</p>
							<p className="text-xs text-muted-foreground">
								2 archivos separados: ventas.csv + ventas_detalle.csv
							</p>
						</div>
					</label>
				</div>

				{successFile && (
					<p className="text-sm text-green-600 font-medium">
						Archivo Creado Correctamente: {successFile}
					</p>
				)}

				<DialogFooter>
					<Button
						onClick={handleExport}
						disabled={loading || (mode === "range" && !rangeLabel)}
						className="w-full"
					>
						{loading ? "Exportando..." : "Exportar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default SalesExportDialog;
