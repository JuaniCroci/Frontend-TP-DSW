export function Spinner() {
  return (
    <p
      role="status"
      className="flex items-center justify-center gap-3 py-16 text-sm font-semibold text-slate-600"
    >
      <span
        aria-hidden="true"
        className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-lime-600"
      />
      Cargando...
    </p>
  );
}
