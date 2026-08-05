import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BodyMetricForm from '../../components/forms/BodyMetricForm/BodyMetricForm';
import { createMetric, reset } from '../../features/metrics/metricsSlice';
import styles from './OnboardingPage.module.css';

function OnboardingPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, isSuccess, isError, message } = useSelector((state) => state.metric);

    useEffect(() => {
        if (isError) console.log(message);
        if (isSuccess) navigate('/');
        dispatch(reset());
    }, [isSuccess, isError, message, navigate, dispatch]);

    const onSubmit = (data) => dispatch(createMetric(data));

    return (
        <div className={styles.page}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Set up your profile</h1>
                    <p className={styles.subtitle}>A few quick details so we can personalize your reports</p>
                </div>

                <BodyMetricForm onSubmit={onSubmit} isLoading={isLoading} />

                {isError && <p className={styles.errorMsg}>{message}</p>}

            </div>
        </div>
    );
}

export default OnboardingPage;