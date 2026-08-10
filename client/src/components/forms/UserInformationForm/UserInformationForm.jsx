import formStyles from '../../../styles/Form.module.css';
import styles from './UserInformationForm.module.css';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

function UserInformationForm({ user, bodyMetric, setIsEditing, onSubmit, isLoading }) {

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            name: user.name,
            email: user.email,
            height: bodyMetric.height,
            weight: bodyMetric.weight,
            gender: bodyMetric.gender,
            age: bodyMetric.age,
            bmi: bodyMetric.bmi,
            activityLevel: bodyMetric.activityLevel
        }
    });

    useEffect(() => {
        reset({
            name: user.name,
            email: user.email,
            height: bodyMetric.height,
            weight: bodyMetric.weight,
            gender: bodyMetric.gender,
            age: bodyMetric.age,
            bmi: bodyMetric.bmi,
            activityLevel: bodyMetric.activityLevel
        });
    }, [bodyMetric.bmi, bodyMetric.age, user.email, user.name, bodyMetric.weight, bodyMetric.height, bodyMetric.gender, bodyMetric.activityLevel, reset]);

    const handleFormSubmit = (data) => {
        onSubmit({ id: bodyMetric._id, data });
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className={formStyles.formCard}>
                <p className={formStyles.formTitle}>Edit profile</p>
                <div className={formStyles.formGrid}>
                    <div className={`${formStyles.formGroup} ${styles.full}`}>
                        <label className={formStyles.label} htmlFor="name">Name</label>
                        <input type="text" id="name" {...register('name')} />
                    </div>
                    <div className={`${formStyles.formGroup} ${styles.full}`}>
                        <label className={formStyles.label} htmlFor="email">Email</label>
                        <input type="email" id="email" {...register('email')} />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label} htmlFor="height">Height (inches)</label>
                        <input type="number" id="height" {...register('height')} />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label} htmlFor="weight">Weight (lbs)</label>
                        <input type="number" id="weight" {...register('weight')} />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label} htmlFor="gender">Gender</label>
                        <select id="gender" {...register('gender')}>
                            <option value="">— Select —</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label} htmlFor="age">Age</label>
                        <input type="number" id="age" {...register('age')} />
                    </div>
                    <div className={`${formStyles.formGroup} ${styles.full}`}>
                        <label className={formStyles.label} htmlFor="activityLevel">Activity Level</label>
                        <select id="activityLevel" {...register('activityLevel')}>
                            <option value="">— Select —</option>
                            <option value="sedentary">Sedentary</option>
                            <option value="light">Light</option>
                            <option value="moderate">Moderate</option>
                            <option value="active">Active</option>
                            <option value="veryActive">Very Active</option>
                            <option value="extremelyActive">Extremely Active</option>
                        </select>
                    </div>
                    <div className={styles.actions}>
                        <button className={formStyles.submitBtn} type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button className={styles.btnCancel} type="button" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default UserInformationForm;