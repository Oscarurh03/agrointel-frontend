import { useState } from 'react';
import Swal from 'sweetalert2';
import { FaLeaf, FaTractor, FaCalendar, FaEuroSign } from 'react-icons/fa';

export default function CalendarioTab({ calendar, onAdd, pushLog }) {
  const [titulo, setTitulo] = useState('');
  const [lote, setLote] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const guardar = () => {
    if (!titulo.trim() || !lote.trim()) {
      Swal.fire('Campos incompletos', 'Completa el título del evento y el lote asociado.', 'warning');
      return;
    }
    onAdd({
      titulo: titulo.trim(),
      lote: lote.trim(),
      fecha: fecha,
      hora: hora,
    });
    setTitulo('');
    setLote('');
    Swal.fire('Evento guardado', 'Calendario actualizado localmente.', 'success');
  };

  return (
    <section className="stack">
      <div className="panel-grid monitoreo">
        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Calendario Agrícola</h3>
          </div>

          <ol className="steps-hint">
            <li>Ingresa el título del evento programado.</li>
            <li>Selecciona el lote y la fecha/hora.</li>
            <li>Guarda para agregar al calendario de operaciones.</li>
          </ol>

          <label className="field">
            <span>Título del Evento</span>
            <input
              className="input"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Aplicación de fungicida"
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
            <span>Fecha</span>
            <input
              className="input"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Hora</span>
            <input
              className="input"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </label>

          <button className="btn btn-primary btn-block" type="button" onClick={guardar}>
            <FaCalendar /> Agregar Evento
          </button>
        </div>
      </div>
    </section>
  );
}