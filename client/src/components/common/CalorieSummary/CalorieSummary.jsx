import styles from './CalorieSummary.module.css';

function CalorieSummary({ calorieSummary }) {
    const {
        caloriesConsumed = 0,
        caloriesBurned = 0,
        remainingCalories = 0,
        maintenance = 0,
    } = calorieSummary || {};

    const progress = maintenance > 0
        ? Math.min((caloriesConsumed / maintenance) * 100, 100)
        : 0;

    return (
        <div className={styles.wrapper}>
            <div
                className={styles.ring}
                style={{ '--progress': `${progress}%` }}
            >
                <div className={styles.ringInner}>
                    <span className={styles.ringValue}>{remainingCalories}</span>
                    <span className={styles.ringLabel}>remaining</span>
                </div>
            </div>
            <div className={styles.statRow}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Consumed</span>
                    <span className={styles.statValue}>{caloriesConsumed} kcal</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Burned</span>
                    <span className={styles.statValue}>{caloriesBurned} kcal</span>
                </div>
            </div>
        </div>
    );
}
export default CalorieSummary