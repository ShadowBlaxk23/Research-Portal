/* ==========================================
   RESEARCH TERMINAL - MAIN FUNCTIONALITY
   ========================================== */

// User credentials and custom status lists
const USERS = {
  moonbeam: {
    password: "phases",
    displayName: "🌙 Moonbeam",
    icon: "🌙",
    theme: "moonbeam-theme",
    statuses: [
      "Active",
      "Inactive",
      "Moonbeam in Orbit",
      "Casting glitter-based spells",
      "Probably climbing something I shouldn't",
      "Powered by caffeine and spite",
      "Currently feral",
      "Cosmic menace (affectionate)",
      "Distracting Kat (mission success guaranteed)",
      "Chaotic-neutral with sparkles",
      "Up to something. Don't ask."
    ]
  },
  
  katalyst: {
    password: "chestpains",
    displayName: "✦ Katalyst",
    icon: "✦",
    theme: "katalyst-theme",
    statuses: [
      "Active",
      "Inactive",
      "Running diagnostics on Luna",
      "Pretending I'm normal",
      "Held together by caffeine and willpower",
      "Stabilizing the gremlin",
      "Absolutely judging your code",
      "Professional problem magnet",
      "No thoughts. Only joints cracking.",
      "System Error: Knee Detected"
    ]
  }
};

/* ==========================================
   LOGIN FUNCTIONALITY
   ========================================== */

function login() {
  const username = document.getElementById('username').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim().toLowerCase();
  const errorMsg = document.getElementById('errorMsg');
  
  // Validate credentials
  const user = USERS[username];
  
  if (!user || user.password !== password) {
    showError("Invalid credentials. Access denied.");
    return;
  }
  
  // Store current user
  localStorage.setItem("currentUser", username);
  
  // Apply user's theme
  document.body.className = user.theme;
  
  // Set access icon
  document.getElementById("accessGlyph").textContent = user.icon;
  
  // Auto mode: set status to Active on login
  const statusMode = localStorage.getItem(username + "_statusMode") || "auto";
  if (statusMode === "auto") {
    localStorage.setItem(username + "_status", "Active");
  }
  
  // Show access granted screen
  showAccessGranted(user);
}

function showError(message) {
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.textContent = message;
  errorMsg.classList.add('show');
  
  setTimeout(() => {
    errorMsg.classList.remove('show');
  }, 3000);
}

function showAccessGranted(user) {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("accessGranted").classList.remove("hidden");
  
  // Transition to profile after delay
  setTimeout(() => {
    document.getElementById("accessGranted").classList.add("hidden");
    showProfile(user);
  }, 2000);
}

function showProfile(user) {
  const username = localStorage.getItem("currentUser");
  
  // Show profile page
  document.getElementById("profilePage").classList.remove("hidden");
  document.getElementById("profileName").textContent = user.displayName;
  
  // Load user data
  loadPhotoFromStorage(username);
  loadProfileFields(username);
  loadStatusSystem(username, user.statuses);
}

function logout() {
  const username = localStorage.getItem("currentUser");
  
  // Auto mode: set status to Inactive on logout
  const statusMode = localStorage.getItem(username + "_statusMode") || "auto";
  if (statusMode === "auto") {
    localStorage.setItem(username + "_status", "Inactive");
  }
  
  // Clear current user and reset view
  localStorage.removeItem("currentUser");
  document.body.className = "";
  
  document.getElementById("profilePage").classList.add("hidden");
  document.getElementById("loginBox").classList.remove("hidden");
  
  // Clear login fields
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
}

/* ==========================================
   PASSWORD VISIBILITY TOGGLE
   ========================================== */

function togglePass() {
  const passInput = document.getElementById("password");
  passInput.type = passInput.type === "password" ? "text" : "password";
}

/* ==========================================
   PROFILE PHOTO MANAGEMENT
   ========================================== */

function loadPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const username = localStorage.getItem("currentUser");
    localStorage.setItem(username + "_pic", e.target.result);
    loadPhotoFromStorage(username);
  };
  reader.readAsDataURL(file);
}

function loadPhotoFromStorage(username) {
  const savedPic = localStorage.getItem(username + "_pic");
  const imgEl = document.getElementById("profilePic");
  const placeholderEl = document.getElementById("picLabel");
  
  if (savedPic) {
    imgEl.src = savedPic;
    placeholderEl.style.display = "none";
  } else {
    imgEl.src = "";
    placeholderEl.style.display = "flex";
  }
}

/* ==========================================
   PROFILE FIELDS MANAGEMENT
   ========================================== */

function loadProfileFields(username) {
  const fields = ["codename", "realname", "role", "clearance"];
  
  fields.forEach(field => {
    const input = document.getElementById("field_" + field);
    const savedValue = localStorage.getItem(username + "_" + field);
    
    if (savedValue) {
      input.value = savedValue;
    }
    
    // Save on input
    input.addEventListener("input", () => {
      localStorage.setItem(username + "_" + field, input.value);
    });
  });
}

/* ==========================================
   STATUS SYSTEM
   ========================================== */

function loadStatusSystem(username, statusList) {
  const modeSelect = document.getElementById("statusMode");
  const statusSelect = document.getElementById("field_status");
  
  // Populate status dropdown
  statusSelect.innerHTML = "";
  statusList.forEach(status => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    statusSelect.appendChild(option);
  });
  
  // Load saved mode
  const savedMode = localStorage.getItem(username + "_statusMode") || "auto";
  modeSelect.value = savedMode;
  
  // Load saved statuses
  const savedStatus = localStorage.getItem(username + "_status") || "Inactive";
  const savedManualStatus = localStorage.getItem(username + "_manualStatus") || savedStatus;
  
  // Set correct status based on mode
  if (savedMode === "auto") {
    statusSelect.value = savedStatus;
  } else {
    statusSelect.value = savedManualStatus;
  }
  
  updateStatusUI(savedMode);
  
  // Handle mode changes
  modeSelect.addEventListener("change", () => {
    const newMode = modeSelect.value;
    localStorage.setItem(username + "_statusMode", newMode);
    
    if (newMode === "auto") {
      statusSelect.value = "Active";
      localStorage.setItem(username + "_status", "Active");
    } else {
      const manualStatus = localStorage.getItem(username + "_manualStatus") || "Inactive";
      statusSelect.value = manualStatus;
    }
    
    updateStatusUI(newMode);
  });
  
  // Handle manual status changes
  statusSelect.addEventListener("change", () => {
    if (modeSelect.value === "manual") {
      localStorage.setItem(username + "_manualStatus", statusSelect.value);
      localStorage.setItem(username + "_status", statusSelect.value);
    }
  });
}

function updateStatusUI(mode) {
  const statusSelect = document.getElementById("field_status");
  
  if (mode === "auto") {
    statusSelect.disabled = true;
    statusSelect.style.opacity = "0.5";
  } else {
    statusSelect.disabled = false;
    statusSelect.style.opacity = "1";
  }
}

/* ==========================================
   AUTO-LOGOUT HANDLER
   ========================================== */

window.addEventListener("beforeunload", () => {
  const username = localStorage.getItem("currentUser");
  if (!username) return;
  
  const statusMode = localStorage.getItem(username + "_statusMode") || "auto";
  
  // Auto mode: set to Inactive when leaving
  if (statusMode === "auto") {
    localStorage.setItem(username + "_status", "Inactive");
  }
});

/* ==========================================
   INITIALIZATION
   ========================================== */

// Check if user is already logged in
window.addEventListener("DOMContentLoaded", () => {
  const currentUser = localStorage.getItem("currentUser");
  
  if (currentUser && USERS[currentUser]) {
    const user = USERS[currentUser];
    document.body.className = user.theme;
    
    // Skip login and go straight to profile
    document.getElementById("loginBox").classList.add("hidden");
    showProfile(user);
  }
});