import type { FocusColumn } from "@/features/registry/types/focus.types";
import { create } from "zustand";

export interface FocusPreferenceStore {
	preference: FocusColumn;
	setPreference: (column: FocusColumn) => void;
}

export const useFocusPreferenceStore = create<FocusPreferenceStore>((set) => ({
	preference: "code",
	setPreference: (preference) => set({ preference }),
}));
