import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";

import { lazy, Suspense } from "react";

const Registry = lazy(() => import("@/pages/Registry"));
const Products = lazy(() => import("@/pages/Products"));
const Sales = lazy(() => import("@/pages/Sales"));

const Login = lazy(() => import("@/pages/login/Login"));
const SignIn = lazy(() => import("@/pages/login/SignUp"));
const Token = lazy(() => import("@/pages/login/Token"));

function Router() {
	return (
		<BrowserRouter>
			<Suspense fallback={<div>Loading...</div>}>
				<Routes>
					<Route element={<App />}>
						<Route path="/" element={<Registry />} />

						<Route path="/products">
							<Route index element={<Products />} />
						</Route>

						<Route path="/sales">
							<Route index element={<Sales />} />
						</Route>

						<Route path="/login">
							<Route index element={<Login />} />
							<Route path="signup" element={<SignIn />} />
							<Route path="token" element={<Token />} />
						</Route>
					</Route>
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}

export default Router;
