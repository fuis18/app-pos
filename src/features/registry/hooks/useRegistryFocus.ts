// src/features/registry/hooks/useRegistryFocus.ts
import { useCallback, useState } from "react";
import { useFocusPreferenceStore } from "@/store/focusPreferenceStore";
import type { FocusColumn, FocusTarget } from "../types/focus.types";

export interface RegistryFocus {
	focus: FocusTarget | null;
	preference: FocusColumn;
	setPreference: (column: FocusColumn) => void;
	focusCell: (rowIndex: number, column: FocusColumn) => void;
	clearFocus: () => void;
}

const useRegistryFocus = (): RegistryFocus => {
	const { preference, setPreference } = useFocusPreferenceStore();
	const [focus, setFocus] = useState<FocusTarget | null>({
		rowIndex: 0,
		column: preference,
	});

	const focusCell = useCallback((rowIndex: number, column: FocusColumn) => {
		setFocus({ rowIndex, column });
	}, []);

	const clearFocus = () => setFocus(null);

	return {
		focus,
		preference,
		setPreference,
		focusCell,
		clearFocus,
	};
};
export default useRegistryFocus;
