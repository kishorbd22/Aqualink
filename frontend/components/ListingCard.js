'use client';

export default function ListingCard({ listing, onDelete }) {
  const {
    id,
    species,
    weight,
    pricePerKg,
    freshnessTimestamp,
    status,
    photoUrl,
    fisher,
    createdAt,
  } = listing;

  const formattedDate = freshnessTimestamp
    ? new Date(freshnessTimestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  const formattedPrice = `₹${parseFloat(pricePerKg).toFixed(2)}/kg`;
  const formattedWeight = `${parseFloat(weight).toFixed(2)} kg`;
  const totalPrice = `₹${(parseFloat(weight) * parseFloat(pricePerKg)).toFixed(2)}`;

  const getStatusClass = (s) => {
    switch (s) {
      case 'available': return 'status-available';
      case 'sold': return 'status-sold';
      case 'reserved': return 'status-reserved';
      case 'expired': return 'status-expired';
      default: return '';
    }
  };

  return (
    <div className="listing-card">
      <div className="listing-image">
        {photoUrl ? (
          <img src={photoUrl} alt={species} />
        ) : (
          <div className="listing-placeholder">🐟</div>
        )}
        <span className={`listing-status ${getStatusClass(status)}`}>
          {status}
        </span>
      </div>
      <div className="listing-body">
        <h3 className="listing-species">{species}</h3>
        <div className="listing-details">
          <div className="detail-row">
            <span className="detail-label">Weight</span>
            <span className="detail-value">{formattedWeight}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Rate</span>
            <span className="detail-value">{formattedPrice}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Total</span>
            <span className="detail-value total">{totalPrice}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Caught</span>
            <span className="detail-value">{formattedDate}</span>
          </div>
        </div>
        {fisher && (
          <div className="listing-fisher">
            <span className="fisher-avatar">{fisher.name?.charAt(0)?.toUpperCase()}</span>
            <span className="fisher-name">{fisher.name}</span>
          </div>
        )}
      </div>
      <div className="listing-footer">
        {onDelete && (
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(id)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
</write_to_file>