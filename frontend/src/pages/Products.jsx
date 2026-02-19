import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '../api/products'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight,
  Package, X, Check, ArrowUpDown, Layers
} from 'lucide-react'
import styles from './Products.module.css'

export default function Products() {
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [editTarget, setEditTarget] = useState(null)
  const [formName, setFormName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const { isAdmin } = useAuth()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productsApi.getAll({
        page,
        size: 10,
        search: search || undefined,
        sortBy: 'id',
        sortDir: 'desc',
      })
      const data = res.data.data
      setProducts(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    setSearch(searchInput)
  }

  const openCreate = () => {
    setFormName('')
    setEditTarget(null)
    setModal('create')
  }

  const openEdit = (product) => {
    setFormName(product.productName)
    setEditTarget(product)
    setModal('edit')
  }

  const closeModal = () => {
    setModal(null)
    setEditTarget(null)
    setFormName('')
  }

  const handleSave = async () => {
    if (!formName.trim()) return toast.error('Product name required')
    setSaving(true)
    try {
      if (modal === 'create') {
        await productsApi.create({ productName: formName.trim() })
        toast.success('Product created')
      } else {
        await productsApi.update(editTarget.id, { productName: formName.trim() })
        toast.success('Product updated')
      }
      closeModal()
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    setDeleting(id)
    try {
      await productsApi.delete(id)
      toast.success('Product deleted')
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>{totalElements} total products</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate}>
          <Plus size={16} /> New Product
        </button>
      </div>

      <div className={styles.toolbar}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button type="button" className={styles.clearBtn} onClick={() => {
              setSearchInput('')
              setSearch('')
              setPage(0)
            }}>
              <X size={14} />
            </button>
          )}
        </form>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Created By</th>
              <th>Items</th>
              <th>Created On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  <td colSpan="6"><div className={styles.skeletonLine} /></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.emptyCell}>
                  <Package size={36} strokeWidth={1} />
                  <p>No products found</p>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className={styles.row}>
                  <td className={styles.idCell}>#{p.id}</td>
                  <td>
                    <Link to={`/products/${p.id}`} className={styles.productLink}>
                      <div className={styles.productIconSm}>{p.productName[0].toUpperCase()}</div>
                      {p.productName}
                    </Link>
                  </td>
                  <td className={styles.dim}>{p.createdBy}</td>
                  <td>
                    <span className={styles.itemBadge}>
                      <Layers size={12} /> {p.itemCount}
                    </span>
                  </td>
                  <td className={styles.dim}>
                    {p.createdOn ? new Date(p.createdOn).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(p)} title="Edit">
                        <Pencil size={14} />
                      </button>
                      {isAdmin && (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          title="Delete"
                        >
                          {deleting === p.id
                            ? <span className={styles.spinSm} />
                            : <Trash2 size={14} />
                          }
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.pageInfo}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{modal === 'create' ? 'New Product' : 'Edit Product'}</h3>
              <button className={styles.closeBtn} onClick={closeModal}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.modalLabel}>Product Name</label>
              <input
                className={styles.modalInput}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter product name"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? <span className={styles.spinSm} /> : <Check size={15} />}
                {modal === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
