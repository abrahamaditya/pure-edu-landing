'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, User, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to dashboard
        router.push('/log');
        router.refresh();
      } else {
        setError(data.error || 'Terjadi kesalahan saat masuk.');
      }
    } catch (err) {
      setError('Gagal menghubungkan ke server. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <style jsx global>{`
        .login-wrapper {
          min-height: 100vh;
          background-color: #0b0f19;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: var(--font-jakarta, 'Plus Jakarta Sans'), sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Subtle glowing background decorations */
        .login-wrapper::before,
        .login-wrapper::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          z-index: 1;
        }

        .login-wrapper::before {
          background-color: #ea6319;
          top: -50px;
          left: -50px;
        }

        .login-wrapper::after {
          background-color: #3b82f6;
          bottom: -50px;
          right: -50px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(21, 29, 48, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 40px 32px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          z-index: 2;
          position: relative;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: rgba(234, 99, 25, 0.1);
          color: #ea6319;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          border: 1px solid rgba(234, 99, 25, 0.2);
        }

        .login-header h2 {
          color: white;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }

        .login-header p {
          color: #64748b;
          font-size: 0.85rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
        }

        .input-label {
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-field-wrapper {
          position: relative;
        }

        .input-icon-left {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #475569;
          transition: color 0.3s ease;
        }

        .input-text {
          width: 100%;
          height: 48px;
          background: #0b0f19;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: white;
          padding: 0 44px;
          font-family: inherit;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .input-text:focus {
          outline: none;
          border-color: #ea6319;
          box-shadow: 0 0 0 3px rgba(234, 99, 25, 0.15);
        }

        .input-text:focus + .input-icon-left {
          color: #ea6319;
        }

        .input-icon-right {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: color 0.3s ease;
        }

        .input-icon-right:hover {
          color: #ea6319;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 10px 14px;
          color: #ef4444;
          font-size: 0.8rem;
          line-height: 1.4;
        }

        .btn-submit {
          width: 100%;
          height: 48px;
          background: linear-gradient(135deg, #ea6319 0%, #ff8c42 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 10px 20px -10px rgba(234, 99, 25, 0.4);
          margin-top: 8px;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px -10px rgba(234, 99, 25, 0.5);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <KeyRound size={24} />
          </div>
          <h2>Akses Dasbor Analitik</h2>
          <p>Masukkan username dan password admin untuk melanjutkan.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="input-field-wrapper">
              <input
                type="text"
                className="input-text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                autoFocus
              />
              <User className="input-icon-left" size={18} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-field-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-text"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <Lock className="input-icon-left" size={18} />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spin" size={18} />
                <span>Memproses Masuk...</span>
              </>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
