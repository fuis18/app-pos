// src/features/registry/components/RegistryOptions.tsx
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/store/userStore";
import type { FocusColumn } from "../types/focus.types";

interface Props {
	onSubmit: () => void;
	onDelete: () => void;
	disableDelete?: boolean;
	preference: FocusColumn;
	onPreferenceChange: (column: FocusColumn) => void;
}

const RegistryOptions = ({
	onSubmit,
	onDelete,
	disableDelete,
	preference,
	onPreferenceChange,
}: Props) => {
	const { user } = useUserStore();

	return (
		<div className="flex flex-col gap-2">
			<ButtonGroup orientation="vertical" className="h-fit">
				<Button variant="outline" onClick={onDelete} disabled={disableDelete}>
					Borrar
				</Button>
				<Button onClick={onSubmit}>Enviar</Button>
			</ButtonGroup>

			{user && (
				<Select
					value={preference}
					onValueChange={(val) => onPreferenceChange(val as FocusColumn)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Preferencia" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="code">Código</SelectItem>
						<SelectItem value="name">Nombre</SelectItem>
					</SelectContent>
				</Select>
			)}
		</div>
	);
};

export default RegistryOptions;
