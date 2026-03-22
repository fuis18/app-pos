// src/features/registry/components/table/NameRow.tsx
import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import {
	getProductByLike,
	getProductByName,
} from "@/features/products/repository/products.repository";
import type { ProductListItem } from "@/features/products/types/products.types";
import type { Registry } from "@/features/registry/types/registry.types";
import type { CellContext } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import useFocusableCell from "../hooks/useFocusableCell";

export default function NameCell({
	row,
	table,
	getValue,
}: CellContext<Registry, unknown>) {
	const meta = table.options.meta;
	const value = (getValue() as string) ?? "";
	const [items, setItems] = useState<ProductListItem[]>([]);

	const ref = useFocusableCell({
		rowIndex: row.index,
		column: "name",
		focus: meta?.focus?.focus ?? null,
	});

	useEffect(() => {
		if (!value || value === "") return;

		getProductByLike(value).then(setItems);
	}, [value]);

	const confirmProduct = (item: ProductListItem, createRow = true) => {
		meta?.upsertProduct?.(row.index, item, createRow);
	};

	return (
		<Combobox items={items}>
			<ComboboxInput
				ref={ref}
				value={value}
				onChange={(e) => {
					meta?.updateCell?.(row.index, "name", e.target.value);
				}}
				onKeyDown={async (e) => {
					if (e.key !== "Enter") return;
					e.preventDefault();

					if (value === "") {
						const hasValidRows = table
							.getRowModel()
							.rows.some(
								(r) => r.original.product_id !== null && r.index !== row.index,
							);

						if (hasValidRows) {
							meta?.submit?.();
						}
						return;
					}

					if (items.length > 0) return;
					const product = await getProductByName(value);
					if (!product) return;
					confirmProduct(product);
				}}
			/>
			<ComboboxContent>
				<ComboboxList>
					{(item) => (
						<ComboboxItem
							key={item.id}
							value={item.name}
							onClick={() => confirmProduct(item)}
						>
							<div className="flex justify-between w-full">
								<span>{item.name}</span>
								<span className="text-muted-foreground">
									S/.{item.price.toFixed(2)}
								</span>
							</div>
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
