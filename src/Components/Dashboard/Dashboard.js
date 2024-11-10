import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  useNavigate,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig";
import { firestore } from "../../firebase/firebaseConfig";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import {
  MdDashboard,
  MdInventory,
  MdShoppingCart,
  MdPerson,
  MdSettings,
  MdLogout,
  MdAdd,
  MdAssessment,
  MdShoppingBag,
  MdWarning,
} from "react-icons/md";
import Navbar from "../Navbar/Navbar";
import ProductList from "../Products/ProductList";
import DailyTotal from "../Sales/DailyTotal";
import SalesForm from "../Sales/SalesForm";
import OrderForm from "../Orders/OrderForm";
import OrderList from "../Orders/OrderList";
import "../styles/Dashboard.css";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    productGrowth: 0,
    salesGrowth: 0,
  });

  const [isVentasOpen, setIsVentasOpen] = useState(false);
  const [isPedidosOpen, setIsPedidosOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const productsSnapshot = await getDocs(collection(firestore, "products"));
      const totalProducts = productsSnapshot.size;

      const salesQuery = query(
        collection(firestore, "ventas"),
        orderBy("fecha", "desc")
      );
      const salesSnapshot = await getDocs(salesQuery);
      const sales = salesSnapshot.docs.map((doc) => doc.data());
      const totalSales = sales.reduce(
        (acc, sale) => acc + (sale.total || 0),
        0
      );

      setDashboardStats({
        totalProducts,
        totalSales,
        productGrowth: 12.5,
        salesGrowth: 8.3,
      });
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const DashboardHome = () => {
    const [salesData, setSalesData] = useState([]);
    const [periodFilter, setPeriodFilter] = useState('week');
    const [summaryStats, setSummaryStats] = useState({
      highest: 0,
      average: 0,
      total: 0
    });

    useEffect(() => {
      fetchSalesData(periodFilter);
    }, [periodFilter]);

    const fetchSalesData = async (period) => {
      try {
        const ventasRef = collection(firestore, 'ventas');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // Últimos 7 días
        
        const q = query(
          ventasRef,
          where('fecha', '>=', startDate),
          orderBy('fecha', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const ventas = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));

        const processedData = processVentasData(ventas, period);
        setSalesData(processedData.chartData);
        setSummaryStats(processedData.stats);
      } catch (error) {
        console.error('Error al obtener datos de ventas:', error);
      }
    };

    const processVentasData = (ventas, period) => {
      // Asegurarnos de que las fechas sean objetos Date válidos
      const ventasConFechas = ventas.map(venta => ({
        ...venta,
        // Convertir el timestamp de Firestore a Date
        fecha: venta.fecha?.toDate ? venta.fecha.toDate() : new Date(venta.fecha)
      })).filter(venta => !isNaN(venta.fecha.getTime())); // Filtrar fechas inválidas

      const groupedData = {};
      let highest = 0;
      let total = 0;

      // Crear las etiquetas para los últimos 7 días
      const labels = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString('es-ES', { weekday: 'short' })
          .replace('.', '')  // Eliminar el punto que algunas localizaciones agregan
          .toLowerCase();    // Convertir a minúsculas para consistencia
        labels.push(key);
        groupedData[key] = 0;
      }

      // Agrupar las ventas por día
      ventasConFechas.forEach(venta => {
        const key = venta.fecha.toLocaleDateString('es-ES', { weekday: 'short' })
          .replace('.', '')
          .toLowerCase();
        
        if (groupedData[key] !== undefined) {
          groupedData[key] += venta.total || 0;
          if (groupedData[key] > highest) highest = groupedData[key];
          total += venta.total || 0;
        }
      });

      // Convertir a array manteniendo el orden de los días
      const chartData = labels.map(label => ({
        name: label.charAt(0).toUpperCase() + label.slice(1), // Capitalizar primera letra
        ventas: groupedData[label] || 0
      }));

      return {
        chartData,
        stats: {
          highest: highest || 0,
          average: chartData.length > 0 ? total / chartData.length : 0,
          total: total || 0
        }
      };
    };

    return (
      <div className="dashboard-content">
        <h1 className="dashboard-title">Panel de Control</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon products">
                <MdInventory />
              </div>
              <div className="stat-badge">
                <span className={`stat-change ${dashboardStats.productGrowth >= 0 ? "positive" : "negative"}`}>
                  {dashboardStats.productGrowth > 0 ? "+" : ""}
                  {dashboardStats.productGrowth}%
                </span>
              </div>
            </div>
            <div className="stat-details">
              <span className="stat-label">Total Productos</span>
              <h2 className="stat-value">{dashboardStats.totalProducts}</h2>
              <p className="stat-description">productos en inventario</p>
            </div>
            <div className="stat-footer">
              <span className="stat-period">Últimos 30 días</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon sales">
                <MdShoppingCart />
              </div>
              <div className="stat-badge">
                <span className={`stat-change ${dashboardStats.salesGrowth >= 0 ? "positive" : "negative"}`}>
                  {dashboardStats.salesGrowth > 0 ? "+" : ""}
                  {dashboardStats.salesGrowth}%
                </span>
              </div>
            </div>
            <div className="stat-details">
              <span className="stat-label">Ventas Totales</span>
              <h2 className="stat-value">${dashboardStats.totalSales.toLocaleString()}</h2>
              <p className="stat-description">en ingresos totales</p>
            </div>
            <div className="stat-footer">
              <span className="stat-period">Últimos 30 días</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon stock">
                <MdWarning />
              </div>
            </div>
            <div className="stat-details">
              <span className="stat-label">Productos Bajos en Stock</span>
              <h2 className="stat-value">3</h2>
              <p className="stat-description">requieren atención</p>
            </div>
            <div className="stat-footer">
              <Link to="/dashboard/productos" className="stat-link">Ver productos</Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon orders">
                <MdShoppingBag />
              </div>
            </div>
            <div className="stat-details">
              <span className="stat-label">Pedidos Pendientes</span>
              <h2 className="stat-value">5</h2>
              <p className="stat-description">por entregar</p>
            </div>
            <div className="stat-footer">
              <Link to="/dashboard/pedidos/lista" className="stat-link">Ver pedidos</Link>
            </div>
          </div>
        </div>

        <div className="chart-section">
          <div className="section-header">
            <h2>Resumen de Ventas</h2>
            <select 
              className="period-selector"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="year">Este año</option>
            </select>
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3f51b5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Ventas']}
                  contentStyle={{
                    background: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#3f51b5"
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-summary">
            <div className="summary-item">
              <span className="summary-label">Venta más alta</span>
              <span className="summary-value">${summaryStats.highest.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Promedio</span>
              <span className="summary-value">${Math.round(summaryStats.average).toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total del período</span>
              <span className="summary-value">${summaryStats.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <MdInventory className="logo-icon" />
            <h2>Inventario</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <MdDashboard className="nav-icon" />
            <span>Dashboard</span>
          </Link>
          <Link to="/dashboard/productos" className="nav-item">
            <MdInventory className="nav-icon" />
            <span>Productos</span>
          </Link>
          
          <div className="nav-group">
            <div className="nav-item" onClick={() => setIsVentasOpen(!isVentasOpen)}>
              <MdShoppingCart className="nav-icon" />
              <span>Ventas</span>
            </div>
            <div className={`nav-submenu ${isVentasOpen ? "open" : ""}`}>
              <Link to="/dashboard/ventas/nueva" className="nav-subitem">
                <MdAdd className="nav-icon" />
                <span>Nueva Venta</span>
              </Link>
              <Link to="/dashboard/ventas/resumen" className="nav-subitem">
                <MdAssessment className="nav-icon" />
                <span>Resumen</span>
              </Link>
            </div>
          </div>
          
          <div className="nav-group">
            <div className="nav-item" onClick={() => setIsPedidosOpen(!isPedidosOpen)}>
              <MdShoppingBag className="nav-icon" />
              <span>Pedidos</span>
            </div>
            <div className={`nav-submenu ${isPedidosOpen ? "open" : ""}`}>
              <Link to="/dashboard/pedidos/nuevo" className="nav-subitem">
                <MdAdd className="nav-icon" />
                <span>Nuevo Pedido</span>
              </Link>
              <Link to="/dashboard/pedidos/lista" className="nav-subitem">
                <MdAssessment className="nav-icon" />
                <span>Lista de Pedidos</span>
              </Link>
            </div>
          </div>
        </nav>
      </aside>

      <div 
        className="sidebar-overlay"
        onClick={() => setIsSidebarOpen(false)}
      />

      <main
        className={`main-content ${!isSidebarOpen ? "sidebar-closed" : ""}`}
      >
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/productos" element={<ProductList />} />
          <Route path="/ventas/nueva" element={<SalesForm />} />
          <Route path="/ventas/resumen" element={<DailyTotal />} />
          <Route path="/pedidos/nuevo" element={<OrderForm />} />
          <Route path="/pedidos/lista" element={<OrderList />} />
        </Routes>
      </main>
    </div>
  );
}

export default Dashboard;
