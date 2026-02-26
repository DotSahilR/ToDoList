import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/authService';
import styles from './Auth.module.css';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (authService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    setSubmitting(true);

    try {
      await authService.login({ email: email.trim(), password: password.trim() });
      navigate('/', { replace: true });
    } catch (unknownError) {
      if (axios.isAxiosError(unknownError)) {
        setError(unknownError.response?.data?.error ?? unknownError.message);
      } else {
        setError('Could not sign in right now');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>New Task Model</h1>
        <p className={styles.subtitle}>Login to continue</p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={onSubmit} className={styles.form}>
          <label htmlFor="loginEmail">Email</label>
          <input
            id="loginEmail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <label htmlFor="loginPassword">Password</label>
          <input
            id="loginPassword"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            autoComplete="current-password"
          />

          <button type="submit" disabled={submitting} className={styles.primaryButton}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className={styles.switchText}>
          No account? <Link to="/register">Create account</Link>
        </p>
      </section>
    </main>
  );
};
