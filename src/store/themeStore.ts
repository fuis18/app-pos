import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeStore {
	theme: Theme;
	toggleTheme: () => void;
}

const getInitialTheme = (): Theme => {
	const stored = localStorage.getItem("theme");
	if (stored === "dark" || stored === "light") return stored;
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
};

const applyTheme = (theme: Theme) => {
	document.documentElement.classList.toggle("dark", theme === "dark");
	localStorage.setItem("theme", theme);
};

export const useThemeStore = create<ThemeStore>((set) => {
	const initial = getInitialTheme();
	applyTheme(initial);

	return {
		theme: initial,
		toggleTheme: () =>
			set((state) => {
				const next = state.theme === "dark" ? "light" : "dark";
				applyTheme(next);
				return { theme: next };
			}),
	};
});
