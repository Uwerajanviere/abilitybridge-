import React, { useState, useEffect } from 'react'
import {
  collection, onSnapshot, query, orderBy,
  doc, updateDoc, getDocs,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { getDisabilityLabel, getTrackDetails } from '../utils/abilityEngine'
import { TRAINING_MODULES } from '../utils/trainingData'

export default function AdminPanel() {
  const { currentUser } = useAuth()
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
          <h2>Admin Panel</h2>
          <p className="text-muted">NGO / Coordinator Dashboard</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <div className="stat-value">{totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div>
            <div className="stat-value">{totalCerts}</div>
            <div className="stat-label">Certificates Issued</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div>
            <div className="stat-value">{openGigs}</div>
            <div className="stat-label">Open Gigs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div>
            <div className="stat-value">RWF {totalEarnings.toLocaleString()}</div>
            <div className="stat-label">Total Earnings Tracked</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="market-tabs">
        <button className={`market-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          👥 Users ({users.length})
        </button>
        <button className={`market-tab ${activeTab === 'gigs' ? 'active' : ''}`} onClick={() => setActiveTab('gigs')}>
          💼 Gigs ({gigs.length})
        </button>
        <button className={`market-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          🛍️ Products ({products.length})
        </button>
      </div>

      {/* Users tab */}
      {activeTab === 'users' && (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {loading && <p className="text-muted">Loading users...</p>}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Disability</th>
                  <th>Tracks</th>
                  <th>Modules Done</th>
                  <th>Certs</th>
                  <th>Earnings</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} onClick={() => setSelectedUser(user)} className="clickable-row">
                    <td><strong>{user.fullName}</strong><br /><small>{user.location}</small></td>
                    <td>{user.email}</td>
                    <td><small>{getDisabilityLabel(user.disabilityType)}</small></td>
                    <td>
                      {(user.assignedTracks || []).map((t) => (
                        <span key={t} className="badge badge-outline" style={{ marginRight: 4 }}>{t}</span>
                      ))}
                    </td>
                    <td>{user.completedModules?.length || 0}</td>
                    <td>{user.certificates?.length || 0}</td>
                    <td>RWF {(user.totalEarnings || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-outline'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={(e) => { e.stopPropagation(); updateEarnings(user.id, user.totalEarnings || 0) }}
                        >
                          💰 Earnings
                        </button>
                        {user.role !== 'admin' && user.id !== currentUser.uid && (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={(e) => { e.stopPropagation(); promoteToAdmin(user.id) }}
                          >
                            ⬆ Admin
                          </button>
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

      {/* Gigs tab */}
      {activeTab === 'gigs' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Posted By</th>
                <th>Applicants</th>
                <th>Status</th>
                <th>Actions</th>
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
                  <td>
                    <span className={`status-badge status-${gig.status}`}>{gig.status}</span>
                  </td>
                  <td>
                    <select
                      value={gig.status}
                      onChange={(e) => updateGigStatus(gig.id, e.target.value)}
                      className="status-select"
                    >
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
                      <li key={i}>🎓 {c.moduleName} — {c.score}%</li>
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
