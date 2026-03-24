// src/components/filtering/SalesOptions.tsx
"use client";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { format, startOfWeek, endOfWeek, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import SalesExportDialog from "./SalesExportDialog";

interface SalesOptionsProps {
	setPage: (page: number) => void;
	selectedDate?: {
		from?: string;
		to?: string;
		timeFrom?: string;
		timeTo?: string;
	};
	setSelectedDate: (date?: {
		from?: string;
		to?: string;
		timeFrom?: string;
		timeTo?: string;
	}) => void;
}

const getCurrentWeekRange = (): DateRange => {
	const now = new Date();
	return {
		from: startOfWeek(now, { weekStartsOn: 0 }), // 0 = domingo
		to: endOfWeek(now, { weekStartsOn: 0 }), // termina en sábado
	};
};

const formatTime12h = (time: string) => {
	const [h, m] = time.split(":");
	const date = new Date();
	date.setHours(Number(h), Number(m), 0, 0);
	return date.toLocaleTimeString("es-PE", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
};

const SalesOptions = ({
	setPage,
	selectedDate,
	setSelectedDate,
}: SalesOptionsProps) => {
	const [open, setOpen] = useState(false);
	const [openTime, setOpenTime] = useState(false);
	const [date, setDate] = useState<DateRange | undefined>(() => {
		if (selectedDate?.from && selectedDate?.to) {
			return {
				from: parse(selectedDate.from, "yyyy-MM-dd", new Date()),
				to: parse(selectedDate.to, "yyyy-MM-dd", new Date()),
			};
		}
		return getCurrentWeekRange();
	});

	const [timeFrom, setTimeFrom] = useState<string>(
		selectedDate?.timeFrom ?? "",
	);
	const [timeTo, setTimeTo] = useState<string>(selectedDate?.timeTo ?? "");

	const applyFilter = (override?: { timeFrom?: string; timeTo?: string }) => {
		const nextTimeFrom = override?.timeFrom ?? timeFrom;
		const nextTimeTo = override?.timeTo ?? timeTo;

		setPage(1);
		if (date?.from && date?.to) {
			setSelectedDate({
				from: format(date.from, "yyyy-MM-dd"),
				to: format(date.to, "yyyy-MM-dd"),
				timeFrom: nextTimeFrom || undefined,
				timeTo: nextTimeTo || undefined,
			});
		} else {
			setSelectedDate(undefined);
		}
		setOpen(false);
	};

	return (
		<div className="SalesOptions">
			<div className="flex gap-2 items-center">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button variant="outline">
							<CalendarIcon />
							{date?.from && date?.to
								? `${format(date.from, "dd/MM/yyyy")} - ${format(date.to, "dd/MM/yyyy")}`
								: "Seleccionar fecha"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-4 text-center" align="start">
						<Calendar
							mode="range"
							defaultMonth={date?.from ?? new Date()}
							selected={date}
							onSelect={setDate}
							numberOfMonths={1}
						/>
						<Button className="mt-2" onClick={() => applyFilter()}>
							Filtrar
						</Button>
					</PopoverContent>
				</Popover>

				<Popover open={openTime} onOpenChange={setOpenTime}>
					<PopoverTrigger asChild>
						<Button variant="outline">
							{timeFrom && timeTo
								? `${formatTime12h(timeFrom)} - ${formatTime12h(timeTo)}`
								: "Filtrar hora"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-4 text-center" align="start">
						<div className="flex gap-3">
							<div className="flex flex-col items-start">
								<Input
									type="time"
									value={timeFrom}
									onChange={(e) => setTimeFrom(e.target.value)}
								/>
								<span className="mt-1 text-xs text-muted-foreground">
									{timeFrom ? formatTime12h(timeFrom) : ""}
								</span>
							</div>
							<div className="flex flex-col items-start">
								<Input
									type="time"
									value={timeTo}
									onChange={(e) => setTimeTo(e.target.value)}
								/>
								<span className="mt-1 text-xs text-muted-foreground">
									{timeTo ? formatTime12h(timeTo) : ""}
								</span>
							</div>
						</div>
						<div className="mt-2 flex gap-2 justify-center">
							<Button
								variant="outline"
								onClick={() => {
									const allDayFrom = "00:00";
									const allDayTo = "23:59";
									setTimeFrom(allDayFrom);
									setTimeTo(allDayTo);
									applyFilter({ timeFrom: allDayFrom, timeTo: allDayTo });
									setOpenTime(false);
								}}
							>
								Todo el día
							</Button>
							<Button
								onClick={() => {
									applyFilter();
									setOpenTime(false);
								}}
							>
								OK
							</Button>
						</div>
					</PopoverContent>
				</Popover>
				<SalesExportDialog dateRange={selectedDate}>
					<Button variant="outline">Exportar</Button>
				</SalesExportDialog>
			</div>
		</div>
	);
};

export default SalesOptions;
