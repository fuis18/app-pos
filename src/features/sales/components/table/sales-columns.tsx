import type { Sale } from "@/features/sales/types/sales.types";
import type { ColumnDef } from "@tanstack/react-table";
import DayCell from "./DayRow";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Flag } from "lucide-react";

const baseColumns: ColumnDef<Sale>[] = [
	{
		accessorKey: "id",
		header: "ID",
	},
	{
		header: "Día",
		cell: (ctx) => <DayCell {...ctx} />,
	},
	{
		accessorKey: "date",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Hora
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const date = new Date(row.original.date + "Z");
			return date.toLocaleTimeString("es-PE", {
				timeZone: "America/Lima",
				hour: "2-digit",
				minute: "2-digit",
			});
		},
		sortingFn: "datetime",
	},
	{
		accessorKey: "amount",
		header: "Cantidad",
		cell: ({ row }) => `S/.${row.original.total.toFixed(2)}`,
	},
];

export function getSalesColumns(options?: {
	onReport?: (saleId: number) => void;
	reportedSaleIds?: Set<number>;
}): ColumnDef<Sale>[] {
	if (!options?.onReport) return baseColumns;

	return [
		...baseColumns,
		{
			id: "reportAction",
			header: "Reporte",
			cell: ({ row }) => {
				const isReported = options.reportedSaleIds?.has(row.original.id);
				return (
					<Button
						variant="ghost"
						size="sm"
						className="h-min"
						disabled={isReported}
						onClick={(e) => {
							e.stopPropagation();
							options.onReport?.(row.original.id);
						}}
						title="Reportar venta"
					>
						<Flag
							className={`${isReported ? "text-muted-foreground" : "text-red-600 dark:text-red-400"}`}
						/>
					</Button>
				);
			},
		},
	];
}
