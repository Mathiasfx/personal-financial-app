/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/finanzasService";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  TablePagination,
} from "@mui/material";
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

const iconMap: Record<string, JSX.Element> = {
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
};
const iconOptions = Object.keys(iconMap);

export default function CategoriasPage() {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<any[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevoIcono, setNuevoIcono] = useState("ShoppingCart");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editIcon, setEditIcon] = useState("ShoppingCart");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (user) {
      getCategories(user.uid).then((data) => {
        setCategorias(data || []);
      });
    }
  }, [user]);

  //#region Agregar Categoría
  const handleAddCategory = async () => {
    if (user && nuevaCategoria.trim()) {
      const newCategory = { nombre: nuevaCategoria, icono: nuevoIcono };
      const addedCategory = await addCategory(user.uid, newCategory);
      setCategorias([...categorias, addedCategory]);
      setNuevaCategoria("");
      setNuevoIcono("ShoppingCart");
    }
  };
  //#endregion

  //#region Eliminar Categoría
  const handleDeleteCategory = async (categoryId: string) => {
    if (user) {
      await deleteCategory(user.uid, categoryId);
      setCategorias(categorias.filter((cat) => cat.id !== categoryId));
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
  const handleSaveEdit = async (categoryId: string) => {
    if (user && editValue.trim()) {
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
    }
  };
  //#endregion

  //#region Paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  //#endregion

  return (
    <div className="p-4 md:p-6 w-full max-w-4xl  justify-start">
      <h1 className="text-lg md:text-xl font-bold text-left">
        Administración de Categorías
      </h1>
      <div className="flex flex-col md:flex-row gap-4 my-4 items-center">
        <TextField
          label="Nueva Categoría"
          variant="outlined"
          value={nuevaCategoria}
          sx={{
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
          onChange={(e) => setNuevoIcono(e.target.value)}
          sx={{
            borderRadius: "24px",
            "& .MuiOutlinedInput-notchedOutline": {
              borderRadius: "24px",
            },
          }}
        >
          {iconOptions.map((icon) => (
            <MenuItem key={icon} value={icon}>
              {iconMap[icon]}
            </MenuItem>
          ))}
        </Select>
        <Button
          variant="contained"
          className="bg-[#171717] text-white rounded-3xl "
          onClick={handleAddCategory}
        >
          Agregar
        </Button>
      </div>

      <TableContainer component={Paper} className="rounded-xl overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Ícono</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categorias
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((categoria) => (
                <TableRow key={categoria.id} className="hover:bg-gray-100">
                  <TableCell>
                    {editingId === categoria.id ? (
                      <TextField
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "24px",
                          },
                        }}
                      />
                    ) : (
                      categoria.nombre
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === categoria.id ? (
                      <Select
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        sx={{
                          borderRadius: "24px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderRadius: "24px",
                          },
                        }}
                      >
                        {iconOptions.map((icon) => (
                          <MenuItem key={icon} value={icon}>
                            {iconMap[icon]}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      iconMap[categoria.icono]
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === categoria.id ? (
                      <IconButton onClick={() => handleSaveEdit(categoria.id)}>
                        <Save />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={() =>
                          handleEditCategory(
                            categoria.id,
                            categoria.nombre,
                            categoria.icono
                          )
                        }
                      >
                        <Edit />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => handleDeleteCategory(categoria.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        className="mt-4  flex justify-end"
        count={categorias.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[]}
        labelRowsPerPage=""
      />
    </div>
  );
}
