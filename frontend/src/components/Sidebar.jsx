import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Package, LogOut, Shield, User } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './Sidebar.module.css'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>Z</div>
        <div>
          <div className={styles.brandName}>Zest India</div>
          <div className={styles.brandSub}>Products API</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.fullName}</div>
            <div className={styles.userRole}>
              {isAdmin ? (
                <><Shield size={12} /> Admin</>
              ) : (
                <><User size={12} /> User</>
              )}
            </div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
