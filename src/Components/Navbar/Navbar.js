// src/Components/Navbar/Navbar.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../../firebase/firebaseConfig';
import Swal from 'sweetalert2';
import { 
  MdMenu, 
  MdArrowDropDown, 
  MdExitToApp, 
  MdSettings,
  MdInventory 
} from 'react-icons/md';
import '../styles/Navbar.css';
import SettingsModal from '../Settings/SettingsModal';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Estás seguro que deseas cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await auth.signOut();
        
        await Swal.fire({
          title: '¡Hasta pronto!',
          text: 'Has cerrado sesión exitosamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        navigate('/');
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cerrar sesión'
      });
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <MdMenu size={24} />
          </button>
          <div className="brand-container">
            <div className="logo-wrapper">
              <MdInventory size={28} className="brand-icon" />
            </div>
            <h1 className="brand-title">Sistema de Inventario</h1>
          </div>
        </div>

        <div className="navbar-right">
          <div className="profile-section">
            <div 
              className="profile-trigger"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img 
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=random`}
                alt="Profile" 
                className="profile-image"
              />
              <div className="profile-info">
                <span className="profile-name">
                  {user?.displayName || user?.email?.split('@')[0]}
                </span>
                <span className="profile-email">{user?.email}</span>
              </div>
              <MdArrowDropDown className="dropdown-icon" />
            </div>

            {showDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <img 
                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=random`}
                    alt="Profile" 
                    className="dropdown-profile-image"
                  />
                  <div className="dropdown-profile-info">
                    <span className="dropdown-name">
                      {user?.displayName || user?.email?.split('@')[0]}
                    </span>
                    <span className="dropdown-email">{user?.email}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    setShowDropdown(false);
                    setShowSettings(true);
                  }}
                >
                  <MdSettings className="dropdown-icon" />
                  Configuración
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  <MdExitToApp className="dropdown-icon" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

export default Navbar;