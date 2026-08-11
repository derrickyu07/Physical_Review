import { useDispatch, useSelector } from "react-redux";
import Reports from "../../components/common/Reports/Reports";
import PageLayout from "../../components/layout/PageLayout/PageLayout";
import { createWeeklyHealthReport, deleteReport, getReports, reset } from "../../features/report/reportSlice";
import { useEffect, useState } from "react";
import { createHealthLog } from "../../features/healthLog/healthLogSlice";
import styles from "./ReportPage.module.css";

function ReportPage() {

    const [generateDone, setGenerateDone] = useState(false);
    const [logDone, setLogDone] = useState(false);


    const [logDate, setLogDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const dispatch = useDispatch()
    const { isError, isLoading, message, reports } = useSelector((state) => state.report)

    useEffect(() => {
        if (isError) {
            console.log(message)
            dispatch(reset())
        }
    }, [isError, message, dispatch])

    useEffect(() => {
        dispatch(getReports())
    }, [dispatch])

    const onDelete = (id) => {
        dispatch(deleteReport(id))
        dispatch(getReports());
    }

    const onGenerate = async () => {
        try {
            await dispatch(createWeeklyHealthReport()).unwrap();
            dispatch(getReports());
            setGenerateDone(true);
            setTimeout(() => setGenerateDone(false), 2500);
        } catch (err) {
            console.error('Report generation failed:', err);
        }
    }
    const onCreateHealthLog = async () => {
        try {
            await dispatch(createHealthLog({ date: logDate })).unwrap();
            setLogDone(true);
            setTimeout(() => setLogDone(false), 2500);
        } catch (err) {
            console.error('Health log creation failed:', err);
        }
    };
    return (
        <PageLayout title="Reports">
            <div className={styles.actionsBar}>
                <button className={styles.btnPrimary} type="button" onClick={onGenerate} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Report'}
                </button>
                {generateDone && <span className={styles.successTag}>✓ Report ready</span>}
                <div className={styles.divider} />
                <div className={styles.actionGroup}>
                    <input
                        className={styles.dateInput}
                        type="date"
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                    />
                    <button className={styles.btnSecondary} type="button" onClick={onCreateHealthLog} disabled={isLoading}>
                        Create Health Log
                    </button>
                    {logDone && <span className={styles.successTag}>✓ Logged</span>}
                </div>
            </div>
            <Reports reports={reports} onDelete={onDelete} />
        </PageLayout>
    )
}
export default ReportPage; 