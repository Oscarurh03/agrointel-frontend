import { API_URL } from '../constants.js';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error de conexión con el servidor.');
  return data;
}

export const apiGet = (path) => request(path);
export const apiPost = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
export const apiPut = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });
export const apiDelete = (path) => request(path, { method: 'DELETE' });

// Para endpoints que devuelven un archivo (ej. respaldo .sql) en vez de JSON
export async function apiDownload(path, nombreSugerido) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'No se pudo descargar el archivo.');
  }
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="(.+)"/);
  const nombre = match ? match[1] : nombreSugerido || 'descarga.txt';

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nombre;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
