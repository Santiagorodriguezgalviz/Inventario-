import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase/firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { MdAdd, MdDelete, MdShoppingCart, MdPerson, MdReceipt, MdSave, MdDescription, MdLocationOn, MdPhone, MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import '../styles/SalesForm.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SalesForm = () => {
  const [productos, setProductos] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [cliente, setCliente] = useState('');
  const [total, setTotal] = useState(0);
  const [requireInvoice, setRequireInvoice] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    nit: '',
    razonSocial: '',
    direccion: '',
    telefono: ''
  });

  // Cargar productos disponibles
  useEffect(() => {
    const fetchProductos = async () => {
      const querySnapshot = await getDocs(collection(firestore, 'products'));
      const productosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductos(productosData);
    };
    fetchProductos();
  }, []);

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, {
      productoId: '',
      nombre: '',
      precio: 0,
      cantidad: 1
    }]);
  };

  const handleProductChange = (index, productoId) => {
    const producto = productos.find(p => p.id === productoId);
    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      productoId: producto.id,
      nombre: producto.name,
      precio: producto.price,
      cantidad: 1,
      stockDisponible: producto.stock
    };
    setSelectedProducts(updatedProducts);
    calcularTotal(updatedProducts);
  };

  const handleQuantityChange = (index, cantidad) => {
    const updatedProducts = [...selectedProducts];
    const producto = updatedProducts[index];
    
    if (cantidad > producto.stockDisponible) {
      alert('No hay suficiente stock disponible');
      return;
    }

    updatedProducts[index] = {
      ...producto,
      cantidad: parseInt(cantidad)
    };
    setSelectedProducts(updatedProducts);
    calcularTotal(updatedProducts);
  };

  const calcularTotal = (productos) => {
    const nuevoTotal = productos.reduce((sum, producto) => {
      return sum + (producto.precio * producto.cantidad);
    }, 0);
    setTotal(nuevoTotal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const ventaData = {
        productos: selectedProducts.map(p => ({
          id: p.productoId,
          nombre: p.nombre,
          precio: p.precio,
          cantidad: p.cantidad
        })),
        total: total,
        cliente: cliente,
        fecha: new Date(),
        requiereFactura: requireInvoice
      };

      await addDoc(collection(firestore, 'ventas'), ventaData);

      // Actualizar stock
      for (const producto of selectedProducts) {
        const productoRef = doc(firestore, 'products', producto.productoId);
        const nuevoStock = producto.stockDisponible - producto.cantidad;
        await updateDoc(productoRef, { stock: nuevoStock });
      }

      // Generar factura solo si se requiere
      if (requireInvoice) {
        generateInvoice(ventaData);
      }

      // Limpiar formulario
      setSelectedProducts([]);
      setCliente('');
      setTotal(0);
      setRequireInvoice(false);
      alert(requireInvoice ? 'Venta registrada y factura generada' : 'Venta registrada exitosamente');

    } catch (error) {
      console.error("Error al registrar la venta:", error);
      alert('Error al registrar la venta');
    }
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
    calcularTotal(updatedProducts);
  };

  const generateInvoice = (ventaData) => {
    const doc = new jsPDF();
    
    // Estilo mejorado de la factura
    doc.setFontSize(25);
    doc.setTextColor(44, 62, 80);
    doc.text('FACTURA', 105, 20, { align: 'center' });
    
    // Información de la empresa
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text('Sistema de Inventario', 20, 40);
    doc.text('NIT: XXX-XXXXX-X', 20, 48);
    doc.text('Dirección: Tu dirección aquí', 20, 56);
    doc.text('Tel: (XXX) XXX-XXXX', 20, 64);
    
    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.line(20, 70, 190, 70);
    
    // Información del cliente y factura
    doc.setFontSize(11);
    doc.text(`Cliente: ${ventaData.cliente || 'Cliente General'}`, 20, 85);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 93);
    doc.text(`No. Factura: ${new Date().getTime().toString().slice(-8)}`, 20, 101);
    
    // Tabla de productos con estilo mejorado
    const tableColumn = ["Producto", "Cantidad", "Precio Unit.", "Subtotal"];
    const tableRows = ventaData.productos.map(item => [
      item.nombre,
      item.cantidad,
      `$${item.precio.toLocaleString()}`,
      `$${(item.cantidad * item.precio).toLocaleString()}`
    ]);

    doc.autoTable({
      startY: 110,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 12
      },
      alternateRowStyles: {
        fillColor: [242, 242, 242]
      }
    });
    
    // Total con estilo mejorado
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${ventaData.total.toLocaleString()}`, 150, finalY);
    
    // Pie de página
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('¡Gracias por su compra!', 105, finalY + 20, { align: 'center' });
    
    // Guardar PDF
    doc.save(`factura_${ventaData.cliente || 'cliente'}_${new Date().getTime()}.pdf`);
  };

  const handleInvoiceDataChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="sales-form-container">
      <h2 className="sales-title">Nueva Venta</h2>

      <div className="form-section">
        <div className="header-container">
          <div className="client-section">
            <label>Cliente (opcional)</label>
            <div className="input-wrapper">
              <MdPerson className="input-icon" />
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nombre del cliente"
                className="client-input"
              />
            </div>
          </div>
          <button
            type="button"
            className={`generate-invoice-btn ${requireInvoice ? 'active' : ''}`}
            onClick={() => {
              setRequireInvoice(!requireInvoice);
              if (!requireInvoice) {
                setShowInvoiceDetails(true);
              }
            }}
          >
            <MdReceipt className="invoice-icon" />
            Generar Factura
          </button>
        </div>

        {requireInvoice && showInvoiceDetails && (
          <div className="invoice-details-container">
            <h3 className="invoice-details-title">
              <MdReceipt className="title-icon" />
              Datos de Facturación
            </h3>
            <div className="invoice-details-grid">
              <div className="invoice-input-group">
                <label>
                  <MdPerson className="input-icon" />
                  NIT/RUT
                </label>
                <input
                  type="text"
                  name="nit"
                  value={invoiceData.nit}
                  onChange={handleInvoiceDataChange}
                  placeholder="Ingrese NIT/RUT"
                />
              </div>
              <div className="invoice-input-group">
                <label>
                  <MdDescription className="input-icon" />
                  Razón Social
                </label>
                <input
                  type="text"
                  name="razonSocial"
                  value={invoiceData.razonSocial}
                  onChange={handleInvoiceDataChange}
                  placeholder="Ingrese Razón Social"
                />
              </div>
              <div className="invoice-input-group">
                <label>
                  <MdLocationOn className="input-icon" />
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={invoiceData.direccion}
                  onChange={handleInvoiceDataChange}
                  placeholder="Ingrese Dirección"
                />
              </div>
              <div className="invoice-input-group">
                <label>
                  <MdPhone className="input-icon" />
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={invoiceData.telefono}
                  onChange={handleInvoiceDataChange}
                  placeholder="Ingrese Teléfono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="products-section">
        <div className="products-header">
          <h3>Productos</h3>
          <button 
            type="button" 
            onClick={handleAddProduct} 
            className="add-product-btn"
          >
            <MdAdd /> Agregar Producto
          </button>
        </div>

        {selectedProducts.length === 0 ? (
          <div className="empty-state">
            <MdShoppingCart className="empty-icon" />
            <p>No hay productos agregados</p>
            <span>Haz clic en "Agregar Producto" para comenzar</span>
          </div>
        ) : (
          <div className="products-table">
            <div className="table-header">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Acciones</span>
            </div>
            {selectedProducts.map((producto, index) => (
              <div key={index} className="product-row">
                <select
                  value={producto.productoId}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                  className="product-select"
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Stock: {p.stock} - ${p.price}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={producto.cantidad}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  className="quantity-input"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(index)}
                  className="delete-btn"
                  title="Eliminar producto"
                >
                  <MdDelete />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sales-footer">
        <div className="total-section">
          <span className="total-label">Total:</span>
          <h3 className="total-amount">${total.toLocaleString()}</h3>
        </div>
        <button 
          type="submit" 
          className="register-btn"
          disabled={selectedProducts.length === 0 || selectedProducts.some(p => !p.productoId)}
        >
          {requireInvoice ? <MdReceipt className="button-icon" /> : <MdSave className="button-icon" />}
          {requireInvoice ? 'Registrar y Generar Factura' : 'Registrar Venta'}
        </button>
      </div>
    </form>
  );
};

export default SalesForm;