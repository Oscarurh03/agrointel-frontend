import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLeaf } from 'react-icons/fa';

export default function LoginOverlay({ onLogin, onRegister, defaultEmail = '', defaultPass = '' }) {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPass);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [rol, setRol] = useState('Técnico de Campo');
  const [busy, setBusy] = useState(false);

  const submitLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onLogin(email, password);
    } finally {
      setBusy(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onRegister(regEmail, regPassword, rol);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      className="login-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
    >
      <motion.div
        className="login-card"
        initial={{ y: 34, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        <div className="login-head">
          <div className="brand-logo">
            <FaLeaf />
          </div>
          <h2>AgroIntel v2</h2>
          <p>Gestión Inteligente de Cultivos y Resiembra</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${modo === 'login' ? 'active' : ''}`}
            onClick={() => setModo('login')}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`auth-tab ${modo === 'register' ? 'active' : ''}`}
            onClick={() => setModo('register')}
          >
            Registrarse
          </button>
        </div>

        {modo === 'login' ? (
          <form onSubmit={submitLogin}>
            <label className="field">
              <span>Correo Electrónico</span>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
              />
            </label>
            <label className="field">
              <span>Contraseña</span>
              <input
                className="input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
              Ingresar al Panel
            </button>
          </form>
        ) : (
          <form onSubmit={submitRegister}>
            <label className="field">
              <span>Correo Electrónico</span>
              <input
                className="input"
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
              />
            </label>
            <label className="field">
              <span>Contraseña</span>
              <input
                className="input"
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            <label className="field">
              <span>Rol Operativo</span>
              <select className="select" value={rol} onChange={(e) => setRol(e.target.value)}>
                <option value="Técnico de Campo">Técnico de Campo</option>
                <option value="Admin Agrónomo">Admin Agrónomo</option>
              </select>
            </label>
            <button className="btn btn-accent btn-block" type="submit" disabled={busy}>
              Crear Cuenta
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
