'use client';

import Link from 'next/link';
import { Compass, Globe, Headphones, LayoutDashboard } from 'lucide-react';

export default function BecomeASupplierPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif", color: '#0f172a' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid #e2e8f0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#0f172a', fontWeight: 800, fontSize: 20 }}>
          <Compass size={22} color="#1d6fe8" /> TravelHub
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 14, fontWeight: 700 }}>
          <Link href="/" style={{ color: '#334155', textDecoration: 'none' }}>Explore</Link>
          <Link href="/become-a-supplier" style={{ color: '#1d6fe8', textDecoration: 'none' }}>Become a Supplier</Link>
          <Link href="/supplier/login" style={{ color: '#fff', background: '#1d6fe8', textDecoration: 'none', borderRadius: 8, padding: '8px 14px' }}>Sign in</Link>
        </nav>
      </header>

      <section style={{
        minHeight: 520,
        background: 'linear-gradient(100deg, rgba(15,23,42,0.72), rgba(15,23,42,0.28)), linear-gradient(160deg, #0f766e 0%, #1d4ed8 45%, #7c2d12 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '64px 8vw'
      }}>
        <div style={{ maxWidth: 640 }}>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 58px)', lineHeight: 1.05, margin: '0 0 16px' }}>Become a Supplier</h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, maxWidth: 520, color: 'rgba(255,255,255,0.92)' }}>
            List your tours, activities, and experiences. Reach travellers and grow your business. Your account stays pending until the application is reviewed.
          </p>
          <Link href="/supplier/signup" style={{ display: 'inline-block', marginTop: 8, background: '#1d6fe8', color: '#fff', textDecoration: 'none', fontWeight: 800, borderRadius: 8, padding: '12px 18px' }}>
            Register as a Supplier
          </Link>
          <div style={{ marginTop: 14, fontSize: 14 }}>
            Already have an account? <Link href="/supplier/login" style={{ color: '#fff', fontWeight: 800 }}>Sign in</Link>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, padding: '36px 8vw 64px' }}>
        {[
          [Globe, 'Global Reach', 'Connect with travellers looking for experiences in your destination.'],
          [LayoutDashboard, 'Easy Management', 'Manage your supplier profile, documents, and verification status in one place.'],
          [Headphones, 'Dedicated Support', 'Get help from the supplier team while your application is reviewed.']
        ].map(([Icon, title, text]) => (
          <article key={title} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
            <Icon color="#1d6fe8" />
            <h2 style={{ fontSize: 18, margin: '10px 0 6px' }}>{title}</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
