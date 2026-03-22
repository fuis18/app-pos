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

interface SalesExportDialogProps {
	children?: React.ReactNode;
}

const SalesExportDialog = ({ children }: SalesExportDialogProps) => {
	const [open, setOpen] = useState(false);
	const [format, setFormat] = useState<ExportFormat>("excel");
	const [loading, setLoading] = useState(false);
	const [successFile, setSuccessFile] = useState<string | null>(null);

	const handleExport = async () => {
		setLoading(true);
		setSuccessFile(null);
		try {
			const name =
				format === "excel" ? await exportSalesExcel() : await exportSalesCsv();
			setSuccessFile(name);
		} catch (err) {
			console.error("Error al exportar ventas:", err);
		} finally {
			setLoading(false);
		}
	};

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
					<Button onClick={handleExport} disabled={loading} className="w-full">
						{loading ? "Exportando..." : "Exportar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default SalesExportDialog;
