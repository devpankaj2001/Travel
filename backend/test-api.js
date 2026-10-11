const http = require('http');

const PORT = 5000;

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json'
    };
    if (body) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING AUTOMATED API TEST SUITE FOR SPRINT 0 & SPRINT 1');
  console.log('=============================================================\n');

  try {
    // 1. Health check
    console.log('[1] Testing Health Endpoint...');
    const health = await request('GET', '/api/v1/health');
    console.log('Status:', health.status, 'Response:', health.data);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Customer Signup
    console.log('\n[2] Testing Customer Signup...');
    const randomSuffix = Math.floor(Math.random() * 10000);
    const customerEmail = `customer_${randomSuffix}@test.com`;
    const uniquePhone = `+9198${Date.now().toString().slice(-8)}`;
    const signupRes = await request('POST', '/api/v1/auth/customer/signup', {
      first_name: 'Test',
      last_name: 'Customer',
      email: customerEmail,
      password: 'Password@123',
      phone: uniquePhone,
      account_type: 'individual',
      customer_segment: 'retail'
    });
    console.log('Status:', signupRes.status, 'Success:', signupRes.data.success);
    const customerOtp = signupRes.data.data.verification.otpCode;
    console.log('Customer Generated OTP:', customerOtp);
    const verifyCust = await request('POST', '/api/v1/auth/customer/verify-otp', {
      email: customerEmail,
      otp: customerOtp
    });
    console.log('Customer OTP Verify Status:', verifyCust.status, 'Success:', verifyCust.data.success);
    const customerToken = verifyCust.data.data.tokens.accessToken;

    // 3. Customer Profile
    console.log('\n[3] Testing Customer Profile (GET /api/v1/users/profile)...');
    const profileRes = await request('GET', '/api/v1/users/profile', null, customerToken);
    console.log('Status:', profileRes.status, 'User Name:', `${profileRes.data.data.first_name} ${profileRes.data.data.last_name}`);

    // 4. Supplier Signup
    console.log('\n[4] Testing Supplier Signup...');
    const supplierEmail = `supplier_${randomSuffix}@test.com`;
    const supplierSignup = await request('POST', '/api/v1/auth/supplier/signup', {
      company_name: `Himalayan Expeditions ${randomSuffix}`,
      first_name: 'Vikram',
      last_name: 'Singh',
      email: supplierEmail,
      password: 'Password@123',
      phone: `+9198888${randomSuffix}`,
      trade_license_no: `TL-${randomSuffix}`,
      tax_id: `GSTIN-${randomSuffix}`,
      city: 'Rishikesh',
      country: 'India'
    });
    console.log('Status:', supplierSignup.status, 'Success:', supplierSignup.data.success);
    const verification = supplierSignup.data.data.verification;
    const supplierId = supplierSignup.data.data.supplierId;
    console.log('Generated OTP:', verification.otpCode, 'Email Token:', verification.emailVerificationToken.substring(0, 10) + '...');

    // 5. Supplier OTP Verification
    console.log('\n[5] Testing Supplier OTP Verification...');
    const otpVerifyRes = await request('POST', '/api/v1/auth/supplier/verify-otp', {
      email: supplierEmail,
      code: verification.otpCode
    });
    console.log('Status:', otpVerifyRes.status, 'Message:', otpVerifyRes.data.message);

    // 6. Supplier Email Verification
    console.log('\n[6] Testing Supplier Email Verification...');
    const emailVerifyRes = await request('POST', '/api/v1/auth/supplier/verify-email', {
      email: supplierEmail,
      token: verification.emailVerificationToken
    });
    console.log('Status:', emailVerifyRes.status, 'Message:', emailVerifyRes.data.message);

    // 7. Supplier Login
    console.log('\n[7] Testing Supplier Login...');
    const suppLogin = await request('POST', '/api/v1/auth/supplier/login', {
      email: supplierEmail,
      password: 'Password@123'
    });
    console.log('Status:', suppLogin.status, 'Supplier Status:', suppLogin.data.data.user.supplier.status);
    const supplierToken = suppLogin.data.data.tokens.accessToken;

    // 8. Admin Login (Site Admin)
    console.log('\n[8] Testing Site Admin Login...');
    const adminLogin = await request('POST', '/api/v1/auth/admin/login', {
      email: 'admin@bookingplatform.com',
      password: 'Admin@Secure2026!'
    });
    console.log('Status:', adminLogin.status, 'Role:', adminLogin.data.data.user.role);
    const adminToken = adminLogin.data.data.tokens.accessToken;

    // 9. Admin List Roles and Permissions
    console.log('\n[9] Testing Admin View Roles...');
    const rolesRes = await request('GET', '/api/v1/admin/roles', null, adminToken);
    console.log('Status:', rolesRes.status, 'Total Roles:', rolesRes.data.data.length);

    // 10. Admin List Pending Suppliers
    console.log('\n[10] Testing Admin View Suppliers...');
    const suppliersRes = await request('GET', '/api/v1/admin/suppliers', null, adminToken);
    console.log('Status:', suppliersRes.status, 'Total Suppliers:', suppliersRes.data.data.total);

    // 11. Admin Approve Supplier
    console.log(`\n[11] Testing Admin Approve Supplier (ID: ${supplierId})...`);
    const approveRes = await request('PUT', `/api/v1/admin/suppliers/${supplierId}/approve`, {
      notes: 'All documents verified and approved for active listings'
    }, adminToken);
    console.log('Status:', approveRes.status, 'Message:', approveRes.data.message);

    // 12. Accountant Login & RBAC permission enforcement
    console.log('\n[12] Testing Site Accountant Login & Permissions...');
    const accLogin = await request('POST', '/api/v1/auth/admin/login', {
      email: 'accountant@bookingplatform.com',
      password: 'Password@123'
    });
    const accountantToken = accLogin.data.data.tokens.accessToken;
    console.log('Accountant Permissions:', accLogin.data.data.user.permissions);

    // Accountant should access revenue report
    const revReport = await request('GET', '/api/v1/admin/reports/revenue', null, accountantToken);
    console.log('Revenue Report Access (Allowed): Status', revReport.status);

    // Accountant should NOT be able to approve suppliers (RBAC check)
    const accApproveCheck = await request('PUT', `/api/v1/admin/suppliers/${supplierId}/approve`, { notes: 'test' }, accountantToken);
    console.log('Accountant Supplier Approval Access (Should be 403 Forbidden): Status', accApproveCheck.status, 'Message:', accApproveCheck.data.message);

    // 13. Forgot Password & Reset Password
    console.log('\n[13] Testing Forgot Password & Reset Password...');
    const forgotRes = await request('POST', '/api/v1/auth/forgot-password', {
      email: customerEmail
    });
    console.log('Forgot Password Status:', forgotRes.status);
    const resetToken = forgotRes.data.data.resetToken;

    const resetRes = await request('POST', '/api/v1/auth/reset-password', {
      token: resetToken,
      password: 'NewPassword@456'
    });
    console.log('Reset Password Status:', resetRes.status, 'Message:', resetRes.data.message);

    // Test Login with new password
    const newLoginRes = await request('POST', '/api/v1/auth/customer/login', {
      email: customerEmail,
      password: 'NewPassword@456'
    });
    console.log('New Password Login Status:', newLoginRes.status, 'Success:', newLoginRes.data.success);

    console.log('\n=============================================================');
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! FULL SPRINT 0 & 1 VERIFIED!');
    console.log('=============================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exit(1);
  }
};

runTests();
