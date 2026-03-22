// src/features/registry/components/RegistryPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Registry } from "../types/registry.types";
import RegistryTable from "./RegistryTable";
import RegistryOptions from "./RegistryOptions";
import { useRegistryState } from "../hooks/useRegistryState";
import { useRegistryActions } from "../hooks/useRegistryActions";
import useRegistryFocus from "../hooks/useRegistryFocus";
import { useSubmitRegistry } from "../hooks/useSubmitRegistry";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const RegistryPage = () => {
	const navigate = useNavigate();
	const { data, setData, total } = useRegistryState();
	const focus = useRegistryFocus();
	const { addRow, deleteRows, updateCell, updateRow, upsertProduct } =
		useRegistryActions(setData, focus);
	const { submit, successOpen, lastTotal, lastDate, closeSuccess } =
		useSubmitRegistry({
			data,
			total,
			setData,
			focus,
		});

	const [selectedRows, setSelectedRows] = useState<Registry[]>([]);

	return (
		<main className="RegistryPage-container">
			<div className="RegistryPage-left">
				<div className="RegistryPage-tableScroll">
					<RegistryTable
						data={data}
						meta={{
							updateCell,
							updateRow,
							addRow,
							focus,
							upsertProduct,
							submit,
						}}
						onSelectionChange={setSelectedRows}
					/>
				</div>

				<div className="RegistryPage-totalBar flex justify-end items-center">
					<span className="mr-4 font-bold">Total: S/. {total.toFixed(2)}</span>
				</div>
			</div>

			<RegistryOptions
				onSubmit={submit}
				onDelete={() => deleteRows(selectedRows)}
				disableDelete={selectedRows.length === 0}
				preference={focus.preference}
				onPreferenceChange={focus.setPreference}
			/>

			<Dialog
				open={successOpen}
				onOpenChange={(open) => !open && closeSuccess()}
			>
				<DialogContent showCloseButton={false}>
					<DialogHeader>
						<DialogTitle>Venta exitosa</DialogTitle>
						<DialogDescription asChild>
							<div className="flex flex-col items-center gap-1 pt-2">
								<span className="text-3xl font-bold text-foreground">
									S/. {lastTotal.toFixed(2)}
								</span>
								{lastDate && (
									<span className="text-sm text-muted-foreground">
										{lastDate.toLocaleDateString("es-PE", {
											day: "2-digit",
											month: "long",
											year: "numeric",
										})}{" "}
										—{" "}
										{lastDate.toLocaleTimeString("es-PE", {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								)}
							</div>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								closeSuccess();
								navigate("/sales");
							}}
						>
							Ver
						</Button>
						<Button autoFocus onClick={closeSuccess}>
							Siguiente
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	);
};
