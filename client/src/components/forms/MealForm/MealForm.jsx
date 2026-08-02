import { useForm } from 'react-hook-form';
import styles from '../../../styles/Form.module.css'
import { useEffect, useRef, useState } from 'react';
import api from '../../../services/axios';

function MealForm({ onSubmit, isLoading, isSuccess }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const debounceRef = useRef(null);

    const handleSearch = async (value) => {
        setQuery(value);
        if (value.length < 2) return setResults([]);

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const { data } = await api.get(`/foods/search?query=${value}`);
                setResults(data.data);
            } finally {
                setSearching(false);
            }
        }, 400);
    };

    const { register, handleSubmit, reset, formState: {
        errors
    }, setValue } = useForm({
        defaultValues: {
            mealDate: new Date().toISOString().slice(0, 16)
        }
    })

    const handleSelect = async (food) => {
        try {
            const { data } = await api.get(`/foods/${food.fdcId}`);
            const nutrition = data.data;
            setValue('name', food.description + (food.brandName ? ' - ' + food.brandName : ''));
            setValue('calories', nutrition.calories ?? '');
            setValue('fat', nutrition.fat ?? '');
            setValue('carbohydrates', nutrition.carbs ?? '');
            setValue('protein', nutrition.protein ?? '');
        } catch (err) {
            console.error('Failed to fetch nutrition data', err);
            // Still populate the name at minimum
            setValue('name', food.description);
        } finally {
            setResults([]);
            setQuery('');
        }
    };

    useEffect(() => {
        if (isSuccess) reset();
    }, [reset, isSuccess])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formCard}>
                <p className={styles.formTitle}>Log a meal</p>
                <div className={styles.formGrid}>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Search for a food..."
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        {results.length > 0 && (
                            <ul className={styles.dropdown}>
                                {
                                    results.map((food) => (
                                        <li key={food.fdcId} onMouseDown={() => handleSelect(food)}>
                                            {food.description}
                                            {food.brandName && <span> — {food.brandName}</span>}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor='name'>Name</label>
                        <input type="test" id='name' name="name" placeholder="e.g. Grilled Chicken Breast" {...register('name', { required: 'Meal name is required' })} />
                        {errors.name && <p className={styles.errorMessage}>{errors.name.message}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor='quantity'>Quantity</label>
                        <input type="number" id='quantity' name="quantity" min="0" placeholder="e.g. 1" {...register('quantity', { required: 'Quantity is required' })} />
                        {errors.quantity && <p className={styles.errorMessage}>{errors.quantity.message}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor='calories'>Calories</label>
                        <input type="number" id='calories' name="calories" min="0" step="any" placeholder="e.g. 350" {...register('calories', { required: 'calories is required' })} />
                        {errors.calories && <p className={styles.errorMessage}>{errors.calories.message}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor='fat'>Fat</label>
                        <input type="number" id='fat' name="fat" min="0" step="any" placeholder="e.g. 5" {...register('fat', { required: 'fat is required' })} />
                        {errors.fat && <p className={styles.errorMessage}>{errors.fat.message}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor='carbohydrates'>Carbohydrate</label>
                        <input type="number" id='carbohydrates' name="carbohydrates" min="0" step="any" placeholder="e.g. 5" {...register('carbohydrates', { required: 'carbohydrates is required' })} />
                        {errors.carbohydrates && <p className={styles.errorMessage}>{errors.carbohydrates.message}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor='protein'>Protein</label>
                        <input type="number" id='protein' name="protein" min="0" step="any" placeholder="e.g. 5" {...register('protein', { required: 'protein is required' })} />
                        {errors.protein && <p className={styles.errorMessage}>{errors.protein.message}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor='mealDate'>Date of meal</label>
                        <input type="datetime-local" id='mealDate' name="mealDate" {...register('mealDate', { required: 'Meal date is required' })} />
                        {errors.mealDate && <p className={styles.errorMessage}>{errors.mealDate.message}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor='mealType'>Meal Type</label>
                        <select name="mealType" id='mealType' {...register('mealType', { required: 'Meal type is required' })}>
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snack">Snack</option>
                        </select>
                        {errors.mealType && <p className={styles.errorMessage}>{errors.mealType.message}</p>}
                    </div>
                    <button className={styles.submitBtn} disabled={isLoading}>{isLoading ? 'Adding...' : 'Add meal'}</button>
                </div>
            </div>
        </form>
    )
}
export default MealForm;