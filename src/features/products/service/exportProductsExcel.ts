import * as XLSX from "xlsx";
import { productService } from "./products.service";
import { saveFileAs } from "@/lib/saveFile";

export async function exportProductsExcel(): Promise<string | null> {
	const products = await productService.exportAll();

	const worksheet = XLSX.utils.json_to_sheet(products, {
		header: ["id", "code", "name", "price"],
	});
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

	const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

	return saveFileAs({
		defaultName: "productos.xlsx",
		filters: [{ name: "Excel", extensions: ["xlsx"] }],
		content: new Uint8Array(buffer),
	});
}
