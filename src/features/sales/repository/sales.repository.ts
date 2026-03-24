// src\features\sales\sales.repository.ts
import { execute, insert, select, type DbParam } from "@/database/index.ts";
import type {
	CreateSale,
	Sale,
	SaleItem,
	SaleReport,
} from "../types/sales.types";

export async function getAllSales(
	limit: number,
	offset: number,
	date?: { from?: string; to?: string; timeFrom?: string; timeTo?: string },
): Promise<Sale[]> {
	let query = `
    SELECT id, date, total
    FROM sales
  `;

	const params: DbParam[] = [];

	const where: string[] = [];
	if (date?.from && date?.to) {
		where.push("date(date, 'localtime') BETWEEN date(?) AND date(?)");
		params.push(date.from, date.to);
	}
	if (date?.timeFrom && date?.timeTo) {
		where.push("time(date, 'localtime') BETWEEN time(?) AND time(?)");
		params.push(date.timeFrom, date.timeTo);
	}
	if (where.length) {
		query += ` WHERE ${where.join(" AND ")}`;
	}

	query += ` ORDER BY date DESC LIMIT ? OFFSET ?`;
	params.push(limit, offset);

	return select<Sale>(query, params);
}

export async function getSaleItems(saleId: number): Promise<SaleItem[]> {
	return select<SaleItem>(
		`SELECT si.id, si.sale_id, si.product_id, si.quantity, si.price_at_sale, p.name, p.code
     FROM sales_items si
     JOIN products p ON p.id = si.product_id
     WHERE si.sale_id = $1`,
		[saleId],
	);
}

export async function getSalesCount(date?: {
	from?: string;
	to?: string;
	timeFrom?: string;
	timeTo?: string;
}): Promise<number> {
	let query = "SELECT COUNT(*) as count FROM sales";
	const params: DbParam[] = [];

	const where: string[] = [];
	if (date?.from && date?.to) {
		where.push("date(date, 'localtime') BETWEEN date(?) AND date(?)");
		params.push(date.from, date.to);
	}
	if (date?.timeFrom && date?.timeTo) {
		where.push("time(date, 'localtime') BETWEEN time(?) AND time(?)");
		params.push(date.timeFrom, date.timeTo);
	}
	if (where.length) {
		query += ` WHERE ${where.join(" AND ")}`;
	}

	const result = await select<{ count: number }>(query, params);
	return result[0].count;
}

export async function getSalesTotal(date?: {
	from?: string;
	to?: string;
	timeFrom?: string;
	timeTo?: string;
}): Promise<number> {
	let query = `
		SELECT COALESCE(SUM(s.total), 0) as total
		FROM sales s
		LEFT JOIN sale_reports sr ON sr.sale_id = s.id
		WHERE sr.sale_id IS NULL
	`;
	const params: DbParam[] = [];

	const where: string[] = [];
	if (date?.from && date?.to) {
		where.push("date(s.date, 'localtime') BETWEEN date(?) AND date(?)");
		params.push(date.from, date.to);
	}
	if (date?.timeFrom && date?.timeTo) {
		where.push("time(s.date, 'localtime') BETWEEN time(?) AND time(?)");
		params.push(date.timeFrom, date.timeTo);
	}
	if (where.length) {
		query += ` AND ${where.join(" AND ")}`;
	}

	const result = await select<{ total: number }>(query, params);
	return result[0].total;
}

export async function getAllSalesForExport(date?: {
	from?: string;
	to?: string;
	timeFrom?: string;
	timeTo?: string;
}): Promise<Sale[]> {
	let query = "SELECT id, date, total FROM sales";
	const params: DbParam[] = [];

	const where: string[] = [];
	if (date?.from && date?.to) {
		where.push("date(date, 'localtime') BETWEEN date(?) AND date(?)");
		params.push(date.from, date.to);
	}
	if (date?.timeFrom && date?.timeTo) {
		where.push("time(date, 'localtime') BETWEEN time(?) AND time(?)");
		params.push(date.timeFrom, date.timeTo);
	}
	if (where.length) {
		query += ` WHERE ${where.join(" AND ")}`;
	}

	query += " ORDER BY date DESC";
	return select<Sale>(query, params);
}

export async function getAllSaleItemsForExport(date?: {
	from?: string;
	to?: string;
	timeFrom?: string;
	timeTo?: string;
}): Promise<SaleItem[]> {
	let query = `SELECT si.id, si.sale_id, si.product_id, si.quantity, si.price_at_sale, p.name, p.code
     FROM sales_items si
     JOIN products p ON p.id = si.product_id`;
	const params: DbParam[] = [];

	const where: string[] = [];
	if (date?.from && date?.to) {
		where.push("date(s.date, 'localtime') BETWEEN date(?) AND date(?)");
		params.push(date.from, date.to);
	}
	if (date?.timeFrom && date?.timeTo) {
		where.push("time(s.date, 'localtime') BETWEEN time(?) AND time(?)");
		params.push(date.timeFrom, date.timeTo);
	}
	if (where.length) {
		query += " JOIN sales s ON s.id = si.sale_id";
		query += ` WHERE ${where.join(" AND ")}`;
	}

	query += " ORDER BY si.sale_id";
	return select<SaleItem>(query, params);
}

export async function createSale(sale: CreateSale) {
	try {
		const saleId = await insert("INSERT INTO sales (total) VALUES ($1)", [
			sale.total,
		]);

		for (const item of sale.items) {
			await execute(
				`INSERT INTO sales_items (sale_id, product_id, quantity, price_at_sale)
         VALUES ($1, $2, $3, $4)`,
				[saleId, item.product_id, item.quantity, item.price],
			);
		}

		return saleId;
	} catch (err) {
		console.error(err);
		throw err;
	}
}

export async function createSaleReport(
	saleId: number,
	reason: string,
): Promise<number> {
	return insert("INSERT INTO sale_reports (sale_id, reason) VALUES ($1, $2)", [
		saleId,
		reason,
	]);
}

export async function getReportedSaleIds(): Promise<Set<number>> {
	const rows = await select<{ sale_id: number }>(
		"SELECT sale_id FROM sale_reports",
	);
	return new Set(rows.map((r) => r.sale_id));
}

export async function getSaleReport(
	saleId: number,
): Promise<SaleReport | null> {
	const rows = await select<SaleReport>(
		"SELECT id, sale_id, reason, reported_at FROM sale_reports WHERE sale_id = $1",
		[saleId],
	);
	return rows[0] ?? null;
}

export async function cancelSaleReport(saleId: number): Promise<void> {
	await execute("DELETE FROM sale_reports WHERE sale_id = $1", [saleId]);
}

export async function deleteSale(saleId: number): Promise<void> {
	await execute("DELETE FROM sale_reports WHERE sale_id = $1", [saleId]);
	await execute("DELETE FROM sales_items WHERE sale_id = $1", [saleId]);
	await execute("DELETE FROM sales WHERE id = $1", [saleId]);
}
