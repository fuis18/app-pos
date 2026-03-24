// src/components/dialogs/ProductImportDialog.tsx
"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	createProduct,
	getProductByCode,
	updateProduct,
} from "@/features/products/repository/products.repository";
import { parseProductsFile } from "../service/parseProductsFile";

interface ImportDialogProps {
	children?: React.ReactNode;
	onFileUpload?: (file: File) => void;
	onImportSuccess?: () => void;
}

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

function isAcceptedFile(file: File): boolean {
	return ACCEPTED_EXTENSIONS.some((ext) =>
		file.name.toLowerCase().endsWith(ext),
	);
}

const ImportDialog = ({
	children,
	onFileUpload,
	onImportSuccess,
}: ImportDialogProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [open, setOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [dragging, setDragging] = useState(false);

	const selectFile = (f: File) => {
		if (!isAcceptedFile(f)) {
			setError("Formato no soportado. Usa .csv, .xlsx o .xls");
			return;
		}
		setError(null);
		setFile(f);
		onFileUpload?.(f);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.files?.[0];
		if (selected) selectFile(selected);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragging(false);
		const dropped = e.dataTransfer.files[0];
		if (dropped) selectFile(dropped);
	};

	const handleImport = async () => {
		if (!file) return;

		setLoading(true);
		setError(null);

		try {
			const rows = await parseProductsFile(file);

			let imported = 0;
			let updated = 0;
			let skipped = 0;

			for (const row of rows) {
				const code = Number(row.code);
				const name = row.name;
				const price = Number(row.price);
				const existing = await getProductByCode(code);

				if (existing) {
					const sameName = existing.name === name;
					const samePrice = existing.price === price;

					if (sameName && samePrice) {
						skipped++;
						continue;
					}

					await updateProduct(existing.id, {
						...(!sameName && { name }),
						...(!samePrice && { price }),
					});
					updated++;
					continue;
				}

				await createProduct({ code, name, price });
				imported++;
			}

			alert(
				`Importación completada: ${imported} importados, ${updated} actualizados, ${skipped} omitidos (sin cambios)`,
			);
			onImportSuccess?.();
			setOpen(false);
			setFile(null);
		} catch (err) {
			setError("Error al importar productos. Revisa tu archivo.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="max-w-md">
				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={`mt-4 flex flex-col gap-2 items-center justify-center border-2 border-dashed p-8 rounded transition-colors ${
						dragging ? "border-primary bg-primary/5" : "border-gray-300"
					}`}
				>
					<p className="text-sm text-gray-500 pointer-events-none">
						Arrastra un archivo CSV o Excel aquí
					</p>
				</div>

				<input
					ref={inputRef}
					type="file"
					accept=".csv,.xlsx,.xls"
					className="hidden"
					onChange={handleFileChange}
				/>
				<Button
					variant="outline"
					className="w-full"
					onClick={() => inputRef.current?.click()}
				>
					Buscar en el dispositivo
				</Button>

				{file && (
					<p className="text-sm text-green-600">
						Archivo seleccionado: {file.name}
					</p>
				)}
				{error && <p className="text-sm text-red-600">{error}</p>}

				<Button disabled={!file || loading} onClick={handleImport}>
					{loading ? "Importando..." : "Importar"}
				</Button>
			</DialogContent>
		</Dialog>
	);
};

export default ImportDialog;
