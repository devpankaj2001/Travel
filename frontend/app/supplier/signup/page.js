'use client';
import AuthModal from '../../../components/AuthModal';

export default function SupplierSignupPage() {
  return (
    <AuthModal
      isOpen={true}
      isPage={true}
      initialRole="supplier"
      initialMode="signup"
    />
  );
}
