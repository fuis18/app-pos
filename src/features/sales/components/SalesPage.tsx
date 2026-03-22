import SalesOptions from "@/features/sales/components/SalesOptions";
import { useSales } from "../hooks/useSales";
import SalesTable from "@/features/sales/components/SalesTable";
import SaleDialog from "@/features/sales/components/SaleDilog";
import PagTable from "@/components/PaginationTable";
import { columns } from "./table/sales-columns";

export const SalesPage = () => {
	const {
		sales,
		page,
		setPage,
		totalPages,
		totalAmount,
		dialogOpen,
		closeDialog,
		openSaleDetail,
		selectedSaleItems,
		selectedDate,
		setSelectedDate,
	} = useSales();

	return (
		<main className="px-1 gap-1 flex flex-col">
			<SalesOptions
				setPage={setPage}
				selectedDate={selectedDate}
				setSelectedDate={setSelectedDate}
			/>

			<SalesTable data={sales} columns={columns} onRowClick={openSaleDetail} />

			<div className="flex justify-end items-center">
				<span className="mr-4 font-bold">
					Total: S/. {totalAmount.toFixed(2)}
				</span>
			</div>

			<SaleDialog
				open={dialogOpen}
				onOpenChange={closeDialog}
				saleItems={selectedSaleItems}
			/>

			<PagTable page={page} setPage={setPage} totalPages={totalPages} />
		</main>
	);
};
