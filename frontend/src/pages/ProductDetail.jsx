import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { productsApi } from '../api/products'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Package, Plus, Pencil, Trash2, Check, X,
  Calendar, User, Layers, Clock
} from 'lucide-react'
import styles from './ProductDetail.module.css'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [product, setProduct] = useState(null)
  const [items, setItems] = useState([])
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [loadingItems, setLoadingItems] = useState(true)

  const [editProductMode, setEditProductMode] = useState(false)
  const [editProductName, setEditProductName] = useState('')
  const [savingProduct, setSavingProduct] = useState(false)

  const [addItemQty, setAddItemQty] = useState('')
  const [addingItem, setAddingItem] = useState(false)

  const [editItem, setEditItem] = useState(null)
  const [editItemQty, setEditItemQty] = useState('')
  const [savingItem, setSavingItem] = useState(false)
  const [deletingItem, setDeletingItem] = useState(null)

  const fetchProduct = useCallback(async () => {
    try {
      const res = await productsApi.getById(id)
      setProduct(res.data.data)
      setEditProductName(res.data.data.productName)
    } catch {
      toast.error('Product not found')
      navigate('/products')
    } finally {
      setLoadingProduct(false)
    }
  }, [id, navigate])

  const fetchItems = useCallback(async () => {
    try {
      const res = await productsApi.getItems(id, { page: 0, size: 50 })
      setItems(res.data.data.content || [])
    } catch {
      // no-op
    } finally {
      setLoadingItems(false)
    }
  }, [id])

  useEffect(() => {
    fetchProduct()
    fetchItems()
  }, [fetchProduct, fetchItems])

  const handleSaveProduct = async () => {
    if (!editProductName.trim()) return toast.error('Name required')
    setSavingProduct(true)
    try {
      await productsApi.update(id, { productName: editProductName.trim() })
      toast.success('Product updated')
      setEditProductMode(false)
      fetchProduct()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setSavingProduct(false)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    const qty = parseInt(addItemQty)
    if (!qty || qty < 1) return toast.error('Quantity must be at least 1')
    setAddingItem(true)
    try {
      await productsApi.addItem(id, { quantity: qty })
      toast.success('Item added')
      setAddItemQty('')
      fetchItems()
      fetchProduct()
    } catch {
      toast.error('Failed to add item')
    } finally {
      setAddingItem(false)
    }
  }

  const handleSaveItem = async () => {
    const qty = parseInt(editItemQty)
    if (!qty || qty < 1) return toast.error('Invalid quantity')
    setSavingItem(true)
    try {
      await productsApi.updateItem(id, editItem.id, { quantity: qty })
      toast.success('Item updated')
      setEditItem(null)
      fetchItems()
    } catch {
      toast.error('Failed to update item')
    } finally {
      setSavingItem(false)
    }
  }

  const handleDeleteItem = async (itemId) => {
    setDeletingItem(itemId)
    try {
      await productsApi.deleteItem(id, itemId)
      toast.success('Item deleted')
      fetchItems()
      fetchProduct()
    } catch {
      toast.error('Failed to delete item')
    } finally {
      setDeletingItem(null)
    }
  }

  if (loadingProduct) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
    </div>
  )

  return (
    <div className={styles.page}>
      <Link to="/products" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className={styles.productCard}>
        <div className={styles.productTop}>
          <div className={styles.productIcon}>
            {product?.productName?.[0]?.toUpperCase()}
          </div>
          <div className={styles.productMain}>
            {editProductMode ? (
              <div className={styles.editRow}>
                <input
                  className={styles.editInput}
                  value={editProductName}
                  onChange={(e) => setEditProductName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveProduct()}
                  autoFocus
                />
                <button className={styles.saveBtn} onClick={handleSaveProduct} disabled={savingProduct}>
                  {savingProduct ? <span className={styles.spinSm} /> : <Check size={15} />}
                </button>
                <button className={styles.cancelIconBtn} onClick={() => setEditProductMode(false)}>
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className={styles.nameLine}>
                <h1 className={styles.productName}>{product?.productName}</h1>
                <button className={styles.editIconBtn} onClick={() => setEditProductMode(true)}>
                  <Pencil size={14} />
                </button>
              </div>
            )}
            <div className={styles.productMeta}>
              <span><User size={12} /> {product?.createdBy}</span>
              <span><Calendar size={12} /> {product?.createdOn ? new Date(product.createdOn).toLocaleString() : '-'}</span>
              <span><Layers size={12} /> {product?.itemCount} items</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.itemsSection}>
        <div className={styles.itemsHeader}>
          <h2 className={styles.itemsTitle}>Items</h2>
          <form className={styles.addItemForm} onSubmit={handleAddItem}>
            <input
              className={styles.qtyInput}
              type="number"
              min="1"
              placeholder="Quantity"
              value={addItemQty}
              onChange={(e) => setAddItemQty(e.target.value)}
            />
            <button className={styles.addItemBtn} type="submit" disabled={addingItem}>
              {addingItem ? <span className={styles.spinSm} /> : <Plus size={15} />}
              Add Item
            </button>
          </form>
        </div>

        {loadingItems ? (
          <div className={styles.itemsList}>
            {[1,2,3].map(i => <div key={i} className={styles.skeletonItem} />)}
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyItems}>
            <Layers size={36} strokeWidth={1} />
            <p>No items for this product yet</p>
          </div>
        ) : (
          <div className={styles.itemsList}>
            {items.map((item, idx) => (
              <div key={item.id} className={styles.itemRow}
                style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className={styles.itemId}>#{item.id}</div>
                <div className={styles.itemQtyWrap}>
                  {editItem?.id === item.id ? (
                    <input
                      className={styles.itemQtyInput}
                      type="number"
                      min="1"
                      value={editItemQty}
                      onChange={(e) => setEditItemQty(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveItem()}
                    />
                  ) : (
                    <div className={styles.itemQty}>
                      <Layers size={14} />
                      <span>{item.quantity} units</span>
                    </div>
                  )}
                </div>
                <div className={styles.itemActions}>
                  {editItem?.id === item.id ? (
                    <>
                      <button className={styles.saveSmBtn} onClick={handleSaveItem} disabled={savingItem}>
                        {savingItem ? <span className={styles.spinSm} /> : <Check size={13} />}
                      </button>
                      <button className={styles.cancelSmBtn} onClick={() => setEditItem(null)}>
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className={styles.editSmBtn} onClick={() => {
                        setEditItem(item)
                        setEditItemQty(String(item.quantity))
                      }}>
                        <Pencil size={13} />
                      </button>
                      <button
                        className={styles.deleteSmBtn}
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={deletingItem === item.id}
                      >
                        {deletingItem === item.id
                          ? <span className={styles.spinSm} />
                          : <Trash2 size={13} />
                        }
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
