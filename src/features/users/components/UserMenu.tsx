import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/store/userStore";

const UserMenu = () => {
	const { user, setUser } = useUserStore();

	if (!user) {
		return (
			<Button>
				<Link to="/login">Iniciar Sesión</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button>
					<Link to="/login">{user.username.toUpperCase()}</Link>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuGroup>
					<DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
					{/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
					<DropdownMenuItem onClick={() => setUser(null)}>
						Cerrar Sesión
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserMenu;
