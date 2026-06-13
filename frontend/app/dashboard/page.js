'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredUser, listings } from '@/lib/api';
import ListingCard from '@/components/ListingCard';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    species: '',
    weight: '',
    pricePerKg: '',
    freshnessTimestamp: '',
    photoUrl: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.push('/login');
      return;
    }
    setUser(stored);
    fetchMyListings(stored.id);
  }, []);

  const fetchMyListings = async (fisherId) => {
    try {
      const result = await listings.getAll({ fisherId });
      setMyListings(result.data.listings || []);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const body = {
        species: form.species,
        weight: parseFloat(form.weight),
        pricePerKg: parseFloat(form.pricePerKg),
        freshnessTimestamp: new Date(form.freshnessTimestamp).toISOString(),
        photoUrl: form.photoUrl || undefined,
      };

      await listings.create(body);
      setForm({ species: '', weight: '', pricePerKg: '', freshnessTimestamp: '', photoUrl: '' });
      setShowForm(false);
      fetchMyListings(user.id);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await listings.delete(id);
      setMyListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (!user) return null;

  const availableCount = myListings.filter((l) => l.status === 'available').length;
  const totalWeight = myListings.reduce((sum, l) => sum + parseFloat(l.weight || 0), 0);

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="section-title">Dashboard</h1>
          <p className="dashboard-welcome">Welcome back, {user.name}!</p>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Listings</h3>
            <div className="stat-value">{myListings.length}</div>
          </div>
          <div className="stat-card">
            <h3>Available</h3>
            <div className="stat-value">{availableCount}</div>
          </div>
          <div className="stat-card">
            <h3>Total Weight</h3>
            <div className="stat-value">{totalWeight.toFixed(1)} kg</div>
          </div>
          <div className="stat-card">
            <h3>Role</h3>
            <div className="stat-value" style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>
              {user.role}
            </div>
          </div>
        </div>

        {/* Create listing (fishers only) */}
        {user.role === 'fisher' && (
          <div className="dashboard-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>My Listings</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel' : '+ New Listing'}
              </button>
            </div>

            {showForm && (
              <div className="create-listing-form" style={{ marginTop: '1rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Create New Listing</h3>
                {formError && <div className="auth-error">{formError}</div>}
                <form onSubmit={handleCreateListing}>
                  <div className="form-group">
                    <label className="form-label">Species *</label>
                    <input
                      name="species"
                      className="form-input"
                      placeholder="e.g. Tuna, Salmon"
                      value={form.species}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Weight (kg) *</label>
                      <input
                        name="weight"
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-input"
                        placeholder="5.00"
                        value={form.weight}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price per kg (₹) *</label>
                      <input
                        name="pricePerKg"
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-input"
                        placeholder="250.00"
                        value={form.pricePerKg}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Freshness Timestamp *</label>
                    <input
                      name="freshnessTimestamp"
                      type="datetime-local"
                      className="form-input"
                      value={form.freshnessTimestamp}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Photo URL (optional)</label>
                    <input
                      name="photoUrl"
                      type="url"
                      className="form-input"
                      placeholder="https://example.com/photo.jpg"
                      value={form.photoUrl}
                      onChange={handleChange}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Listing'}
                  </button>
                </form>
              </div>
            )}

            {/* My listings */}
            <div style={{ marginTop: '1.5rem' }}>
              {loading ? (
                <div className="loading"><div className="spinner"></div></div>
              ) : myListings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No listings yet</h3>
                  <p>Create your first fish listing to start selling.</p>
                </div>
              ) : (
                <div className="listings-grid">
                  {myListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Non-fisher view */}
        {user.role !== 'fisher' && (
          <div className="dashboard-section">
            <h2>Quick Links</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/listings" className="btn btn-primary">
                Browse All Listings
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
</write_to_file>