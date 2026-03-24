import * as repo from "../repository/products.repository";

export const productService = {
	async findByCode(code: number) {
		return repo.getProductByCode(code);
	},

	async findByName(name: string) {
		return repo.getProductByName(name);
	},

	async findByLike(name: string) {
		if (!name.trim()) return [];
		return repo.getProductByLike(name);
	},

	async findAll(limit: number, offset: number, user: boolean) {
		const [data, total] = await Promise.all([
			user
				? repo.getAllProducts(limit, offset)
				: repo.getAllProductsActive(limit, offset),
			user ? repo.getProductsCount() : repo.getProductsCountActive(),
		]);
		return { data, total };
	},

	async exportAll() {
		return repo.getAllProductsForExport();
	},

	async reactive(id: number) {
		return repo.reactivateProduct(id);
	},

	async softDelete(id: number) {
		return repo.softDeleteProduct(id);
	},

	async hardDelete(id: number) {
		return repo.hardDeleteProduct(id);
	},

	async softDeleteBatch(ids: number[]) {
		return repo.softDeleteProducts(ids);
	},

	async reactiveBatch(ids: number[]) {
		return repo.reactivateProducts(ids);
	},

	async hardDeleteBatch(ids: number[]) {
		return repo.hardDeleteProducts(ids);
	},
};
