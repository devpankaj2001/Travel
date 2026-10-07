'use client';
export default function StudioFooter({ onOpenAuth }) {
  return (
  <footer className="site-studio-footer" aria-label="Site Footer">
    {/* Giant Ambient Brand Watermark (Aigocy Style) */}
    <div className="footer-watermark-text" aria-hidden="true">Travel</div>

    <div className="site-container">

      {/* Top Connect Hero Section */}
      <div className="footer-connect-wrap">
        {/* 3D Dark App Icon Badge */}
        <div className="footer-app-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D6F5EE" strokeWidth="2.3"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </div>

        <h2 className="footer-connect-headline">
          Get connected<br />with Travel on social
        </h2>
        <p className="footer-connect-subtitle">Don't miss our new updates &amp; secret travel deals!</p>

        {/* 3D Pill Cards Row (4 Centered Cards, Exactly Like Reference Image) */}
        <div className="footer-pills-row">
          {/* Facebook */}
          <a href="#!" data-route="facebook" className="footer-3d-pill" aria-label="Facebook">
            <span className="footer-pill-label">Facebook</span>
            <div className="footer-pill-icon-knob">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
              </svg>
            </div>
          </a>

          {/* Instagram */}
          <a href="#!" data-route="instagram" className="footer-3d-pill" aria-label="Instagram">
            <span className="footer-pill-label">Instagram</span>
            <div className="footer-pill-icon-knob">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
          </a>

          {/* LinkedIn */}
          <a href="#!" data-route="linkedin" className="footer-3d-pill" aria-label="LinkedIn">
            <span className="footer-pill-label">Linkedin</span>
            <div className="footer-pill-icon-knob">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </div>
          </a>

          {/* YouTube */}
          <a href="#!" data-route="youtube" className="footer-3d-pill" aria-label="YouTube">
            <span className="footer-pill-label">YouTube</span>
            <div className="footer-pill-icon-knob">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="footer-studio-divider"></div>

      {/* 5 Navigation Columns (Traval's Content Preserved) */}
      <div className="footer-studio-grid">
        {/* 1. COMPANY */}
        <div className="footer-studio-col">
          <h3 className="footer-studio-col-title">Company</h3>
          <ul className="footer-studio-links">
            <li><a href="#!" data-route="aboutUs">About Us</a></li>
            <li><a href="#!" data-route="careers">Careers</a></li>
            <li><a href="#!" data-route="contactUs">Contact Us</a></li>
            <li><a href="#!" data-route="blog">Blog</a></li>
            <li><a href="#!" data-route="pressAndMedia">Press and Media</a></li>
          </ul>
        </div>

        {/* 2. EXPLORE */}
        <div className="footer-studio-col">
          <h3 className="footer-studio-col-title">Explore</h3>
          <ul className="footer-studio-links">
            <li><a href="#!" data-route="activities">Activities</a></li>
            <li><a href="#!" data-route="destinations">Destinations</a></li>
            <li><a href="#!" data-route="activities">Categories</a></li>
            <li><a href="#!" data-route="offers">Offers</a></li>
            <li><a href="#!" data-route="aiTripPlanner">AI Trip Planner</a></li>
          </ul>
        </div>

        {/* 3. PARTNERS */}
        <div className="footer-studio-col">
          <h3 className="footer-studio-col-title">Partners</h3>
          <ul className="footer-studio-links">
            <li><a href="#!" data-route="becomeSupplier">Become a Supplier</a></li>
            <li><a href="#!" data-route="becomeTravelPartner">Become a Travel Partner</a></li>
            <li><a href="#!" data-route="corporateBookings">Corporate Bookings</a></li>
            <li><a href="#!" data-route="affiliateProgram">Affiliate Program</a></li>
            <li><a href="#!" data-route="apiIntegration">API Integration</a></li>
          </ul>
        </div>

        {/* 4. SUPPORT */}
        <div className="footer-studio-col">
          <h3 className="footer-studio-col-title">Support</h3>
          <ul className="footer-studio-links">
            <li><a href="#!" data-route="helpCentre">Help Centre</a></li>
            <li><a href="#!" data-route="manageBooking">Manage Booking</a></li>
            <li><a href="#!" data-route="cancellationAndRefund">Cancellation &amp; Refund</a></li>
            <li><a href="#!" data-route="safetyAndTrust">Safety and Trust</a></li>
            <li><a href="#!" data-route="contactSupport">Contact Support</a></li>
          </ul>
        </div>

        {/* 5. LEGAL */}
        <div className="footer-studio-col">
          <h3 className="footer-studio-col-title">Legal</h3>
          <ul className="footer-studio-links">
            <li><a href="#!" data-route="termsAndConditions">Terms &amp; Conditions</a></li>
            <li><a href="#!" data-route="privacyPolicy">Privacy Policy</a></li>
            <li><a href="#!" data-route="cookiePolicy">Cookie Policy</a></li>
            <li><a href="#!" data-route="cancellationAndRefund">Refund Policy</a></li>
            <li><a href="#!" data-route="userAgreement">User Agreement</a></li>
          </ul>
        </div>
      </div>

      {/* Legal Policy Bar */}
      <div className="footer-studio-policy-bar">
        <div className="footer-studio-policy-links">
          <a href="#!" data-route="cancellationAndRefund">Cancellation and Refund Policy</a>
          <span className="footer-studio-sep">&bull;</span>
          <a href="#!" data-route="paymentPolicy">Payment Policy</a>
          <span className="footer-studio-sep">&bull;</span>
          <a href="#!" data-route="supplierTerms">Supplier Terms and Conditions</a>
          <span className="footer-studio-sep">&bull;</span>
          <a href="#!" data-route="travelPartnerTerms">Travel Partner Terms and Conditions</a>
          <span className="footer-studio-sep">&bull;</span>
          <a href="#!" data-route="safetyDisclaimer">Safety Disclaimer</a>
          <span className="footer-studio-sep">&bull;</span>
          <a href="#!" data-route="intellectualProperty">Intellectual Property Policy</a>
          <span className="footer-studio-sep">&bull;</span>
          <a href="#!" data-route="grievanceRedressal">Grievance Redressal Policy</a>
          <span className="footer-studio-sep">&bull;</span>
          <a href="#!" data-route="dataProtection">Data Protection Policy</a>
        </div>
      </div>

      {/* Bottom Bar: Underlined Quick Links, Copyright, Payments, Back to Top */}
      <div className="footer-studio-bottom">
        {/* Quick Nav Underlined Links (Like in reference) */}
        <div className="footer-studio-underlined-links">
          <a href="#!" data-route="aboutUs">About</a>
          <a href="#!" data-route="activities">Services</a>
          <a href="#!" data-route="destinations">Works</a>
          <a href="#!" data-route="contactUs">Contact</a>
        </div>

        {/* Copyright */}
        <p className="footer-studio-copyright">
          &copy; 2026 Travel. All Rights Reserved.
        </p>

        {/* Payment Badges & Back to Top */}
        <div className="footer-studio-bottom-right">
          <div className="footer-studio-payments">
            <img src="/assets/icons/payment/visa.svg" alt="Visa accepted" className="footer-studio-pay-icon" />
            <img src="/assets/icons/payment/mastercard.svg" alt="Mastercard accepted" className="footer-studio-pay-icon" />
            <img src="/assets/icons/payment/upi.svg" alt="UPI accepted" className="footer-studio-pay-icon" />
            <img src="/assets/icons/payment/razorpay.svg" alt="Razorpay gateway" className="footer-studio-pay-icon" />
            <div className="footer-studio-ssl-badge">
              <img src="/assets/icons/payment/ssl-lock.svg" alt="" className="footer-studio-ssl-icon" />
              <span>SSL Secure</span>
            </div>
          </div>

          {/* Back to Top Link (Like in reference) */}
          <button type="button" className="footer-studio-back-top" onClick={() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            aria-label="Back to top">
            Back to top <span>&uarr;</span>
          </button>
        </div>
      </div>

    </div>
  </footer>
  );
}
