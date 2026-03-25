import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/features/products/types/products.types";
import type { CellContext } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import ProductDialog from "@/features/products/components/ProductDialog";

export default function ActionsCell({
	row,
	table,
}: CellContext<Product, unknown>) {
	const product = row.original;
	const meta = table.options.meta;
	const { user } = useUserStore();
	const isLoggedIn = !!user;

	const handleSoftDelete = async () => {
		await meta?.onSoftDelete?.(product.id);
	};

	const handleHardDelete = async () => {
		await meta?.onHardDelete?.(product.id);
	};

	const handleReactivate = async () => {
		await meta?.onReactivate?.(product.id);
	};

	const handleEditSuccess = () => {
		meta?.onEditSuccess?.();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<MoreHorizontal />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<ButtonGroup
					orientation="vertical"
					aria-label="Media controls"
					className="h-fit w-full"
				>
					{isLoggedIn ? (
						<>
							{product.state ? (
								<>
									<ProductDialog
										product={product}
										onSuccess={handleEditSuccess}
									>
										<Button variant="ghost" className="w-full justify-start">
											Editar
										</Button>
									</ProductDialog>

									<DropdownMenuItem
										className="text-sm font-medium cursor-pointer px-4 text-yellow-600"
										onClick={handleSoftDelete}
									>
										Inactivar
									</DropdownMenuItem>
								</>
							) : (
								<DropdownMenuItem
									className="text-green-600 font-medium"
									onClick={handleReactivate}
								>
									Reactivar
								</DropdownMenuItem>
							)}

							<DropdownMenuItem
								variant="destructive"
								className="text-sm font-medium cursor-pointer px-4"
								onClick={handleHardDelete}
							>
								Eliminar
							</DropdownMenuItem>
						</>
					) : (
						<>
							<ProductDialog product={product} onSuccess={handleEditSuccess}>
								<Button variant="ghost" className="w-full justify-start">
									Editar
								</Button>
							</ProductDialog>

							{product.state && (
								<DropdownMenuItem
									className="text-sm font-medium cursor-pointer px-4 text-yellow-600"
									onClick={handleSoftDelete}
								>
									Inactivar
								</DropdownMenuItem>
							)}
						</>
					)}
				</ButtonGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
