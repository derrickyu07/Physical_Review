import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import CalorieSummary from '../../components/common/CalorieSummary/CalorieSummary';
import styles from './DashboardPage.module.css'
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import { getCalorieSummary, reset as summaryReset } from '../../features/dashboard/dashboardSlice';
import { getStartOfDay, getEndOfDay } from '../../utils/dateUtils';

function DashboardPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const { calorieSummary, isLoading: isSummaryLoading, isError: isSummaryError, message: summaryMessage } = useSelector((state) => state.dashboard)
    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    useEffect(() => {
        if (isSummaryError) console.log(summaryMessage)

    }, [isSummaryError, summaryMessage])

    useEffect(() => {
        return () => {
            dispatch(summaryReset());
        };
    }, [dispatch]);

    useEffect(() => {
        dispatch(getCalorieSummary({ startDate: getStartOfDay(), endDate: getEndOfDay() }))
    }, [dispatch]);
    return (
        <PageLayout title="Dashboard">
            <div className={styles.dashboard}>
                <div className={styles.heroCard}>
                    {isSummaryLoading ? (<CalorieSummary calorieSummary={null} isLoading={isSummaryLoading} />) : <CalorieSummary calorieSummary={calorieSummary} isLoading={isSummaryLoading} />}
                </div>
                {/* <div className={styles.recommendationsCard}>
                    {isReportLoading ? (
                        <RecommendationSummary recommendations={[]} />
                    ) : (
                        <RecommendationSummary recommendations={report?.recommendations || []} />
                    )}
                </div> */}
            </div>
        </PageLayout>
    );
}

export default DashboardPage;