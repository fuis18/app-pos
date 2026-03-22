import Papa from "papaparse";
import { productService } from "./products.service";

export async function exportProductsCsv(): Promise<string> {
	const fileName = "productos.csv";
	const products = await productService.exportAll();

	const csv = Papa.unparse(products, {
		columns: ["id", "code", "name", "price"],
	});

	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	a.click();

	URL.revokeObjectURL(url);
	return fileName;
}
