import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import ProductDialog from "./ProductDialog";
import ImportDialog from "./ProductImportDialog";
import ProductExportDialog from "./ProductExportDialog";

interface ProductsOptionsProps {
	loadProducts: () => Promise<void>;
}

const ProductsOptions = ({ loadProducts }: ProductsOptionsProps) => {
	return (
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
	);
};

export default ProductsOptions;
