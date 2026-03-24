import * as XLSX from "xlsx";
import { salesService } from "./sales.service";
import { saveFileAs } from "@/lib/saveFile";

export async function exportSalesExcel(date?: {
	from?: string;
	to?: string;
	timeFrom?: string;
	timeTo?: string;
}): Promise<string | null> {
	const [sales, items] = await Promise.all([
		salesService.exportAll(date),
		salesService.exportAllItems(date),
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

	return saveFileAs({
		defaultName: "ventas.xlsx",
		filters: [{ name: "Excel", extensions: ["xlsx"] }],
		content: new Uint8Array(buffer),
	});
}
