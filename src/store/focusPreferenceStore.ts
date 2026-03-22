import type { FocusColumn } from "@/features/registry/types/focus.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FocusPreferenceStore {
	preference: FocusColumn;
	setPreference: (column: FocusColumn) => void;
}

export const useFocusPreferenceStore = create<FocusPreferenceStore>()(
	persist(
		(set) => ({
			preference: "code",
			setPreference: (preference) => set({ preference }),
		}),
		{ name: "focus-preference" },
	),
);
