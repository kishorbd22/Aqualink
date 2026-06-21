'use client';

import { useState, useEffect } from 'react';
import { listings } from '@/lib/api';
import ListingCard from '@/components/ListingCard';

export default function ListingsPage() {
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'available',
    species: '',
    minPrice: '',
    maxPrice: '',
  });

  const fetchListings = async (appliedFilters = {}) => {
    setLoading(true);
    setError('');
    try {
      // Remove empty filter values
      const clean = {};
      Object.entries(appliedFilters).forEach(([k, v]) => {
        if (v) clean[k] = v;
      });
      const result = await listings.getAll(clean);
      setAllListings(result.data.listings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings({ status: 'available' });
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchListings(filters);
  };

  const handleClearFilters = () => {
    const cleared = { status: 'available', species: '', minPrice: '', maxPrice: '' };
    setFilters(cleared);
    fetchListings({ status: 'available' });
  };

  return (
    <div className="listings-page">
      <div className="container">
        <div className="listings-header">
          <div>
            <h1 className="section-title">Fish Listings</h1>
            <p className="section-subtitle">
              Browse fresh catch from local fishers
            </p>
          </div>
        </div>

        {/* Filters */}
        <form onSubmit={handleApplyFilters} className="listings-filters">
          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Species</label>
            <input
              name="species"
              type="text"
              placeholder="e.g. Tuna"
              value={filters.species}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Min Price (₹)</label>
            <input
              name="minPrice"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Max Price (₹)</label>
            <input
              name="maxPrice"
              type="number"
              min="0"
              step="1"
              placeholder="1000"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 'auto' }}>
            Apply
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ marginTop: 'auto', background: 'var(--gray-200)', color: 'var(--gray-700)' }}
            onClick={handleClearFilters}
          >
            Clear
          </button>
        </form>

        {/* Listings Grid */}
        <div style={{ marginTop: '2rem' }}>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p style={{ marginTop: '1rem' }}>Loading listings...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="empty-icon">⚠️</div>
              <h3>Failed to load listings</h3>
              <p>{error}</p>
            </div>
          ) : allListings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🐟</div>
              <h3>No listings found</h3>
              <p>Try adjusting your filters or check back later for new catches.</p>
            </div>
          ) : (
            <>
              <p style={{ marginBottom: '1rem', color: 'var(--gray-500)' }}>
                Showing {allListings.length} listing{allListings.length !== 1 ? 's' : ''}
              </p>
              <div className="listings-grid">
                {allListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}