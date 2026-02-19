import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '../api/products'
import { useAuth } from '../context/AuthContext'
import { Package, Layers, TrendingUp, ArrowRight, Clock } from 'lucide-react'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalItems: 0, recentProducts: [] })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await productsApi.getAll({ page: 0, size: 5, sortBy: 'id', sortDir: 'desc' })
        const page = res.data.data
        const products = page.content || []
        const totalItems = products.reduce((sum, p) => sum + (p.itemCount || 0), 0)
        setStats({
          totalProducts: page.totalElements || 0,
          totalItems,
          recentProducts: products.slice(0, 4),
        })
      } catch {
        // no-op
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.greeting}>{greeting()},</p>
          <h1 className={styles.name}>{user?.fullName}</h1>
        </div>
        <Link to="/products" className={styles.ctaBtn}>
          Manage Products <ArrowRight size={16} />
        </Link>
      </header>

      <section className={styles.statsGrid}>
        <StatCard
          icon={<Package size={22} />}
          label="Total Products"
          value={loading ? '...' : stats.totalProducts}
          color="accent"
        />
        <StatCard
          icon={<Layers size={22} />}
          label="Total Items"
          value={loading ? '...' : stats.totalItems}
          color="green"
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="Recent Activity"
          value={loading ? '...' : stats.recentProducts.length}
          color="amber"
          sub="last 5 products"
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Products</h2>
          <Link to="/products" className={styles.viewAll}>View all</Link>
        </div>

        {loading ? (
          <div className={styles.skeleton}>
            {[1,2,3].map(i => <div key={i} className={styles.skeletonRow} />)}
          </div>
        ) : stats.recentProducts.length === 0 ? (
          <div className={styles.empty}>
            <Package size={40} strokeWidth={1} />
            <p>No products yet. Create your first one!</p>
            <Link to="/products" className={styles.emptyBtn}>Create Product</Link>
          </div>
        ) : (
          <div className={styles.productList}>
            {stats.recentProducts.map((product, i) => (
              <Link key={product.id} to={`/products/${product.id}`} className={styles.productRow}
                style={{ animationDelay: `${i * 0.07}s` }}>
                <div className={styles.productIcon}>
                  {product.productName[0].toUpperCase()}
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.productName}>{product.productName}</div>
                  <div className={styles.productMeta}>
                    <Clock size={11} />
                    <span>by {product.createdBy}</span>
                    <span className={styles.dot} />
                    <span>{product.itemCount} items</span>
                  </div>
                </div>
                <ArrowRight size={14} className={styles.rowArrow} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className={`${styles.statCard} ${styles[`stat-${color}`]}`}>
      <div className={`${styles.statIcon} ${styles[`icon-${color}`]}`}>{icon}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  )
}
