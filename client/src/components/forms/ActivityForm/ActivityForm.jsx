import { useForm } from 'react-hook-form';
import styles from '../../../styles/Form.module.css'
import { useEffect } from 'react';

function ActivityForm({ onSubmit, isLoading, isSuccess }) {


    const { register, handleSubmit, formState: {
        errors
    }, reset } = useForm()

    useEffect(() => {
        if (isSuccess) reset();
    }, [reset, isSuccess])

    return (
        <form onSubmit={handleSubmit(onSubmit)} >
            <div className={styles.formCard}>
                <p className={styles.formTitle}>Log an activity</p>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="activityType">Activity Type</label>
                        <select name="activityType" id="activityType"
                            {...register('activityType', { required: "Activity Type is required" })}
                        >
                            <option value="running">Running</option>
                            <option value="walking">Walking</option>
                            <option value="cycling">Cycling</option>
                            <option value="weightlifting">Weightlifting</option>
                            <option value="basketball">Basketball</option>
                            <option value="soccer">Soccer</option>
                            <option value="swimming">Swimming</option>
                            <option value="hiking">Hiking</option>
                            <option value="yoga">Yoga</option>
                            <option value="boxing">Boxing</option>
                            <option value="tennis">Tennis</option>
                            <option value="crossfit">Crossfit</option>
                        </select>
                        {errors.activityType && <p className={styles.errorMessage}>{errors.activityType.message}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="duration">Duration(minutes)</label>
                        <input type="number" id="duration" placeholder="e.g. 30" name="duration"
                            {...register('duration', { required: "Duration is required" })} />
                        {errors.duration && <p className={styles.errorMessage}>{errors.duration.message}</p>}
                    </div>
                    <div className={styles.formGroup}>

                        <label className={styles.label} htmlFor="intensity">Intensity</label>
                        <select name="intensity" id="intensity"
                            {...register('intensity', { required: "Intensity is required" })}>
                            <option value="light">Light</option>
                            <option value="moderate">Moderate</option>
                            <option value="intense">Intense</option>
                        </select>
                        {errors.intensity && <p className={styles.errorMessage}>{errors.intensity.message}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor='activityDate'>Date of Activity</label>
                        <input type="datetime-local" id='activityDate' name="activityDate"                         {...register('activityDate', { required: "Activity date is required" })} />
                        {errors.activityDate && <p className={styles.errorMessage}>{errors.activityDate.message}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="caloriesBurned">Calories Burned</label>
                        <input type="number" id="caloriesBurned" placeholder="e.g. 100" name="caloriesBurned"
                            {...register('caloriesBurned', {
                                setValueAs: (v) => v === '' ? null : Number(v)
                            })} />
                        {errors.caloriesBurned && <p className={styles.errorMessage}>{errors.caloriesBurned.message}</p>}
                    </div>
                    <button className={styles.submitBtn} disabled={isLoading}>{isLoading ? 'Adding...' : 'Add activity'}</button>
                </div>
            </div>
        </form >
    )
}
export default ActivityForm;