"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { useState } from "react";
import { userSchema } from "@/features/users/types/userSchema";
import type { FormType } from "@/features/users/types/userSchema";
import type { SubmitHandler } from "react-hook-form";
import { createUserService } from "@/features/users/service/users.service";
import { useUserStore } from "@/store/userStore";
import { CONFIG } from "@/constants/config";

const Login = () => {
	const userService = createUserService({
		tokenValidator: (token) => token === CONFIG.TOKEN,
	});

	const [successMessage, setSuccessMessage] = useState("");

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

			const user = await userService.getUser({
				username: parsed.username,
				password: parsed.password,
			});

			if (!user || user.length === 0) {
				throw new Error("Usuario o contraseña incorrectos");
			}

			useUserStore.setState({ user: user[0] });

			form.reset();
			setSuccessMessage("Se inicio la sesion correctamente");
		} catch (error) {
			setSuccessMessage("");
			form.setError("root", {
				type: "server",
				message:
					"No se pudo realizar el login. " +
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
						<Label htmlFor="password">Contraseña</Label>
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
						<span className="mt-2">
							<Button type="submit">Login</Button>
							<Button variant="outline" type="button">
								<Link
									to="/login/token"
									className="text-blue-500 underline text-sm"
								>
									Sign Up
								</Link>
							</Button>
						</span>
					</div>
				</form>
			</Form>
			<div className="form-source mt-4 text-xs text-muted-foreground">
				{CONFIG.GITHUB_REPO_URL ? (
					<a
						href={CONFIG.GITHUB_REPO_URL}
						target="_blank"
						rel="noreferrer"
						className="underline"
					>
						Source
					</a>
				) : null}
				{CONFIG.GITHUB_REPO_URL && CONFIG.GITHUB_PROFILE_URL ? (
					<span> • </span>
				) : null}
				{CONFIG.GITHUB_PROFILE_URL ? (
					<a
						href={CONFIG.GITHUB_PROFILE_URL}
						target="_blank"
						rel="noreferrer"
						className="underline"
					>
						GitHub
					</a>
				) : null}
			</div>
		</div>
	);
};

export default Login;
