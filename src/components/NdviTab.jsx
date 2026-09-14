import { useEffect, useState } from 'react';
import { FaSatelliteDish, FaExclamationTriangle, FaCloudRain, FaCheckCircle } from 'react-icons/fa';
import { consultarClima } from '../lib/weather.js';

function parseCoords(str) {
  const [lat, lng] = String(str || '').split(',').map((s) => parseFloat(String(s).trim()));
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
}

function Typewriter({ text }) {
  const [len, setLen] = useState(0);
  useEffect(() => {
    setLen(0);
    if (!text) return undefined;
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setLen(i);
      if (i >= text.length) clearInterval(iv);
    }, 14);
    return () => clearInterval(iv);
  }, [text]);
  return <span className={len < text.length ? 'caret' : ''}>{text.slice(0, len)}</span>;
}

const ALERTAS = {
  termal: {
    cls: 'critical',
    icon: <FaExclamationTriangle />,
    titulo: 'ESTRÉS TÉRMICO CRÍTICO',
  },
  lluvia: {
    cls: 'rain',
    icon: <FaCloudRain />,
    titulo: 'RESTRICCIÓN POR PRECIPITACIÓN',
  },
  optima: {
    cls: 'good',
    icon: <FaCheckCircle />,
    titulo: 'VENTANA OPERATIVA ÓPTIMA',
  },
};

export default function NdviTab({ lotes, activeLoteId, onSelectLote, pushLog, setClima, onGuardarAnalisis }) {
  const [analisis, setAnalisis] = useState(null);
  const [alerta, setAlerta] = useState(null);
  const [logLine, setLogLine] = useState('');
  const [status, setStatus] = useState('idle');

  const procesar = async (id) => {
    onSelectLote(id || null);
    if (!id) {
      setAnalisis(null);
      setAlerta(null);
      setLogLine('');
      setStatus('idle');
      return;
    }

    const lote = lotes.find((x) => x.id === Number(id));
    if (!lote) return;

    setStatus('loading');
    setAlerta(null);

    // Simulación de firmas infrarrojas (misma fórmula histórica del sistema)
    await new Promise((r) => setTimeout(r, 550));
    const vigor = 82 + (lote.id % 15);
    const estres = 100 - vigor;
    setAnalisis({ vigor, estres });

    const ll = parseCoords(lote.coordenadas);
    const climaDatos = ll ? await consultarClima(ll[0], ll[1]) : null;
    if (climaDatos && setClima) setClima(climaDatos);

    const strClima = climaDatos ? ` | Clima: ${climaDatos.temp}°C` : '';
    setLogLine(
      `>>> [ÉXITO] NDVI calculado para '${lote.nombre}'. Reflectancia: ${vigor}%${strClima}`
    );
    setStatus('online');

    pushLog('ANÁLISIS NDVI', `Simulación computada para lote: ${lote.nombre}`);

    // Guarda este análisis en el historial de la base de datos (para los reportes por lote)
    onGuardarAnalisis?.({
      loteId: lote.id,
      vigor,
      estres,
      temperatura: climaDatos?.temp ?? null,
      condicionClima: climaDatos?.condicion ?? null,
    });

    if (!climaDatos) return;

    if (climaDatos.temp >= 35) {
      setAlerta({
        ...ALERTAS.termal,
        texto: `El lote '${lote.nombre}' registra ${climaDatos.temp}°C. Se recomienda suspender el traslado de plántulas y el tape de semilla para evitar deshidratación del material vegetativo.`,
      });
      pushLog('ALERTA', `Estrés térmico detectado en ${lote.nombre}`);
    } else if (climaDatos.code >= 51 && climaDatos.code <= 82) {
      setAlerta({
        ...ALERTAS.lluvia,
        texto: `Lluvia activa sobre '${lote.nombre}'. Las labores mecánicas de surcado y tracción pueden generar compactación severa del suelo. Vigilar drenajes.`,
      });
      pushLog('ALERTA', `Precipitación activa sobre ${lote.nombre}`);
    } else {
      setAlerta({
        ...ALERTAS.optima,
        texto: `Condiciones microclimáticas ideales (${climaDatos.temp}°C) en '${lote.nombre}'. El balance hídrico favorece la tasa de germinación del brote de caña.`,
      });
    }
  };

  const loteActivo = lotes.find((x) => x.id === activeLoteId);

  return (
    <section className="stack">
      <div className="panel-grid ndvi">
        <div className="card" style={{ display: 'grid', gap: 16 }}>
          <div className="card-title-row" style={{ marginBottom: 0 }}>
            <h3 className="card-title">
              <FaSatelliteDish /> Vigor Vegetativo Satelital
            </h3>
            <small>NDVI</small>
          </div>

          <label className="field">
            <span>Seleccionar Parcela Operativa</span>
            <select
              className="select"
              value={activeLoteId ?? ''}
              onChange={(e) => procesar(e.target.value)}
            >
              <option value="">-- Esperando selección --</option>
              {lotes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="stat-list">
            <div className="row">
              <span className="muted">🟢 Vigor Óptimo</span>
              <span className="val" style={{ color: 'var(--primary)' }}>
                {analisis ? `${analisis.vigor} %` : '-- %'}
              </span>
            </div>
            <div className="row">
              <span className="muted">🟠 Estrés Hídrico</span>
              <span className="val" style={{ color: 'var(--accent-strong)' }}>
                {analisis ? `${analisis.estres} %` : '-- %'}
              </span>
            </div>
          </div>

          {alerta && (
            <div className={`alert-box ${alerta.cls}`}>
              <div className="alert-head">
                {alerta.icon} {alerta.titulo}
              </div>
              <p style={{ margin: 0 }}>{alerta.texto}</p>
            </div>
          )}

          {!alerta && (
            <p className="muted" style={{ margin: 0 }}>
              El motor de reglas evaluará temperatura y precipitación al ejecutar un análisis.
            </p>
          )}
        </div>

        <div className="console">
          <div>
            <p className="dim" style={{ margin: 0 }}>
              {'// CONSOLA DE TELEMETRÍA SATELITAL Y METEOROLÓGICA'}
            </p>
            <p style={{ margin: '10px 0 0' }}>
              Estado:{' '}
              {status === 'online' ? (
                <span className="ok">ONLINE · MÉTRICAS CARGADAS</span>
              ) : status === 'loading' ? (
                <span className="warn">PROCESANDO FIRMAS INFRARROJAS…</span>
              ) : (
                <span className="warn">Esperando selección de lote…</span>
              )}
            </p>
            <p className="dim" style={{ margin: '6px 0 0' }}>
              Coordenadas vinculadas:{' '}
              {loteActivo ? `[${loteActivo.coordenadas}]` : 'Ninguna'}
            </p>
          </div>
          <div>
            <hr />
            <p className="dim" style={{ margin: 0 }}>
              Resultado del procesamiento:
            </p>
            <p className="ok" style={{ margin: '6px 0 0', minHeight: 20 }}>
              {logLine ? <Typewriter text={logLine} /> : '>>> Canal de datos inactivo.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
