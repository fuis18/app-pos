import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import ProductDialog from "./ProductDialog";
import ImportDialog from "./ProductImportDialog";
import ProductExportDialog from "./ProductExportDialog";
import { useUserStore } from "@/store/userStore";
import type { Product } from "../types/products.types";

interface ProductsOptionsProps {
	loadProducts: () => Promise<void>;
	selectedRows: Product[];
	onBatchSoftDelete: (ids: number[]) => Promise<void>;
	onBatchReactivate: (ids: number[]) => Promise<void>;
	onBatchHardDelete: (ids: number[]) => Promise<void>;
}

const ProductsOptions = ({
	loadProducts,
	selectedRows,
	onBatchSoftDelete,
	onBatchReactivate,
	onBatchHardDelete,
}: ProductsOptionsProps) => {
	const { user } = useUserStore();
	const hasSelection = selectedRows.length > 0;

	const allActive = hasSelection && selectedRows.every((r) => r.state);
	const allInactive = hasSelection && selectedRows.every((r) => !r.state);

	const handleBatchInactivate = () => {
		onBatchSoftDelete(selectedRows.map((r) => r.id));
	};

	const handleBatchActivate = () => {
		onBatchReactivate(selectedRows.map((r) => r.id));
	};

	const handleBatchDelete = () => {
		onBatchHardDelete(selectedRows.map((r) => r.id));
	};

	return (
		<div className="flex flex-col gap-2">
			<ButtonGroup orientation="vertical" className="h-fit">
				<ProductDialog onSuccess={loadProducts}>
					<Button>Crear</Button>
				</ProductDialog>

				<ImportDialog onImportSuccess={loadProducts}>
					<Button variant="outline">Importar</Button>
				</ImportDialog>

				<ProductExportDialog>
					<Button variant="outline">Exportar</Button>
				</ProductExportDialog>
			</ButtonGroup>

			{user && hasSelection && (
				<ButtonGroup orientation="vertical" className="h-fit">
					<Button variant="destructive" onClick={handleBatchDelete}>
						Eliminar ({selectedRows.length})
					</Button>

					{allActive && (
						<Button
							variant="outline"
							className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
							onClick={handleBatchInactivate}
						>
							Inactivar ({selectedRows.length})
						</Button>
					)}

					{allInactive && (
						<Button
							variant="outline"
							className="text-green-600 border-green-600 hover:bg-green-50"
							onClick={handleBatchActivate}
						>
							Activar ({selectedRows.length})
						</Button>
					)}
				</ButtonGroup>
			)}
		</div>
	);
};

export default ProductsOptions;
