import { useForm } from 'react-hook-form';
import styles from '../../../styles/Form.module.css';

function BodyMetricForm({ onSubmit, isLoading }) {
    const { register, handleSubmit, formState: { errors } } = useForm();

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formCard}>
                <p className={styles.formTitle}>Set up your body metrics</p>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="height">Height (inches)</label>
                        <input type="number" step="any" id="height" placeholder="e.g. 70"
                            {...register('height', { required: 'Height is required', valueAsNumber: true, min: { value: 1, message: 'Height must be positive' } })} />
                        {errors.height && <p className={styles.errorMessage}>{errors.height.message}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="weight">Weight (lbs)</label>
                        <input type="number" step="any" id="weight" placeholder="e.g. 165"
                            {...register('weight', { required: 'Weight is required', valueAsNumber: true, min: { value: 1, message: 'Weight must be positive' } })} />
                        {errors.weight && <p className={styles.errorMessage}>{errors.weight.message}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="gender">Gender</label>
                        <select id="gender" {...register('gender', { required: 'Gender is required' })}>
                            <option value="">— Select —</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        {errors.gender && <p className={styles.errorMessage}>{errors.gender.message}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="age">Age</label>
                        <input type="number" id="age" placeholder="e.g. 28"
                            {...register('age', { required: 'Age is required', valueAsNumber: true, min: { value: 1, message: 'Age must be positive' } })} />
                        {errors.age && <p className={styles.errorMessage}>{errors.age.message}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="activityLevel">Activity Level</label>
                        <select id="activityLevel" {...register('activityLevel', { required: 'Activity level is required' })}>
                            <option value="">— Select —</option>
                            <option value="sedentary">Sedentary</option>
                            <option value="light">Light</option>
                            <option value="moderate">Moderate</option>
                            <option value="active">Active</option>
                            <option value="veryActive">Very active</option>
                            <option value="extremelyActive">Extremely active</option>
                        </select>
                        {errors.activityLevel && <p className={styles.errorMessage}>{errors.activityLevel.message}</p>}
                    </div>

                    <button className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save & continue'}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default BodyMetricForm;