import { useState } from "react";
import PagTable from "@/components/PaginationTable";
import useProducts from "../hooks/useProducts";
import ProductsTable from "./ProductsTable";
import ProductsOptions from "./ProductsOptions";
import type { Product } from "../types/products.types";

export const ProductsPage = () => {
	const {
		products,
		page,
		setPage,
		totalPages,
		reloadAll,
		handleSoftDelete,
		handleHardDelete,
		handleReactivate,
		handleBatchSoftDelete,
		handleBatchReactivate,
		handleBatchHardDelete,
	} = useProducts();

	const [selectedRows, setSelectedRows] = useState<Product[]>([]);

	return (
		<main className="ProductsPage-container">
			<div>
				<ProductsTable
					data={products}
					meta={{
						onSoftDelete: handleSoftDelete,
						onHardDelete: handleHardDelete,
						onReactivate: handleReactivate,
						onEditSuccess: reloadAll,
					}}
					onSelectionChange={setSelectedRows}
				/>
				<PagTable page={page} setPage={setPage} totalPages={totalPages} />
			</div>
			<ProductsOptions
				loadProducts={reloadAll}
				selectedRows={selectedRows}
				onBatchSoftDelete={handleBatchSoftDelete}
				onBatchReactivate={handleBatchReactivate}
				onBatchHardDelete={handleBatchHardDelete}
			/>
		</main>
	);
};
