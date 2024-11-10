import React, { useState, useEffect } from 'react';
import { MdSave } from 'react-icons/md';
import { firestore } from '../../firebase/firebaseConfig';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import '../styles/Modal.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const ProductModal = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.category) newErrors.category = 'La categoría es obligatoria';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Ingrese un precio válido';
    if (!formData.stock || Number(formData.stock) < 0) newErrors.stock = 'Ingrese un stock válido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor, completa todos los campos correctamente');
      return;
    }

    try {
      if (product) {
        const result = await Swal.fire({
          title: '¿Confirmar cambios?',
          text: "¿Deseas guardar los cambios realizados?",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, guardar',
          cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
          await updateDoc(doc(firestore, 'products', product.id), {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            updatedAt: new Date().toISOString()
          });
          onSave(formData, true);
          onClose();
          toast.success('¡Producto actualizado exitosamente!');
        }
      } else {
        await addDoc(collection(firestore, 'products'), {
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          createdAt: new Date().toISOString()
        });
        onSave(formData, false);
        onClose();
        toast.success('¡Producto agregado exitosamente!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Error al ${product ? 'actualizar' : 'crear'} el producto`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label>Nombre del producto</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={errors.name ? 'error' : ''}
              placeholder="Ingrese el nombre del producto"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="modal-form-group">
            <label>Categoría</label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className={errors.category ? 'error' : ''}
            >
              <option value="">Selecciona una categoría</option>
              <option value="Electrónica">Electrónica</option>
              <option value="Ropa">Ropa</option>
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          <div className="modal-form-group">
            <label>Precio</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className={errors.price ? 'error' : ''}
              placeholder="Ingrese el precio"
              min="0"
              step="0.01"
            />
            {errors.price && <span className="error-message">{errors.price}</span>}
          </div>

          <div className="modal-form-group">
            <label>Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              className={errors.stock ? 'error' : ''}
              placeholder="Ingrese el stock disponible"
              min="0"
            />
            {errors.stock && <span className="error-message">{errors.stock}</span>}
          </div>

          {errors.submit && (
            <div className="error-alert">{errors.submit}</div>
          )}

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="save-btn">
              <MdSave /> Guardar
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ProductModal; 