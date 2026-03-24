import { useMemo } from "react";
import SalesOptions from "@/features/sales/components/SalesOptions";
import { useSales } from "../hooks/useSales";
import SalesTable from "@/features/sales/components/SalesTable";
import SaleDialog from "@/features/sales/components/SaleDilog";
import ReportSaleDialog from "@/features/sales/components/ReportSaleDialog";
import PagTable from "@/components/PaginationTable";
import { getSalesColumns } from "./table/sales-columns";
import { useUserStore } from "@/store/userStore";

export const SalesPage = () => {
	const user = useUserStore((s) => s.user);

	const {
		sales,
		page,
		setPage,
		totalPages,
		totalAmount,
		dialogOpen,
		closeDialog,
		openSaleDetail,
		selectedSaleId,
		selectedSaleItems,
		selectedDate,
		setSelectedDate,
		reportedSaleIds,
		reportDialogOpen,
		openReportDialog,
		closeReportDialog,
		submitReport,
		refreshSales,
	} = useSales();

	const columns = useMemo(
		() =>
			getSalesColumns(
				!user ? { onReport: openReportDialog, reportedSaleIds } : undefined,
			),
		[user, openReportDialog, reportedSaleIds],
	);

	return (
		<main className="px-1 gap-1 flex flex-col">
			<SalesOptions
				setPage={setPage}
				selectedDate={selectedDate}
				setSelectedDate={setSelectedDate}
			/>

			<SalesTable
				data={sales}
				columns={columns}
				onRowClick={openSaleDetail}
				reportedSaleIds={reportedSaleIds}
			/>

			<div className="flex justify-end items-center">
				<span className="mr-4 font-bold">
					Total: S/. {totalAmount.toFixed(2)}
				</span>
			</div>

			<SaleDialog
				open={dialogOpen}
				onOpenChange={closeDialog}
				saleItems={selectedSaleItems}
				saleId={selectedSaleId}
				isReported={
					selectedSaleId !== null && reportedSaleIds.has(selectedSaleId)
				}
				isAdmin={Boolean(user)}
				onSalesUpdated={refreshSales}
			/>

			<ReportSaleDialog
				open={reportDialogOpen}
				onOpenChange={closeReportDialog}
				onSubmit={submitReport}
			/>

			<PagTable page={page} setPage={setPage} totalPages={totalPages} />
		</main>
	);
};
