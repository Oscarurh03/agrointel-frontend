function describirClima(code) {
  if (code > 0 && code <= 3) return { condicion: 'Parcialmente nublado', icono: '⛅' };
  if (code >= 45 && code <= 48) return { condicion: 'Niebla', icono: '🌫️' };
  if (code >= 51 && code <= 67) return { condicion: 'Llovizna ligera', icono: '🌧️' };
  if (code >= 71 && code <= 82) return { condicion: 'Tormenta eléctrica', icono: '⛈️' };
  if (code >= 95) return { condicion: 'Tormenta severa', icono: '⛈️' };
  return { condicion: 'Despejado', icono: '☀️' };
}

export async function consultarClima(lat, lng) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    );
    if (!res.ok) throw new Error('Servicio de clima no disponible');
    const data = await res.json();
    const { temperature, weathercode } = data.current_weather;
    const { condicion, icono } = describirClima(weathercode);
    return { temp: temperature, condicion, icono, code: weathercode };
  } catch {
    return null;
  }
}
