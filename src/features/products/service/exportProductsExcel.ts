import * as XLSX from "xlsx";
import { productService } from "./products.service";

export async function exportProductsExcel(): Promise<string> {
	const fileName = "productos.xlsx";
	const products = await productService.exportAll();

	const worksheet = XLSX.utils.json_to_sheet(products, {
		header: ["id", "code", "name", "price"],
	});
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

	const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
	const blob = new Blob([buffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	a.click();

	URL.revokeObjectURL(url);
	return fileName;
}
