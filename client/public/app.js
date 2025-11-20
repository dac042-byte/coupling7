// State Management
const state = {
  user: null,
  currentView: 'discover',
  potentialMatches: [],
  currentCardIndex: 0,
  matches: [],
  selectedMatch: null,
  theme: localStorage.getItem('theme') || 'dark'
};

// API Helper
const API = {
  async request(endpoint, options = {}) {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  },

  auth: {
    signup: (userData) => API.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    signin: (credentials) => API.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    signout: () => API.request('/auth/signout', { method: 'POST' }),
    getCurrentUser: () => API.request('/auth/me')
  },

  users: {
    getProfile: (userId) => API.request(`/users/${userId}`),
    updateProfile: (data) => API.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    addProject: (project) => API.request('/users/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    }),
    addIdea: (idea) => API.request('/users/ideas', {
      method: 'POST',
      body: JSON.stringify(idea)
    }),
    getPotentialMatches: () => API.request('/users/discover/potential')
  },

  swipes: {
    swipe: (swipedId, liked) => API.request('/swipes', {
      method: 'POST',
      body: JSON.stringify({ swipedId, liked })
    }),
    getLikes: () => API.request('/swipes/likes')
  },

  matches: {
    getAll: () => API.request('/matches')
  },

  messages: {
    get: (matchId) => API.request(`/messages/${matchId}`),
    send: (matchId, message) => API.request(`/messages/${matchId}`, {
      method: 'POST',
      body: JSON.stringify({ message })
    })
  },

  feedback: {
    submit: (message) => API.request('/feedback', {
      method: 'POST',
      body: JSON.stringify({ message })
    })
  }
};

// Theme Management
function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcons();
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', state.theme);
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcons();
}

function updateThemeIcons() {
  const icons = document.querySelectorAll('.theme-icon');
  icons.forEach(icon => {
    icon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  });
}

// Router
function showPage(pageName) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.add('hidden');
  });
  document.getElementById(`${pageName}-page`)?.classList.remove('hidden');
}

function showView(viewName) {
  state.currentView = viewName;
  document.querySelectorAll('.view').forEach(view => {
    view.classList.add('hidden');
  });
  document.getElementById(`${viewName}-view`)?.classList.remove('hidden');

  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === viewName) {
      btn.classList.add('active');
    }
  });

  // Load view data
  if (viewName === 'discover') {
    loadPotentialMatches();
  } else if (viewName === 'matches') {
    loadMatches();
  } else if (viewName === 'profile') {
    loadProfile();
  }
}

// Auth Functions
async function handleSignup(e) {
  e.preventDefault();
  const form = e.target;

  try {
    const userData = {
      email: form.querySelector('#signup-email').value,
      password: form.querySelector('#signup-password').value,
      name: form.querySelector('#signup-name').value,
      userType: form.querySelector('#signup-usertype').value,
      country: form.querySelector('#signup-country').value,
      university: form.querySelector('#signup-university').value,
      bio: form.querySelector('#signup-bio').value
    };

    const response = await API.auth.signup(userData);
    state.user = response.user;
    showPage('main');
    showView('discover');
  } catch (error) {
    alert(error.message);
  }
}

async function handleSignin(e) {
  e.preventDefault();
  const form = e.target;

  try {
    const credentials = {
      email: form.querySelector('#signin-email').value,
      password: form.querySelector('#signin-password').value
    };

    const response = await API.auth.signin(credentials);
    state.user = response.user;
    showPage('main');
    showView('discover');
  } catch (error) {
    alert(error.message);
  }
}

async function handleSignout() {
  try {
    await API.auth.signout();
    state.user = null;
    state.potentialMatches = [];
    state.matches = [];
    showPage('signin');
  } catch (error) {
    alert(error.message);
  }
}

// Discover Functions
async function loadPotentialMatches() {
  try {
    state.potentialMatches = await API.users.getPotentialMatches();
    state.currentCardIndex = 0;
    renderCurrentCard();
    updateSwipesRemaining();
  } catch (error) {
    console.error('Failed to load potential matches:', error);
  }
}

function updateSwipesRemaining() {
  if (state.user) {
    document.getElementById('swipes-remaining').textContent = state.user.swipesRemaining || 20;
  }
}

function renderCurrentCard() {
  const cardStack = document.getElementById('card-stack');
  const swipeActions = document.getElementById('swipe-actions');
  const emptyState = document.getElementById('empty-discover');

  if (state.currentCardIndex >= state.potentialMatches.length) {
    emptyState.style.display = 'block';
    swipeActions.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  swipeActions.style.display = 'flex';

  const user = state.potentialMatches[state.currentCardIndex];

  const card = document.createElement('div');
  card.className = 'user-card';
  card.innerHTML = `
    <div class="user-card-header">
      <span class="user-type-badge ${user.userType}">${user.userType === 'technical' ? '👨‍💻 Technical' : '💡 Idea Maker'}</span>
      <h2>${user.name}</h2>
      <div class="user-meta">
        📍 ${user.university}, ${user.country}
        ${user.rating > 0 ? `<br>⭐ ${user.rating.toFixed(1)} (${user.ratingCount} ratings)` : ''}
      </div>
      ${user.bio ? `<p style="margin-top: 1rem; color: var(--text-secondary);">${user.bio}</p>` : ''}
    </div>
    <div class="user-card-body">
      ${renderUserContent(user)}
    </div>
  `;

  cardStack.innerHTML = '';
  cardStack.appendChild(card);
}

function renderUserContent(user) {
  if (user.userType === 'technical') {
    let content = '';

    if (user.skills) {
      content += `
        <div style="margin-bottom: 1.5rem;">
          <h3>🛠️ Skills</h3>
          <p>${user.skills}</p>
        </div>
      `;
    }

    if (user.previousProjects && user.previousProjects.length > 0) {
      content += '<h3>📁 Previous Projects</h3>';
      user.previousProjects.forEach(project => {
        content += `
          <div class="project-item">
            <h4>${project.title}</h4>
            <p>${project.description}</p>
            <div class="project-meta">
              <span class="meta-tag">🔧 ${project.tech_stack}</span>
              ${project.project_url ? `<a href="${project.project_url}" target="_blank" class="meta-tag" style="text-decoration: none;">🔗 View Project</a>` : ''}
            </div>
          </div>
        `;
      });
    }

    if (user.githubUrl || user.portfolioUrl) {
      content += '<div style="margin-top: 1rem;">';
      if (user.githubUrl) content += `<a href="${user.githubUrl}" target="_blank" style="color: var(--accent-primary); margin-right: 1rem;">🔗 GitHub</a>`;
      if (user.portfolioUrl) content += `<a href="${user.portfolioUrl}" target="_blank" style="color: var(--accent-primary);">🔗 Portfolio</a>`;
      content += '</div>';
    }

    return content || '<p>No projects added yet.</p>';
  } else {
    let content = '';

    if (user.industry) {
      content += `
        <div style="margin-bottom: 1.5rem;">
          <h3>🏢 Industry</h3>
          <p>${user.industry}</p>
        </div>
      `;
    }

    if (user.projectIdeas && user.projectIdeas.length > 0) {
      content += '<h3>💡 Project Ideas</h3>';
      user.projectIdeas.forEach(idea => {
        content += `
          <div class="idea-item">
            <h4>${idea.title}</h4>
            <p>${idea.description}</p>
            <div class="idea-meta">
              <span class="meta-tag">⏰ ${idea.timeline}</span>
              ${idea.equity_offering ? `<span class="meta-tag">💰 ${idea.equity_offering}</span>` : ''}
              ${idea.payment_available ? '<span class="meta-tag">💵 Payment Available</span>' : '<span class="meta-tag">🆓 Free/Equity Only</span>'}
              ${idea.required_skills ? `<span class="meta-tag">🔧 ${idea.required_skills}</span>` : ''}
            </div>
          </div>
        `;
      });
    }

    return content || '<p>No project ideas added yet.</p>';
  }
}

async function handleSwipe(liked) {
  if (state.currentCardIndex >= state.potentialMatches.length) return;

  const user = state.potentialMatches[state.currentCardIndex];
  const card = document.querySelector('.user-card');

  // Animate card
  card.classList.add(liked ? 'swipe-right' : 'swipe-left');

  try {
    const result = await API.swipes.swipe(user.id, liked);

    // Update swipes remaining
    if (state.user && !state.user.isPremium) {
      state.user.swipesRemaining = (state.user.swipesRemaining || 20) - 1;
      updateSwipesRemaining();
    }

    // Show match modal if matched
    if (result.matched) {
      showMatchModal(user.name);
    }

    // Move to next card after animation
    setTimeout(() => {
      state.currentCardIndex++;
      renderCurrentCard();
    }, 300);
  } catch (error) {
    alert(error.message);
    card.classList.remove('swipe-right', 'swipe-left');
  }
}

function showMatchModal(name) {
  const modal = document.getElementById('match-modal');
  document.getElementById('match-name').textContent = name;
  modal.classList.remove('hidden');
}

function closeMatchModal() {
  document.getElementById('match-modal').classList.add('hidden');
}

// Matches Functions
async function loadMatches() {
  try {
    state.matches = await API.matches.getAll();
    renderMatches();
  } catch (error) {
    console.error('Failed to load matches:', error);
  }
}

function renderMatches() {
  const matchesList = document.getElementById('matches-list');

  if (state.matches.length === 0) {
    matchesList.innerHTML = '<div class="empty-state"><p>No matches yet. Keep swiping!</p></div>';
    return;
  }

  matchesList.innerHTML = state.matches.map(match => `
    <div class="match-item" data-match-id="${match.matchId}" onclick="selectMatch(${match.matchId})">
      <h3>${match.user.name}</h3>
      <div class="user-meta">${match.user.university}</div>
      ${match.lastMessage ? `<div class="last-message">${match.lastMessage.isFromMe ? 'You: ' : ''}${match.lastMessage.message}</div>` : '<div class="last-message">Say hi! 👋</div>'}
      ${match.unreadCount > 0 ? `<span class="unread-badge">${match.unreadCount} new</span>` : ''}
    </div>
  `).join('');
}

async function selectMatch(matchId) {
  state.selectedMatch = state.matches.find(m => m.matchId === matchId);

  // Update active state
  document.querySelectorAll('.match-item').forEach(item => {
    item.classList.remove('active');
    if (parseInt(item.dataset.matchId) === matchId) {
      item.classList.add('active');
    }
  });

  await loadMessages(matchId);
}

async function loadMessages(matchId) {
  try {
    const messages = await API.messages.get(matchId);
    renderChat(messages);

    // Start polling for new messages
    if (state.messagePolling) clearInterval(state.messagePolling);
    state.messagePolling = setInterval(() => {
      if (state.selectedMatch?.matchId === matchId && state.currentView === 'matches') {
        loadMessages(matchId);
      } else {
        clearInterval(state.messagePolling);
      }
    }, 3000);
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
}

function renderChat(messages) {
  const chatContainer = document.getElementById('chat-container');

  chatContainer.innerHTML = `
    <div class="chat-header">
      <h2>${state.selectedMatch.user.name}</h2>
      <div class="user-meta">${state.selectedMatch.user.university} • ${state.selectedMatch.user.country}</div>
    </div>
    <div class="chat-messages" id="chat-messages">
      ${messages.map(msg => `
        <div class="message ${msg.isFromMe ? 'sent' : 'received'}">
          ${msg.message}
          <span class="message-time">${formatTime(msg.createdAt)}</span>
        </div>
      `).join('')}
    </div>
    <div class="chat-input">
      <input type="text" id="message-input" placeholder="Type a message..." onkeypress="handleMessageKeyPress(event)">
      <button class="btn btn-primary" onclick="sendMessage()">Send</button>
    </div>
  `;

  // Scroll to bottom
  const messagesContainer = document.getElementById('chat-messages');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value.trim();

  if (!message || !state.selectedMatch) return;

  try {
    await API.messages.send(state.selectedMatch.matchId, message);
    input.value = '';
    await loadMessages(state.selectedMatch.matchId);
  } catch (error) {
    alert(error.message);
  }
}

function handleMessageKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString();
}

// Profile Functions
async function loadProfile() {
  try {
    const currentUser = await API.auth.getCurrentUser();
    state.user = currentUser;
    renderProfile(currentUser);
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
}

function renderProfile(user) {
  const profileContent = document.getElementById('profile-content');

  profileContent.innerHTML = `
    <div class="profile-section">
      <h3>Personal Information</h3>
      <div class="profile-info">
        <div class="info-item">
          <div class="info-label">Name</div>
          <div class="info-value">${user.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Email</div>
          <div class="info-value">${user.email}</div>
        </div>
        <div class="info-item">
          <div class="info-label">User Type</div>
          <div class="info-value">${user.userType === 'technical' ? '👨‍💻 Technical' : '💡 Non-Technical'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Country</div>
          <div class="info-value">${user.country}</div>
        </div>
        <div class="info-item">
          <div class="info-label">University</div>
          <div class="info-value">${user.university}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Swipes Remaining</div>
          <div class="info-value">${user.swipesRemaining} / 20</div>
        </div>
        ${user.rating > 0 ? `
          <div class="info-item">
            <div class="info-label">Rating</div>
            <div class="info-value">⭐ ${user.rating.toFixed(1)} (${user.ratingCount} ratings)</div>
          </div>
        ` : ''}
        <div class="info-item">
          <div class="info-label">Account Type</div>
          <div class="info-value">${user.isPremium ? '✨ Premium' : '🆓 Free'}</div>
        </div>
      </div>
      ${user.bio ? `
        <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 12px;">
          <div class="info-label">Bio</div>
          <p style="margin-top: 0.5rem;">${user.bio}</p>
        </div>
      ` : ''}
    </div>
  `;
}

// Feedback Functions
function showFeedbackModal() {
  document.getElementById('feedback-modal').classList.remove('hidden');
}

function hideFeedbackModal() {
  document.getElementById('feedback-modal').classList.add('hidden');
  document.getElementById('feedback-form').reset();
}

async function handleFeedback(e) {
  e.preventDefault();
  const message = document.getElementById('feedback-message').value;

  try {
    await API.feedback.submit(message);
    alert('Thank you for your feedback!');
    hideFeedbackModal();
  } catch (error) {
    alert(error.message);
  }
}

// Initialize App
async function init() {
  initTheme();

  // Start with auth page visible while checking login status
  showPage('signin');

  // Check if user is logged in
  try {
    const user = await API.auth.getCurrentUser();
    state.user = user;
    showPage('main');
    showView('discover');
  } catch (error) {
    // User not logged in, stay on signin page
    showPage('signin');
  }

  // Event Listeners
  document.getElementById('signin-form').addEventListener('submit', handleSignin);
  document.getElementById('signup-form').addEventListener('submit', handleSignup);
  document.getElementById('signout-btn').addEventListener('click', handleSignout);

  document.getElementById('goto-signup').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('signup');
  });

  document.getElementById('goto-signin').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('signin');
  });

  // Theme toggles
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });

  // Swipe actions
  document.getElementById('like-btn').addEventListener('click', () => handleSwipe(true));
  document.getElementById('reject-btn').addEventListener('click', () => handleSwipe(false));

  // Match modal
  document.getElementById('close-match-modal').addEventListener('click', () => {
    closeMatchModal();
    showView('matches');
  });

  // Feedback
  document.getElementById('feedback-btn').addEventListener('click', showFeedbackModal);
  document.getElementById('cancel-feedback').addEventListener('click', hideFeedbackModal);
  document.getElementById('feedback-form').addEventListener('submit', handleFeedback);

  // Premium upgrade
  document.getElementById('upgrade-btn').addEventListener('click', () => {
    alert('Premium features coming soon! Unlimited swipes, see who likes you, and more!');
  });
}

// Make selectMatch global
window.selectMatch = selectMatch;

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
