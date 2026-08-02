import ReportCard from "../ReportCard/ReportCard";
import styles from "./Reports.module.css"

function Reports({ reports, onDelete }) {
    return (
        <div className={styles.gridContainer}>
            {reports.map((report) => (
                < ReportCard key={report.id} previewUrl={report.previewUrl} downloadUrl={report.downloadUrl} date={report.date} onDelete={onDelete} id={report.id} />
            ))
            }
        </div>
    )
}

export default Reports;