/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import { Edit, Delete, Save } from "@mui/icons-material";
import {
  ShoppingCart,
  DirectionsCar,
  Fastfood,
  Movie,
  FitnessCenter,
  LocalHospital,
  Home,
  Flight,
  SportsSoccer,
  Restaurant,
  Work,
  School,
} from "@mui/icons-material";
import { AppDispatch } from "@/app/redux/store";
import { useSelector, useDispatch } from "react-redux";
import {
  crearCategoria,
  editarCategoria,
  eliminarCategoria,
  fetchCategorias,
  selectCategorias,
  // selectCategoriasLoading,
} from "@/app/redux/slices/categorias";

export default function CategoriasPage() {
  const iconMap: { [key: string]: JSX.Element } = useMemo(
    () => ({
      ShoppingCart: <ShoppingCart />,
      DirectionsCar: <DirectionsCar />,
      Fastfood: <Fastfood />,
      Movie: <Movie />,
      FitnessCenter: <FitnessCenter />,
      LocalHospital: <LocalHospital />,
      Home: <Home />,
      Flight: <Flight />,
      SportsSoccer: <SportsSoccer />,
      Restaurant: <Restaurant />,
      Work: <Work />,
      School: <School />,
    }),
    []
  );

  const iconOptions = useMemo(() => Object.keys(iconMap), [iconMap]);

  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const categorias = useSelector(selectCategorias);
  //const categoriasLoading = useSelector(selectCategoriasLoading);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevoIcono, setNuevoIcono] = useState("ShoppingCart");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editIcon, setEditIcon] = useState("ShoppingCart");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchCategorias(user.uid));
    }
  }, [user, dispatch]);

  const paginatedCategories = useMemo(
    () =>
      categorias.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [categorias, page, rowsPerPage]
  );

  //#region Agregar Categoría
  const handleAddCategory = async () => {
    if (user && nuevaCategoria.trim()) {
      await dispatch(
        crearCategoria({
          uid: user.uid,
          categoria: {
            nombre: nuevaCategoria,
            icono: nuevoIcono,
          },
        })
      );
      setNuevaCategoria("");
      setNuevoIcono("ShoppingCart");
    }
  };
  //#endregion

  //#region Eliminar Categoría
  const handleDeleteCategory = async (id: string) => {
    if (user) {
      await dispatch(eliminarCategoria({ uid: user.uid, id }));
    }
  };
  //#endregion

  //#region Editar Categoría
  const handleEditCategory = (
    categoryId: string,
    nombreActual: string,
    iconoActual: string
  ) => {
    setEditingId(categoryId);
    setEditValue(nombreActual);
    setEditIcon(iconoActual);
  };
  //#endregion

  //#region Guardar Editar Categoría
  const handleSaveEdit = async (id: string) => {
    if (user && editValue.trim()) {
      await dispatch(
        editarCategoria({
          uid: user.uid,
          categoria: {
            id,
            nombre: editValue,
            icono: editIcon,
          },
        })
      );
      setEditingId(null);
      setEditValue("");
      setEditIcon("ShoppingCart");
    }
  };
  //#endregion

  //#region Paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  //#endregion
  const handleIconChange = useCallback((e: SelectChangeEvent<string>) => {
    setNuevoIcono(e.target.value);
  }, []);

  const handleEditIconChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setEditIcon(e.target.value);
    },
    []
  );

  return (
    <div className="p-0 md:p-6 w-full max-w-4xl  justify-start">
      <h1 className="text-lg md:text-xl font-bold text-left">
        Administración de Categorías
      </h1>
      <div className="flex flex-col md:flex-row gap-4 my-4 items-center">
        <TextField
          label="Nueva Categoría"
          variant="outlined"
          value={nuevaCategoria}
          sx={{
            marginTop: "1rem",
            marginBottom: "1rem",
            "& .MuiOutlinedInput-root": {
              borderRadius: "24px",
            },
          }}
          onChange={(e) => setNuevaCategoria(e.target.value)}
        />
        <Select
          labelId="icon-label"
          label="Icono"
          value={nuevoIcono}
          onChange={handleIconChange}
          sx={{
            borderRadius: "24px",
            "& .MuiOutlinedInput-notchedOutline": {
              borderRadius: "24px",
            },
          }}
        >
          {iconOptions.map((icon: string) => (
            <MenuItem key={icon} value={icon}>
              {iconMap[icon]}
            </MenuItem>
          ))}
        </Select>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#171717",
            color: "#ffff",
            borderRadius: "24px",
          }}
          onClick={handleAddCategory}
        >
          Agregar
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl shadow-md">
        <table className="w-full border-collapse bg-white text-left text-sm text-gray-700">
          {/* Encabezado */}
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-gray-700">Nombre</th>
              <th className="px-6 py-3 text-gray-700">Ícono</th>
              <th className="px-6 py-3 text-gray-700">Acciones</th>
            </tr>
          </thead>

          {/* Cuerpo */}
          <tbody>
            {paginatedCategories.map((categoria) => (
              <tr
                key={categoria.id}
                className="border-b hover:bg-gray-100 transition-all"
              >
                <td className="px-6 py-3">
                  {editingId === categoria.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full border border-gray-100  rounded-lg px-2 py-3 focus:outline-none "
                    />
                  ) : (
                    categoria.nombre
                  )}
                </td>
                <td className="px-6 py-3">
                  {editingId === categoria.id ? (
                    <select
                      value={editIcon}
                      onChange={handleEditIconChange}
                      className="w-full border border-gray-100  rounded-lg px-2 py-3 focus:outline-none "
                    >
                      {iconOptions.map((icon) => (
                        <option key={icon} value={icon}>
                          {iconMap[icon]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    iconMap[categoria.icono]
                  )}
                </td>
                <td className="px-6 py-3 flex space-x-2">
                  {editingId === categoria.id ? (
                    <button
                      onClick={() => handleSaveEdit(categoria.id)}
                      className="p-1 hover:underline border-none bg-none rounded-full"
                    >
                      <Save className="w-5 h-5 m-1" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          handleEditCategory(
                            categoria.id,
                            categoria.nombre,
                            categoria.icono
                          )
                        }
                        className="text-gray-900 hover:underline border-none bg-none rounded-full "
                      >
                        <Edit className="w-5 h-5 m-1 text-gray-900" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(categoria.id)}
                        className="text-red-500 hover:underline border-none bg-none rounded-full "
                      >
                        <Delete className="w-5 h-5 m-1" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-end space-x-2 mt-4">
        {/* Botón Anterior */}
        <button
          onClick={() => handleChangePage(null, page - 1)}
          disabled={page === 0}
          className="p-2 rounded-full border-none  shadow-sm transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5 text-gray-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Indicador de Página */}
        <span className="px-1 py-1 "></span>

        {/* Botón Siguiente */}
        <button
          onClick={() => handleChangePage(null, page + 1)}
          disabled={page >= Math.ceil(categorias.length / rowsPerPage) - 1}
          className="p-2 rounded-full border-none  shadow-sm transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5 text-gray-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
