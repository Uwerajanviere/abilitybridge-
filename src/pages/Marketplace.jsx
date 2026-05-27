import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, doc, updateDoc, arrayUnion,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

const CATEGORIES = ['All', 'Digital', 'Voice', 'Handcraft', 'Cognitive', 'Other']

export default function Marketplace() {
  const { currentUser, userProfile } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()
  const defaultTab = new URLSearchParams(location.search).get('tab') === 'sell' ? 'products' : 'gigs'

  const [tab, setTab] = useState(defaultTab)
  const [gigs, setGigs] = useState([])
  const [products, setProducts] = useState([])
  const [filterCat, setFilterCat] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showGigForm, setShowGigForm] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [gigForm, setGigForm] = useState({ title: '', description: '', budget: '', category: 'Digital', deadline: '' })
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: 'Handcraft', imageUrl: '' })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'gigs'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setGigs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      console.error('Gigs load error:', err)
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    }, (err) => {
      console.error('Products load error:', err)
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
      setSuccessMsg(t('market_gig_posted'))
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
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
      setSuccessMsg(t('market_product_listed'))
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  async function applyToGig(gigId) {
    try {
      await updateDoc(doc(db, 'gigs', gigId), { applicants: arrayUnion(currentUser.uid) })
      setSuccessMsg(t('market_application_sent'))
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error('Apply error:', err)
      setSuccessMsg('Could not submit application. Please try again.')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  const filteredGigs = filterCat === 'All' ? gigs : gigs.filter((g) => g.category === filterCat)
  const filteredProducts = filterCat === 'All' ? products : products.filter((p) => p.category === filterCat)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>{t('market_title')}</h2>
          <p className="text-muted">{t('market_subtitle')}</p>
        </div>
        <div className="page-header-actions">
          {tab === 'gigs' && (
            <button className="btn btn-primary" onClick={() => setShowGigForm(!showGigForm)}>
              {t('market_post_gig')}
            </button>
          )}
          {tab === 'products' && (
            <button className="btn btn-primary" onClick={() => setShowProductForm(!showProductForm)}>
              {t('market_list_product')}
            </button>
          )}
        </div>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="market-tabs">
        <button className={`market-tab ${tab === 'gigs' ? 'active' : ''}`} onClick={() => setTab('gigs')}>
          {t('market_gig_tasks')}
        </button>
        <button className={`market-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
          {t('market_product_store')}
        </button>
      </div>

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

      {showGigForm && (
        <div className="form-card">
          <h4>{t('market_post_gig_title')}</h4>
          <form onSubmit={postGig}>
            <div className="form-row">
              <div className="form-group">
                <label>{t('market_task_title')} *</label>
                <input type="text" value={gigForm.title}
                  onChange={(e) => setGigForm({ ...gigForm, title: e.target.value })}
                  placeholder={t('market_task_placeholder')} required />
              </div>
              <div className="form-group">
                <label>{t('market_category')} *</label>
                <select value={gigForm.category} onChange={(e) => setGigForm({ ...gigForm, category: e.target.value })}>
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>{t('market_description')} *</label>
              <textarea value={gigForm.description}
                onChange={(e) => setGigForm({ ...gigForm, description: e.target.value })}
                placeholder={t('market_desc_placeholder')} rows={3} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('market_budget')} *</label>
                <input type="number" value={gigForm.budget}
                  onChange={(e) => setGigForm({ ...gigForm, budget: e.target.value })}
                  placeholder={t('market_budget_placeholder')} min="0" required />
              </div>
              <div className="form-group">
                <label>{t('market_deadline')}</label>
                <input type="date" value={gigForm.deadline}
                  onChange={(e) => setGigForm({ ...gigForm, deadline: e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowGigForm(false)}>{t('market_cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? t('market_posting') : t('market_post_btn')}
              </button>
            </div>
          </form>
        </div>
      )}

      {showProductForm && (
        <div className="form-card">
          <h4>{t('market_list_title')}</h4>
          <form onSubmit={listProduct}>
            <div className="form-row">
              <div className="form-group">
                <label>{t('market_product_name')} *</label>
                <input type="text" value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder={t('market_product_placeholder')} required />
              </div>
              <div className="form-group">
                <label>{t('market_category')} *</label>
                <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>{t('market_description')} *</label>
              <textarea value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder={t('market_desc_product_placeholder')} rows={3} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('market_price')} *</label>
                <input type="number" value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder={t('market_price_placeholder')} min="0" required />
              </div>
              <div className="form-group">
                <label>{t('market_image_url')}</label>
                <input type="url" value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://..." />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowProductForm(false)}>{t('market_cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? t('market_listing') : t('market_list_btn')}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'gigs' && (
        <div className="cards-grid">
          {loading && <p className="text-muted">{t('market_loading')}</p>}
          {!loading && filteredGigs.length === 0 && (
            <div className="empty-state"><p>{t('market_no_gigs')}</p></div>
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
                    <span>RWF {gig.budget?.toLocaleString()}</span>
                    {gig.deadline && <span>{gig.deadline}</span>}
                    <span>{gig.postedByName}</span>
                    <span>{gig.applicants?.length || 0} {t('market_applicants')}</span>
                  </div>
                  {gig.postedBy !== currentUser.uid && gig.status === 'open' && (
                    <button
                      className={`btn btn-sm ${alreadyApplied ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => !alreadyApplied && applyToGig(gig.id)}
                      disabled={alreadyApplied}
                    >
                      {alreadyApplied ? `✓ ${t('market_applied')}` : t('market_apply')}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'products' && (
        <div className="products-grid">
          {filteredProducts.length === 0 && (
            <div className="empty-state"><p>{t('market_no_products')}</p></div>
          )}
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} className="product-image" />
                : <div className="product-image-placeholder">No image</div>
              }
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
                    {t('market_contact_seller')}
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
