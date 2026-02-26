import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/authService';
import styles from './Auth.module.css';

export const Register = () => {
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

    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    try {
      await authService.register({ email: email.trim(), password: password.trim() });
      navigate('/', { replace: true });
    } catch (unknownError) {
      if (axios.isAxiosError(unknownError)) {
        setError(unknownError.response?.data?.error ?? unknownError.message);
      } else {
        setError('Could not create account right now');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>New Task Model</h1>
        <p className={styles.subtitle}>Create account</p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={onSubmit} className={styles.form}>
          <label htmlFor="registerEmail">Email</label>
          <input
            id="registerEmail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <label htmlFor="registerPassword">Password</label>
          <input
            id="registerPassword"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />

          <button type="submit" disabled={submitting} className={styles.primaryButton}>
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
};
