/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Esta página es la página de inicio de sesión de la aplicación.
 * Contiene un formulario de login con un botón de Google o un campo de email y contraseña.
 */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";

import { TextField, Button, Divider } from "@mui/material";
import Link from "next/link";

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
    <div className="flex items-center justify-center min-h-screen bg-white  ">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-7xl  overflow-hidden ">
        {/* Sección Izquierda - Formulario */}
        <div className="p-10 bg-white  flex flex-col justify-center">
          <h3 className="font-normal text-gray-900  mb-3 text-2xl">Ingresar</h3>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<FcGoogle />}
            onClick={handleGoogleLogin}
            sx={{ borderColor: "gray" }}
            className="mb-3 border-gray-300 min-h-11 rounded-3xl text-[#171717] "
          >
            Ingresar con Google
          </Button>

          <Divider className="mb-6 mt-6" />
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-red-500">{error}</p>}
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
            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="min-h-11 rounded-3xl bg-[#171717]"
            >
              Login
            </Button>
          </form>
          <p className="mt-4 text-center text-[#171717] text-sm">
            ¿Aún no has creado tu cuenta en Fiapp?{"  "}
            <Link href="/register" className="text-blue-500 hover:underline">
              Regístrate
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
