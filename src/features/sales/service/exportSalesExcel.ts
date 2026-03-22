import * as XLSX from "xlsx";
import { salesService } from "./sales.service";

export async function exportSalesExcel(): Promise<string> {
	const fileName = "ventas.xlsx";
	const [sales, items] = await Promise.all([
		salesService.exportAll(),
		salesService.exportAllItems(),
	]);

	const workbook = XLSX.utils.book_new();

	const salesSheet = XLSX.utils.json_to_sheet(sales, {
		header: ["id", "date", "total"],
	});
	XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales");

	const itemsSheet = XLSX.utils.json_to_sheet(items, {
		header: [
			"id",
			"sale_id",
			"product_id",
			"code",
			"name",
			"quantity",
			"price_at_sale",
		],
	});
	XLSX.utils.book_append_sheet(workbook, itemsSheet, "SaleItems");

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
