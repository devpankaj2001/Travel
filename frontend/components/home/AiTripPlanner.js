'use client';
export default function AiTripPlanner({ onPlanTrip }) {
  return (
    <section className="py-10 md:py-16 bg-white" aria-labelledby="ai-heading">
      <div className="site-container">
        <div className="ai-banner-card">
          <div className="ai-assistant-inner">

            {/* Left Column: Title & 3 Feature Points */}
            <div className="ai-assistant-left">
              <div className="ai-pill-tag">
                <span className="ai-sparkle">✨</span>
                <span>AI-Powered Itinerary</span>
              </div>
              <h2 id="ai-heading" className="ai-heading-title">
                MEET YOUR AI<br />TRAVEL ASSISTANT
              </h2>

              <div className="ai-feature-list">
                {/* Feature 1 */}
                <div className="ai-feature-item">
                  <div className="ai-feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#172B4D" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"  />
                    </svg>
                  </div>
                  <div className="ai-feature-content">
                    <span className="ai-feature-text">Plan Your Activities in Seconds</span>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="ai-feature-item">
                  <div className="ai-feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#172B4D" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"  />
                      <path
                        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"  />
                    </svg>
                  </div>
                  <div className="ai-feature-content">
                    <span className="ai-feature-text">Tell Us Your Destination, Budget and Interests</span>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="ai-feature-item">
                  <div className="ai-feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#172B4D" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"  />
                    </svg>
                  </div>
                  <div className="ai-feature-content">
                    <span className="ai-feature-text">Get Personalised Experience Recommendations</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column: Bot Row + Interactive Prompt Card */}
            <div className="ai-assistant-center">
              {/* Top Bot Row */}
              <div className="ai-bot-row">
                <div className="ai-bot-avatar-wrap">
                  <svg viewBox="0 0 46 46" className="ai-bot-avatar" width="46" height="46" fill="none">
                    {/* Head Shadow */}
                    <circle cx="23" cy="24" r="19" fill="#0E223D" opacity="0.1" />
                    {/* White Capsule Head */}
                    <circle cx="23" cy="23" r="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.8" />
                    {/* Antenna */}
                    <line x1="23" y1="3" x2="23" y2="7" stroke="#172B4D" strokeWidth="2.2" strokeLinecap="round" />
                    <circle cx="23" cy="3" r="2.2" fill="#0088cc" />
                    {/* Ear pods */}
                    <rect x="2" y="19" width="4" height="8" rx="2" fill="#172B4D" />
                    <rect x="40" y="19" width="4" height="8" rx="2" fill="#172B4D" />
                    {/* Visor Screen */}
                    <rect x="10" y="14" width="26" height="15" rx="7.5" fill="#172B4D" />
                    {/* Glowing Eyes */}
                    <circle cx="17" cy="21.5" r="3" fill="#5CE1E6" />
                    <circle cx="29" cy="21.5" r="3" fill="#5CE1E6" />
                    {/* Smile Line */}
                    <path d="M20.5 24 Q23 26 25.5 24" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"
                      fill="none" />
                  </svg>
                </div>

                {/* Speech Bubble */}
                <div id="ai-bot-bubble" className="ai-bot-bubble">
                  <p className="ai-bubble-line1">Hi! I'm your AI travel assistant.</p>
                  <p className="ai-bubble-line2">Tell me about your trip.</p>
                </div>

                {/* Floating Paper Plane with flight trail */}
                <div className="ai-paper-plane-wrap">
                  <svg className="ai-paper-plane" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D375B"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13"  />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z"  />
                  </svg>
                </div>
              </div>

              {/* Card Form */}
              <div className="ai-card">
                <form id="ai-assistant-preview-form" className="ai-form">
                  {/* Field 1: Destination */}
                  <div className="ai-field-row">
                    <div className="ai-field-icon">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2B3B60" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"  />
                        <circle cx="12" cy="10" r="3"  />
                      </svg>
                    </div>
                    <div className="ai-field-content">
                      <label htmlFor="ai-dest-input" className="ai-field-label">Destination</label>
                      <input type="text" id="ai-dest-input" value="Jaipur" placeholder="e.g. Jaipur"
                        className="ai-field-input" />
                    </div>
                  </div>

                  {/* Field 2: Budget */}
                  <div className="ai-field-row">
                    <div className="ai-field-icon">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2B3B60" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="21" x2="21" y2="21"  />
                        <line x1="3" y1="10" x2="21" y2="10"  />
                        <path d="M4 10l8-6 8 6"  />
                        <line x1="6" y1="14" x2="6" y2="18"  />
                        <line x1="10" y1="14" x2="10" y2="18"  />
                        <line x1="14" y1="14" x2="14" y2="18"  />
                        <line x1="18" y1="14" x2="18" y2="18"  />
                      </svg>
                    </div>
                    <div className="ai-field-content">
                      <label htmlFor="ai-budget-input" className="ai-field-label">Budget</label>
                      <input type="text" id="ai-budget-input" value="₹ —" placeholder="e.g. ₹ —" className="ai-field-input" />
                    </div>
                  </div>

                  {/* Field 3: Interests */}
                  <div className="ai-field-row">
                    <div className="ai-field-icon">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2B3B60" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3l4 8 5-5 5 15H2L8 3z"  />
                      </svg>
                    </div>
                    <div className="ai-field-content">
                      <label htmlFor="ai-interests-input" className="ai-field-label">Interests</label>
                      <input type="text" id="ai-interests-input" value="Adventure, Nature, Culture"
                        placeholder="e.g. Adventure, Nature, Culture" className="ai-field-input" />
                    </div>
                  </div>

                  {/* Floating Round Action Button */}
                  <button type="submit" className="ai-submit-circle-btn" aria-label="Submit AI prompt"
                    title="Generate AI Plan">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"
                      strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"  />
                      <polyline points="7 7 17 7 17 17"  />
                    </svg>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Smiling Traveller with Nature Leaves Decor */}
            <div className="ai-assistant-right">
              <div className="ai-traveller-wrap">
                <img src="/assets/images/ai_traveller.jpg" alt="Happy smiling traveller with tropical leaves"
                  className="ai-traveller-img" loading="lazy" />
                {/* Floating Mini Badge */}
                <div className="ai-floating-pill">
                  <span className="ai-floating-pill-dot"></span>
                  <span>✨ Itinerary ready in 3s</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
