import { useState } from 'react';
import Swal from 'sweetalert2';
import { FaLeaf, FaTractor, FaCalendar, FaEuroSign } from 'react-icons/fa';

export default function RiegoTab({ lotes, riego, onSetMetodo, pushLog }) {
  const [loteSeleccionado, setLoteSeleccionado] = useState('');
  const [metodo, setMetodo] = useState('goteo');

  const métodos = ['goteo', 'aspersión', 'rain-feed'];

  const aplicarMetodo = () => {
    if (!loteSeleccionado) {
      Swal.fire('Lote no seleccionado', 'Selecciona un lote de la lista antes de asignar el método de riego.', 'warning');
      return;
    }
    onSetMetodo(loteSeleccionado, metodo);
    pushLog('RIEGO', `Método ${metodo} asignado al lote: ${loteSeleccionado}`);
    Swal.fire('Método de riego', `El método ${metodo} ha sido asignado al lote ${loteSeleccionado}.`, 'success');
  };

  return (
    <section className="stack">
      <div className="panel-grid monitoreo">
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Métodos de Riego</h3>
          </div>

          <ol className="steps-hint">
            <li>Selecciona un lote de la lista.</li>
            <li>Elige el método de riego deseado.</li>
            <li>El sistema actualizará el registro del lote.</li>
          </ol>

          <label className="field">
            <span>Lote</span>
            <select className="select" value={loteSeleccionado} onChange={(e) => setLoteSeleccionado(e.target.value)}>
              <option value="">-- Selecciona un lote --</option>
              {lotes.map((l) => (
                <option key={l.id} value={l.nombre}>
                  {l.nombre} (${l.ha} Ha - {l.cultivo || 'Sin cultivar'})
                </option>
              ))}
            </select>
          </label>

          <div className="field">
            <span>Método de Riego</span>
            {métodos.map((m) => (
              <label key={m} className="btn btn-accent btn-sm" style={{ width: '100%', marginBottom: '8px', textAlign: 'left' }}>
                <input
                  type="radio"
                  name="riego"
                  value={m}
                  checked={metodo === m}
                  onChange={() => setMetodo(m)}
                  className="input"
                />{m}
                {' '}
                {m === 'goteo' && <span>Goteo (goteo lento, alta eficiencia)</span>}
                {m === 'aspersión' && <span>Aspersión (rociado overhead)</span>}
                {m === 'rain-feed' && <span>Rain-fed (lluvia natural)</span>}
              </label>
            ))}
          </div>

          <button className="btn btn-primary btn-block" type="button" onClick={aplicarMetodo}>
            <FaLeaf /> Asignar Método
          </button>
        </div>
      </div>
    </section>
  );
}