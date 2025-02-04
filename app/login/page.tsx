/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
} from "@mui/material";

export default function LoginPage() {
  const { login, loginWithGoogle, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader title="Iniciar Sesión" className="text-center" />
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <Typography color="error">{error}</Typography>}
            <TextField
              label="Correo Electrónico"
              name="email"
              variant="outlined"
              fullWidth
              onChange={handleChange}
            />
            <TextField
              label="Contraseña"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              onChange={handleChange}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Ingresar
            </Button>
            <Button
              onClick={handleGoogleLogin}
              variant="outlined"
              color="secondary"
              fullWidth
            >
              Iniciar sesión con Google
            </Button>
          </form>
          <Typography
            variant="body2"
            className="mt-4 text-center text-gray-600 dark:text-gray-400"
          >
            ¿No tienes cuenta?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Regístrate
            </a>
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
