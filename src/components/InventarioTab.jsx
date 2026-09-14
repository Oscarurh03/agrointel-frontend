import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { FaBoxOpen, FaExchangeAlt, FaPlus, FaExclamationTriangle } from 'react-icons/fa';

const today = () => new Date().toISOString().split('T')[0];

export default function InventarioTab({ inventario, onAddProducto, onAddMovimiento }) {
  const [producto, setProducto] = useState({ nombre: '', sku: '', categoria: 'Insumos', unidad: 'kg', stock_minimo: '', costo_unitario: '', proveedor: '' });
  const [movimiento, setMovimiento] = useState({ producto_id: '', tipo: 'entrada', cantidad: '', motivo: '', lote: '', fecha: today() });

  const productos = inventario?.productos || [];
  const movimientos = inventario?.movimientos || [];
  const bajoMinimo = useMemo(() => productos.filter((item) => item.stock <= item.stockMinimo), [productos]);

  const crearProducto = async (event) => {
    event.preventDefault();
    if (!producto.nombre.trim() || !producto.unidad) return Swal.fire('Campos incompletos', 'Indica el nombre y la unidad del producto.', 'warning');
    try {
      await onAddProducto(producto);
      setProducto({ nombre: '', sku: '', categoria: 'Insumos', unidad: 'kg', stock_minimo: '', costo_unitario: '', proveedor: '' });
      Swal.fire('Producto creado', 'Ya puedes registrar sus entradas y salidas.', 'success');
    } catch { /* el padre muestra el error */ }
  };

  const crearMovimiento = async (event) => {
    event.preventDefault();
    if (!movimiento.producto_id || !movimiento.cantidad || Number(movimiento.cantidad) <= 0) return Swal.fire('Campos incompletos', 'Selecciona un producto y una cantidad válida.', 'warning');
    try {
      await onAddMovimiento(movimiento);
      setMovimiento({ producto_id: '', tipo: 'entrada', cantidad: '', motivo: '', lote: '', fecha: today() });
      Swal.fire('Movimiento registrado', 'Las existencias fueron actualizadas.', 'success');
    } catch { /* el padre muestra el error */ }
  };

  return (
    <section className="stack">
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-label">Productos activos</span><span className="kpi-icon"><FaBoxOpen /></span></div><div className="kpi-value">{inventario?.resumen?.productos || 0}</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-label">Unidades en stock</span><span className="kpi-icon info"><FaExchangeAlt /></span></div><div className="kpi-value">{(inventario?.resumen?.unidades || 0).toLocaleString()}</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-label">Alertas de mínimo</span><span className="kpi-icon accent"><FaExclamationTriangle /></span></div><div className="kpi-value">{bajoMinimo.length}</div></div>
      </div>

      {bajoMinimo.length > 0 && <div className="alert-box critical"><div className="alert-head"><FaExclamationTriangle /><strong>Reabastecimiento recomendado</strong></div><span>{bajoMinimo.map((item) => item.nombre).join(', ')} tienen existencias iguales o menores al mínimo.</span></div>}

      <div className="panel-grid monitoreo">
        <form className="card" onSubmit={crearProducto}>
          <div className="card-title-row"><h3 className="card-title"><FaPlus /> Nuevo producto</h3></div>
          <p className="muted">Registra semillas, fertilizantes, agroquímicos, repuestos y otros insumos.</p>
          <label className="field"><span>Nombre *</span><input className="input" value={producto.nombre} onChange={(e) => setProducto({ ...producto, nombre: e.target.value })} placeholder="Ej. Urea 46%" /></label>
          <label className="field"><span>SKU / Código</span><input className="input" value={producto.sku} onChange={(e) => setProducto({ ...producto, sku: e.target.value })} placeholder="Ej. FERT-001" /></label>
          <label className="field"><span>Categoría</span><select className="select" value={producto.categoria} onChange={(e) => setProducto({ ...producto, categoria: e.target.value })}><option>Insumos</option><option>Semillas</option><option>Fertilizantes</option><option>Agroquímicos</option><option>Repuestos</option><option>Herramientas</option></select></label>
          <div className="form-grid-2"><label className="field"><span>Unidad *</span><select className="select" value={producto.unidad} onChange={(e) => setProducto({ ...producto, unidad: e.target.value })}><option value="kg">kg</option><option value="L">L</option><option value="unidad">unidad</option><option value="saco">saco</option><option value="caja">caja</option></select></label><label className="field"><span>Stock mínimo</span><input className="input" type="number" min="0" step="0.01" value={producto.stock_minimo} onChange={(e) => setProducto({ ...producto, stock_minimo: e.target.value })} placeholder="0" /></label></div>
          <div className="form-grid-2"><label className="field"><span>Costo unitario</span><input className="input" type="number" min="0" step="0.01" value={producto.costo_unitario} onChange={(e) => setProducto({ ...producto, costo_unitario: e.target.value })} placeholder="0.00" /></label><label className="field"><span>Proveedor</span><input className="input" value={producto.proveedor} onChange={(e) => setProducto({ ...producto, proveedor: e.target.value })} placeholder="Opcional" /></label></div>
          <button className="btn btn-primary btn-block" type="submit"><FaPlus /> Crear producto</button>
        </form>

        <form className="card" onSubmit={crearMovimiento}>
          <div className="card-title-row"><h3 className="card-title"><FaExchangeAlt /> Registrar movimiento</h3></div>
          <p className="muted">Cada entrada o salida queda guardada en la bitácora del inventario.</p>
          <label className="field"><span>Producto *</span><select className="select" value={movimiento.producto_id} onChange={(e) => setMovimiento({ ...movimiento, producto_id: e.target.value })}><option value="">Selecciona un producto</option>{productos.map((item) => <option key={item.id} value={item.id}>{item.nombre} · {item.stock} {item.unidad} disponibles</option>)}</select></label>
          <div className="form-grid-2"><label className="field"><span>Tipo *</span><select className="select" value={movimiento.tipo} onChange={(e) => setMovimiento({ ...movimiento, tipo: e.target.value })}><option value="entrada">Entrada / compra</option><option value="salida">Salida / consumo</option></select></label><label className="field"><span>Cantidad *</span><input className="input" type="number" min="0.01" step="0.01" value={movimiento.cantidad} onChange={(e) => setMovimiento({ ...movimiento, cantidad: e.target.value })} placeholder="0" /></label></div>
          <label className="field"><span>Motivo</span><input className="input" value={movimiento.motivo} onChange={(e) => setMovimiento({ ...movimiento, motivo: e.target.value })} placeholder="Ej. Compra proveedor / aplicación" /></label>
          <div className="form-grid-2"><label className="field"><span>Lote relacionado</span><input className="input" value={movimiento.lote} onChange={(e) => setMovimiento({ ...movimiento, lote: e.target.value })} placeholder="Opcional" /></label><label className="field"><span>Fecha</span><input className="input" type="date" value={movimiento.fecha} onChange={(e) => setMovimiento({ ...movimiento, fecha: e.target.value })} /></label></div>
          <button className="btn btn-accent btn-block" type="submit"><FaExchangeAlt /> Guardar movimiento</button>
        </form>
      </div>

      <div className="card"><div className="card-title-row"><h3 className="card-title">Existencias actuales</h3><span className="chip-note">Valor estimado: ${(inventario?.resumen?.valor || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div><div className="table-wrap"><table className="logs-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Mínimo</th><th>Proveedor</th><th>Estado</th></tr></thead><tbody>{productos.length === 0 ? <tr><td colSpan="6" className="muted">Aún no hay productos registrados.</td></tr> : productos.map((item) => <tr key={item.id}><td><strong>{item.nombre}</strong><br /><small>{item.sku || 'Sin SKU'}</small></td><td>{item.categoria}</td><td>{item.stock} {item.unidad}</td><td>{item.stockMinimo} {item.unidad}</td><td>{item.proveedor || '—'}</td><td><span className={`badge ${item.stock <= item.stockMinimo ? 'accent' : ''}`}>{item.stock <= item.stockMinimo ? 'Bajo mínimo' : 'Disponible'}</span></td></tr>)}</tbody></table></div></div>

      <div className="card"><div className="card-title-row"><h3 className="card-title">Últimos movimientos</h3></div><div className="table-wrap"><table className="logs-table"><thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Motivo / lote</th></tr></thead><tbody>{movimientos.length === 0 ? <tr><td colSpan="5" className="muted">Los movimientos aparecerán aquí.</td></tr> : movimientos.slice(0, 20).map((item) => <tr key={item.id}><td>{item.fecha}</td><td>{item.producto}</td><td><span className={`badge ${item.tipo === 'salida' ? 'accent' : ''}`}>{item.tipo}</span></td><td>{item.cantidad}</td><td>{item.motivo || '—'}{item.lote ? ` · ${item.lote}` : ''}</td></tr>)}</tbody></table></div></div>
    </section>
  );
}
