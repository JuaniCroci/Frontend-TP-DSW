import { useState } from 'react';
import { useCrearIngreso } from '../api/ingresosMutations';
import { getApiErrorMessage } from '../../../core/api/friendlyError';

interface ProductoSeleccionable {
  id: number;
  nombre: string;
  stockActual: number;
}

interface ProveedorSeleccionable {
  id: number;
  razonSocial: string;
}

interface Props {
  proveedores: ProveedorSeleccionable[];
  productos: ProductoSeleccionable[];
  onClose: () => void;
}

interface RenglonIngreso {
  idProducto: number;
  cantidad: number;
}

export function RegistrarIngresoModal({ proveedores, productos, onClose }: Props) {
  const crearIngresoMutation = useCrearIngreso();

  const [idProveedor, setIdProveedor] = useState<number | ''>('');
  const [nroIngreso, setNroIngreso] = useState<string>('');
  const [items, setItems] = useState<RenglonIngreso[]>([
    { idProducto: 0, cantidad: 1 },
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAgregarItem = () => {
    setItems([...items, { idProducto: 0, cantidad: 1 }]);
  };

  const handleRemoverItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof RenglonIngreso, value: number) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [field]: value };
    setItems(nuevosItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!idProveedor) {
      setErrorMsg('Debes seleccionar un proveedor.');
      return;
    }

    const itemsValidos = items.filter((it) => it.idProducto > 0 && it.cantidad > 0);
    if (itemsValidos.length === 0) {
      setErrorMsg('Debes agregar al menos un producto válido con cantidad mayor a 0.');
      return;
    }

    try {
      await crearIngresoMutation.mutateAsync({
        idProveedor: Number(idProveedor),
        nroIngreso: nroIngreso || undefined,
        items: itemsValidos,
      });
      onClose();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Registrar Ingreso de Mercadería
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Proveedor *
              </label>
              <select
                required
                value={idProveedor}
                onChange={(e) => setIdProveedor(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-950"
              >
                <option value="">Seleccionar Proveedor...</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.razonSocial}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                N° de Comprobante / Remito (Opcional)
              </label>
              <input
                type="text"
                value={nroIngreso}
                onChange={(e) => setNroIngreso(e.target.value)}
                placeholder="Ej: ING-000123"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-950"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-slate-800">Productos a ingresar</h3>
              <button
                type="button"
                onClick={handleAgregarItem}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                + Agregar otro producto
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-center mb-3">
                <div className="flex-1">
                  <select
                    value={item.idProducto}
                    onChange={(e) => handleItemChange(index, 'idProducto', Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value={0}>Seleccionar Producto...</option>
                    {productos.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nombre} (Stock actual: {prod.stockActual})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-28">
                  <input
                    type="number"
                    min="1"
                    placeholder="Cant."
                    value={item.cantidad}
                    onChange={(e) => handleItemChange(index, 'cantidad', Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoverItem(index)}
                    className="text-red-500 hover:text-red-700 text-sm px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={crearIngresoMutation.isPending}
              className="px-4 py-2 text-sm font-medium bg-slate-950 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
            >
              {crearIngresoMutation.isPending ? 'Guardando Ingreso...' : 'Confirmar Ingreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}