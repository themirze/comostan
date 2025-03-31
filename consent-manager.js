// Google Consent Mode V2 Implementation
(function () {
  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }

  // Default consent state
  const defaultConsent = {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  };

  // Consent categories with detailed cookie information
  const categories = {
    necessary: {
      name: "Necessary",
      description: "Essential cookies that enable basic functionality and security features.",
      required: true,
      storage: ["ad_storage", "analytics_storage"],
      cookies: [
        {
          name: "_GRECAPTCHA",
          duration: "6 months",
          description:
            "Google Recaptcha service sets this cookie to identify bots to protect the website against malicious spam attacks.",
        },
        {
          name: "XSRF-TOKEN",
          duration: "2 hours",
          description: "This cookie enhances visitor browsing security by preventing cross-site request forgery.",
        },
        {
          name: "__cf_bm",
          duration: "1 hour",
          description: "This cookie, set by Cloudflare, is used to support Cloudflare Bot Management.",
        },
        {
          name: "__cfruid",
          duration: "session",
          description: "Cloudflare sets this cookie to identify trusted web traffic.",
        },
        {
          name: "__Secure-ENID",
          duration: "1 year 1 month",
          description:
            "The __Secure-ENID cookie is a type of secure cookie used for authentication and to ensure the security of user sessions.",
        },
      ],
    },
    analytics: {
      name: "Analytics",
      description: "Cookies that help us understand how visitors interact with our website.",
      required: false,
      storage: ["analytics_storage"],
      cookies: [
        {
          name: "ajs_anonymous_id",
          duration: "Never Expires",
          description:
            "This cookie is set by Segment to count the number of people who visit a certain site by tracking if they have visited before.",
        },
        {
          name: "ajs_user_id",
          duration: "Never Expires",
          description:
            "This cookie is set by Segment to help track visitor usage, events, target marketing, and also measure application performance and stability.",
        },
      ],
    },
    marketing: {
      name: "Marketing",
      description: "Cookies used to track visitors across websites to display relevant advertisements.",
      required: false,
      storage: ["ad_storage", "ad_user_data", "ad_personalization"],
      cookies: [
        {
          name: "m",
          duration: "2 years",
          description:
            "Stripe sets this cookie for fraud prevention purposes. It identifies the device used to access the website, allowing the website to be formatted accordingly.",
        },
      ],
    },
  };

  // Create and inject CSS
  const style = document.createElement("style");
  style.textContent = `
        .consent-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #fff;
            padding: 1rem;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            transform: translateY(100%);
            transition: transform 0.3s ease-in-out;
            display: block;
        }
        .consent-banner.show {
            transform: translateY(0);
        }
        .consent-banner.hide {
            transform: translateY(100%);
        }
        .consent-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .consent-text {
            flex: 1;
            margin-right: 20px;
        }
        .consent-buttons {
            display: flex;
            gap: 10px;
        }
        .consent-button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
        }
        .consent-button.accept-all {
            background: #1a73e8;
            color: white;
        }
        .consent-button.reject-all {
            background: #f1f3f4;
            color: #5f6368;
        }
        .consent-button.customize {
            background: #e8f0fe;
            color: #1a73e8;
        }
        .consent-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 1000000;
        }
        .consent-modal.show {
            display: block;
        }
        .consent-modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 8px;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }
        .consent-category {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #e8eaed;
            border-radius: 4px;
        }
        .consent-category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            cursor: pointer;
        }
        .consent-category-title {
            font-weight: 500;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .dropdown-icon {
            width: 20px;
            height: 20px;
            transition: transform 0.3s ease;
        }
        .dropdown-icon.active {
            transform: rotate(180deg);
        }
        .consent-category-description {
            color: #5f6368;
            font-size: 14px;
            margin: 5px 0;
        }
        .consent-toggle {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        .consent-toggle input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .consent-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
        }
        .consent-slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .consent-slider {
            background-color: #1a73e8;
        }
        input:checked + .consent-slider:before {
            transform: translateX(26px);
        }
        .cookie-details {
            margin-top: 15px;
            border-top: 1px solid #e8eaed;
            padding-top: 15px;
            display: none;
            animation: slideDown 0.3s ease;
        }
        .cookie-details.show {
            display: block;
        }
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .cookie-item {
            margin-bottom: 15px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }
        .cookie-item:hover {
            background: #f1f3f4;
        }
        .cookie-name {
            font-weight: 500;
            color: #1a73e8;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .cookie-duration {
            font-size: 12px;
            color: #5f6368;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .cookie-description {
            font-size: 13px;
            color: #3c4043;
            line-height: 1.4;
            padding-left: 28px;
        }
        .cookie-count {
            font-size: 12px;
            color: #5f6368;
            background: #e8eaed;
            padding: 2px 6px;
            border-radius: 12px;
        }
    `;
  document.head.appendChild(style);

  // Create banner HTML
  const banner = document.createElement("div");
  banner.className = "consent-banner";
  banner.innerHTML = `
        <div class="consent-content">
            <div class="consent-text">
                <p>We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
            </div>
            <div class="consent-buttons">
                <button class="consent-button reject-all">Reject All</button>
                <button class="consent-button customize">Customize</button>
                <button class="consent-button accept-all">Accept All</button>
            </div>
        </div>
    `;
  document.body.appendChild(banner);

  // Create modal HTML
  const modal = document.createElement("div");
  modal.className = "consent-modal";
  modal.innerHTML = `
        <div class="consent-modal-content">
            <h2>Cookie Preferences</h2>
            <div class="consent-categories">
                ${Object.entries(categories)
                  .map(
                    ([key, category]) => `
                    <div class="consent-category">
                        <div class="consent-category-header">
                            <div class="consent-category-title">
                                <svg class="dropdown-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 10L12 15L17 10" stroke="#5f6368" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                ${category.name}
                                <span class="cookie-count">${category.cookies.length} cookies</span>
                            </div>
                            <label class="consent-toggle">
                                <input type="checkbox" ${
                                  category.required ? "checked disabled" : ""
                                } data-category="${key}">
                                <span class="consent-slider"></span>
                            </label>
                        </div>
                        <p class="consent-category-description">${category.description}</p>
                        <div class="cookie-details">
                            ${category.cookies
                              .map(
                                (cookie) => `
                                <div class="cookie-item">
                                    <div class="cookie-name">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 1.5C4.5 1.5 1.5 4.5 1.5 8C1.5 11.5 4.5 14.5 8 14.5C11.5 14.5 14.5 11.5 14.5 8C14.5 4.5 11.5 1.5 8 1.5ZM8 13C5.2 13 3 10.8 3 8C3 5.2 5.2 3 8 3C10.8 3 13 5.2 13 8C13 10.8 10.8 13 8 13Z" fill="#1a73e8"/>
                                            <path d="M8 4.5C6.1 4.5 4.5 6.1 4.5 8C4.5 9.9 6.1 11.5 8 11.5C9.9 11.5 11.5 9.9 11.5 8C11.5 6.1 9.9 4.5 8 4.5ZM8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6C9.1 6 10 6.9 10 8C10 9.1 9.1 10 8 10Z" fill="#1a73e8"/>
                                        </svg>
                                        ${cookie.name}
                                    </div>
                                    <div class="cookie-duration">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 1.5C4.5 1.5 1.5 4.5 1.5 8C1.5 11.5 4.5 14.5 8 14.5C11.5 14.5 14.5 11.5 14.5 8C14.5 4.5 11.5 1.5 8 1.5ZM8 13C5.2 13 3 10.8 3 8C3 5.2 5.2 3 8 3C10.8 3 13 5.2 13 8C13 10.8 10.8 13 8 13Z" fill="#5f6368"/>
                                            <path d="M8 4.5V8L10.5 9.5" stroke="#5f6368" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        Duration: ${cookie.duration}
                                    </div>
                                    <div class="cookie-description">${cookie.description}</div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
            <div class="consent-buttons" style="margin-top: 20px;">
                <button class="consent-button reject-all">Reject All</button>
                <button class="consent-button accept-all">Accept All</button>
                <button class="consent-button save-preferences">Save Preferences</button>
            </div>
        </div>
    `;
  document.body.appendChild(modal);

  // Add dropdown functionality
  const categoryHeaders = modal.querySelectorAll(".consent-category-header");
  categoryHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const category = header.parentElement;
      const details = category.querySelector(".cookie-details");
      const icon = header.querySelector(".dropdown-icon");

      details.classList.toggle("show");
      icon.classList.toggle("active");
    });
  });

  // Initialize consent state
  let currentConsent = { ...defaultConsent };

  // Update consent state
  function updateConsentState(consent) {
    currentConsent = { ...consent };
    if (typeof gtag === "function") {
      gtag("consent", "update", currentConsent);
    }
    localStorage.setItem("consent_state", JSON.stringify(currentConsent));
  }

  // Load saved consent state
  const savedConsent = localStorage.getItem("consent_state");
  if (savedConsent) {
    currentConsent = JSON.parse(savedConsent);
    if (typeof gtag === "function") {
      gtag("consent", "update", currentConsent);
    }
  } else {
    // Show banner if no consent state is saved
    setTimeout(() => {
      banner.classList.add("show");
    }, 1000); // 1 saniye gecikme ile göster
  }

  // Event listeners
  banner.querySelector(".accept-all").addEventListener("click", () => {
    const consent = {
      ad_storage: "granted",
      analytics_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      wait_for_update: 500,
    };
    updateConsentState(consent);
    banner.classList.remove("show");
  });

  banner.querySelector(".reject-all").addEventListener("click", () => {
    updateConsentState(defaultConsent);
    banner.classList.remove("show");
  });

  banner.querySelector(".customize").addEventListener("click", () => {
    modal.classList.add("show");
  });

  modal.querySelector(".reject-all").addEventListener("click", () => {
    updateConsentState(defaultConsent);
    modal.classList.remove("show");
    banner.classList.remove("show");
  });

  modal.querySelector(".accept-all").addEventListener("click", () => {
    const consent = {
      ad_storage: "granted",
      analytics_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      wait_for_update: 500,
    };
    updateConsentState(consent);
    modal.classList.remove("show");
    banner.classList.remove("show");
  });

  modal.querySelector(".save-preferences").addEventListener("click", () => {
    const consent = { ...defaultConsent };
    Object.entries(categories).forEach(([key, category]) => {
      const checkbox = modal.querySelector(`input[data-category="${key}"]`);
      if (checkbox.checked) {
        category.storage.forEach((storage) => {
          consent[storage] = "granted";
        });
      }
    });
    updateConsentState(consent);
    modal.classList.remove("show");
    banner.classList.remove("show");
  });

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("show");
    }
  });
})();
