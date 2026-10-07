'use client';
import AuthModal from '../../../components/AuthModal';

export default function CustomerLoginPage() {
  return (
    <AuthModal
      isOpen={true}
      isPage={true}
      initialRole="customer"
      initialMode="signin"
    />
  );
}
