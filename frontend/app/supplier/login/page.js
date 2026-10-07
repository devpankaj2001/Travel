'use client';
import AuthModal from '../../../components/AuthModal';

export default function SupplierLoginPage() {
  return (
    <AuthModal
      isOpen={true}
      isPage={true}
      initialRole="supplier"
      initialMode="signin"
    />
  );
}
