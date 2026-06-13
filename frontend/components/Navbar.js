'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getStoredUser, clearAuth } from '@/lib/api';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push('/');
  };

  const isActive = (path) => pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-brand">
          <span className="brand-icon">🐟</span>
          <span className="brand-text">AquaLink</span>
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`nav-links ${menuOpen ? 'show' : ''}`}>
          <Link href="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/listings" className={isActive('/listings')} onClick={() => setMenuOpen(false)}>
            Listings
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <span className="nav-user">
                <span className="user-avatar">{user.name?.charAt(0)?.toUpperCase()}</span>
                {user.name}
              </span>
              <button className="nav-link btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={isActive('/login')} onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link href="/register" className="nav-link btn-register" onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}