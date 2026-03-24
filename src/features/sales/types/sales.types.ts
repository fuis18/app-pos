// src/features/sales/types/sales.types.ts
import type { ColumnDef } from "@tanstack/react-table";

export interface Sale {
	id: number;
	date: string;
	total: number;
}

export interface CreateSaleItem {
	product_id: number;
	quantity: number;
	price: number;
}

export interface CreateSale {
	total: number;
	items: CreateSaleItem[];
}

export interface SaleItem {
	id: number;
	sale_id: number;
	product_id: number;
	quantity: number;
	price_at_sale: number;
	name?: string;
	code?: string;
}

export interface SaleReport {
	id: number;
	sale_id: number;
	reason: string;
	reported_at: string;
}

export interface SalesTableProps {
	data: Sale[];
	columns: ColumnDef<Sale>[];
	meta?: Record<string, unknown>;
	onRowClick?: (saleId: number) => void;
	reportedSaleIds?: Set<number>;
}
