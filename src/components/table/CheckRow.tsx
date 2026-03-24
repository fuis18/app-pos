import type React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { CellContext, HeaderContext } from "@tanstack/react-table";

let anchorRowIndex: number | null = null;
let shiftHeld = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CheckHeader({ table }: HeaderContext<any, unknown>) {
	const checked =
		table.getIsAllPageRowsSelected() ||
		(table.getIsSomePageRowsSelected() && "indeterminate");

	return (
		<Checkbox
			checked={checked}
			onCheckedChange={(value) => {
				table.toggleAllPageRowsSelected(!!value);
				anchorRowIndex = null;
			}}
			aria-label="Select all"
		/>
	);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CheckCell({ row, table }: CellContext<any, unknown>) {
	const handleClick = (e: React.MouseEvent) => {
		shiftHeld = e.shiftKey;
	};

	const handleCheckedChange = (value: boolean | "indeterminate") => {
		if (shiftHeld && anchorRowIndex !== null && anchorRowIndex !== row.index) {
			const start = Math.min(anchorRowIndex, row.index);
			const end = Math.max(anchorRowIndex, row.index);

			const rows = table.getRowModel().rows;
			for (let i = start; i <= end; i++) {
				const targetRow = rows[i];
				if (targetRow?.getCanSelect()) {
					targetRow.toggleSelected(true);
				}
			}
		} else {
			row.toggleSelected(!!value);
			anchorRowIndex = row.index;
		}

		shiftHeld = false;
	};

	return (
		<Checkbox
			disabled={!row.getCanSelect()}
			checked={row.getIsSelected()}
			onClick={handleClick}
			onCheckedChange={handleCheckedChange}
			aria-label="Select row"
		/>
	);
}
