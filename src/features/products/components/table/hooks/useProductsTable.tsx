import {
	getCoreRowModel,
	useReactTable,
	type RowSelectionState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { getColumns } from "../products-columns";
import type { ProductsTableProps } from "@/features/products/types/products.types";
import { useUserStore } from "@/store/userStore";

const useProductsTable = ({
	data,
	meta,
	onSelectionChange,
}: ProductsTableProps) => {
	const { user } = useUserStore();
	const hasUser = !!user;
	const columns = getColumns(hasUser);

	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data,
		columns,
		meta,
		state: { rowSelection },
		onRowSelectionChange: setRowSelection,
		getRowId: (row) => String(row.id),
		enableRowSelection: hasUser,
		getCoreRowModel: getCoreRowModel(),
	});

	useEffect(() => {
		setRowSelection({});
	}, [data]);

	useEffect(() => {
		if (!onSelectionChange) return;
		onSelectionChange(
			table.getSelectedRowModel().rows.map((row) => row.original),
		);
	}, [onSelectionChange, rowSelection, table]);

	return table;
};

export default useProductsTable;
