import { select, execute, insert } from "@/database/index.ts";
import type {
	CreateProduct,
	Product,
	ProductListItem,
	UpdateProduct,
} from "../types/products.types";

export async function getProductByCode(
	code: number,
): Promise<ProductListItem | null> {
	const result = await select<ProductListItem>(
		"SELECT id, code, name, price FROM products WHERE code = ?",
		[code],
	);
	return result[0] ?? null;
}

export async function getProductByName(
	name: string,
): Promise<ProductListItem | null> {
	const result = await select<ProductListItem>(
		"SELECT id, code, name, price FROM products WHERE name = ? AND state = 1",
		[name],
	);
	return result[0] ?? null;
}

export async function getProductByLike(
	name: string,
): Promise<ProductListItem[]> {
	const result = await select<ProductListItem>(
		"SELECT id, code, name, price FROM products WHERE name LIKE ? AND state = 1",
		[`${name}%`],
	);
	return result;
}

export async function getAllProducts(
	limit: number,
	offset: number,
): Promise<Product[]> {
	return select<Product>(
		"SELECT id, code, name, price, state FROM products LIMIT ? OFFSET ?",
		[limit, offset],
	);
}

export async function getAllProductsForExport(): Promise<ProductListItem[]> {
	return select<ProductListItem>(
		"SELECT id, code, name, price FROM products WHERE state = 1",
	);
}

export async function getProductsCount(): Promise<number> {
	const result = await select<{ count: number }>(
		"SELECT COUNT(*) as count FROM products",
	);
	return result[0].count;
}

export async function getAllProductsActive(
	limit: number,
	offset: number,
): Promise<Product[]> {
	return select<Product>(
		"SELECT id, code, name, price, state FROM products WHERE state = 1 LIMIT ? OFFSET ?",
		[limit, offset],
	);
}

export async function getProductsCountActive(): Promise<number> {
	const result = await select<{ count: number }>(
		"SELECT COUNT(*) as count FROM products WHERE state = 1",
	);
	return result[0].count;
}

export async function createProduct(product: CreateProduct): Promise<number> {
	return insert("INSERT INTO products (code, name, price) VALUES (?, ?, ?)", [
		product.code,
		product.name,
		product.price,
	]);
}

export async function updateProduct(
	id: number,
	product: UpdateProduct,
): Promise<void> {
	const fields = [];
	const values = [];

	if (product.code !== undefined) {
		fields.push("code = ?");
		values.push(product.code);
	}

	if (product.name !== undefined) {
		fields.push("name = ?");
		values.push(product.name);
	}

	if (product.price !== undefined) {
		fields.push("price = ?");
		values.push(product.price);
	}

	if (product.state !== undefined) {
		fields.push("state = ?");
		values.push(product.state ? 1 : 0);
	}

	if (!fields.length) return;

	values.push(id);

	return execute(
		`UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
		values,
	);
}

export async function softDeleteProduct(id: number): Promise<void> {
	return updateProduct(id, { state: false });
}

export async function reactivateProduct(id: number): Promise<void> {
	return updateProduct(id, { state: true });
}

export async function hardDeleteProduct(id: number): Promise<void> {
	return execute("DELETE FROM products WHERE id = ?", [id]);
}

/* ---------- Batch operations ---------- */

export async function softDeleteProducts(ids: number[]): Promise<void> {
	if (!ids.length) return;
	const placeholders = ids.map(() => "?").join(", ");
	return execute(
		`UPDATE products SET state = 0 WHERE id IN (${placeholders})`,
		ids,
	);
}

export async function reactivateProducts(ids: number[]): Promise<void> {
	if (!ids.length) return;
	const placeholders = ids.map(() => "?").join(", ");
	return execute(
		`UPDATE products SET state = 1 WHERE id IN (${placeholders})`,
		ids,
	);
}

export async function hardDeleteProducts(ids: number[]): Promise<void> {
	if (!ids.length) return;
	const placeholders = ids.map(() => "?").join(", ");
	return execute(`DELETE FROM products WHERE id IN (${placeholders})`, ids);
}
