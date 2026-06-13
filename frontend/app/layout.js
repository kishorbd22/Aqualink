import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'AquaLink - Fresh Fish Marketplace',
  description: 'Direct from fisher to table. Browse fresh fish listings, connect with local fishers, and buy the catch of the day.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="page-wrapper">{children}</main>
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} AquaLink. Connecting fishers to communities.</p>
        </footer>
      </body>
    </html>
  );
}
</write_to_file>