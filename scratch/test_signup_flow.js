const { query } = require('../backend/database/connection');

async function testSignupFlow() {
  const testEmail = `test_partner_${Date.now()}@adventure.com`;
  const testPhone = '98765' + Math.floor(10000 + Math.random() * 90000);

  console.log(`\n--- 1. Testing Supplier Signup with Email: ${testEmail} ---`);
  const signupRes = await fetch('http://127.0.0.1:5000/api/v1/auth/supplier/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_name: 'Desert Safari Pvt Ltd',
      owner_name: 'Vikram Singh',
      email: testEmail,
      password: 'Password@123',
      phone: testPhone,
      business_type: 'Private Limited',
      website: 'www.desertsafari.com',
      main_category: 'adventure',
      sub_category: 'Camping',
      services: ['Desert Safari', 'Camel Ride', 'Dune Bashing'],
      description: 'Premier desert safari and camping tour provider in Jaisalmer.',
      documents: [
        { document_type: 'gst_certificate', document_name: 'GST_Desert.pdf', document_url: '/uploads/documents/GST_Desert.pdf', file_size: 2048 }
      ]
    })
  });

  const signupData = await signupRes.json();
  console.log('Signup Response Status:', signupRes.status);
  console.log('Signup Response Data:', signupData);

  const otpCode = signupData.data?.verification?.otpCode;
  if (!otpCode) {
    console.error('No OTP code returned!');
    process.exit(1);
  }

  console.log(`\n--- 2. Verifying OTP Code: ${otpCode} for ${testEmail} ---`);
  const verifyRes = await fetch('http://127.0.0.1:5000/api/v1/auth/supplier/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      phone: testPhone,
      code: otpCode
    })
  });

  const verifyData = await verifyRes.json();
  console.log('Verify Response Status:', verifyRes.status);
  console.log('Verify Response Data:', verifyData);

  console.log('\n--- 3. Checking Database Records ---');
  const user = await query('SELECT id, role_id, email, first_name, last_name, status, phone FROM users WHERE email = ?', [testEmail]);
  console.log('users table:', user);

  if (user.length > 0) {
    const supplier = await query('SELECT id, user_id, company_name, contact_person, status, main_category, sub_category, services FROM suppliers WHERE user_id = ?', [user[0].id]);
    console.log('suppliers table:', supplier);

    const profile = await query('SELECT id, user_id, company_name, contact_email, status FROM supplier_profiles WHERE user_id = ?', [user[0].id]);
    console.log('supplier_profiles table:', profile);

    const docs = await query('SELECT id, supplier_id, document_type, document_name, status FROM supplier_documents WHERE supplier_id = ?', [supplier[0]?.id]);
    console.log('supplier_documents table:', docs);
  }

  process.exit(0);
}

testSignupFlow().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
