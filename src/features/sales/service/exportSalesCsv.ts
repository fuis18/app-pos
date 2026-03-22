import Papa from "papaparse";
import { salesService } from "./sales.service";

export async function exportSalesCsv(): Promise<string> {
	const [sales, items] = await Promise.all([
		salesService.exportAll(),
		salesService.exportAllItems(),
	]);

	const salesCsv = Papa.unparse(sales, {
		columns: ["id", "date", "total"],
	});
	const itemsCsv = Papa.unparse(items, {
		columns: ["id", "sale_id", "product_id", "code", "name", "quantity", "price_at_sale"],
	});

	downloadCsv(salesCsv, "ventas.csv");
	downloadCsv(itemsCsv, "ventas_detalle.csv");

	return "ventas.csv + ventas_detalle.csv";
}

function downloadCsv(content: string, fileName: string) {
	const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	a.click();

	URL.revokeObjectURL(url);
}
