import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, reset } from '../../features/auth/authSlice';
import styles from '../../styles/Login.module.css';

function RegisterPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    useEffect(() => {
        if (isError) console.log(message);
        if (isSuccess || user) navigate('/');
        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onSubmit = (data) => dispatch(registerUser(data));

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.brand}>
                    <div className={styles.brandIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    </div>
                    <span className={styles.brandName}>Physical Review</span>
                </div>

                <h1 className={styles.title}>Create an account</h1>
                <p className={styles.subtitle}>Start tracking your health today</p>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Name</label>
                        <input
                            type="text"
                            placeholder="Your full name"
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                            {...register('name', { required: 'Name is required' })}
                        />
                        {errors.name && <p className={styles.errorMsg}>{errors.name.message}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                            {...register('email', { required: 'Email is required' })}
                        />
                        {errors.email && <p className={styles.errorMsg}>{errors.email.message}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Minimum 6 characters' },
                            })}
                        />
                        {errors.password && <p className={styles.errorMsg}>{errors.password.message}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Confirm password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (val) => val === watch('password') || 'Passwords do not match',
                            })}
                        />
                        {errors.confirmPassword && <p className={styles.errorMsg}>{errors.confirmPassword.message}</p>}
                    </div>

                    {isError && <p className={styles.errorMsg}>{message}</p>}

                    <button type="submit" className={styles.btn} disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <div className={styles.divider}>
                    <span />
                    <p>or</p>
                    <span />
                </div>

                <p className={styles.registerText}>
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
