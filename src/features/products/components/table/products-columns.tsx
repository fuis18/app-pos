import type { Product } from "@/features/products/types/products.types";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckHeader, CheckCell } from "@/components/table/CheckRow";
import ActionsCell from "./cells/ActionsRow";
import StateCell from "./cells/StateRow";

export const getColumns = (hasUser: boolean): ColumnDef<Product>[] => {
	const columns: ColumnDef<Product>[] = [];

	if (hasUser) {
		columns.push({
			id: "select",
			header: CheckHeader,
			cell: CheckCell,
			enableSorting: false,
			enableHiding: false,
		});
	}

	columns.push(
		{
			accessorKey: "code",
			header: "Code",
		},
		{
			accessorKey: "name",
			header: "Nombre",
		},
		{
			accessorKey: "price",
			header: "Precio",
			cell: ({ row }) => (
				<span className="font-semibold">S/.{row.original.price}</span>
			),
		},
	);

	if (hasUser) {
		columns.push({
			accessorKey: "state",
			header: "Estado",
			cell: StateCell,
		});
	}

	columns.push({
		id: "actions",
		header: "Acciones",
		cell: ActionsCell,
	});

	return columns;
};
