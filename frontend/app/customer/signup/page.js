'use client';
import AuthModal from '../../../components/AuthModal';

export default function CustomerSignupPage() {
  return (
    <AuthModal
      isOpen={true}
      isPage={true}
      initialRole="customer"
      initialMode="signup"
    />
  );
}
