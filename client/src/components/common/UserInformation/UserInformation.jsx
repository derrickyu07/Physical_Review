import styles from './UserInformation.module.css'
import UserInformationForm from '../../forms/UserInformationForm/UserInformationForm';
function UserInformation({ user, bodyMetric, isLoading, onSubmit, isEditing, setIsEditing }) {


    return (
        <div className={styles.userInfoContainer}>
            {!isEditing && (
                <div className={styles.profileInfo}>
                    <p><strong>Name: </strong> {user.name}</p>
                    <p><strong>Email: </strong> {user.email}</p>
                    <p><strong>Height(inches): </strong> {bodyMetric.height}</p>
                    <p><strong>Weight(lbs): </strong> {bodyMetric.weight}</p>
                    <p><strong>Gender: </strong> {bodyMetric.gender}</p>
                    <p><strong>Age: </strong>{bodyMetric.age}</p>
                    <p><strong>BMI: </strong> {bodyMetric.bmi}</p>
                    <p><strong>Activity Level: </strong> {bodyMetric.activityLevel}</p>
                    <button className={styles.btnEdit} onClick={() => setIsEditing(true)}>Edit</button>
                </div>
            )
            }
            {isEditing && (
                <UserInformationForm
                    user={user}
                    bodyMetric={bodyMetric}
                    setIsEditing={setIsEditing}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                />
            )}
        </div>
    )
}
export default UserInformation;