import styles from './MealCard.module.css';

const MEAL_TYPE_COLORS = {
    breakfast: 'orange',
    lunch: 'green',
    dinner: 'blue',
    snack: 'purple',
};

function getMealTypeColor(mealType) {
    return MEAL_TYPE_COLORS[mealType] || 'gray';
}

function MealCard({ meal, onDelete }) {
    const formattedDate = new Date(meal.mealDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.name}>{meal.name}</span>
                <span className={`${styles.badge} ${styles[getMealTypeColor(meal.mealType)]}`}>
                    {meal.mealType}
                </span>
            </div>

            <p className={styles.date}>{formattedDate}</p>

            <div className={styles.macros}>
                <div className={styles.macro}>
                    <span className={styles.macroValue}>{meal.calories}</span>
                    <span className={styles.macroLabel}>kcal</span>
                </div>
                <div className={styles.macro}>
                    <span className={styles.macroValue}>{meal.protein}g</span>
                    <span className={styles.macroLabel}>Protein</span>
                </div>
                <div className={styles.macro}>
                    <span className={styles.macroValue}>{meal.carbohydrates}g</span>
                    <span className={styles.macroLabel}>Carbs</span>
                </div>
                <div className={styles.macro}>
                    <span className={styles.macroValue}>{meal.fat}g</span>
                    <span className={styles.macroLabel}>Fat</span>
                </div>
            </div>

            <button className={styles.deleteBtn} onClick={() => onDelete(meal._id)}>
                Delete
            </button>
        </div>
    );
}

export default MealCard;