import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { MdAttachMoney, MdShoppingCart, MdDateRange, MdSearch, MdFilterList } from 'react-icons/md';
import '../styles/DailyTotal.css';

const DailyTotal = () => {
  const [ventasData, setVentasData] = useState({
    ventasDiarias: [],
    totalDia: 0
  });
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    minTotal: '',
    maxTotal: '',
    cliente: ''
  });
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    obtenerVentasPorFecha(fechaSeleccionada);
  }, [fechaSeleccionada]);

  useEffect(() => {
    const resultados = filtrarVentas(ventasData.ventasDiarias, searchTerm, filtros);
    setVentasFiltradas(resultados);
  }, [searchTerm, filtros, ventasData.ventasDiarias]);

  const obtenerVentasPorFecha = async (fecha) => {
    try {
      const inicio = new Date(fecha);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(fecha);
      fin.setHours(23, 59, 59, 999);

      const ventasRef = collection(firestore, 'ventas');
      const q = query(
        ventasRef,
        where('fecha', '>=', inicio),
        where('fecha', '<=', fin),
        orderBy('fecha', 'desc')
      );

      const snapshot = await getDocs(q);
      const ventas = [];
      let totalDia = 0;

      snapshot.forEach((doc) => {
        const venta = {
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha.toDate()
        };
        ventas.push(venta);
        totalDia += venta.total;
      });

      setVentasData({
        ventasDiarias: ventas,
        totalDia
      });
      setVentasFiltradas(ventas);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
    }
  };

  const filtrarVentas = (ventas, termino, filtrosActivos) => {
    return ventas.filter(venta => {
      const busquedaMatch = !termino || 
        venta.cliente?.toLowerCase().includes(termino.toLowerCase()) ||
        venta.productos.some(prod => 
          prod.nombre.toLowerCase().includes(termino.toLowerCase())
        );

      const totalMatch = (!filtrosActivos.minTotal || venta.total >= Number(filtrosActivos.minTotal)) &&
                        (!filtrosActivos.maxTotal || venta.total <= Number(filtrosActivos.maxTotal));

      const clienteMatch = !filtrosActivos.cliente || 
        venta.cliente?.toLowerCase().includes(filtrosActivos.cliente.toLowerCase());

      return busquedaMatch && totalMatch && clienteMatch;
    });
  };

  const loadMore = async () => {
    try {
      setLoading(true);
      // Aquí iría la lógica para cargar más registros
      // Por ahora lo dejamos como placeholder
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar más registros:", error);
      setLoading(false);
    }
  };

  return (
    <div className="daily-total-container">
      <div className="daily-header">
        <h1>Resumen de Ventas</h1>
        <input
          type="date"
          value={fechaSeleccionada.toISOString().split('T')[0]}
          onChange={(e) => setFechaSeleccionada(new Date(e.target.value))}
          className="date-picker"
        />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon money">
            <MdAttachMoney />
          </div>
          <div className="stat-content">
            <span>Total del Día</span>
            <h2>${ventasData.totalDia.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cart">
            <MdShoppingCart />
          </div>
          <div className="stat-content">
            <span>Ventas Realizadas</span>
            <h2>{ventasData.ventasDiarias.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon calendar">
            <MdDateRange />
          </div>
          <div className="stat-content">
            <span>Promedio por Venta</span>
            <h2>${(ventasData.totalDia / ventasData.ventasDiarias.length).toFixed(2)}</h2>
          </div>
        </div>
      </div>

      <div className="daily-search-section">
        <div className="daily-search-container">
          <MdSearch className="daily-search-icon" />
          <input
            type="text"
            placeholder="Buscar por cliente o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="daily-search-input"
          />
        </div>
        <button 
          className={`daily-filter-button ${mostrarFiltros ? 'active' : ''}`}
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
        >
          <MdFilterList /> Filtros
        </button>
      </div>

      {mostrarFiltros && (
        <div className="filtros-panel">
          <div className="filtro-grupo">
            <label>Monto mínimo</label>
            <input
              type="number"
              value={filtros.minTotal}
              onChange={(e) => setFiltros({...filtros, minTotal: e.target.value})}
              placeholder="Monto mínimo"
            />
          </div>
          <div className="filtro-grupo">
            <label>Monto máximo</label>
            <input
              type="number"
              value={filtros.maxTotal}
              onChange={(e) => setFiltros({...filtros, maxTotal: e.target.value})}
              placeholder="Monto máximo"
            />
          </div>
          <div className="filtro-grupo">
            <label>Cliente</label>
            <input
              type="text"
              value={filtros.cliente}
              onChange={(e) => setFiltros({...filtros, cliente: e.target.value})}
              placeholder="Nombre del cliente"
            />
          </div>
          <button 
            className="limpiar-filtros"
            onClick={() => setFiltros({minTotal: '', maxTotal: '', cliente: ''})}
          >
            <MdFilterList /> Limpiar filtros
          </button>
        </div>
      )}

      <div className="daily-sales-details">
        <h2>Detalle de Ventas</h2>
        <div className="daily-sales-table-container">
          <table className="daily-sales-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Cliente</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.map((venta) => (
                <tr key={venta.id}>
                  <td>{venta.fecha.toLocaleTimeString()}</td>
                  <td>
                    <ul className="daily-productos-lista">
                      {venta.productos.map((producto, index) => (
                        <li key={index}>
                          {producto.nombre} x {producto.cantidad} = ${(producto.precio * producto.cantidad).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>${venta.total.toLocaleString()}</td>
                  <td>{venta.cliente || 'Cliente General'}</td>
                </tr>
              ))}
              {ventasFiltradas.length === 0 && (
                <tr>
                  <td colSpan="4" className="no-results">
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {loading && <div className="loading-spinner">Cargando...</div>}
          
          {hasMore && !loading && (
            <button className="load-more-btn" onClick={loadMore}>
              Cargar más registros
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyTotal; 