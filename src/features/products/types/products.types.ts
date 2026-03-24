import type { TableMeta } from "@tanstack/react-table";
import { z } from "zod";

export interface ProductsTableProps {
	data: Product[];
	meta?: TableMeta<Product>;
	onSelectionChange?: (rows: Product[]) => void;
}

/* ---------- Entity ---------- */
export interface Product {
	id: number;
	code: number;
	name: string;
	price: number;
	state: boolean | number;
}

export interface ProductListItem {
	id: number;
	code: number;
	name: string;
	price: number;
}

export interface CreateProduct {
	code: number;
	name: string;
	price: number;
}

export type UpdateProduct = Partial<CreateProduct> & {
	state?: boolean;
};

/* ---------- Validation ---------- */
export const productSchema = z.object({
	code: z.coerce.number().positive("Código inválido"),
	name: z.string().min(3, "Nombre inválido").max(30, "Máximo 30 caracteres"),
	price: z.coerce.number().positive("Precio inválido"),
});

// export type FormType = z.input<typeof productSchema>;
export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormValues = z.output<typeof productSchema>;
