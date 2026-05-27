import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, doc, updateDoc, arrayUnion,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { TRACKS } from '../utils/abilityEngine'

const CATEGORIES = ['All', 'Digital', 'Voice', 'Handcraft', 'Cognitive', 'Other']

export default function Marketplace() {
  const { currentUser, userProfile } = useAuth()
  const location = useLocation()
  const defaultTab = new URLSearchParams(location.search).get('tab') === 'sell' ? 'sell' : 'gigs'

  const [tab, setTab] = useState(defaultTab)
  const [gigs, setGigs] = useState([])
  const [products, setProducts] = useState([])
  const [filterCat, setFilterCat] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showGigForm, setShowGigForm] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)

  // Gig form state
  const [gigForm, setGigForm] = useState({ title: '', description: '', budget: '', category: 'Digital', deadline: '' })
  // Product form state
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: 'Handcraft', imageUrl: '' })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Load gigs
  useEffect(() => {
    const q = query(collection(db, 'gigs'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setGigs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  // Load products
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  async function postGig(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'gigs'), {
        ...gigForm,
        budget: Number(gigForm.budget),
        postedBy: currentUser.uid,
        postedByName: userProfile?.fullName || 'Anonymous',
        status: 'open',
        applicants: [],
        createdAt: serverTimestamp(),
      })
      setGigForm({ title: '', description: '', budget: '', category: 'Digital', deadline: '' })
      setShowGigForm(false)
      setSuccessMsg('Gig posted successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  async function listProduct(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'products'), {
        ...productForm,
        price: Number(productForm.price),
        sellerId: currentUser.uid,
        sellerName: userProfile?.fullName || 'Anonymous',
        status: 'available',
        createdAt: serverTimestamp(),
      })
      setProductForm({ name: '', description: '', price: '', category: 'Handcraft', imageUrl: '' })
      setShowProductForm(false)
      setSuccessMsg('Product listed successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  async function applyToGig(gigId) {
    try {
      await updateDoc(doc(db, 'gigs', gigId), {
        applicants: arrayUnion(currentUser.uid),
      })
      setSuccessMsg('Application submitted!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredGigs = filterCat === 'All' ? gigs : gigs.filter((g) => g.category === filterCat)
  const filteredProducts = filterCat === 'All' ? products : products.filter((p) => p.category === filterCat)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Marketplace</h2>
          <p className="text-muted">Find gig work or sell your handmade products</p>
        </div>
        <div className="page-header-actions">
          {tab === 'gigs' && (
            <button className="btn btn-primary" onClick={() => setShowGigForm(!showGigForm)}>
              + Post a Gig
            </button>
          )}
          {tab === 'products' && (
            <button className="btn btn-primary" onClick={() => setShowProductForm(!showProductForm)}>
              + List a Product
            </button>
          )}
        </div>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Tabs */}
      <div className="market-tabs">
        <button className={`market-tab ${tab === 'gigs' ? 'active' : ''}`} onClick={() => setTab('gigs')}>
          💼 Gig Tasks
        </button>
        <button className={`market-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
          🛍️ Product Store
        </button>
        {tab === 'sell' && (
          <button className={`market-tab ${tab === 'sell' ? 'active' : ''}`} onClick={() => setTab('sell')}>
            🏪 Sell
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="category-filter">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${filterCat === cat ? 'active' : ''}`}
            onClick={() => setFilterCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gig post form */}
      {showGigForm && (
        <div className="form-card">
          <h4>Post a New Gig Task</h4>
          <form onSubmit={postGig}>
            <div className="form-row">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={gigForm.title}
                  onChange={(e) => setGigForm({ ...gigForm, title: e.target.value })}
                  placeholder="e.g. Data entry for 500 records"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={gigForm.category} onChange={(e) => setGigForm({ ...gigForm, category: e.target.value })}>
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={gigForm.description}
                onChange={(e) => setGigForm({ ...gigForm, description: e.target.value })}
                placeholder="Describe the task in detail..."
                rows={3}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Budget (RWF) *</label>
                <input
                  type="number"
                  value={gigForm.budget}
                  onChange={(e) => setGigForm({ ...gigForm, budget: e.target.value })}
                  placeholder="e.g. 15000"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={gigForm.deadline}
                  onChange={(e) => setGigForm({ ...gigForm, deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowGigForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Gig'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product listing form */}
      {showProductForm && (
        <div className="form-card">
          <h4>List a Product for Sale</h4>
          <form onSubmit={listProduct}>
            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Handwoven basket"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Describe your product..."
                rows={3}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (RWF) *</label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="e.g. 5000"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Image URL (optional)</label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowProductForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Listing...' : 'List Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gigs list */}
      {tab === 'gigs' && (
        <div className="cards-grid">
          {loading && <p className="text-muted">Loading gigs...</p>}
          {!loading && filteredGigs.length === 0 && (
            <div className="empty-state">
              <span>💼</span>
              <p>No gigs posted yet. Be the first to post one!</p>
            </div>
          )}
          {filteredGigs.map((gig) => {
            const alreadyApplied = gig.applicants?.includes(currentUser.uid)
            return (
              <div key={gig.id} className="gig-card">
                <div className="gig-header">
                  <span className={`category-badge cat-${gig.category?.toLowerCase()}`}>{gig.category}</span>
                  <span className={`status-badge status-${gig.status}`}>{gig.status}</span>
                </div>
                <h4>{gig.title}</h4>
                <p className="gig-description">{gig.description}</p>
                <div className="gig-footer">
                  <div className="gig-meta">
                    <span>💰 RWF {gig.budget?.toLocaleString()}</span>
                    {gig.deadline && <span>📅 {gig.deadline}</span>}
                    <span>👤 {gig.postedByName}</span>
                    <span>👥 {gig.applicants?.length || 0} applicants</span>
                  </div>
                  {gig.postedBy !== currentUser.uid && gig.status === 'open' && (
                    <button
                      className={`btn btn-sm ${alreadyApplied ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => !alreadyApplied && applyToGig(gig.id)}
                      disabled={alreadyApplied}
                    >
                      {alreadyApplied ? '✓ Applied' : 'Apply Now'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Products list */}
      {tab === 'products' && (
        <div className="products-grid">
          {filteredProducts.length === 0 && (
            <div className="empty-state">
              <span>🛍️</span>
              <p>No products listed yet. List your first product!</p>
            </div>
          )}
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="product-image" />
              ) : (
                <div className="product-image-placeholder">🎨</div>
              )}
              <div className="product-info">
                <span className={`category-badge cat-${product.category?.toLowerCase()}`}>{product.category}</span>
                <h4>{product.name}</h4>
                <p>{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">RWF {product.price?.toLocaleString()}</span>
                  <span className="product-seller">by {product.sellerName}</span>
                </div>
                {product.sellerId !== currentUser.uid && (
                  <button className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem', width: '100%' }}>
                    Contact Seller
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
