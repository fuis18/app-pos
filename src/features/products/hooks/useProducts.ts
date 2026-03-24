import { useEffect, useState } from "react";
import type { Product } from "../types/products.types";
import { CONFIG } from "@/constants/config";
import { usePagination } from "@/hooks/usePagination";
import { productService } from "../service/products.service";
import { useUserStore } from "@/store/userStore";

const useProducts = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const { user } = useUserStore();
	// --------------------
	// PAGINATION
	// --------------------
	const [totalPages, setTotalPages] = useState(1);
	const { page, setPage } = usePagination(totalPages);

	const limit = CONFIG.LIMIT;
	const offset = (page - 1) * limit;

	const reloadProducts = async () => {
		const { data, total } = await productService.findAll(limit, offset, !!user);

		setProducts(data);
		setTotalPages(Math.ceil(total / limit));
	};

	const reloadAll = async () => {
		await Promise.all([reloadProducts()]);
	};

	// --------------------
	// ACTIONS
	// --------------------
	const handleSoftDelete = async (id: number) => {
		await productService.softDelete(id);
		reloadProducts();
	};

	const handleHardDelete = async (id: number) => {
		await productService.hardDelete(id);
		reloadProducts();
	};

	const handleReactivate = async (id: number) => {
		await productService.reactive(id);
		reloadProducts();
	};

	// --------------------
	// BATCH ACTIONS
	// --------------------
	const handleBatchSoftDelete = async (ids: number[]) => {
		await productService.softDeleteBatch(ids);
		reloadProducts();
	};

	const handleBatchReactivate = async (ids: number[]) => {
		await productService.reactiveBatch(ids);
		reloadProducts();
	};

	const handleBatchHardDelete = async (ids: number[]) => {
		await productService.hardDeleteBatch(ids);
		reloadProducts();
	};

	// --------------------
	// EFFECTS
	// --------------------
	useEffect(() => {
		const fetchProducts = async () => {
			const { data, total } = await productService.findAll(
				limit,
				offset,
				!!user,
			);

			setProducts(data);
			setTotalPages(Math.ceil(total / limit));
		};

		fetchProducts();
	}, [limit, offset, user]);

	return {
		// data
		products,
		// pagination
		page,
		setPage,
		totalPages,
		// actions
		reloadAll,
		handleSoftDelete,
		handleHardDelete,
		handleReactivate,
		// batch actions
		handleBatchSoftDelete,
		handleBatchReactivate,
		handleBatchHardDelete,
	};
};
export default useProducts;
