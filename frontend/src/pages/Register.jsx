import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, Lock, User, Mail, BadgeCheck } from 'lucide-react'
import styles from './Auth.module.css'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'fullName', label: 'Full Name', icon: BadgeCheck, placeholder: 'John Doe', type: 'text' },
    { name: 'username', label: 'Username', icon: User, placeholder: 'john_doe', type: 'text' },
    { name: 'email', label: 'Email', icon: Mail, placeholder: 'john@example.com', type: 'email' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.logo}>Z</div>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Join Zest Products platform</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {fields.map(({ name, label, icon: Icon, placeholder, type }) => (
            <div className={styles.field} key={name}>
              <label className={styles.label}>{label}</label>
              <div className={styles.inputWrap}>
                <Icon size={16} className={styles.inputIcon} />
                <input
                  className={styles.input}
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                />
              </div>
            </div>
          ))}

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                className={styles.input}
                name="password"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
