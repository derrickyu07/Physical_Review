import styles from './LogoutButton.module.css'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../features/auth/authSlice'

function LogoutButton() {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }
    return (
        <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
        </button>
    )
}
export default LogoutButton;