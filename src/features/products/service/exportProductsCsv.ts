import Papa from "papaparse";
import { productService } from "./products.service";
import { saveFileAs } from "@/lib/saveFile";

export async function exportProductsCsv(): Promise<string | null> {
	const products = await productService.exportAll();

	const csv = Papa.unparse(products, {
		columns: ["id", "code", "name", "price"],
	});

	return saveFileAs({
		defaultName: "productos.csv",
		filters: [{ name: "CSV", extensions: ["csv"] }],
		content: new TextEncoder().encode(csv),
	});
}
