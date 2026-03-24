// src/features/sales/useSales.ts
import { useCallback, useEffect, useState } from "react";
import { CONFIG } from "@/constants/config";
import { salesService } from "../service/sales.service";
import type { Sale, SaleItem } from "@/features/sales/types/sales.types";
import { usePagination } from "@/hooks/usePagination";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { getSalesTotal } from "../repository/sales.repository";

export function useSales() {
	// --------------------
	// DATA
	// --------------------
	const [sales, setSales] = useState<Sale[]>([]);
	const [selectedSaleItems, setSelectedSaleItems] = useState<SaleItem[] | null>(
		null,
	);
	const [totalAmount, setTotalAmount] = useState(0);

	// --------------------
	// PAGINATION
	// --------------------
	const [totalPages, setTotalPages] = useState(1);
	const { page, setPage } = usePagination(totalPages);

	const limit = CONFIG.LIMIT;
	const offset = (page - 1) * limit;

	// --------------------
	// FILTERS
	// --------------------

	const getCurrentWeekRange = () => {
		const now = new Date();
		return {
			from: format(startOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd"),
			to: format(endOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd"),
		};
	};

	const [selectedDate, setSelectedDate] = useState<{
		from?: string;
		to?: string;
		timeFrom?: string;
		timeTo?: string;
	}>(getCurrentWeekRange());

	// --------------------
	// DIALOG
	// --------------------
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

	const closeDialog = () => {
		setDialogOpen(false);
		setSelectedSaleItems(null);
		setSelectedSaleId(null);
	};

	const openSaleDetail = async (saleId: number) => {
		setSelectedSaleId(saleId);
		setDialogOpen(true);
		setSelectedSaleItems(null); // loading state

		const items = await salesService.getItems(saleId);
		setSelectedSaleItems(items);
	};

	// --------------------
	// REPORT
	// --------------------
	const [reportedSaleIds, setReportedSaleIds] = useState<Set<number>>(
		new Set(),
	);
	const [reportDialogOpen, setReportDialogOpen] = useState(false);
	const [reportingSaleId, setReportingSaleId] = useState<number | null>(null);

	const openReportDialog = useCallback((saleId: number) => {
		setReportingSaleId(saleId);
		setReportDialogOpen(true);
	}, []);

	const closeReportDialog = () => {
		setReportDialogOpen(false);
		setReportingSaleId(null);
	};

	const refreshSales = useCallback(async () => {
		const [salesData, total, amount, reported] = await Promise.all([
			salesService.findAll(limit, offset, selectedDate),
			salesService.count(selectedDate),
			getSalesTotal(selectedDate),
			salesService.getReportedSaleIds(),
		]);

		setSales(salesData);
		setTotalPages(Math.ceil(total / limit));
		setTotalAmount(amount);
		setReportedSaleIds(reported);
	}, [limit, offset, selectedDate]);

	const submitReport = async (reason: string) => {
		if (reportingSaleId === null) return;
		await salesService.reportSale(reportingSaleId, reason);
		closeReportDialog();
		await refreshSales();
	};

	// --------------------
	// EFFECTS
	// --------------------
	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			void refreshSales();
		}, 0);

		return () => window.clearTimeout(timeoutId);
	}, [refreshSales]);

	return {
		// data
		sales,

		// pagination
		page,
		setPage,
		totalPages,
		totalAmount,

		// filters
		selectedDate,
		setSelectedDate: (date?: {
			from?: string;
			to?: string;
			timeFrom?: string;
			timeTo?: string;
		}) => setSelectedDate(date ?? getCurrentWeekRange()),

		// dialog
		dialogOpen,
		openSaleDetail,
		closeDialog,
		selectedSaleId,
		selectedSaleItems,

		// report
		reportedSaleIds,
		reportDialogOpen,
		openReportDialog,
		closeReportDialog,
		submitReport,
		refreshSales,
	};
}
