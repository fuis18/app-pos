import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import UserMenu from "@/features/users/components/UserMenu";
import { useThemeStore } from "@/store/themeStore";

const Header = () => {
	const { theme, toggleTheme } = useThemeStore();

	return (
		<header className="flex justify-around p-2">
			<Button asChild>
				<Link to="/">Registro</Link>
			</Button>
			<Button asChild>
				<Link to="/products">Productos</Link>
			</Button>
			<Button asChild>
				<Link to="/sales">Ventas</Link>
			</Button>
			<UserMenu />
			<Button variant="outline" size="icon" onClick={toggleTheme}>
				{theme === "dark" ? (
					<Sun className="h-4 w-4" />
				) : (
					<Moon className="h-4 w-4" />
				)}
			</Button>
		</header>
	);
};

export default Header;
