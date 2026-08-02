// components/layouts/PageLayout/PageLayout.jsx
import NavBar from '../../common/NavBar/NavBar'
import styles from './PageLayout.module.css'

function PageLayout({ title, children }) {
    return (
        <div className={styles.page}>
            <NavBar />
            <div className={styles.content}>
                {title && <p className={styles.pageTitle}>{title}</p>}
                {children}
            </div>
        </div>
    )
}

export default PageLayout