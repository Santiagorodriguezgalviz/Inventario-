// src/components/Auth/Login.js
import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase/firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaHandPeace } from 'react-icons/fa';
import Swal from 'sweetalert2';
import '../styles/Login.css';
import inventoryImage from '../assets/img.png';

// Componente principal de Login
function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    showPassword: false
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const db = getFirestore();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showAlert = async (config) => {
    return Swal.fire({
      ...config,
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
        confirmButton: 'swal-confirm',
        timerProgressBar: 'swal-timer-progress-bar'
      }
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      await showAlert({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión exitosamente con Google',
        timer: 3500,
        timerProgressBar: true,
        showConfirmButton: false
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Error con Google:", error);
      showAlert({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo iniciar sesión con Google',
        confirmButtonColor: '#6366f1'
      });
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    await showAlert({
      title: 'Iniciando sesión',
      html: '<div class="loading-message"><p>Verificando credenciales...</p></div>',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const userDoc = await validateUser();
      if (!userDoc) return;

      await signInWithEmailAndPassword(auth, userDoc.data().email, formData.password);
      await showSuccessSequence(formData.username);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error:", error);
      showAlert({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: 'Usuario o contraseña incorrectos',
        confirmButtonColor: '#6366f1',
        timer: 3000,
        timerProgressBar: true
      });
    }
  };

  const validateUser = async () => {
    const querySnapshot = await getDocs(
      query(collection(db, 'users'), 
      where('username', '==', formData.username.toLowerCase()))
    );

    if (querySnapshot.empty) {
      await showAlert({
        icon: 'error',
        title: 'Usuario no encontrado',
        text: 'El usuario ingresado no existe en el sistema',
        confirmButtonColor: '#6366f1'
      });
      return null;
    }

    return querySnapshot.docs[0];
  };

  const showSuccessSequence = async (username) => {
    // Primera alerta - Verificación exitosa
    await showAlert({
      icon: 'success',
      title: 'Verificación exitosa',
      text: 'Credenciales correctas',
      timer: 1500,
      showConfirmButton: false
    });

    // Segunda alerta - Bienvenida personalizada
    await showAlert({
      icon: 'success',
      title: '¡Bienvenido!',
      html: `
        <div class="welcome-message">
          <p>Hola <strong>${username}</strong>!</p>
          <p>Has iniciado sesión exitosamente</p>
        </div>
      `,
      timer: 3500,
      timerProgressBar: true,
      showConfirmButton: false
    });
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-image-section">
          <img 
            src={inventoryImage}
            alt="Inventory Management"
            className="login-illustration"
          />
          <div className="image-text">
            <h2>Sistema de Gestión de Inventario</h2>
            <p>Administra tu inventario de manera eficiente y segura</p>
          </div>
        </div>
        
        <div className="login-form-section">
          <div className="welcome-header">
            <h1 className="login-title">
              Bienvenido <FaHandPeace className="wave-icon" />
            </h1>
            <p className="login-subtitle">Inicia sesión para continuar</p>
          </div>

          <button className="google-btn" onClick={handleGoogleSignIn}>
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google logo" 
              className="google-icon" 
            />
            Continuar con Google
          </button>

          <div className="separator">
            <span>o continúa con usuario</span>
          </div>

          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <input
                type="text"
                className="login-input"
                placeholder="Nombre de usuario"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group password-input-container">
              <input
                type={formData.showPassword ? "text" : "password"}
                className="login-input"
                placeholder="Contraseña"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button 
                type="button"
                className="toggle-password-btn"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  showPassword: !prev.showPassword
                }))}
              >
                {formData.showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button className="login-btn">
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;