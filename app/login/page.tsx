/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Esta página es la página de inicio de sesión de la aplicación.
 * Contiene un formulario de login con un botón de Google o un campo de email y contraseña.
 */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/lib/useToast";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import imagepreview from "../../public/images/dashboard_preview.png";
import { TextField, Button, Divider, CircularProgress } from "@mui/material";
import Link from "next/link";

export default function LoginPage() {
  const { login, loginWithGoogle, user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      toast.showWarning("Por favor completa todos los campos");
      setLoading(false);
      return;
    }

    try {
      await login(form.email, form.password);
      toast.showSuccess("¡Bienvenido! Inicio de sesión exitoso");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      toast.showError("Error al iniciar sesión: " + err.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1600);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.showSuccess("¡Bienvenido! Inicio de sesión con Google exitoso");
      router.push("/dashboard");
    } catch (error: any) {
      console.log(error);
      toast.showError("Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex flex-1 h-screen justify-center items-center">
        <CircularProgress size="3rem" sx={{ color: "#171717" }} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white  ">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-7xl  overflow-hidden ">
        {/* Sección Izquierda - Formulario */}
        <div className="p-10 bg-white  flex flex-col justify-center">
          <h3 className="font-normal text-gray-900  mb-3 text-2xl textlufga">
            Ingresar
          </h3>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<FcGoogle />}
            onClick={handleGoogleLogin}
            sx={{
              borderColor: "#d1d5db",
              marginBottom: "12px",
              color: "#171717",
              borderRadius: "24px",
              minHeight: "44px",
            }}
          >
            Ingresar con Google
          </Button>

          <Divider sx={{ marginBottom: "1.5rem", marginTop: "1.5rem" }} />
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
              sx={{
                backgroundColor: "#171717",
                borderRadius: "24px",
                minHeight: "44px",
              }}
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
          <div className="flex justify-center md:justify-end">

            <p className="text-xs">Version: 1.2.0</p>

          </div>
        </div>
        {/* Sección Derecha - Imagen */}
        <div className="hidden md:flex bg-[#171717] text-white flex-col justify-center items-center p-10 min-h-[900px] rounded-xl">
          <h5 className="font-semibold text-white text-2xl mb-4">
            La mejor manera de manejar tus finanzas
          </h5>

          <Image
            src={imagepreview}
            alt="Dashboard Preview"
            width={700}
            height={200}
            className="w-full max-w-xs rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
