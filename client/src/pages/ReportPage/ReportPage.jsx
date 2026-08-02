import { useDispatch, useSelector } from "react-redux";
import Reports from "../../components/common/Reports/Reports";
import PageLayout from "../../components/layout/PageLayout/PageLayout";
import { deleteReport, getReports, reset } from "../../features/report/reportSlice";
import { useEffect } from "react";

function ReportPage() {
    const dispatch = useDispatch()
    const { isError, message, reports } = useSelector((state) => state.report)

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
    }

    return (
        <PageLayout title="Reports">
            <Reports reports={reports} onDelete={onDelete} />
        </PageLayout>
    )
}
export default ReportPage;