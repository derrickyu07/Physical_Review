import { useForm } from 'react-hook-form'
import styles from '../../../styles/Form.module.css'
import { useEffect } from 'react'


function GoalForm({ onSubmit, isLoading, isSuccess }) {
    const { register, handleSubmit, reset, formState: {
        errors
    } } = useForm()

    useEffect(() => {
        if (isSuccess) reset()
    }, [isSuccess, reset])
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formCard}>
                <p className={styles.formTitle}>Add a goal</p>
                <div className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${styles.full}`}>
                        <label>Goal type</label>
                        <select className={styles.formSelect}
                            {...register('goalType', { required: 'Goal type is required' })}
                        >
                            <option value="">— Select —</option>
                            <option value="weight loss">Weight loss</option>
                            <option value="muscle gain">Muscle gain</option>
                            <option value="fat loss">Fat loss</option>
                        </select>
                        {errors.goalType && <p className={styles.errorMessage}>{errors.goalType.message}</p>}

                    </div>

                    <div className={styles.formGroup}>
                        <label>Target value</label>
                        <input type="number" placeholder="e.g. 180"
                            {...register('targetValue', { required: 'Target value is required' })} />
                        {errors.targetValue && <p className={styles.errorMessage}>{errors.targetValue.message}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Current value</label>
                        <input type="number" placeholder="e.g. 200"
                            {...register('currentValue', { required: 'Current value is required' })} />
                        {errors.currentValue && <p className={styles.errorMessage}>{errors.currentValue.message}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Start date</label>
                        <input type="date"
                            {...register('startDate', { required: 'Start Date is required' })} />
                        {errors.startDate && <p className={styles.errorMessage}>{errors.startDate.message}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>End date</label>
                        <input type="date"
                            {...register('endDate')} />
                        {errors.endDate && <p className={styles.errorMessage}>{errors.endDate.message}</p>}
                    </div>

                    <button className={styles.submitBtn} disabled={isLoading}>{isLoading ? 'Adding...' : 'Add goal'}</button>
                </div>
            </div>
        </form>
    )
}

export default GoalForm