import * as repo from "../repository/sales.repository";
import type {
	CreateSale,
	Sale,
	SaleItem,
	SaleReport,
} from "../types/sales.types";

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

	async exportAll(date?: {
		from?: string;
		to?: string;
		timeFrom?: string;
		timeTo?: string;
	}): Promise<Sale[]> {
		return repo.getAllSalesForExport(date);
	},

	async exportAllItems(date?: {
		from?: string;
		to?: string;
		timeFrom?: string;
		timeTo?: string;
	}): Promise<SaleItem[]> {
		return repo.getAllSaleItemsForExport(date);
	},

	async reportSale(saleId: number, reason: string): Promise<number> {
		return repo.createSaleReport(saleId, reason);
	},

	async getReportedSaleIds(): Promise<Set<number>> {
		return repo.getReportedSaleIds();
	},

	async getSaleReport(saleId: number): Promise<SaleReport | null> {
		return repo.getSaleReport(saleId);
	},

	async cancelSaleReport(saleId: number): Promise<void> {
		return repo.cancelSaleReport(saleId);
	},

	async deleteSale(saleId: number): Promise<void> {
		return repo.deleteSale(saleId);
	},
};
