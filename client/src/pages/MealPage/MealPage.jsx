import { useDispatch, useSelector } from "react-redux";
import MealForm from "../../components/forms/MealForm/MealForm";
import PageLayout from "../../components/layout/PageLayout/PageLayout";
import { useEffect } from "react";
import { reset, deleteMeal, getMeals, createMeal } from "../../features/meals/mealSlice";
import MealCard from "../../components/common/MealCard/MealCard";
import styles from "./MealPage.module.css"


function MealPage() {

    const dispatch = useDispatch()

    const { meals, isSuccess, isError, message, isLoading } = useSelector((state) => state.meal)

    useEffect(() => {
        if (isError) {
            console.log(message);
            dispatch(reset())
        }
    }, [isError, message, dispatch])

    useEffect(() => {
        dispatch(getMeals())
    }, [dispatch])

    const handleDelete = (id) => {
        dispatch(deleteMeal(id))
    }


    const onSubmit = async (data) => {
        const result = await dispatch(createMeal(data))
        if (result.meta.requestStatus === 'fulfilled') {
            dispatch(getMeals());
        }
    }
    return (
        <PageLayout title="Meals">
            <div className={styles.content}>
                <MealForm onSubmit={onSubmit} isSuccess={isSuccess} isLoading={isLoading} />
                <section className={styles.list}>

                    {meals.length === 0 ? (
                        <p className={styles.empty}>No meals logged yet.</p>
                    ) : (
                        <div className={styles.grid}>
                            {meals.map((meal) => (
                                < MealCard meal={meal} key={meal._id} onDelete={handleDelete} />
                            ))
                            }
                        </div>)}
                </section>
            </div>
        </PageLayout>
    )
}

export default MealPage;