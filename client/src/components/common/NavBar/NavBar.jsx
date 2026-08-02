import styles from './NavBar.module.css'
import LogoutButton from '../LogoutButton/LogoutButton'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'

function NavBar() {
    const { user } = useSelector((state) => state.auth)
    const location = useLocation();

    return (
        <nav className={styles.navbar}>
            <span className={styles.navLogo}>Physical Review</span>
            <ul className={styles.navLinks}>
                <li><Link to="/" className={location.pathname === '/' ? styles.active : ''}>Dashboard</Link></li>
                <li><Link to="/meals" className={location.pathname === '/meals' ? styles.active : ''}>Meals</Link></li>
                <li><Link to="/activities" className={location.pathname === '/activities' ? styles.active : ''}>Activities</Link></li>
                <li><Link to="/goals" className={location.pathname === '/goals' ? styles.active : ''}>Goals</Link></li>
                <li><Link to="/reports" className={location.pathname === '/reports' ? styles.active : ''}>Reports</Link></li>
            </ul>
            <div className={styles.navRight}>
                <Link to="/userInformation">
                    <div className={styles.navUser}>
                        <div className={styles.navAvatar}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        {user?.name}
                    </div>
                </Link>
                <LogoutButton />
            </div>
        </nav>
    )
}

export default NavBar