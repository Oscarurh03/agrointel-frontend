import { useState } from 'react';
import { FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import MapView from './MapView.jsx';

export default function MonitoreoTab({ lotes, pickedCoord, onPick, onAddLote }) {
  const [nombre, setNombre] = useState('');
  const [cultivo, setCultivo] = useState('Caña de Azúcar');
  const [ha, setHa] = useState('');

  const guardar = () => {
    if (!nombre.trim() || !ha || !pickedCoord) {
      Swal.fire(
        'Campos incompletos',
        'Escribe el nombre del lote, la superficie en hectáreas y georreferencia el terreno haciendo clic en el mapa.',
        'warning'
      );
      return;
    }
    onAddLote({ nombre: nombre.trim(), cultivo: cultivo.trim() || 'Sin especificar', ha: parseFloat(ha) });
    setNombre('');
    setHa('');
  };

  return (
    <section className="stack">
      <div className="panel-grid monitoreo">
        <MapView
          lotes={lotes}
          pickedCoord={pickedCoord}
          onPick={onPick}
        />

        <div className="card">
          <div className="card-title-row">
            <h3 className="card-title">Registrar Nueva Parcela</h3>
          </div>

          <ol className="steps-hint">
            <li>Haz clic en el mapa para capturar la coordenada.</li>
            <li>Ajusta el marcador arrastrándolo si es necesario.</li>
            <li>Completa los datos y guarda el terreno.</li>
          </ol>

          <label className="field">
            <span>Nombre del Lote</span>
            <input
              className="input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Tablón 14 - ISA"
            />
          </label>

          <label className="field">
            <span>Tipo de Cultivo</span>
            <input
              className="input"
              value={cultivo}
              onChange={(e) => setCultivo(e.target.value)}
              placeholder="Cultivo establecido"
            />
          </label>

          <label className="field">
            <span>Superficie (Hectáreas)</span>
            <input
              className="input"
              type="number"
              min="0.01"
              step="0.01"
              value={ha}
              onChange={(e) => setHa(e.target.value)}
              placeholder="Ej. 12"
            />
          </label>

          <label className="field">
            <span>Coordenadas Geográficas</span>
            <input
              className="input"
              readOnly
              value={pickedCoord ? `${pickedCoord.lat.toFixed(6)}, ${pickedCoord.lng.toFixed(6)}` : ''}
              placeholder="Latitud, Longitud — pendiente de selección"
            />
          </label>

          <button className="btn btn-primary btn-block" type="button" onClick={guardar}>
            <FaSave /> Guardar Terreno
          </button>
        </div>
      </div>
    </section>
  );
}
