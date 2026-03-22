// src/features/registry/components/table/registry-columns.tsx
import type { Registry } from "@/features/registry/types/registry.types";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckHeader, CheckCell } from "./cells/CheckRow";
import CodeCell from "./cells/CodeRow";
import QuantityCell from "./cells/QuantityRow";
import NameCell from "./cells/NameRow";

export const columns: ColumnDef<Registry>[] = [
	{
		id: "select",
		header: CheckHeader,
		cell: CheckCell,
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "code",
		header: "Código",
		cell: CodeCell,
	},
	{
		accessorKey: "quantity",
		header: "Cantidad",
		cell: QuantityCell,
	},
	{
		accessorKey: "name",
		header: "Nombre",
		cell: NameCell,
	},
	{
		accessorKey: "price",
		header: "Precio",
	},
	{
		accessorKey: "total",
		header: "Total",
		cell: ({ row }) => (
			<span className="font-semibold">S/.{row.original.total.toFixed(2)}</span>
		),
	},
];
