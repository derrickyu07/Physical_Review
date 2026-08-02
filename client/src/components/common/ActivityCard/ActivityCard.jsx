import styles from './ActivityCard.module.css';

const INTENSITY_COLORS = {
    light: 'green',
    moderate: 'orange',
    intense: 'red',
};

function getIntensityColor(intensity) {
    return INTENSITY_COLORS[intensity] || 'gray';
}

function ActivityCard({ activity, onDelete }) {
    const formattedDate = new Date(activity.activityDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.name}>{activity.activityType}</span>
                <span className={`${styles.badge} ${styles[getIntensityColor(activity.intensity)]}`}>
                    {activity.intensity}
                </span>
            </div>

            <p className={styles.date}>{formattedDate}</p>

            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{activity.duration}</span>
                    <span className={styles.statLabel}>mins</span>
                </div>
                {activity.caloriesBurned && (
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{activity.caloriesBurned}</span>
                        <span className={styles.statLabel}>kcal</span>
                    </div>
                )}
            </div>
            <button className={styles.deleteBtn} onClick={() => onDelete(activity._id)}>
                Delete
            </button>
        </div>
    );
}

export default ActivityCard;