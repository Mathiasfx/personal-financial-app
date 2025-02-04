/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
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

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await register(form.email, form.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader title="Registrarse" className="text-center" />
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
            <TextField
              label="Confirmar Contraseña"
              name="confirmPassword"
              type="password"
              variant="outlined"
              fullWidth
              onChange={handleChange}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Registrarse
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
