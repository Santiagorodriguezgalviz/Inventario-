import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import Swal from 'sweetalert2';
import '../styles/Orders.css';

function OrderForm() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      const productsSnapshot = await getDocs(collection(firestore, 'products'));
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    };
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: '', quantity: 1 }]);
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index][field] = value;
    setSelectedProducts(updatedProducts);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        clientName,
        products: selectedProducts.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            name: product.name,
            quantity: item.quantity,
            price: product.price
          };
        }),
        total: calculateTotal(),
        status: 'pendiente',
        date: new Date()
      };

      await addDoc(collection(firestore, 'pedidos'), orderData);
      
      Swal.fire({
        icon: 'success',
        title: '¡Pedido Creado!',
        text: 'El pedido se ha creado exitosamente'
      });
      // Limpiar formulario
      setClientName('');
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error al crear el pedido:', error);
    }
  };

  return (
    <div className="order-form-container">
      <h2>Nuevo Pedido</h2>
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <label>Nombre del Cliente:</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            className="form-control"
            style={{ maxWidth: '300px' }}
          />
        </div>

        <div className="products-section">
          <h3>Productos</h3>
          <button type="button" onClick={handleAddProduct} className="add-product-btn">
            + Agregar Producto
          </button>

          {selectedProducts.map((item, index) => (
            <div key={index} className="product-row">
              <select
                value={item.productId}
                onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                required
              >
                <option value="">Seleccionar producto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                required
              />
            </div>
          ))}
        </div>

        <div className="order-total">
          <h3>Total: ${calculateTotal()}</h3>
        </div>

        <button type="submit" className="submit-btn">
          Crear Pedido
        </button>
      </form>
    </div>
  );
}

export default OrderForm;
