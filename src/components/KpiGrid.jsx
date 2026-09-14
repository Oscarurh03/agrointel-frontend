import { motion } from 'framer-motion';
import { FaLayerGroup, FaRulerCombined, FaWeightHanging, FaCloudSun } from 'react-icons/fa';

function KpiCard({ icon, tone, label, value, sub, live, delay }) {
  return (
    <motion.div
      className="kpi-card"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -4 }}
    >
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <span className={`kpi-icon ${tone || ''}`}>{icon}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">
        {live && <span className="live-tag">● LIVE&nbsp;&nbsp;</span>}
        {sub}
      </div>
    </motion.div>
  );
}

export default function KpiGrid({ totalLotes, superficieTotal, semillaTotal, clima }) {
  return (
    <section className="kpi-grid">
      <KpiCard
        icon={<FaLayerGroup />}
        label="Total Parcelas"
        value={`${totalLotes} Lotes`}
        sub="Registrados en el catastro"
        delay={0}
      />
      <KpiCard
        icon={<FaRulerCombined />}
        tone="accent"
        label="Superficie Total"
        value={`${superficieTotal.toFixed(1)} Ha`}
        sub="Suma de lotes georreferenciados"
        delay={0.06}
      />
      <KpiCard
        icon={<FaWeightHanging />}
        tone="info"
        label="Semilla Estimada"
        value={`${semillaTotal.toFixed(1)} Kg`}
        sub="Requerida según plan de resiembra"
        delay={0.12}
      />
      <KpiCard
        icon={<FaCloudSun />}
        label="Clima de Campo"
        value={clima ? `${clima.temp}°C` : '--°C'}
        sub={clima ? `${clima.condicion}` : 'Esperando georreferenciación…'}
        live={!!clima}
        delay={0.18}
      />
    </section>
  );
}
