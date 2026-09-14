import { useState } from 'react';
import Swal from 'sweetalert2';
import { FaLeaf, FaTractor, FaCalendar, FaEuroSign } from 'react-icons/fa';

export default function FertilizacionTab({ fertilizacion, onAdd, pushLog }) {
  const [nombreLote, setNombreLote] = useState('');
  const [tipo, setTipo] = useState('Fertilizante Base');
  const [cantidad, setCantidad] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const guardar = () => {
    if (!nombreLote.trim() || !cantidad.trim() || !tipo.trim()) {
      Swal.fire('Campos incompletos', 'Completa el nombre del lote, tipo de fertilizante y cantidad.', 'warning');
      return;
    }
    onAdd({
      lote: nombreLote.trim(),
      tipo: tipo.trim(),
      cantidad: parseFloat(cantidad),
      fecha: fecha,
    });
    setNombreLote('');
    setCantidad('');
    setTipo('Fertilizante Base');
    Swal.fire('Fertilizante guardado', 'Registro de fertilización guardado localmente.', 'success');
  };

  return (
    <section className="stack">
      <div className="panel-grid monitoreo">
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Registrar Fertilizante</h3>
          </div>

          <ol className="steps-hint">
            <li>Selecciona el lote objetivo.</li>
            <li>Elige el tipo de fertilizante y la cantidad.</li>
            <li>Define la fecha de aplicación y guarda.</li>
          </ol>

          <label className="field">
            <span>Nombre del Lote</span>
            <input
              className="input"
              value={nombreLote}
              onChange={(e) => setNombreLote(e.target.value)}
              placeholder="Ej. Tablón 14 - ISA"
            />
          </label>

          <label className="field">
            <span>Tipo de Fertilizante</span>
            <select className="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="Fertilizante Base">Fertilizante Base</option>
              <option value="Nitrógeno">Nitrógeno (Urea/AMS)</option>
              <option value="Fósforo">Fósforo (DAP)</option>
              <option value="Potasio">Potasio (MOP)</option>
              <option value="Orgánico">Fertilizante Orgánico</option>
            </select>
          </label>

          <label className="field">
            <span>Cantidad (Kg)</span>
            <input
              className="input"
              type="number"
              min="0"
              step="0.1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej. 25.5"
            />
          </label>

          <label className="field">
            <span>Fecha Aplicación</span>
            <input
              className="input"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </label>

          <button className="btn btn-primary btn-block" type="button" onClick={guardar}>
            <FaTractor /> Guardar Fertilizante
          </button>
        </div>
      </div>
    </section>
  );
}