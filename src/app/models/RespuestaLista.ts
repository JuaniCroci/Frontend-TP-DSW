export interface RespuestaLista<T> {
  data: T[];
  total: number;
  page?: number;
  size?: number;
}
