import formStyles from '../../../styles/Form.module.css';
import styles from './UserInformationForm.module.css';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

function UserInformationForm({ user, bodyMetric, setIsEditing, onSubmit, isLoading }) {

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        reset({
            name: user.name,
            email: user.email,
            height: bodyMetric.height,
            weight: bodyMetric.weight,
            gender: bodyMetric.gender,
            age: bodyMetric.age,
            bmi: bodyMetric.bmi
        });
    }, [bodyMetric.bmi, bodyMetric.age, user.email, user.name, bodyMetric.weight, bodyMetric.height, bodyMetric.gender, reset]);

    const handleFormSubmit = (data) => {
        onSubmit({ id: bodyMetric._id, data });
    };
    return (
        <form className={formStyles.profileForm} onSubmit={handleSubmit(handleFormSubmit)}>
            <div className={`${formStyles.formGroup} ${styles.formGroup}`}>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" {...register('name')} />
            </div>
            <div className={`${formStyles.formGroup} ${styles.formGroup}`}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email"{...register('email')} />
            </div>
            <div className={`${formStyles.formGroup} ${styles.formGroup}`}>
                <label htmlFor="height">Height(inches)</label>
                <input type="number" id="height" {...register('height')} />
            </div>
            <div className={`${formStyles.formGroup} ${styles.formGroup}`}>
                <label htmlFor="weight">Weight(lbs)</label>
                <input type="number" id="weight" {...register('weight')} />
            </div>
            <div className={`${formStyles.formGroup} ${styles.formGroup}`}>
                <label htmlFor="gender">Gender</label>
                <select className={`${formStyles.formSelect} ${styles.formSelect}`} type="text" id="gender"{...register('gender')}>
                    <option value="">— Select —</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>
            <div className={`${formStyles.formGroup} ${styles.formGroup}`}>
                <label htmlFor="age">Age</label>
                <input type="number" id="age" {...register('age')} />
            </div>
            <button className={formStyles.btnSave} type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</button>
            <button className={formStyles.btnCancel} type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
    )
}

export default UserInformationForm;