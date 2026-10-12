export function Spinner() {
  return (
    <div role="status" className="flex items-center justify-center py-8">
      <span className="sr-only">Cargando…</span>
      <div
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-brand-600"
      />
    </div>
  );
}
