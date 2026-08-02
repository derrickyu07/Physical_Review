import { useDispatch, useSelector } from 'react-redux';
import UserInformation from '../../components/common/UserInformation/UserInformation';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import { useEffect, useState } from 'react';
import { reset, getMetric, updateMetric } from "../../features/metrics/metricsSlice";
import { updateUser } from "../../features/auth/authSlice";

function UserInformationPage() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { metric, isSuccess, isError, message, isLoading } = useSelector((state) => state.metric)

    const [isEditing, setIsEditing] = useState(false);


    useEffect(() => {
        if (isError) {
            console.log(message)
            dispatch(reset())
        }
    }, [isError, message, dispatch])

    useEffect(() => {
        dispatch(getMetric())
    }, [dispatch])

    const handleUpdateMetric = async (id, metricData) => {
        await dispatch(updateMetric({ id, data: metricData }))
    }

    const handleUpdateUser = async (userData) => {

        await dispatch(updateUser(userData))
    }

    const onSubmit = async ({ id, data }) => {
        await handleUpdateUser({ name: data.name, email: data.email })
        await handleUpdateMetric(id, { weight: Number(data.weight), height: Number(data.height), gender: data.gender, age: Number(data.age) })
        setIsEditing(false);
    };

    return (
        <PageLayout title='User Information'>
            {metric ?
                <UserInformation user={user} bodyMetric={metric} isSuccess={isSuccess} isError={isError} isLoading={isLoading} onSubmit={onSubmit} isEditing={isEditing} setIsEditing={setIsEditing} /> : <p>Loading...</p>
            }
        </PageLayout>
    )
}

export default UserInformationPage;