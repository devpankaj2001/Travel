import SupplierSignupWizard from '../../../components/supplier/SupplierSignupWizard';

export const metadata = {
  title: 'Supplier Registration',
  description: 'Register as an individual or corporate supplier. Applications stay pending until they are approved.'
};

export default function SupplierSignupPage() {
  return <SupplierSignupWizard />;
}
