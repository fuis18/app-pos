import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		host: true,
		port: 5173,
	},
	base: "/",
	build: {
		rollupOptions: {
			output: {
				advancedChunks: {
					groups: [
						{
							name(moduleId) {
								if (
									moduleId.includes("node_modules/react") ||
									moduleId.includes("node_modules/react-dom") ||
									moduleId.includes("node_modules/react-router-dom")
								) {
									return "vendor-react";
								}
								return null;
							},
						},
						{
							name(moduleId) {
								if (moduleId.includes("node_modules/@radix-ui")) {
									return "vendor-ui";
								}
								return null;
							},
						},
					],
				},
			},
		},
	},
});
