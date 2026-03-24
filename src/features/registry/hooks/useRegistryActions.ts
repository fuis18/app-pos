// src\features\registry\hooks\useRegistryActions.ts
import { EMPTY_REGISTRY_ROW } from "../types/constants";
import type { FocusColumn } from "../types/focus.types";
import type { Registry } from "../types/registry.types";
import type { RegistryFocus } from "./useRegistryFocus";

export const useRegistryActions = (
	setData: React.Dispatch<React.SetStateAction<Registry[]>>,
	focus: RegistryFocus,
) => {
	const addRow = (focusColumn: FocusColumn = focus.preference) => {
		setData((prev) => {
			const nextIndex = prev.length;
			focus.focusCell(nextIndex, focusColumn);
			return [...prev, { ...EMPTY_REGISTRY_ROW, id: nextIndex }];
		});
	};

	const deleteRows = (rows: Registry[]) => {
		setData((prev) => {
			const ids = new Set(rows.map((r) => r.id));

			const filtered = prev.filter((row) => !ids.has(row.id));

			const result = filtered.length === 0 ? [EMPTY_REGISTRY_ROW] : filtered;

			return result.map((row, i) => ({ ...row, id: i }));
		});
	};

	const calculateTotal = (row: Registry) => ({
		...row,
		total: row.quantity * row.price,
	});

	const updateCell = <K extends keyof Registry>(
		rowIndex: number,
		columnId: K,
		value: Registry[K],
	) => {
		setData((prev) =>
			prev.map((row, i) => {
				if (i !== rowIndex) return row;

				const updatedRow = {
					...row,
					[columnId]: value,
				};

				return calculateTotal(updatedRow);
			}),
		);
	};

	const updateRow = (rowIndex: number, newData: Partial<Registry>) => {
		setData((prev) =>
			prev.map((row, i) => (i === rowIndex ? { ...row, ...newData } : row)),
		);
	};

	const upsertProduct = (
		rowIndex: number,
		product: {
			id: number;
			code: number | string;
			name: string;
			price: number;
		},
		createRow: boolean,
	) => {
		setData((prev) => {
			const existingIndex = prev.findIndex(
				(r, i) => i !== rowIndex && r.product_id === product.id,
			);

			// 🟢 YA EXISTE → sumar cantidad y limpiar fila actual
			if (existingIndex !== -1) {
				return prev.map((row, i) => {
					// 🔼 incrementar fila existente
					if (i === existingIndex) {
						const quantity = row.quantity + 1;
						return {
							...row,
							quantity,
							total: quantity * row.price,
						};
					}

					// 🧹 limpiar fila actual
					if (i === rowIndex) {
						return {
							...EMPTY_REGISTRY_ROW,
							id: row.id,
						};
					}

					return row;
				});
			}

			// 🔵 NO EXISTE → usar fila actual
			const updated = prev.map((row, i) =>
				i === rowIndex
					? {
							...row,
							product_id: product.id,
							code: String(product.code),
							name: product.name,
							price: product.price,
							quantity: 1,
							total: product.price,
						}
					: row,
			);

			// ➕ SOLO AQUÍ se crea nueva fila
			if (createRow) {
				const nextIndex = updated.length;
				focus.focusCell(nextIndex, focus.preference);

				return [...updated, { ...EMPTY_REGISTRY_ROW, id: nextIndex }];
			}

			return updated;
		});
	};

	return {
		addRow,
		deleteRows,
		updateCell,
		updateRow,
		upsertProduct,
	};
};
