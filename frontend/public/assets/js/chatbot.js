/**
 * Travel AI Concierge Chatbot
 * Interactive 24/7 AI Travel Assistant
 */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const launcher = document.getElementById('traval-chat-launcher');
    const chatWindow = document.getElementById('traval-chat-window');
    const closeBtn = document.getElementById('traval-chat-close');
    const resetBtn = document.getElementById('traval-chat-reset');
    const hintBubble = document.getElementById('traval-chat-hint');
    const hintClose = document.getElementById('traval-hint-close');
    const messagesBody = document.getElementById('traval-chat-messages');
    const inputField = document.getElementById('traval-chat-input');
    const sendBtn = document.getElementById('traval-chat-send');

    if (!launcher || !chatWindow) return;

    // Toggle Chat Window
    function toggleChat(open = null) {
      const shouldOpen = open !== null ? open : !chatWindow.classList.contains('active');
      if (shouldOpen) {
        chatWindow.classList.add('active');
        if (hintBubble) hintBubble.style.display = 'none';
        setTimeout(() => inputField && inputField.focus(), 300);
      } else {
        chatWindow.classList.remove('active');
      }
    }

    launcher.addEventListener('click', (e) => {
      if (e.target.closest('#traval-hint-close')) return;
      toggleChat();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleChat(false);
      });
    }

    if (hintClose && hintBubble) {
      hintClose.addEventListener('click', (e) => {
        e.stopPropagation();
        hintBubble.style.opacity = '0';
        setTimeout(() => hintBubble.style.display = 'none', 300);
      });
    }

    // Append Message
    function appendMessage(sender, text, isHtml = false) {
      const row = document.createElement('div');
      row.className = `chat-msg-row ${sender}`;

      if (sender === 'bot') {
        const avatar = document.createElement('div');
        avatar.className = 'chat-msg-avatar';
        avatar.innerHTML = `<img src="assets/images/traval_bot_head.png" alt="TravelBot">`;
        row.appendChild(avatar);
      }

      const bubble = document.createElement('div');
      bubble.className = 'chat-msg-bubble';
      if (isHtml) {
        bubble.innerHTML = text;
      } else {
        bubble.textContent = text;
      }
      row.appendChild(bubble);

      messagesBody.appendChild(row);
      scrollToBottom();
    }

    // Scroll chat to bottom
    function scrollToBottom() {
      messagesBody.scrollTop = messagesBody.scrollHeight;
    }

    // Typing Indicator
    let typingIndicatorEl = null;
    function showTypingIndicator() {
      if (typingIndicatorEl) return;
      const row = document.createElement('div');
      row.className = 'chat-msg-row bot';
      row.id = 'chat-typing-row';

      const avatar = document.createElement('div');
      avatar.className = 'chat-msg-avatar';
      avatar.innerHTML = `<img src="assets/images/traval_bot_head.png" alt="TravelBot">`;
      row.appendChild(avatar);

      const indicator = document.createElement('div');
      indicator.className = 'chat-typing-indicator';
      indicator.innerHTML = '<span></span><span></span><span></span>';
      row.appendChild(indicator);

      messagesBody.appendChild(row);
      typingIndicatorEl = row;
      scrollToBottom();
    }

    function hideTypingIndicator() {
      if (typingIndicatorEl && typingIndicatorEl.parentNode) {
        typingIndicatorEl.parentNode.removeChild(typingIndicatorEl);
      }
      typingIndicatorEl = null;
    }

    // Bot Response Logic
    function getBotResponse(query) {
      const q = query.toLowerCase().trim();

      if (q.includes('discount') || q.includes('coupon') || q.includes('code') || q.includes('offer') || q.includes('voucher') || q.includes('15%')) {
        return `🎉 <strong>Here is your VIP Travel Voucher!</strong><br><br>Use promo code: <code style="background:#D6F5EE; color:#065F46; padding:3px 8px; border-radius:6px; font-weight:800; font-size:1rem;">TRAVELVIP15</code> at checkout for an instant <strong>15% OFF</strong> any tour or activity!`;
      }

      if (q.includes('tour') || q.includes('activity') || q.includes('activities') || q.includes('recommend') || q.includes('cappadocia') || q.includes('bali') || q.includes('jaisalmer') || q.includes('dubai')) {
        return `🌟 <strong>Top Trending Experiences This Week:</strong><br><br>
        🎈 <strong>Sunrise Balloon Flight Over Cappadocia</strong> - $285/person (⭐ 5.0)<br>
        🐪 <strong>Desert Camel Safari Jaisalmer</strong> - $89/person (⭐ 4.9)<br>
        🌿 <strong>Jungle Trek & Waterfalls, Bali</strong> - $89/person (⭐ 4.8)<br>
        🚢 <strong>Norwegian Fjords Panoramic Cruise</strong> - $450/person (⭐ 4.9)<br><br>
        <em>All tours include instant mobile QR entry passes!</em>`;
      }

      if (q.includes('book') || q.includes('how to book') || q.includes('reservation')) {
        return `📱 <strong>Booking with Travel is 100% Seamless:</strong><br><br>
        1️⃣ Select your destination & tour.<br>
        2️⃣ Choose your preferred date & group size.<br>
        3️⃣ Complete checkout with UPI, Card, or Razorpay.<br>
        4️⃣ Instant QR boarding pass is saved to your phone & Apple Wallet!`;
      }

      if (q.includes('cancel') || q.includes('refund') || q.includes('cancellation')) {
        return `🛡️ <strong>Risk-Free Booking Guarantee:</strong><br><br>
        You get <strong>100% Free Cancellation & Full Refund</strong> on 95% of activities when cancelled up to <strong>24 hours before</strong> the start time. No questions asked!`;
      }

      if (q.includes('support') || q.includes('human') || q.includes('contact') || q.includes('help') || q.includes('phone') || q.includes('agent')) {
        return `🤝 <strong>Our 24/7 Human Concierge is Available:</strong><br><br>
        📞 Toll-Free: <strong>+1 (800) 872-825</strong><br>
        💬 WhatsApp: <strong>+91 98765 43210</strong><br>
        ✉️ Email: <strong>support@travel.com</strong><br>
        <em>Average response time: under 3 minutes!</em>`;
      }

      if (q.includes('plan') || q.includes('itinerary') || q.includes('trip')) {
        return `🗺️ <strong>AI Trip Planner at your service!</strong><br><br>
        Where would you like to travel? (e.g. <em>"Plan 3 days in Bali"</em> or <em>"Weekend in Jaisalmer"</em>). Tell me your destination and I'll tailor a complete schedule with top activities!`;
      }

      if (q.includes('app') || q.includes('mobile')) {
        return `📱 <strong>Travel Mobile App is Coming Soon!</strong><br><br>
        We're launching on iOS & Android with offline QR passes, live guide radar, and an exclusive 15% launch voucher. You can join the early-access waitlist directly in Section 15!`;
      }

      if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('namaste')) {
        return `👋 Hello adventurer! I'm TravelBot, your AI travel buddy. Looking for exciting tour ideas, travel vouchers, or booking assistance today?`;
      }

      // Default smart answer
      return `✨ I'd love to help you with that! You can ask me about:<br>
      • <strong>Tours & Attractions</strong> worldwide<br>
      • <strong>Discount Codes</strong> & flash deals<br>
      • <strong>Booking & Free Cancellation</strong> policies<br>
      • Or type <strong>"human"</strong> to speak with our 24/7 support team!`;
    }

    // Send User Message
    function handleSend() {
      const text = inputField.value.trim();
      if (!text) return;

      appendMessage('user', text);
      inputField.value = '';

      showTypingIndicator();

      const delay = Math.min(1000, Math.max(500, text.length * 15));
      setTimeout(() => {
        hideTypingIndicator();
        const reply = getBotResponse(text);
        appendMessage('bot', reply, true);
      }, delay);
    }

    sendBtn.addEventListener('click', handleSend);
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });

    // Quick suggestion chips handler
    messagesBody.addEventListener('click', (e) => {
      const chip = e.target.closest('.chat-chip-btn');
      if (!chip) return;
      const query = chip.dataset.query || chip.textContent.trim();
      inputField.value = query;
      handleSend();
    });

    // Reset Chat
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        messagesBody.innerHTML = `
          <div class="traval-chat-time-tag">Today</div>
          <div class="chat-msg-row bot">
            <div class="chat-msg-avatar">
              <img src="assets/images/traval_bot_head.png" alt="TravelBot">
            </div>
            <div class="chat-msg-bubble">
              👋 <strong>Hi adventurer!</strong> I'm TravelBot, your 24/7 AI Travel Assistant.<br><br>
              How can I assist your journey today? Pick a quick option below or type anything!
              <div class="chat-quick-suggestions">
                <button type="button" class="chat-chip-btn" data-query="Top Recommended Tours">🗺️ Top Tours</button>
                <button type="button" class="chat-chip-btn" data-query="Unlock 15% Discount Code">🏷️ 15% Discount</button>
                <button type="button" class="chat-chip-btn" data-query="How to Book Activities">🎟️ How to Book</button>
                <button type="button" class="chat-chip-btn" data-query="Talk to Human Support">📞 Human Agent</button>
              </div>
            </div>
          </div>
        `;
      });
    }

  });
})();
