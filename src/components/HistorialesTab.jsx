import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import { FaTrash, FaFileCsv, FaFilePdf, FaDatabase, FaFileInvoice } from 'react-icons/fa';
import { CHART_PALETTE, LS } from '../constants.js';

function formatFecha(valor) {
  if (!valor) return '—';
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? String(valor) : d.toLocaleString('es-NI');
}

export default function HistorialesTab({
  lotes,
  logs,
  pushLog,
  onPurge,
  onBackup,
  ndviHistory = [],
  fertilizacion = [],
  costos = [],
}) {
  const canvasSuperficie = useRef(null);
  const canvasSemilla = useRef(null);
  const chartA = useRef(null);
  const chartB = useRef(null);

  const [loteReporteId, setLoteReporteId] = useState('');
  const loteReporte = useMemo(
    () => lotes.find((l) => l.id === Number(loteReporteId)),
    [lotes, loteReporteId]
  );
  const ndviDelLote = useMemo(
    () => (loteReporte ? ndviHistory.filter((n) => n.loteId === loteReporte.id) : []),
    [ndviHistory, loteReporte]
  );
  const fertilizacionDelLote = useMemo(
    () => (loteReporte ? fertilizacion.filter((f) => f.lote === loteReporte.nombre) : []),
    [fertilizacion, loteReporte]
  );
  const costosDelLote = useMemo(
    () => (loteReporte ? costos.filter((c) => c.lote === loteReporte.nombre) : []),
    [costos, loteReporte]
  );
  const totalCostosLote = costosDelLote.reduce((s, c) => s + Number(c.monto || 0), 0);

  useEffect(() => {
    if (!canvasSuperficie.current || !canvasSemilla.current) return undefined;

    chartA.current?.destroy();
    chartB.current?.destroy();

    chartA.current = new Chart(canvasSuperficie.current, {
      type: 'doughnut',
      data: {
        labels: lotes.map((l) => l.nombre),
        datasets: [
          {
            data: lotes.map((l) => l.ha),
            backgroundColor: CHART_PALETTE,
            borderColor: '#e6ebe4',
            borderWidth: 3,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 11, boxHeight: 11, font: { family: 'Inter', size: 10.5 }, color: '#5f6f64' },
          },
        },
      },
    });

    chartB.current = new Chart(canvasSemilla.current, {
      type: 'bar',
      data: {
        labels: lotes.map((l) => l.nombre),
        datasets: [
          {
            label: 'Masa (Kg)',
            data: lotes.map((l) => l.semillaRequerida || 0),
            backgroundColor: '#35714c',
            borderRadius: 7,
            maxBarThickness: 42,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(95,111,100,.14)' },
            ticks: { font: { size: 10 }, color: '#8b9a8f' },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 }, color: '#8b9a8f' },
          },
        },
      },
    });

    return () => {
      chartA.current?.destroy();
      chartB.current?.destroy();
      chartA.current = null;
      chartB.current = null;
    };
  }, [lotes]);

  const exportarCSV = () => {
    if (lotes.length === 0) {
      Swal.fire('Sin registros', 'No existen lotes guardados para exportar.', 'warning');
      return;
    }
    let csv = 'ID_UNICO,NOMBRE_LOTE,VARIEDAD_CULTIVO,SUPERFICIE_HA,SEMILLA_REQUERIDA_KG,GEORREFERENCIACION\n';
    lotes.forEach((lote) => {
      const nombre = `"${String(lote.nombre).replace(/"/g, '""')}"`;
      const cultivo = `"${String(lote.cultivo).replace(/"/g, '""')}"`;
      csv += `${lote.id},${nombre},${cultivo},${lote.ha},${lote.semillaRequerida || 0},"${lote.coordenadas}"\n`;
    });
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Matriz_Planificacion_AgroIntel.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);

    pushLog('EXPORTACIÓN CSV', `Matriz descargada con ${lotes.length} registros tabulares.`);
    Swal.fire('¡Exportación exitosa!', 'Archivo "Matriz_Planificacion_AgroIntel.csv" generado para Excel.', 'success');
  };

  const exportarPDF = () => {
    const totalHa = lotes.reduce((s, l) => s + Number(l.ha || 0), 0).toFixed(1);
    const totalKg = lotes.reduce((s, l) => s + Number(l.semillaRequerida || 0), 0).toFixed(1);

    const doc = new jsPDF();
    doc.setFillColor(39, 86, 58);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('AGROINTEL v2 - PLATAFORMA AGRICOLA', 15, 20);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.text('Sistema de Gestion Inteligente de Cultivos y Resiembra', 15, 30);

    doc.setTextColor(38, 51, 43);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('REPORTE CONSOLIDADO DE MONITOREO Y RESIEMBRA', 15, 54);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Fecha de emision: ${new Date().toLocaleString()}`, 15, 67);
    doc.text(`Parcelas evaluadas: ${lotes.length}`, 15, 75);
    doc.text(`Superficie total: ${totalHa} Ha`, 15, 83);
    doc.text(`Masa de semilla requerida: ${totalKg} Kg`, 15, 91);

    let y = 105;
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE LOTES', 15, y);
    y += 8;
    lotes.forEach((l, i) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`${i + 1}. ${l.nombre} | ${l.cultivo} | ${l.ha} Ha | ${l.semillaRequerida || 0} Kg | ${l.coordenadas}`, 15, y);
      y += 7;
    });

    doc.save('Consolidado_Reporte_AgroIntel.pdf');
    pushLog('REPORTE PDF', 'Se exportó el reporte técnico en formato PDF.');
  };

  const purgar = async () => {
    if (logs.length === 0 && lotes.length === 0) {
      Swal.fire('Ecosistema limpio', 'No hay datos almacenados.', 'info');
      return;
    }
    const res = await Swal.fire({
      title: '¿Purgar todo el sistema?',
      text: 'Se eliminarán permanentemente todos los lotes georreferenciados, métricas y bitácoras.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar todo',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ad463d',
      cancelButtonColor: '#8fa094',
    });
    if (!res.isConfirmed) return;
    onPurge();
    Swal.fire('Sistema restablecido', 'Toda la caché local ha sido purgada.', 'success');
  };

  const respaldar = async () => {
    const res = await Swal.fire({
      title: 'Generar respaldo de la base de datos',
      text: 'Se descargará un archivo .sql con todo el contenido actual de la base de datos.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, generar respaldo',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#27563a',
    });
    if (!res.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Generando respaldo…',
        text: 'Esto puede tardar unos segundos.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      await onBackup();
      Swal.close();
      pushLog('RESPALDO BD', 'Se generó y descargó un respaldo completo de la base de datos.');
      Swal.fire('¡Respaldo generado!', 'El archivo .sql se descargó correctamente.', 'success');
    } catch (err) {
      Swal.fire('No se pudo generar el respaldo', err.message, 'error');
    }
  };

  /* ---------- Reporte individual por lote (PDF y CSV) ---------- */
  const generarPDFLote = () => {
    if (!loteReporte) {
      Swal.fire('Selecciona un lote', 'Elige un lote de la lista para generar su reporte individual.', 'warning');
      return;
    }
    const lote = loteReporte;
    const doc = new jsPDF();
    let y = 20;

    const encabezado = (titulo) => {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(39, 86, 58);
      doc.text(titulo, 15, y);
      y += 7;
      doc.setDrawColor(39, 86, 58);
      doc.line(15, y - 4, 195, y - 4);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
    };
    const linea = (texto) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(texto, 15, y);
      y += 6;
    };

    doc.setFillColor(39, 86, 58);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('AGROINTEL v2 - REPORTE INDIVIDUAL DE LOTE', 15, 18);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.text(`Generado: ${new Date().toLocaleString('es-NI')}`, 15, 27);
    doc.setTextColor(0, 0, 0);
    y = 48;

    encabezado('1. MONITOREO DE LOTES');
    linea(`Nombre del lote: ${lote.nombre}`);
    linea(`Cultivo: ${lote.cultivo || 'Sin especificar'}`);
    linea(`Superficie: ${lote.ha} Ha`);
    linea(`Coordenadas: ${lote.coordenadas}`);
    y += 4;

    encabezado('2. ANÁLISIS NDVI (historial)');
    if (ndviDelLote.length === 0) {
      linea('Sin registros de análisis NDVI para este lote.');
    } else {
      ndviDelLote.forEach((n) => {
        linea(
          `${formatFecha(n.fecha)} · Vigor: ${n.vigor}% · Estrés: ${n.estres}% · Clima: ${
            n.temperatura != null ? `${n.temperatura}°C` : '—'
          } (${n.condicionClima || '—'})`
        );
      });
    }
    y += 4;

    encabezado('3. PLAN DE RESIEMBRA');
    linea(`Masa de semilla requerida: ${lote.semillaRequerida || 0} Kg`);
    y += 4;

    encabezado('4. FERTILIZANTES APLICADOS');
    if (fertilizacionDelLote.length === 0) {
      linea('Sin registros de fertilización para este lote.');
    } else {
      fertilizacionDelLote.forEach((f) => {
        linea(`${formatFecha(f.fecha)} · ${f.tipo} · ${f.cantidad} Kg`);
      });
    }
    y += 4;

    encabezado('5. COSTOS DE MANTENIMIENTO');
    if (costosDelLote.length === 0) {
      linea('Sin registros de costos para este lote.');
    } else {
      costosDelLote.forEach((c) => {
        linea(`${c.titulo} · ${c.tipo} · $${Number(c.monto).toFixed(2)}`);
      });
      linea(`Total acumulado: $${totalCostosLote.toFixed(2)}`);
    }
    y += 4;

    encabezado('6. MÉTODO DE RIEGO');
    linea(`Método asignado: ${lote.metodoRiego || 'No asignado'}`);

    doc.save(`Reporte_${lote.nombre.replace(/\s+/g, '_')}.pdf`);
    pushLog('REPORTE PDF POR LOTE', `Se generó el reporte individual de: ${lote.nombre}`);
    Swal.fire('¡Reporte generado!', 'El PDF individual del lote se descargó correctamente.', 'success');
  };

  const generarCSVLote = () => {
    if (!loteReporte) {
      Swal.fire('Selecciona un lote', 'Elige un lote de la lista para generar su reporte individual.', 'warning');
      return;
    }
    const lote = loteReporte;
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    let csv = '';

    csv += 'SECCION,MONITOREO DE LOTES\n';
    csv += 'Nombre,Cultivo,Superficie_Ha,Coordenadas,Metodo_Riego\n';
    csv += `${q(lote.nombre)},${q(lote.cultivo)},${lote.ha},${q(lote.coordenadas)},${q(lote.metodoRiego || 'No asignado')}\n\n`;

    csv += 'SECCION,ANALISIS NDVI (historial)\n';
    csv += 'Fecha,Vigor_%,Estres_%,Temperatura_C,Condicion_Clima\n';
    if (ndviDelLote.length === 0) {
      csv += 'Sin registros,,,, \n\n';
    } else {
      ndviDelLote.forEach((n) => {
        csv += `${q(formatFecha(n.fecha))},${n.vigor},${n.estres},${n.temperatura ?? ''},${q(n.condicionClima)}\n`;
      });
      csv += '\n';
    }

    csv += 'SECCION,PLAN DE RESIEMBRA\n';
    csv += 'Semilla_Requerida_Kg\n';
    csv += `${lote.semillaRequerida || 0}\n\n`;

    csv += 'SECCION,FERTILIZANTES\n';
    csv += 'Fecha,Tipo,Cantidad_Kg\n';
    if (fertilizacionDelLote.length === 0) {
      csv += 'Sin registros,,\n\n';
    } else {
      fertilizacionDelLote.forEach((f) => {
        csv += `${q(formatFecha(f.fecha))},${q(f.tipo)},${f.cantidad}\n`;
      });
      csv += '\n';
    }

    csv += 'SECCION,COSTOS DE MANTENIMIENTO\n';
    csv += 'Titulo,Tipo,Monto_USD\n';
    if (costosDelLote.length === 0) {
      csv += 'Sin registros,,\n\n';
    } else {
      costosDelLote.forEach((c) => {
        csv += `${q(c.titulo)},${q(c.tipo)},${Number(c.monto).toFixed(2)}\n`;
      });
      csv += `TOTAL,,${totalCostosLote.toFixed(2)}\n\n`;
    }

    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_${lote.nombre.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);

    pushLog('REPORTE CSV POR LOTE', `Se generó la matriz CSV individual de: ${lote.nombre}`);
    Swal.fire('¡Reporte generado!', 'La matriz CSV individual del lote se descargó correctamente.', 'success');
  };

  return (
    <section className="stack">
      <div className="panel-grid charts-grid">
        <div className="card">
          <div className="card-title-row">
            <h4 className="card-title" style={{ fontSize: 14 }}>
              Comparativa de Superficie por Lote (Ha)
            </h4>
          </div>
          <div className="chart-box">
            <canvas ref={canvasSuperficie} />
          </div>
        </div>
        <div className="card">
          <div className="card-title-row">
            <h4 className="card-title" style={{ fontSize: 14 }}>
              Proyección de Semilla Requerida (Kg)
            </h4>
          </div>
          <div className="chart-box">
            <canvas ref={canvasSemilla} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title-row">
          <div>
            <h3 className="card-title">
              <FaFileInvoice /> Reporte Individual por Lote
            </h3>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              Incluye Monitoreo, NDVI, Resiembra, Fertilizantes, Costos y Método de Riego
            </p>
          </div>
        </div>

        <label className="field">
          <span>Lote a Reportar</span>
          <select className="select" value={loteReporteId} onChange={(e) => setLoteReporteId(e.target.value)}>
            <option value="">-- Selecciona un lote --</option>
            {lotes.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </select>
        </label>

        <div className="btn-row">
          <button className="btn btn-primary btn-sm" type="button" onClick={generarPDFLote}>
            <FaFilePdf /> PDF Individual del Lote
          </button>
          <button className="btn btn-accent btn-sm" type="button" onClick={generarCSVLote}>
            <FaFileCsv /> Matriz CSV del Lote
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title-row">
          <div>
            <h3 className="card-title">Historial de Transacciones y Operaciones</h3>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              Auditoría síncrona de actividades del sistema
            </p>
          </div>
          <div className="btn-row">
            <button className="btn btn-danger btn-sm" type="button" onClick={purgar}>
              <FaTrash /> Eliminar Todo
            </button>
            <button className="btn btn-accent btn-sm" type="button" onClick={exportarCSV}>
              <FaFileCsv /> Matriz CSV General
            </button>
            <button className="btn btn-primary btn-sm" type="button" onClick={exportarPDF}>
              <FaFilePdf /> Reporte PDF General
            </button>
            <button className="btn btn-primary btn-sm" type="button" onClick={respaldar}>
              <FaDatabase /> Respaldo Base de Datos
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Módulo / Acción</th>
                <th>Detalle Transaccional</th>
                <th style={{ textAlign: 'center' }}>Estado Sync</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No existen logs en la bitácora actual.
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={`${log.timestamp}-${i}`}>
                    <td className="ts">{log.timestamp}</td>
                    <td>
                      <span className="badge">{log.modulo}</span>
                    </td>
                    <td>{log.detalle}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 12 }}>🟢 Local</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
