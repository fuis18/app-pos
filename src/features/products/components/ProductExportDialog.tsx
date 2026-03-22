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
import { exportProductsCsv } from "../service/exportProductsCsv";
import { exportProductsExcel } from "../service/exportProductsExcel";

type ExportFormat = "csv" | "excel";

interface ProductExportDialogProps {
	children?: React.ReactNode;
}

const ProductExportDialog = ({ children }: ProductExportDialogProps) => {
	const [open, setOpen] = useState(false);
	const [format, setFormat] = useState<ExportFormat>("csv");
	const [loading, setLoading] = useState(false);
	const [successFile, setSuccessFile] = useState<string | null>(null);

	const handleExport = async () => {
		setLoading(true);
		setSuccessFile(null);
		try {
			const name =
				format === "csv"
					? await exportProductsCsv()
					: await exportProductsExcel();
			setSuccessFile(name);
		} catch (err) {
			console.error("Error al exportar:", err);
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
					<DialogTitle>Exportar productos</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-2">
					<label
						className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
							format === "csv" ? "border-primary bg-primary/5" : "border-border"
						}`}
					>
						<input
							type="radio"
							name="export-format"
							value="csv"
							checked={format === "csv"}
							onChange={() => setFormat("csv")}
							className="accent-primary"
						/>
						<div>
							<p className="text-sm font-medium">CSV</p>
							<p className="text-xs text-muted-foreground">
								Archivo separado por comas (.csv)
							</p>
						</div>
					</label>

					<label
						className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
							format === "excel"
								? "border-primary bg-primary/5"
								: "border-border"
						}`}
					>
						<input
							type="radio"
							name="export-format"
							value="excel"
							checked={format === "excel"}
							onChange={() => setFormat("excel")}
							className="accent-primary"
						/>
						<div>
							<p className="text-sm font-medium">Excel</p>
							<p className="text-xs text-muted-foreground">
								Libro de Excel (.xlsx)
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

export default ProductExportDialog;
