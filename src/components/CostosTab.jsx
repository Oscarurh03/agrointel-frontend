import { useState } from 'react';
import Swal from 'sweetalert2';
import { FaLeaf, FaTractor, FaCalendar, FaEuroSign } from 'react-icons/fa';

export default function CostosTab({ costos, onAdd, pushLog }) {
  const [titulo, setTitulo] = useState('');
  const [monto, setMonto] = useState('');
  const [lote, setLote] = useState('');
  const [tipo, setTipo] = useState('Mantenimiento');

  const guardar = () => {
    if (!titulo.trim() || !monto.trim() || !lote.trim()) {
      Swal.fire('Campos incompletos', 'Completa el título, monto y lote asociado.', 'warning');
      return;
    }
    onAdd({
      titulo: titulo.trim(),
      monto: parseFloat(monto),
      lote: lote.trim(),
      tipo: tipo.trim(),
    });
    setTitulo('');
    setMonto('');
    setLote('');
    Swal.fire('Costo guardado', 'Registro de costo guardado localmente.', 'success');
  };

  return (
    <section className="stack">
      <div className="panel-grid monitoreo">
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Costos de Mantenimiento</h3>
          </div>

          <ol className="steps-hint">
            <li>Define el tipo de costo y el monto asociado.</li>
            <li>Selecciona el lote afectado.</li>
            <li>Guarda para incluir en el reporte financiero.</li>
          </ol>

          <label className="field">
            <span>Título del Costo</span>
            <input
              className="input"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Reparación equipo riego"
            />
          </label>

          <label className="field">
            <span>Monto (USD)</span>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Ej. 125.50"
            />
          </label>

          <label className="field">
            <span>Lote Asociado</span>
            <input
              className="input"
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              placeholder="Nombre del lote"
            />
          </label>

          <label className="field">
            <span>Tipo de Costo</span>
            <select className="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Fertilizante">Fertilizante</option>
              <option value="ManoObra">Mano de Obra</option>
              <option value="Equipo">Daño/Reparación de Equipo</option>
              <option value="Otros">Otros</option>
            </select>
          </label>

          <button className="btn btn-primary btn-block" type="button" onClick={guardar}>
            <FaEuroSign /> Guardar Costo
          </button>
        </div>
      </div>
    </section>
  );
}