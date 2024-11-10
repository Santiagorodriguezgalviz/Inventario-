import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { storage } from '../../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MdPerson, MdEmail, MdAddAPhoto } from 'react-icons/md';
import Swal from 'sweetalert2';
import '../styles/SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(user?.photoURL);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        
        if (file.size > 5 * 1024 * 1024) { // 5MB máximo
          throw new Error('La imagen es demasiado grande. Máximo 5MB.');
        }
        
        if (!file.type.startsWith('image/')) {
          throw new Error('Por favor selecciona un archivo de imagen válido.');
        }

        const storageRef = ref(storage, `profile_photos/${user.uid}`);
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        
        await updateProfile(user, { photoURL });
        setPreviewImage(photoURL);
        
        await Swal.fire({
          icon: 'success',
          title: '¡Imagen actualizada!',
          text: 'Tu foto de perfil ha sido actualizada correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al subir imagen:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo actualizar la foto de perfil'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(user, {
        displayName: displayName
      });

      await Swal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: 'Los cambios se han guardado correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      onClose();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron guardar los cambios'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Configuración de Perfil</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          <div className="modal-profile-section">
            <div className="modal-profile-container">
              <img 
                src={previewImage || user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=random`}
                alt="Profile" 
                className="modal-profile-image"
              />
              <label className="modal-upload-label">
                <MdAddAPhoto className="modal-upload-icon" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
              <label>
                <MdPerson className="input-icon" />
                Nombre de usuario
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>
                <MdEmail className="input-icon" />
                Correo electrónico
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="form-input"
              />
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={onClose}
                className="modal-cancel-btn"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="modal-save-btn"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 