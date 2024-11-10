import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import Swal from 'sweetalert2';
import { FaEye, FaTrash, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import '../styles/OrderList.css';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersSnapshot = await getDocs(collection(firestore, 'pedidos'));
      const ordersList = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersList);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los pedidos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#f8f9fa',
        borderRadius: '15px',
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-secondary',
          title: 'sweet-title',
          popup: 'sweet-popup'
        },
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });

      if (result.isConfirmed) {
        await deleteDoc(doc(firestore, 'pedidos', orderId));
        setOrders(orders.filter(order => order.id !== orderId));
        
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El pedido ha sido eliminado.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          customClass: {
            popup: 'sweet-popup'
          },
          timer: 2000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el pedido'
      });
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(firestore, 'pedidos', orderId), {
        status: newStatus
      });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado'
      });
    }
  };

  const viewOrderDetails = (order) => {
    Swal.fire({
      title: 'Detalles del Pedido',
      html: `
        <div class="order-details">
          <p><strong>Cliente:</strong> ${order.clientName}</p>
          <p><strong>Fecha:</strong> ${order.date.toDate().toLocaleDateString()}</p>
          <p><strong>Total:</strong> $${order.total}</p>
          <p><strong>Estado:</strong> ${order.status}</p>
          <h4>Productos:</h4>
          ${order.products.map(product => `
            <div class="product-detail">
              <p>${product.name} x ${product.quantity} = $${product.price * product.quantity}</p>
            </div>
          `).join('')}
        </div>
      `,
      width: '600px',
      confirmButtonText: 'Cerrar',
      customClass: {
        htmlContainer: 'order-details-container'
      }
    });
  };

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calcular paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  if (loading) {
    return <div className="loading">Cargando pedidos...</div>;
  }

  return (
    <div className="orders-wrapper">
      <div className="orders-header">
        <h2>Lista de Pedidos</h2>
      </div>

      <div className="filters-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="table-controls">
        <div className="items-per-page">
          <span>Mostrar</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>registros por página</span>
        </div>
        <div className="results-info">
          Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredOrders.length)} de {filteredOrders.length} registros
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map(order => (
              <tr key={order.id}>
                <td>{order.clientName}</td>
                <td>{order.date.toDate().toLocaleDateString()}</td>
                <td>${order.total}</td>
                <td>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-button view-button"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <FaEye />
                    </button>
                    <button 
                      className={`action-button ${order.status === 'pendiente' ? 'complete-button' : 'pending-button'}`}
                      onClick={() => handleStatusChange(order.id, order.status === 'pendiente' ? 'completado' : 'pendiente')}
                    >
                      {order.status === 'pendiente' ? <FaCheck /> : <FaTimes />}
                    </button>
                    <button 
                      className="action-button delete-button"
                      onClick={() => handleDelete(order.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          {"<<"}
        </button>
        <button 
          onClick={() => setCurrentPage(prev => prev - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          {"<"}
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
          >
            {index + 1}
          </button>
        ))}
        <button 
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          {">"}
        </button>
        <button 
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          {">>"}
        </button>
      </div>
    </div>
  );
}

export default OrderList;
