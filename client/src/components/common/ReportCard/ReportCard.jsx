import styles from './ReportCard.module.css'

function ReportCard({ id, previewUrl, downloadUrl, date, onDelete }) {
    const formattedDate = new Date(date).toLocaleDateString('en-US')
    return (
        <div className={styles.reportCard}>
            <div className={styles.pdfPreview}>
                {previewUrl ? (
                    <img src={previewUrl} alt="Report preview" />
                ) : (
                    <div className={styles.previewPlaceholder}>No preview available</div>
                )}
            </div>
            <div className={styles.cardFooter}>
                <p className={styles.cardLabel}>
                    Date:<span>{formattedDate}</span> Report
                </p>
                <a href={downloadUrl} download className={styles.cardAction}>
                    ↓
                </a>
                <button type="button" onClick={() => onDelete(id)}>
                    🗑
                </button>
            </div>
        </div>
    )
}
export default ReportCard;