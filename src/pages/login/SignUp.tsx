import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormType } from "@/features/users/types/userSchema";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@/features/users/types/userSchema";
import { createUserService } from "@/features/users/service/users.service";
import { CONFIG } from "@/constants/config";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
	const userService = createUserService({
		tokenValidator: (token) => token === CONFIG.TOKEN,
	});

	const [canGoToLogin, setCanGoToLogin] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const navigate = useNavigate();

	const form = useForm<FormType>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const onSubmit: SubmitHandler<FormType> = async (data) => {
		try {
			setSuccessMessage("");
			const parsed = userSchema.parse(data);

			await userService.createUser({
				username: parsed.username,
				password: parsed.password,
			});

			form.reset();
			setCanGoToLogin(true);
			setSuccessMessage("Se registro correctamente");
		} catch (error) {
			setSuccessMessage("");
			setCanGoToLogin(false);
			form.setError("root", {
				type: "server",
				message:
					"No se pudo realizar el registro. " +
					(error instanceof Error ? error : ""),
			});
		}
	};

	return (
		<div className="form-container">
			<Form {...form}>
				<form className="form-content" onSubmit={form.handleSubmit(onSubmit)}>
					<div className="form-field">
						<Label htmlFor="username">Nombre de Usuario</Label>
						<Input
							id="username"
							type="text"
							{...form.register("username", {
								onChange: () => form.clearErrors("root"),
							})}
						/>
						{form.formState.errors.username && (
							<p className="text-red-500 text-sm">
								{form.formState.errors.username.message}
							</p>
						)}
					</div>
					<div className="form-field">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							{...form.register("password", {
								onChange: () => form.clearErrors("root"),
							})}
						/>
						{form.formState.errors.password && (
							<p className="text-red-500 text-sm">
								{form.formState.errors.password.message}
							</p>
						)}
					</div>
					<div className="form-field">
						{successMessage && (
							<p className="text-green-500 text-sm">{successMessage}</p>
						)}
						{form.formState.errors.root && (
							<p className="text-red-600 text-sm">
								{form.formState.errors.root.message}
							</p>
						)}
						<span>
							<Button type="submit">Sign Up</Button>
							<Button
								className="ml-2"
								variant="outline"
								type="button"
								disabled={!canGoToLogin}
								onClick={() => navigate("/login")}
							>
								Volver
							</Button>
						</span>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default SignUp;
