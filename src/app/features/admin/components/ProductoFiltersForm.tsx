import { useState } from 'react';
import type { Marca } from '../../../models/Marca';
import type { TipoProducto } from '../../../models/TipoProducto';
import type { Proveedor } from '../../../models/AdminCatalogo';

export type EstadoProducto = 'todos' | 'activos' | 'inactivos';

export interface FiltrosProductoDraft {
  nombre: string;
  idTipoProducto: string;
  idMarca: string;
  idProveedor: string;
  estado: EstadoProducto;
}

interface CatalogoEstado {
  isLoading: boolean;
  isError: boolean;
}

interface ProductoFiltersFormProps {
  tipos: TipoProducto[];
  marcas: Marca[];
  proveedores: Proveedor[];
  marcasQuery: CatalogoEstado;
  tiposQuery: CatalogoEstado;
  proveedoresQuery: CatalogoEstado;
  onApply: (filtros: FiltrosProductoDraft) => void;
  onClear: () => void;
}

export function ProductoFiltersForm({
  tipos,
  marcas,
  proveedores,
  marcasQuery,
  tiposQuery,
  proveedoresQuery,
  onApply,
  onClear,
}: ProductoFiltersFormProps) {
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchBrand, setSearchBrand] = useState('');
  const [searchSupplier, setSearchSupplier] = useState('');
  const [searchState, setSearchState] = useState<EstadoProducto>('todos');

  function handleApplyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply({
      nombre: searchName.trim(),
      idTipoProducto: searchType,
      idMarca: searchBrand,
      idProveedor: searchSupplier,
      estado: searchState,
    });
  }

  function handleClearFilters() {
    setSearchName('');
    setSearchType('');
    setSearchBrand('');
    setSearchSupplier('');
    setSearchState('todos');
    onClear();
  }

  return (
    <form
      onSubmit={handleApplyFilters}
      className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <label className="text-sm font-semibold text-slate-700 lg:col-span-2">
        Buscar por nombre
        <input
          type="search"
          value={searchName}
          onChange={(event) => setSearchName(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
        />
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Tipo
        <select
          value={searchType}
          onChange={(event) => setSearchType(event.target.value)}
          disabled={marcasQuery.isLoading || tiposQuery.isLoading || tiposQuery.isError}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
        >
          <option value="">Todos</option>
          {tipos.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Marca
        <select
          value={searchBrand}
          onChange={(event) => setSearchBrand(event.target.value)}
          disabled={marcasQuery.isLoading || marcasQuery.isError}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
        >
          <option value="">Todas</option>
          {marcas.map((marca) => (
            <option key={marca.id} value={marca.id}>
              {marca.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Proveedor
        <select
          value={searchSupplier}
          onChange={(event) => setSearchSupplier(event.target.value)}
          disabled={proveedoresQuery.isLoading || proveedoresQuery.isError}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
        >
          <option value="">Todos</option>
          {proveedores.map((proveedor) => (
            <option key={proveedor.id} value={proveedor.id}>
              {proveedor.razonSocial}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Estado
        <select
          value={searchState}
          onChange={(event) => setSearchState(event.target.value as EstadoProducto)}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </label>
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-6">
        <button type="submit" className="rounded-full bg-slate-950 px-5 py-2.5 font-bold text-white">
          Aplicar filtros
        </button>
        <button
          type="button"
          onClick={handleClearFilters}
          className="rounded-full border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}
