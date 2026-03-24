"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import type { SaleItem, SaleReport } from "@/features/sales/types/sales.types";
import { salesService } from "@/features/sales/service/sales.service";

interface SaleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	saleItems: SaleItem[] | null;
	saleId: number | null;
	isReported: boolean;
	isAdmin: boolean;
	onSalesUpdated?: () => Promise<void> | void;
}

const SaleDialog = ({
	open,
	onOpenChange,
	saleItems,
	saleId,
	isReported,
	isAdmin,
	onSalesUpdated,
}: SaleDialogProps) => {
	const [report, setReport] = useState<SaleReport | null>(null);
	const [reportDialogOpen, setReportDialogOpen] = useState(false);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [actionLoading, setActionLoading] = useState<
		"cancelReport" | "deleteSale" | null
	>(null);

	useEffect(() => {
		if (!open || !isReported || saleId === null) return;

		let cancelled = false;
		salesService.getSaleReport(saleId).then((r) => {
			if (!cancelled) setReport(r);
		});
		return () => {
			cancelled = true;
			setReport(null);
		};
	}, [open, isReported, saleId]);

	const totalSale =
		saleItems?.reduce(
			(sum, item) => sum + item.price_at_sale * item.quantity,
			0,
		) ?? 0;

	const handleCancelReport = async () => {
		if (saleId === null) return;
		setActionLoading("cancelReport");
		try {
			await salesService.cancelSaleReport(saleId);
			setReport(null);
			setReportDialogOpen(false);
			onOpenChange(false);
			await onSalesUpdated?.();
		} finally {
			setActionLoading(null);
		}
	};

	const executeDeleteSale = async () => {
		if (saleId === null) return;

		setActionLoading("deleteSale");
		try {
			await salesService.deleteSale(saleId);
			setReport(null);
			setConfirmDeleteOpen(false);
			setReportDialogOpen(false);
			onOpenChange(false);
			await onSalesUpdated?.();
		} finally {
			setActionLoading(null);
		}
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
					<DialogHeader>
						<DialogTitle>Detalle de la venta</DialogTitle>
					</DialogHeader>

					{!saleItems ? (
						<p>Cargando...</p>
					) : (
						<>
							<div className="flex-1 min-h-0 overflow-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Código</TableHead>
											<TableHead>Producto</TableHead>
											<TableHead>Cantidad</TableHead>
											<TableHead>Precio</TableHead>
											<TableHead>Total</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{saleItems.map((item) => (
											<TableRow key={item.id}>
												<TableCell>{item.code}</TableCell>
												<TableCell>{item.name}</TableCell>
												<TableCell>{item.quantity}</TableCell>
												<TableCell>${item.price_at_sale}</TableCell>
												<TableCell>
													S/.{(item.price_at_sale * item.quantity).toFixed(2)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							<div className="flex justify-between items-center border-t pt-3">
								{isReported && report ? (
									<Button
										variant="outline"
										size="sm"
										onClick={() => setReportDialogOpen(true)}
									>
										Ver reporte
									</Button>
								) : (
									<span />
								)}
								<span className="font-semibold">
									Total venta: S/.{totalSale.toFixed(2)}
								</span>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>

			<Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Reporte de venta</DialogTitle>
					</DialogHeader>
					{report && (
						<div className="space-y-4">
							<p>
								<span className="font-semibold">Motivo: </span>
								{report.reason}
							</p>
							<p>
								<span className="font-semibold">Hora: </span>
								{new Date(report.reported_at + "Z").toLocaleString("es-PE", {
									timeZone: "America/Lima",
									dateStyle: "short",
									timeStyle: "short",
								})}
							</p>

							{isAdmin && (
								<div className="flex gap-2 pt-2 border-t">
									<Button
										variant="outline"
										onClick={handleCancelReport}
										disabled={actionLoading !== null}
									>
										Anular el reporte
									</Button>
									<Button
										variant="destructive"
										onClick={() => setConfirmDeleteOpen(true)}
										disabled={actionLoading !== null}
									>
										Eliminar la venta
									</Button>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			<Dialog
				open={confirmDeleteOpen}
				onOpenChange={(openState) => {
					if (actionLoading === "deleteSale") return;
					setConfirmDeleteOpen(openState);
				}}
			>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Confirmar eliminación</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						¿Eliminar esta venta? Esta acción no se puede deshacer.
					</p>
					<div className="flex justify-end gap-2 pt-2">
						<Button
							variant="outline"
							onClick={() => setConfirmDeleteOpen(false)}
							disabled={actionLoading === "deleteSale"}
						>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={executeDeleteSale}
							disabled={actionLoading === "deleteSale"}
						>
							Sí, eliminar
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default SaleDialog;
