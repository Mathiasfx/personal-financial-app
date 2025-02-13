/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TextField, Button, Typography } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { updateProfile } from "firebase/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
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
      const useCredential: any = await register(form.email, form.password);
      const user = useCredential.user;
      await updateProfile(user, {
        displayName: form.nombre,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white  ">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-7xl  overflow-hidden ">
        {/* Sección Izquierda - Formulario */}
        <div className="p-10 bg-white  flex flex-col justify-center">
          <h3 className="font-normal text-gray-900  mb-3 text-2xl">
            Registrarse
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <Typography color="error">{error}</Typography>}
            <TextField
              label="Nombre"
              name="nombre"
              variant="outlined"
              fullWidth
              onChange={handleChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "24px",
                },
              }}
            />
            <TextField
              label="Email"
              name="email"
              variant="outlined"
              fullWidth
              onChange={handleChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "24px",
                },
              }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              onChange={handleChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "24px",
                },
              }}
            />
            <TextField
              label="Confirmar Password"
              name="confirmPassword"
              type="password"
              variant="outlined"
              fullWidth
              onChange={handleChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "24px",
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                backgroundColor: "#171717",
                minHeight: "44px",
                borderRadius: "24px",
              }}
            >
              Registrarse
            </Button>
          </form>
          <p className="mt-4 text-center text-[#171717] text-sm">
            ¿Ya tienes cuenta?{"  "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Ingresar
            </Link>
          </p>
        </div>
        {/* Sección Derecha - Imagen */}
        <div className="hidden md:flex bg-[#171717] text-white flex-col justify-center items-center p-10 min-h-[900px] rounded-xl">
          <h5 className="font-semibold text-white text-2xl mb-4">
            La mejor manera de manejar tus finanzas
          </h5>

          <Image
            src="/images/dashboard-preview.png"
            alt="Dashboard Preview"
            width={100}
            height={100}
            className="w-full max-w-xs rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
