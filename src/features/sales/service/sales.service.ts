import * as repo from "../repository/sales.repository";
import type { CreateSale, Sale, SaleItem } from "../types/sales.types";

export const salesService = {
	async findAll(
		limit: number,
		offset: number,
		date?: { from?: string; to?: string; timeFrom?: string; timeTo?: string },
	) {
		return repo.getAllSales(limit, offset, date);
	},

	async count(date?: {
		from?: string;
		to?: string;
		timeFrom?: string;
		timeTo?: string;
	}) {
		return repo.getSalesCount(date);
	},

	async getItems(saleId: number) {
		return repo.getSaleItems(saleId);
	},

	async create(sale: CreateSale) {
		return repo.createSale(sale);
	},

	async exportAll(): Promise<Sale[]> {
		return repo.getAllSalesForExport();
	},

	async exportAllItems(): Promise<SaleItem[]> {
		return repo.getAllSaleItemsForExport();
	},
};
