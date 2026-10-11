import './globals.css';
import './homepage.css';
import { AuthProvider } from '../hooks/useAuth';
import { ToastProvider } from '../components/Toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Enterprise Booking Platform — Sprint 1 Portal',
  description: 'Production-ready authentication, RBAC role management, and multi-tenant supplier onboarding platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                {children}
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
