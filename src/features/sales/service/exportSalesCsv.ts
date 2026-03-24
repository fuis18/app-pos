import Papa from "papaparse";
import { salesService } from "./sales.service";
import { saveFileAs } from "@/lib/saveFile";

export async function exportSalesCsv(date?: {
	from?: string;
	to?: string;
	timeFrom?: string;
	timeTo?: string;
}): Promise<string | null> {
	const [sales, items] = await Promise.all([
		salesService.exportAll(date),
		salesService.exportAllItems(date),
	]);

	const salesCsv = Papa.unparse(sales, {
		columns: ["id", "date", "total"],
	});
	const itemsCsv = Papa.unparse(items, {
		columns: [
			"id",
			"sale_id",
			"product_id",
			"code",
			"name",
			"quantity",
			"price_at_sale",
		],
	});

	const csvFilter = [{ name: "CSV", extensions: ["csv"] }];

	const name1 = await saveFileAs({
		defaultName: "ventas.csv",
		filters: csvFilter,
		content: new TextEncoder().encode(salesCsv),
	});

	const name2 = await saveFileAs({
		defaultName: "ventas_detalle.csv",
		filters: csvFilter,
		content: new TextEncoder().encode(itemsCsv),
	});

	const saved = [name1, name2].filter(Boolean);
	return saved.length ? saved.join(" + ") : null;
}
