import { motion } from 'framer-motion';
import {
  FaMapMarkedAlt,
  FaSatelliteDish,
  FaSeedling,
  FaChartBar,
  FaPowerOff,
  FaTractor,
  FaCalendar,
  FaEuroSign,
  FaLeaf,
  FaBoxes,
} from 'react-icons/fa';

const ITEMS = [
  { id: 'monitoreo', label: 'Monitoreo Lotes', icon: <FaMapMarkedAlt /> },
  { id: 'ndvi', label: 'Análisis NDVI', icon: <FaSatelliteDish /> },
  { id: 'resiembra', label: 'Plan de Resiembra', icon: <FaSeedling /> },
  { id: 'historiales', label: 'Historiales y Reportes', icon: <FaChartBar /> },
  { id: 'fertilizacion', label: 'Fertilizantes', icon: <FaTractor /> },
  { id: 'calendario', label: 'Calendario', icon: <FaCalendar /> },
  { id: 'costos', label: 'Costos Mantenimiento', icon: <FaEuroSign /> },
  { id: 'riego', label: 'Métodos Riego', icon: <FaLeaf /> },
  { id: 'inventario', label: 'Inventario', icon: <FaBoxes /> },
];

export default function Sidebar({ activeTab, onChangeTab, sesion, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">
          <FaLeaf />
        </div>
        <h1>AgroIntel v2</h1>
        <span className="tagline">Control Agrícola</span>
      </div>

      <nav className="nav">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onChangeTab(item.id)}
          >
            {activeTab === item.id && (
              <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
            )}
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="user-chip">
        <div>
          <div className="who">{sesion?.email || 'Sesión no iniciada'}</div>
          <div className="role">{sesion?.rol || ''}</div>
        </div>
        <button className="btn btn-danger btn-sm btn-block" type="button" onClick={onLogout}>
          <FaPowerOff /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
