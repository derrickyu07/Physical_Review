import PageLayout from "../../components/layout/PageLayout/PageLayout"
import ActivityForm from '../../components/forms/ActivityForm/ActivityForm';
import ActivityCard from "../../components/common/ActivityCard/ActivityCard";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { createActivity, deleteActivity, getActivities, reset } from "../../features/activities/activitySlice";
import styles from "./ActivityPage.module.css"

function ActivityPage() {

    const dispatch = useDispatch()

    const { activities, isLoading, isError, message, isSuccess } = useSelector((state) => state.activity)

    useEffect(() => {
        if (isError) {
            console.log(message);
            dispatch(reset())
        }
    }, [isError, message, dispatch])

    useEffect(() => {
        dispatch(getActivities())
    }, [dispatch])

    const onSubmit = async (data) => {
        const result = await dispatch(createActivity(data))
        if (result.meta.requestStatus === 'fulfilled') {
            dispatch(getActivities())
        }
    }

    const onDelete = (id) => {
        dispatch(deleteActivity(id))
    }

    return (
        <PageLayout title="Activities">
            <div className={styles.content}>
                <ActivityForm isLoading={isLoading} onSubmit={onSubmit} isSuccess={isSuccess} />
                <section className={styles.list}>
                    <div className={styles.grid}>
                        {activities.length > 0 ? (

                            activities.map((activity) => (
                                <ActivityCard key={activity._id} activity={activity} onDelete={onDelete} />
                            ))
                        ) : (
                            <p className={styles.empty}>No activities logged yet.</p>
                        )}
                    </div>
                </section>
            </div>
        </PageLayout>
    )
}

export default ActivityPage