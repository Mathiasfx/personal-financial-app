"use client";
import { migrateFinancialData } from "@/lib/finanzasService";

import { useAuth } from "@/context/AuthContext";

import financialData from "../../../lib/datos.json";
const Temporal = () => {
  const { user } = useAuth();

  const handleMigration = async () => {
    if (user) {
      const success = await migrateFinancialData(user.uid, financialData);
      if (success) {
        alert("Datos migrados con éxito.");
      } else {
        alert("Error en la migración.");
      }
    } else {
      alert("Usuario no autenticado.");
    }
  };

  return (
    <div>
      <p>Usuario: {user?.email || "No autenticado"}</p>
      <button onClick={handleMigration}>Migrar Datos</button>
    </div>
  );
};

export default Temporal;
