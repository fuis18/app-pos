// src/components/dialogs/ProductDialog.tsx
"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import { Form } from "@/components/ui/form";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	productSchema,
	type Product,
	type ProductFormInput,
	type ProductFormValues,
} from "@/features/products/types/products.types";

import {
	createProduct,
	updateProduct,
	getProductByCode,
	getProductByName,
} from "@/features/products/repository/products.repository";

interface ProductDialogProps {
	product?: Product;
	onSuccess?: () => void;
	children?: React.ReactNode;
}

const ProductDialog = ({
	product,
	onSuccess,
	children,
}: ProductDialogProps) => {
	const [open, setOpen] = useState(false);
	const isEdit = !!product;

	const form = useForm<ProductFormInput>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			code: product?.code ?? 0,
			name: product?.name ?? "",
			price: product?.price ?? 0,
		},
	});

	const isDisabled =
		isEdit && Object.keys(form.formState.dirtyFields).length === 0;

	useEffect(() => {
		if (product) {
			form.reset({
				code: product.code,
				name: product.name,
				price: product.price,
			});
		}
	}, [product, form]);

	const onSubmit = async (data: ProductFormInput) => {
		try {
			const parsed = productSchema.parse(data);

			const existingByCode = await getProductByCode(parsed.code);
			if (existingByCode && (!isEdit || existingByCode.id !== product?.id)) {
				form.setError("code", { type: "manual", message: "Código existente" });
				return;
			}

			const existingByName = await getProductByName(parsed.name);
			if (existingByName && (!isEdit || existingByName.id !== product?.id)) {
				form.setError("name", { type: "manual", message: "Nombre existente" });
				return;
			}

			if (isEdit && product) {
				const { dirtyFields } = form.formState;

				const changes: Partial<ProductFormValues> = {};

				if (dirtyFields.code) changes.code = parsed.code;
				if (dirtyFields.name) changes.name = parsed.name;
				if (dirtyFields.price) changes.price = parsed.price;

				if (Object.keys(changes).length === 0) {
					setOpen(false);
					return;
				}

				await updateProduct(product.id, changes);
			} else {
				await createProduct(parsed);
			}

			form.reset();
			setOpen(false);
			onSuccess?.();
		} catch {
			form.setError("root", {
				type: "server",
				message: "Error al guardar el producto",
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Editar producto" : "Crear producto"}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 mt-2"
					>
						<div className="flex gap-1 flex-col">
							<Label htmlFor="code">Código</Label>
							<Input id="code" type="number" {...form.register("code")} />
							{form.formState.errors.code && (
								<p className="text-red-500 text-sm">
									{form.formState.errors.code.message}
								</p>
							)}
						</div>

						<div className="flex gap-1 flex-col">
							<Label htmlFor="name">Nombre</Label>
							<Input id="name" {...form.register("name")} />
							{form.formState.errors.name && (
								<p className="text-red-500 text-sm">
									{form.formState.errors.name.message}
								</p>
							)}
						</div>

						<div className="flex gap-1 flex-col">
							<Label htmlFor="price">Precio</Label>
							<Input id="price" type="text" {...form.register("price")} />
							{form.formState.errors.price && (
								<p className="text-red-500 text-sm">
									{form.formState.errors.price.message}
								</p>
							)}
						</div>

						{form.formState.errors.root && (
							<p className="text-red-600 text-sm">
								{form.formState.errors.root.message}
							</p>
						)}

						<Button type="submit" disabled={isDisabled}>
							{isEdit ? "Guardar cambios" : "Crear"}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default ProductDialog;
