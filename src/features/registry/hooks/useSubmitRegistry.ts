// src\features\registry\hooks\useSubmitRegistry.ts
import { useState } from "react";
import { EMPTY_REGISTRY_ROW } from "../types/constants";
import { submitRegistrySale } from "../service/registry.service";
import type { RegistryFocus } from "./useRegistryFocus";
import type { Registry } from "../types/registry.types";

interface Params {
	data: Registry[];
	total: number;
	setData: React.Dispatch<React.SetStateAction<Registry[]>>;
	focus: RegistryFocus;
}

export const useSubmitRegistry = ({ data, total, setData, focus }: Params) => {
	const [successOpen, setSuccessOpen] = useState(false);
	const [lastTotal, setLastTotal] = useState(0);
	const [lastDate, setLastDate] = useState<Date | null>(null);

	const submit = async () => {
		const success = await submitRegistrySale(data, total);

		if (!success) return;

		setLastTotal(total);
		setLastDate(new Date());
		setSuccessOpen(true);
		setData([EMPTY_REGISTRY_ROW]);
	};

	const closeSuccess = () => {
		setSuccessOpen(false);
		focus.focusCell(0, focus.preference);
	};

	return {
		submit,
		successOpen,
		lastTotal,
		lastDate,
		closeSuccess,
	};
};
