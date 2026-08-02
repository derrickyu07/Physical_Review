import { useDispatch, useSelector } from "react-redux";
import GoalCard from "../../components/common/GoalCard/GoalCard";
import GoalForm from "../../components/forms/GoalForm/GoalForm";
import PageLayout from "../../components/layout/PageLayout/PageLayout";
import styles from "./GoalPage.module.css"
import { createGoal, getGoals, reset } from "../../features/goals/goalSlice";
import { useEffect } from 'react';

function GoalPage() {
    const dispatch = useDispatch();

    const { goals, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.goal
    )

    useEffect(() => {
        dispatch(getGoals());
    }, [dispatch])

    useEffect(() => {
        if (isError) {
            console.log(message);
            dispatch(reset());
        }
    }, [isError, message, dispatch])

    const onSubmit = async (data) => {
        const result = await dispatch(createGoal(data))
        if (result.meta.requestStatus === 'fulfilled') {
            dispatch(getGoals());
            dispatch(reset());
        }
    }

    return (
        < PageLayout title="Goals" >
            <div className={styles.goalsGrid}>
                {isError && <p>{message}</p>}
                <GoalForm onSubmit={onSubmit} isLoading={isLoading} isSuccess={isSuccess} />
                <div className={styles.goalsList}>
                    {goals.map((goal) => (
                        <GoalCard key={goal._id} goal={goal} />
                    ))}
                </div>
            </div>
        </PageLayout >
    )
}

export default GoalPage;