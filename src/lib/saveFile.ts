import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";

interface SaveFileOptions {
	defaultName: string;
	filters: { name: string; extensions: string[] }[];
	content: Uint8Array;
}

export async function saveFileAs(options: SaveFileOptions): Promise<string | null> {
	const path = await save({
		defaultPath: options.defaultName,
		filters: options.filters,
	});

	if (!path) return null;

	await writeFile(path, options.content);

	const fileName = path.split(/[/\\]/).pop() ?? options.defaultName;
	return fileName;
}
