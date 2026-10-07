'use client';
import { useState } from 'react';

export default function AiChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hi adventurer! I'm TravelBot, your 24/7 AI Travel Assistant.\n\nI can help you explore top activities, get instant itineraries, or unlock secret discounts. How can I assist today?"
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSend = (textToSend) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInputVal('');

    setTimeout(() => {
      let botReply = "I can definitely help you with that! You can explore our featured activities, browse verified desert safaris, or sign in to save your booking.";
      const qLower = query.toLowerCase();
      if (qLower.includes('discount') || qLower.includes('15%') || qLower.includes('promo')) {
        botReply = "🎉 You can use coupon code 'FLASH40' for up to 40% off flash sales or 'FIRSTTRIP10' for 10% off your initial booking!";
      } else if (qLower.includes('top tours') || qLower.includes('recommend')) {
        botReply = "✨ Our most popular adventures right now are: 1. Desert Jeep Safari (Dubai), 2. Camel Safari at Sunset (Jaisalmer), and 3. Parasailing Adventure (Goa)!";
      } else if (qLower.includes('book') || qLower.includes('how to')) {
        botReply = "To book, simply select any activity card, choose your preferred date & guests, and proceed to instant checkout!";
      } else if (qLower.includes('human') || qLower.includes('support')) {
        botReply = "📞 Our support team is available 24/7 at support@travelworldwide.com or call +91 (800) 123-4567.";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  const handleReset = () => {
    setMessages([
      {
        sender: 'bot',
        text: "👋 Hi adventurer! I'm TravelBot, your 24/7 AI Travel Assistant.\n\nI can help you explore top activities, get instant itineraries, or unlock secret discounts. How can I assist today?"
      }
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div
        id="traval-chat-launcher"
        className="traval-chat-launcher"
        aria-label="Open AI Travel Assistant"
        onClick={() => setIsOpen(!isOpen)}
      >
        {hintVisible && !isOpen && (
          <div
            id="traval-chat-hint"
            className="traval-chat-bubble-hint"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            <span>👋 Hi! Need help planning your trip?</span>
            <span
              id="traval-hint-close"
              className="hint-close"
              title="Dismiss"
              onClick={(e) => {
                e.stopPropagation();
                setHintVisible(false);
              }}
            >
              &times;
            </span>
          </div>
        )}
        <div className="traval-chat-btn">
          <img
            src="/assets/images/traval_bot_head.png"
            alt="Travel AI Bot Mascot"
            className="traval-chat-mascot-img"
          />
          <span className="traval-chat-status-dot" title="AI Assistant Online"></span>
        </div>
      </div>

      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div
          id="traval-chat-window"
          className="traval-chat-window active"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-bot-title"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div className="traval-chat-header">
            <div className="traval-chat-header-info">
              <div className="traval-chat-avatar-wrap">
                <img
                  src="/assets/images/traval_bot_head.png"
                  alt="TravelBot"
                  className="traval-chat-header-avatar"
                />
                <span className="traval-chat-online-badge"></span>
              </div>
              <div className="traval-chat-header-text">
                <div id="chat-bot-title" className="traval-chat-header-title">
                  <span>Travel AI Concierge</span>
                  <span>✨</span>
                </div>
                <span className="traval-chat-header-status">
                  <span className="traval-chat-header-status-dot"></span>
                  Online &bull; Replies Instantly
                </span>
              </div>
            </div>
            <div className="traval-chat-header-actions">
              <button
                type="button"
                id="traval-chat-reset"
                className="traval-chat-action-btn"
                title="Reset Chat"
                aria-label="Reset Chat"
                onClick={handleReset}
              >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                type="button"
                id="traval-chat-close"
                className="traval-chat-action-btn"
                title="Close Chat"
                aria-label="Close Chat"
                onClick={() => setIsOpen(false)}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div id="traval-chat-messages" className="traval-chat-body" style={{ flex: 1, overflowY: 'auto' }}>
            <div className="traval-chat-time-tag">Today</div>

            {messages.map((m, idx) => (
              <div key={idx} className={`chat-msg-row ${m.sender}`}>
                {m.sender === 'bot' && (
                  <div className="chat-msg-avatar">
                    <img src="/assets/images/traval_bot_head.png" alt="TravelBot" />
                  </div>
                )}
                <div className="chat-msg-bubble">
                  <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                  {idx === 0 && (
                    <div className="chat-quick-suggestions" style={{ marginTop: '12px' }}>
                      <button
                        type="button"
                        className="chat-chip-btn"
                        onClick={() => handleSend('Top Recommended Tours')}
                      >
                        ⭐ Top Tours
                      </button>
                      <button
                        type="button"
                        className="chat-chip-btn"
                        onClick={() => handleSend('Unlock 15% Discount Code')}
                      >
                        🏷️ 15% Discount
                      </button>
                      <button
                        type="button"
                        className="chat-chip-btn"
                        onClick={() => handleSend('How to Book Activities')}
                      >
                        🧭 How to Book
                      </button>
                      <button
                        type="button"
                        className="chat-chip-btn"
                        onClick={() => handleSend('Talk to Human Support')}
                      >
                        🎧 Human Agent
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Input Bar */}
          <div className="traval-chat-footer">
            <div className="traval-chat-input-row">
              <input
                type="text"
                id="traval-chat-input"
                className="traval-chat-input"
                placeholder="Ask anything about tours, bookings..."
                autoComplete="off"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
              />
              <button
                type="button"
                id="traval-chat-send"
                className="traval-chat-send-btn"
                aria-label="Send message"
                onClick={() => handleSend()}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <p className="traval-chat-powered">⚡ Powered by Travel AI Engine &bull; Instant 24/7 Support</p>
          </div>
        </div>
      )}
    </>
  );
}
