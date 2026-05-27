import React, { useState, useEffect } from 'react'
import {
  collection, onSnapshot, query, orderBy,
  doc, updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { getDisabilityLabel } from '../utils/abilityEngine'

export default function AdminPanel() {
  const { currentUser } = useAuth()
  const { t } = useLanguage()
  const [users, setUsers] = useState([])
  const [gigs, setGigs] = useState([])
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const unsubUsers = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      (snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      }
    )
    const unsubGigs = onSnapshot(
      query(collection(db, 'gigs'), orderBy('createdAt', 'desc')),
      (snap) => setGigs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )
    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), orderBy('createdAt', 'desc')),
      (snap) => setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )
    return () => { unsubUsers(); unsubGigs(); unsubProducts() }
  }, [])

  async function updateGigStatus(gigId, status) {
    await updateDoc(doc(db, 'gigs', gigId), { status })
  }

  async function promoteToAdmin(userId) {
    if (!window.confirm('Promote this user to admin?')) return
    await updateDoc(doc(db, 'users', userId), { role: 'admin' })
  }

  async function updateEarnings(userId, currentEarnings) {
    const input = window.prompt('Enter new total earnings (RWF):', currentEarnings)
    if (input === null) return
    const amount = Number(input)
    if (isNaN(amount) || amount < 0) { alert('Invalid amount'); return }
    await updateDoc(doc(db, 'users', userId), { totalEarnings: amount })
  }

  const filteredUsers = users.filter((u) =>
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Summary stats
  const totalUsers = users.filter((u) => u.role !== 'admin').length
  const totalEarnings = users.reduce((sum, u) => sum + (u.totalEarnings || 0), 0)
  const totalCerts = users.reduce((sum, u) => sum + (u.certificates?.length || 0), 0)
  const openGigs = gigs.filter((g) => g.status === 'open').length

  return (
    <div className="page">
      <div className="admin-header">
        <div>
          <h2>{t('admin_title')}</h2>
          <p className="text-muted">{t('admin_subtitle')}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div><div className="stat-value">{totalUsers}</div><div className="stat-label">{t('admin_total_users')}</div></div></div>
        <div className="stat-card"><div><div className="stat-value">{totalCerts}</div><div className="stat-label">{t('admin_certs_issued')}</div></div></div>
        <div className="stat-card"><div><div className="stat-value">{openGigs}</div><div className="stat-label">{t('admin_open_gigs')}</div></div></div>
        <div className="stat-card"><div><div className="stat-value">RWF {totalEarnings.toLocaleString()}</div><div className="stat-label">{t('admin_total_earnings')}</div></div></div>
      </div>

      <div className="market-tabs">
        <button className={`market-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          {t('admin_users_tab')} ({users.length})
        </button>
        <button className={`market-tab ${activeTab === 'gigs' ? 'active' : ''}`} onClick={() => setActiveTab('gigs')}>
          {t('admin_gigs_tab')} ({gigs.length})
        </button>
        <button className={`market-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          {t('admin_products_tab')} ({products.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          <div className="search-bar">
            <input type="text" placeholder={t('admin_search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          {loading && <p className="text-muted">{t('admin_loading')}</p>}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin_name')}</th><th>{t('admin_email')}</th><th>{t('admin_disability')}</th>
                  <th>{t('admin_tracks')}</th><th>{t('admin_modules_done')}</th><th>{t('admin_certs')}</th>
                  <th>{t('admin_earnings')}</th><th>{t('admin_role')}</th><th>{t('admin_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} onClick={() => setSelectedUser(user)} className="clickable-row">
                    <td><strong>{user.fullName}</strong><br /><small>{user.location}</small></td>
                    <td>{user.email}</td>
                    <td><small>{getDisabilityLabel(user.disabilityType)}</small></td>
                    <td>{(user.assignedTracks || []).map((tr) => (<span key={tr} className="badge badge-outline" style={{ marginRight: 4 }}>{tr}</span>))}</td>
                    <td>{user.completedModules?.length || 0}</td>
                    <td>{user.certificates?.length || 0}</td>
                    <td>RWF {(user.totalEarnings || 0).toLocaleString()}</td>
                    <td><span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-outline'}`}>{user.role || 'user'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); updateEarnings(user.id, user.totalEarnings || 0) }}>{t('admin_update_earnings')}</button>
                        {user.role !== 'admin' && user.id !== currentUser.uid && (
                          <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); promoteToAdmin(user.id) }}>{t('admin_make_admin')}</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'gigs' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin_title_col')}</th><th>{t('market_category')}</th><th>{t('admin_budget')}</th>
                <th>{t('admin_posted_by')}</th><th>{t('admin_applicants')}</th><th>{t('admin_status')}</th><th>{t('admin_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {gigs.map((gig) => (
                <tr key={gig.id}>
                  <td><strong>{gig.title}</strong></td>
                  <td>{gig.category}</td>
                  <td>RWF {gig.budget?.toLocaleString()}</td>
                  <td>{gig.postedByName}</td>
                  <td>{gig.applicants?.length || 0}</td>
                  <td><span className={`status-badge status-${gig.status}`}>{gig.status}</span></td>
                  <td>
                    <select value={gig.status} onChange={(e) => updateGigStatus(gig.id, e.target.value)} className="status-select">
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products tab */}
      {activeTab === 'products' && (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="product-image" />
              ) : (
                <div className="product-image-placeholder">No image</div>
              )}
              <div className="product-info">
                <span className={`category-badge cat-${product.category?.toLowerCase()}`}>{product.category}</span>
                <h4>{product.name}</h4>
                <p>{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">RWF {product.price?.toLocaleString()}</span>
                  <span className="product-seller">by {product.sellerName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedUser.fullName}</h3>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div><strong>Email:</strong> {selectedUser.email}</div>
                <div><strong>Phone:</strong> {selectedUser.phone || '—'}</div>
                <div><strong>Location:</strong> {selectedUser.location || '—'}</div>
                <div><strong>Disability:</strong> {getDisabilityLabel(selectedUser.disabilityType)}</div>
                <div><strong>Tracks:</strong> {(selectedUser.assignedTracks || []).join(', ')}</div>
                <div><strong>Modules Completed:</strong> {selectedUser.completedModules?.length || 0}</div>
                <div><strong>Certificates:</strong> {selectedUser.certificates?.length || 0}</div>
                <div><strong>Total Earnings:</strong> RWF {(selectedUser.totalEarnings || 0).toLocaleString()}</div>
              </div>
              {selectedUser.certificates?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Certificates:</strong>
                  <ul style={{ marginTop: '0.5rem' }}>
                    {selectedUser.certificates.map((c, i) => (
                      <li key={i}>{c.moduleName} — {c.score}%</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
