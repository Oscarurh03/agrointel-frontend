import { useEffect, useMemo, useState } from 'react';
import { FaSeedling } from 'react-icons/fa';

export default function ResiembraTab({ activeLoteId, onUpdateSemilla }) {
  const [dist, setDist] = useState('1.50');
  const [falla, setFalla] = useState('12.5');

  const resultado = useMemo(() => {
    const d = parseFloat(dist) || 1.5;
    const f = parseFloat(falla) || 0;
    const densidad = 10000 / d;
    const poblacion = densidad * (f / 100);
    const masa = poblacion * 0.12;
    return { densidad, poblacion, masa };
  }, [dist, falla]);

  useEffect(() => {
    if (!activeLoteId) return undefined;
    onUpdateSemilla(activeLoteId, parseFloat(resultado.masa.toFixed(2)));
    return undefined;
  }, [activeLoteId, resultado.masa, onUpdateSemilla]);

  const fmt = (n) => n.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section className="stack">
      <div className="panel-grid resiembra">
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">
              <FaSeedling /> Variables Técnicas de Entrada
            </h3>
          </div>

          {activeLoteId ? (
            <p style={{ marginTop: 0 }}>
              <span className="chip-note">🌱 Los resultados se asignan al lote activo seleccionado en NDVI</span>
            </p>
          ) : (
            <p className="muted" style={{ marginTop: 0 }}>
              Sin lote activo: el cálculo es general por hectárea. Selecciona un lote en la pestaña
              NDVI para almacenar su semilla requerida.
            </p>
          )}

          <label className="field">
            <span>Distancia Entre Surcos (metros lineales)</span>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0.1"
              value={dist}
              onChange={(e) => setDist(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Porcentaje de Fallas de Germinación (%)</span>
            <input
              className="input"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={falla}
              onChange={(e) => setFalla(e.target.value)}
            />
          </label>

          <div className="divider" />
          <p className="muted" style={{ margin: 0 }}>
            Fórmula: densidad = 10 000 m² ÷ distancia · población = densidad × falla · masa =
            población × 0.12 kg.
          </p>
        </div>

        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Resultados Biométricos Estimados</h3>
          </div>

          <div className="stat-list">
            <div className="row">
              <span className="muted">Densidad de Líneas Teóricas / Ha</span>
              <span className="val">{fmt(resultado.densidad)} m</span>
            </div>
            <div className="row">
              <span className="muted">Población Vegetal Faltante / Ha</span>
              <span className="val">{fmt(resultado.poblacion)} u</span>
            </div>
            <div className="row stat-total">
              <span>Masa de Semilla Requerida / Ha</span>
              <span className="val" style={{ color: 'var(--primary-strong)' }}>
                {fmt(resultado.masa)} Kg
              </span>
            </div>
          </div>

          <div className="divider" />
          <div className="alert-box good" style={{ fontSize: 12 }}>
            <div className="alert-head">📌 Nota agronómica</div>
            Ajusta la distancia de surcos según la variedad: siembras densas (&lt; 1.4 m) elevan el
            requerimiento de semilla por hectárea de forma proporcional.
          </div>
        </div>
      </div>
    </section>
  );
}
