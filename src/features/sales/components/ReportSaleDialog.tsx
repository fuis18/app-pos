"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ReportSaleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (reason: string) => void;
}

const MIN_REASON_LENGTH = 20;

const ReportSaleDialog = ({
	open,
	onOpenChange,
	onSubmit,
}: ReportSaleDialogProps) => {
	const [reason, setReason] = useState("");

	const canSubmit = reason.trim().length >= MIN_REASON_LENGTH;

	const handleSubmit = () => {
		if (!canSubmit) return;
		onSubmit(reason.trim());
		setReason("");
	};

	const handleOpenChange = (value: boolean) => {
		if (!value) setReason("");
		onOpenChange(value);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Motivo de reporte:</DialogTitle>
				</DialogHeader>

				<Textarea
					placeholder="Describa el motivo del reporte (mínimo 20 caracteres)..."
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					rows={4}
				/>

				<p className="text-xs text-muted-foreground">
					{reason.trim().length}/{MIN_REASON_LENGTH} caracteres mínimos
				</p>

				<div className="flex justify-end">
					<Button disabled={!canSubmit} onClick={handleSubmit}>
						Enviar
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ReportSaleDialog;
