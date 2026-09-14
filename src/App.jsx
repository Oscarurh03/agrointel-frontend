import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';

import Sidebar from './components/Sidebar.jsx';
import KpiGrid from './components/KpiGrid.jsx';
import MonitoreoTab from './components/MonitoreoTab.jsx';
import NdviTab from './components/NdviTab.jsx';
import ResiembraTab from './components/ResiembraTab.jsx';
import HistorialesTab from './components/HistorialesTab.jsx';
import FertilizacionTab from './components/FertilizacionTab.jsx';
import CalendarioTab from './components/CalendarioTab.jsx';
import CostosTab from './components/CostosTab.jsx';
import RiegoTab from './components/RiegoTab.jsx';
import InventarioTab from './components/InventarioTab.jsx';
import LoginOverlay from './components/LoginOverlay.jsx';
import BackgroundParticles from './components/BackgroundParticles.jsx';

import { API_URL, LS } from './constants.js';
import { loadJSON, saveJSON, removeKey } from './lib/storage.js';
import { consultarClima } from './lib/weather.js';
import { apiGet, apiPost, apiPut, apiDelete, apiDownload } from './lib/api.js';

export default function App() {
  // La sesión sigue en localStorage: solo identifica quién está autenticado,
  // los DATOS (lotes, logs, etc.) ahora viven en PostgreSQL.
  const [sesion, setSesion] = useState(() => loadJSON(LS.SESION, null));

  const [lotes, setLotes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [fertilizacion, setFertilizacion] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [costos, setCostos] = useState([]);
  const [riego, setRiego] = useState({});
  const [ndviHistory, setNdviHistory] = useState([]);
  const [inventario, setInventario] = useState({ productos: [], movimientos: [], resumen: {} });

  const [activeTab, setActiveTab] = useState('monitoreo');
  const [activeLoteId, setActiveLoteId] = useState(null);
  const [pickedCoord, setPickedCoord] = useState(null);
  const [clima, setClima] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  /* ---------- Cargar todos los datos del usuario desde la API al iniciar sesión ---------- */
  useEffect(() => {
    if (!sesion?.id) return;
    let cancelado = false;

    async function cargarTodo() {
      setCargandoDatos(true);
      try {
        const [lotesData, logsData, fertData, calData, costosData, ndviData, inventarioData] = await Promise.all([
          apiGet(`/lotes?usuario_id=${sesion.id}`),
          apiGet(`/logs?usuario_id=${sesion.id}`),
          apiGet(`/fertilizacion?usuario_id=${sesion.id}`),
          apiGet(`/calendario?usuario_id=${sesion.id}`),
          apiGet(`/costos?usuario_id=${sesion.id}`),
          apiGet(`/ndvi?usuario_id=${sesion.id}`),
          apiGet(`/inventario?usuario_id=${sesion.id}`),
        ]);
        if (cancelado) return;
        setLotes(lotesData);
        setLogs(logsData);
        setFertilizacion(fertData);
        setCalendar(calData);
        setCostos(costosData);
        setNdviHistory(ndviData);
        setInventario(inventarioData);
      } catch (err) {
        Swal.fire('Sin conexión al servidor', err.message, 'error');
      } finally {
        if (!cancelado) setCargandoDatos(false);
      }
    }

    cargarTodo();
    return () => {
      cancelado = true;
    };
  }, [sesion?.id]);

  /* ---------- Bitácora ---------- */
  const pushLog = useCallback(
    async (modulo, detalle) => {
      if (!sesion?.id) return;
      const timestamp = new Date().toLocaleString();
      setLogs((prev) => [{ timestamp, modulo, detalle }, ...prev]);
      try {
        await apiPost('/logs', { usuario_id: sesion.id, timestamp, modulo, detalle });
      } catch (err) {
        console.error('No se pudo guardar el log en la base de datos:', err);
      }
    },
    [sesion?.id]
  );

  /* ---------- Lotes ---------- */
  const addLote = useCallback(
    async (datos) => {
      if (!pickedCoord || !sesion?.id) return;
      const coordenadas = `${pickedCoord.lat.toFixed(6)}, ${pickedCoord.lng.toFixed(6)}`;
      try {
        const nuevoLote = await apiPost('/lotes', {
          usuario_id: sesion.id,
          nombre: datos.nombre,
          cultivo: datos.cultivo,
          ha: datos.ha,
          coordenadas,
        });
        setLotes((prev) => [...prev, nuevoLote]);
        setPickedCoord(null);
        pushLog('CATASTRO', `Inserción de lote: ${nuevoLote.nombre} (${nuevoLote.ha} Ha)`);
        Swal.fire('Lote guardado', 'Terreno registrado en la base de datos.', 'success');
      } catch (err) {
        Swal.fire('Error al guardar', err.message, 'error');
      }
    },
    [pickedCoord, sesion?.id, pushLog]
  );

  const updateSemilla = useCallback(async (loteId, kg) => {
    const id = Number(loteId);
    setLotes((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx === -1 || prev[idx].semillaRequerida === kg) return prev;
      return prev.map((l) => (l.id === id ? { ...l, semillaRequerida: kg } : l));
    });
    try {
      await apiPut(`/lotes/${id}/semilla`, { semillaRequerida: kg });
    } catch (err) {
      console.error('No se pudo actualizar la semilla en la base de datos:', err);
    }
  }, []);

  const purgeAll = useCallback(async () => {
    if (!sesion?.id) return;
    try {
      await apiDelete(`/usuarios/${sesion.id}/datos`);
      setLogs([]);
      setLotes([]);
      setFertilizacion([]);
      setCalendar([]);
      setCostos([]);
      setRiego({});
      setNdviHistory([]);
      setInventario({ productos: [], movimientos: [], resumen: {} });
      setActiveLoteId(null);
      setPickedCoord(null);
      setClima(null);
    } catch (err) {
      Swal.fire('Error al purgar', err.message, 'error');
    }
  }, [sesion?.id]);

  /* ---------- Fertilizacion ---------- */
  const addFertilizacion = useCallback(
    async (datos) => {
      if (!sesion?.id) return;
      try {
        const nuevo = await apiPost('/fertilizacion', { usuario_id: sesion.id, ...datos });
        setFertilizacion((prev) => [...prev, nuevo]);
        pushLog('FERTILIZACION', `Aplicado ${datos.tipo}: ${datos.cantidad} kg en ${datos.lote}`);
      } catch (err) {
        Swal.fire('Error al guardar', err.message, 'error');
      }
    },
    [sesion?.id, pushLog]
  );

  /* ---------- Calendario ---------- */
  const addCalendarEvent = useCallback(
    async (datos) => {
      if (!sesion?.id) return;
      try {
        const nuevo = await apiPost('/calendario', { usuario_id: sesion.id, ...datos });
        setCalendar((prev) => [...prev, nuevo]);
        pushLog('CALENDAR', `Evento: ${datos.titulo} en ${datos.lote}`);
      } catch (err) {
        Swal.fire('Error al guardar', err.message, 'error');
      }
    },
    [sesion?.id, pushLog]
  );

  /* ---------- Costos ---------- */
  const addCostos = useCallback(
    async (datos) => {
      if (!sesion?.id) return;
      try {
        const nuevo = await apiPost('/costos', { usuario_id: sesion.id, ...datos });
        setCostos((prev) => [...prev, nuevo]);
        pushLog('COSTOS', `Gasto: ${datos.titulo} - $${datos.monto}`);
      } catch (err) {
        Swal.fire('Error al guardar', err.message, 'error');
      }
    },
    [sesion?.id, pushLog]
  );

  /* ---------- Inventario ---------- */
  const addProducto = useCallback(async (datos) => {
    if (!sesion?.id) return;
    try {
      const nuevo = await apiPost('/inventario/productos', { usuario_id: sesion.id, ...datos });
      setInventario((prev) => ({ ...prev, productos: [...prev.productos, nuevo], resumen: { ...prev.resumen, productos: prev.productos.length + 1 } }));
      pushLog('INVENTARIO', `Producto creado: ${nuevo.nombre}`);
      return nuevo;
    } catch (err) {
      Swal.fire('Error al crear producto', err.message, 'error');
      throw err;
    }
  }, [sesion?.id, pushLog]);

  const addMovimiento = useCallback(async (datos) => {
    if (!sesion?.id) return;
    try {
      const nuevo = await apiPost('/inventario/movimientos', { usuario_id: sesion.id, ...datos, producto_id: Number(datos.producto_id) });
      const productos = inventario.productos.map((item) => item.id === Number(datos.producto_id) ? { ...item, stock: nuevo.stock } : item);
      setInventario((prev) => ({ ...prev, productos, movimientos: [nuevo, ...prev.movimientos], resumen: { ...prev.resumen, unidades: productos.reduce((sum, item) => sum + Number(item.stock), 0), bajoMinimo: productos.filter((item) => item.stock <= item.stockMinimo).length, valor: productos.reduce((sum, item) => sum + item.stock * item.costoUnitario, 0) } }));
      pushLog('INVENTARIO', `${datos.tipo === 'entrada' ? 'Entrada' : 'Salida'}: ${nuevo.producto} (${datos.cantidad})`);
      return nuevo;
    } catch (err) {
      Swal.fire('Error al registrar movimiento', err.message, 'error');
      throw err;
    }
  }, [sesion?.id, inventario.productos, pushLog]);

  /* ---------- Método de Riego ---------- */
  const setMetodoRiego = useCallback(
    async (loteNombre, metodo) => {
      const lote = lotes.find((l) => l.nombre === loteNombre);
      if (!lote) return;
      setLotes((prev) => prev.map((l) => (l.id === lote.id ? { ...l, metodoRiego: metodo } : l)));
      try {
        await apiPut(`/lotes/${lote.id}/riego`, { metodo });
      } catch (err) {
        Swal.fire('Error al guardar', err.message, 'error');
      }
    },
    [lotes]
  );

  /* ---------- Historial NDVI ---------- */
  const guardarAnalisisNdvi = useCallback(
    async (datos) => {
      if (!sesion?.id) return;
      try {
        const nuevo = await apiPost('/ndvi', { usuario_id: sesion.id, ...datos });
        setNdviHistory((prev) => [nuevo, ...prev]);
      } catch (err) {
        console.error('No se pudo guardar el análisis NDVI en la base de datos:', err);
      }
    },
    [sesion?.id]
  );

  /* ---------- Respaldo de base de datos ---------- */
  const descargarRespaldo = useCallback(async () => {
    await apiDownload('/backup', 'agrointel_backup.sql');
  }, []);

  /* ---------- Mapa / clima ---------- */
  const handlePick = useCallback(async (latlng) => {
    const lat = Number(latlng.lat.toFixed(6));
    const lng = Number(latlng.lng.toFixed(6));
    setPickedCoord({ lat, lng });
    const climaDatos = await consultarClima(lat, lng);
    setClima(climaDatos);
  }, []);

  /* ---------- Autenticación (PostgreSQL vía API) ---------- */
  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem(LS.EMAIL, email);
      localStorage.setItem(LS.PASS, password);
      saveJSON(LS.SESION, data.usuario);
      setSesion(data.usuario);
      Swal.fire('¡Acceso concedido!', data.mensaje || 'Bienvenido al panel.', 'success');
    } catch (err) {
      Swal.fire(
        'No se pudo iniciar sesión',
        err.message || 'Verifica que el backend esté corriendo y la base de datos conectada.',
        'error'
      );
    }
  }, []);

  const register = useCallback(async (email, password, rol) => {
    try {
      const res = await fetch(`${API_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rol }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      Swal.fire('¡Registro completado!', 'Usuario guardado en la base de datos. Ya puedes iniciar sesión.', 'success');
    } catch (err) {
      Swal.fire('No se pudo registrar', err.message || 'Verifica la conexión con el backend.', 'error');
    }
  }, []);

  const logout = useCallback(() => {
    removeKey(LS.SESION);
    setSesion(null);
    setLotes([]);
    setLogs([]);
    setFertilizacion([]);
    setCalendar([]);
    setCostos([]);
    setNdviHistory([]);
    setInventario({ productos: [], movimientos: [], resumen: {} });
    setActiveTab('monitoreo');
    Swal.fire('Sesión cerrada', 'Conexión de terminal finalizada con éxito.', 'info');
  }, []);

  /* ---------- KPIs derivados ---------- */
  const superficieTotal = lotes.reduce((s, l) => s + Number(l.ha || 0), 0);
  const semillaTotal = lotes.reduce((s, l) => s + Number(l.semillaRequerida || 0), 0);

  return (
    <>
      <BackgroundParticles />

      <AnimatePresence>
        {!sesion && (
          <LoginOverlay
            key="login"
            onLogin={login}
            onRegister={register}
            defaultEmail={localStorage.getItem(LS.EMAIL) || ''}
            defaultPass={localStorage.getItem(LS.PASS) || ''}
          />
        )}
      </AnimatePresence>

      {sesion && (
        <div className="app-shell">
          <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} sesion={sesion} onLogout={logout} />

          <main className="main">
            <header className="page-head">
              <h1>Panel de Control Agrícola</h1>
              <p>
                Monitoreo satelital, catastro georreferenciado y planificación de resiembra
                {cargandoDatos && ' · Cargando datos…'}
              </p>
            </header>

            <KpiGrid
              totalLotes={lotes.length}
              superficieTotal={superficieTotal}
              semillaTotal={semillaTotal}
              clima={clima}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {activeTab === 'monitoreo' && (
                  <MonitoreoTab lotes={lotes} pickedCoord={pickedCoord} onPick={handlePick} onAddLote={addLote} />
                )}
                {activeTab === 'ndvi' && (
                  <NdviTab
                    lotes={lotes}
                    activeLoteId={activeLoteId}
                    onSelectLote={setActiveLoteId}
                    pushLog={pushLog}
                    setClima={setClima}
                    onGuardarAnalisis={guardarAnalisisNdvi}
                  />
                )}
                {activeTab === 'resiembra' && (
                  <ResiembraTab activeLoteId={activeLoteId} onUpdateSemilla={updateSemilla} />
                )}
                {activeTab === 'historiales' && (
                  <HistorialesTab
                    lotes={lotes}
                    logs={logs}
                    pushLog={pushLog}
                    onPurge={purgeAll}
                    onBackup={descargarRespaldo}
                    ndviHistory={ndviHistory}
                    fertilizacion={fertilizacion}
                    costos={costos}
                  />
                )}
                {activeTab === 'fertilizacion' && (
                  <FertilizacionTab fertilizacion={fertilizacion} onAdd={addFertilizacion} pushLog={pushLog} />
                )}
                {activeTab === 'calendario' && (
                  <CalendarioTab calendar={calendar} onAdd={addCalendarEvent} pushLog={pushLog} />
                )}
                {activeTab === 'costos' && (
                  <CostosTab costos={costos} onAdd={addCostos} pushLog={pushLog} />
                )}
                {activeTab === 'riego' && (
                  <RiegoTab lotes={lotes} riego={riego} onSetMetodo={setMetodoRiego} pushLog={pushLog} />
                )}
                {activeTab === 'inventario' && (
                  <InventarioTab inventario={inventario} onAddProducto={addProducto} onAddMovimiento={addMovimiento} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      )}
    </>
  );
}
