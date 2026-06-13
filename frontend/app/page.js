import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <h1>Fresh Catch, Direct to You</h1>
        <p>
          AquaLink connects you directly with local fishers. Browse the freshest catch
          of the day, compare prices, and buy directly — no middlemen.
        </p>
        <div className="hero-actions">
          <Link href="/listings" className="btn btn-secondary">
            Browse Listings
          </Link>
          <Link href="/register" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>How AquaLink Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎣</div>
            <h3>For Fishers</h3>
            <p>
              List your catch in minutes. Set your price, upload photos, and reach
              buyers directly. No commission fees.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛒</div>
            <h3>For Buyers</h3>
            <p>
              Browse fresh listings from local fishers. Filter by species, price,
              and location. Get the best catch at the best price.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>For Transporters</h3>
            <p>
              Connect with fishers and buyers to arrange timely delivery. Keep the
              supply chain moving efficiently.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
</write_to_file>