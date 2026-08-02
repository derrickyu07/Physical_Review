import styles from './GoalCard.module.css'

function GoalCard({ goal }) {

    const getProgressColor = (status) => {
        switch (status) {
            case 'active': return '#1D9E75'
            case 'complete': return '#534AB7'
            case 'inactive': return '#6b6375'
            default: return '#1D9E75'
        }
    }

    const getProgressPercentage = (currentValue, targetValue, goalType) => {
        if (goalType == 'muscle gain') {
            return (currentValue / targetValue * 100)
        }
        return (targetValue / currentValue * 100)
    }

    const now = new Date();

    return (
        <div key={goal._id} className={styles.goalCard}>
            <div className={styles.goalHeader}>
                <span className={styles.goalType}>{goal.goalType}</span>
                <span className={`${styles.badge} ${styles[`badge${goal.status}`]}`}>
                    {goal.status}
                </span>
                <span className={styles.goalMeta}>
                    <span>Target: {goal.targetValue} lbs</span>
                    <span>Current: {goal.currentValue} lbs</span>
                    {now < new Date(goal.startDate) ?
                        <span>Starts: {new Date(goal.startDate).toLocaleDateString()}</span>
                        : <span>Due: {new Date(goal.endDate).toLocaleDateString()}</span>

                    }

                </span>
            </div>
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${getProgressPercentage(goal.currentValue, goal.targetValue, goal.goalType)}%`, background: getProgressColor(goal.status) }}
                />
            </div>
        </div>
    )
}
export default GoalCard;