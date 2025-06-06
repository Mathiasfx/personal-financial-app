/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/lib/useToast";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/finanzasService";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
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
  const toast = useToast();
  const [categorias, setCategorias] = useState<any[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevoIcono, setNuevoIcono] = useState("ShoppingCart");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editIcon, setEditIcon] = useState("ShoppingCart");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  useEffect(() => {
    if (user) {
      getCategories(user.uid)
        .then((data) => {
          setCategorias(data || []);
        })
        .catch((error) => {
          console.error("Error al cargar categorías:", error);
          toast.crud.loadError("las categorías");
        });
    }
  }, [user, toast]);


  const paginatedCategories = useMemo(
    () =>
      categorias.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [categorias, page, rowsPerPage]
  );
  //#region Agregar Categoría
    const handleAddCategory = useCallback(async () => {
    if (user && nuevaCategoria.trim()) {
      try {
        const newCategory = { nombre: nuevaCategoria, icono: nuevoIcono };
        const addedCategory = await addCategory(user.uid, newCategory);
        setCategorias((prev) => [...prev, addedCategory]);
        setNuevaCategoria("");
        setNuevoIcono("ShoppingCart");
        toast.finance.categoryCreated();
      } catch (error) {
        console.error("Error al agregar categoría:", error);
        toast.finance.categoryError();
      }
    } else {
      toast.crud.validation("El nombre de la categoría es requerido");
    }
  }, [user, nuevaCategoria, nuevoIcono, toast]);
  //#endregion
  
  //#region Eliminar Categoría
  const handleDeleteCategory = useCallback(
    async (categoryId: string) => {
      if (user) {
        try {
          await deleteCategory(user.uid, categoryId);
          setCategorias((prev) => prev.filter((cat) => cat.id !== categoryId));
          toast.finance.categoryDeleted();
        } catch (error) {
          console.error("Error al eliminar categoría:", error);
          toast.crud.deleteError("la categoría");
        }
      }
    },
    [user, toast]
  );
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
  //#region Guardar Editar Categoría
  const handleSaveEdit = async (categoryId: string) => {
    if (user && editValue.trim()) {
      try {
        await updateCategory(user.uid, categoryId, {
          nombre: editValue,
          icono: editIcon,
        });
        setCategorias(
          categorias.map((cat) =>
            cat.id === categoryId
              ? { ...cat, nombre: editValue, icono: editIcon }
              : cat
          )
        );
        setEditingId(null);
        setEditValue("");
        setEditIcon("ShoppingCart");
        toast.finance.categoryUpdated();
      } catch (error) {
        console.error("Error al actualizar categoría:", error);
        toast.crud.updateError("la categoría");
      }
    } else {
      toast.crud.validation("El nombre de la categoría es requerido");
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
  const handleEditIconChange = useCallback((e: SelectChangeEvent<string>) => {
    setEditIcon(e.target.value);
  }, []);

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
      </div>{" "}
      {/* Card contenedor principal */}
      <div className="bg-white shadow-md rounded-2xl p-6 min-h-[180px] w-full max-w-4xl">
        {categorias.length > 0 ? (
          <div className="space-y-3">
            {paginatedCategories.map((categoria) => (
              <div
                key={categoria.id}
                className="flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm w-full hover:bg-gray-200 transition-all duration-200"
              >
                {/* Información de la categoría */}
                <div className="flex items-center gap-4 flex-1">
                  {" "}
                  <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm">
                    {editingId === categoria.id ? (
                      <FormControl
                        size="small"
                        sx={{ minWidth: 48, width: 48 }}
                      >
                        <Select
                          value={editIcon}
                          onChange={handleEditIconChange}
                          displayEmpty
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                            },
                            "& .MuiSelect-select": {
                              padding: "0 !important",
                              paddingRight: "0 !important",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minHeight: "auto",
                            },
                            "& .MuiSelect-icon": {
                              display: "none",
                            },
                          }}
                        >
                          {iconOptions.map((icon) => (
                            <MenuItem key={icon} value={icon}>
                              <div className="flex items-center justify-center">
                                {iconMap[icon]}
                              </div>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <div className="text-gray-700">
                        {iconMap[categoria.icono]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    {editingId === categoria.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Nombre de la categoría"
                      />
                    ) : (
                      <div>
                        <p className="text-lg font-bold text-gray-800">
                          {categoria.nombre}
                        </p>
                        <p className="text-sm text-gray-500">
                          Icono: {categoria.icono}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-2">
                  {editingId === categoria.id ? (
                    <button
                      onClick={() => handleSaveEdit(categoria.id)}
                      className="p-2 hover:bg-gray-300 border-none bg-transparent rounded-full transition-all"
                      title="Guardar cambios"
                    >
                      <Save className="w-5 h-5 text-green-600" />
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
                        className="p-2 hover:bg-gray-300 border-none bg-transparent rounded-full transition-all"
                        title="Editar categoría"
                      >
                        <Edit className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(categoria.id)}
                        className="p-2 hover:bg-gray-300 border-none bg-transparent rounded-full transition-all"
                        title="Eliminar categoría"
                      >
                        <Delete className="w-5 h-5 text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            No hay categorías registradas.
          </p>
        )}
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
