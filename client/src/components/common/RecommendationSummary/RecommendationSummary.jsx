import styles from './RecommendationSummary.module.css'

function RecommendationSummary({ recommendations }) {

    return (
        <div className={styles.recCard}>
            <p className={styles.recTitle}>Recommendations</p>
            <ul className={styles.recList}>
                {recommendations.map((rec, i) => (
                    <li className={styles.recItem} key={i}>{rec}</li>
                ))}
            </ul>
        </div>
    )
}

export default RecommendationSummary