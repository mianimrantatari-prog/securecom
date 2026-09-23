let cart = [];
let currentProduct = null;
let currentAuthRole = 'customer';
let loggedInUser = JSON.parse(localStorage.getItem('securecom_user')) || null;
let allOrdersHistory = JSON.parse(localStorage.getItem('securecom_orders')) || [];
let registeredUsersDB = JSON.parse(localStorage.getItem('securecom_users_db')) || [];

// Master Products Database for Live Search
const productsDatabase = [
  { title: "IMOU AOV PT 10MP (5MP+5MP) With Solar Panel", img: "hero-camera.png", category: "Solar 4G", desc: "Solar Panel 360 PTZ Outdoor Security Camera with IP66 Weatherproof." },
  { title: "IMOU Ranger 2 Pro WiFi Camera 2K 3MP", img: "hero-camera-2.png", category: "Dome Cameras", desc: "Indoor Smart Security Camera with Human/Pet Detection, Privacy Mode." },
  { title: "Imou Ranger 2 Pro 8MP 4K Indoor WiFi Color Camera", img: "hero-camera-3.png", category: "PTZ Cameras", desc: "High-definition 4K indoor camera with full color night vision." },
  { title: "IMOU 10CH Wired Smart NVR N110", img: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80", category: "NVR Security Kits", desc: "10-CH Wire Smart Network Video Recorder with Remote Monitoring." }
];

const countryStatesData = {
  "Pakistan": ["Punjab", "Sindh", "KPK", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Kashmir"],
  "United States": ["California", "New York", "Texas", "Florida", "Illinois", "Washington", "Nevada", "Ohio", "Pennsylvania"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Fujairah", "Ras Al Khaimah", "Umm Al Quwain"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  "Saudi Arabia": ["Riyadh", "Makkah", "Madinah", "Eastern Province", "Asir", "Tabuk", "Jazan"],
  "Poland": ["Masovian", "Lesser Poland", "Greater Poland", "Lower Silesian", "Pomeranian", "Łódź", "Lublin"]
};

const allWorldCountries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", 
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", 
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", 
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", 
  "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", 
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", 
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", 
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", 
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", 
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", 
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", 
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", 
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", 
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", 
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", 
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", 
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", 
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", 
  "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

function showPage(pageId) {
  document.querySelectorAll('.page-view').forEach(v => v.style.display = 'none');
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.style.display = 'block';
    window.scrollTo(0, 0);
  }
  if(pageId === 'checkout') {
    populateCountriesDropdown();
    renderCheckoutSummary();
    updateStatesList();
  }
}

function populateCountriesDropdown() {
  const countrySelect = document.getElementById('chk_country');
  if(!countrySelect || countrySelect.options.length > 0) return;

  let html = '';
  allWorldCountries.forEach(c => {
    html += `<option value="${c}" ${c === 'Pakistan' ? 'selected' : ''}>${c}</option>`;
  });
  countrySelect.innerHTML = html;
}

function updateStatesList() {
  const countrySelect = document.getElementById('chk_country');
  const stateSelect = document.getElementById('chk_state');
  if(!countrySelect || !stateSelect) return;

  const selectedCountry = countrySelect.value;
  let states = countryStatesData[selectedCountry];
  if(!states) {
    states = [`${selectedCountry} Capital Region`, `North ${selectedCountry}`, `South ${selectedCountry}`, `Central Province`];
  }
  
  let optionsHtml = '';
  states.forEach(st => {
    optionsHtml += `<option value="${st}">${st}</option>`;
  });
  stateSelect.innerHTML = optionsHtml;
}

function showCategory(catId) {
  showPage('products');
}

function openProductDetail(title, img, desc) {
  currentProduct = { title, img, desc };
  document.getElementById('detailTitle').innerText = title;
  document.getElementById('detailImg').src = img;
  document.getElementById('detailDesc').innerText = desc;
  showPage('detail');
}

function toggleCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartDrawerOverlay');
  const isOpen = drawer.style.transform === 'translateX(0px)';
  
  if(isOpen) {
    drawer.style.transform = 'translateX(100%)';
    overlay.style.display = 'none';
  } else {
    drawer.style.transform = 'translateX(0px)';
    overlay.style.display = 'block';
    renderDrawerCart();
  }
}

function quickAddToCart(title, img, specs) {
  const existing = cart.find(item => item.title === title);
  if(existing) {
    existing.qty += 1;
  } else {
    cart.push({ title, img, specs: specs || 'Verified Security Device', qty: 1 });
  }
  updateCartCount();
  toggleCartDrawer();
}

function addToCartFromDetail() {
  if(currentProduct) {
    const existing = cart.find(item => item.title === currentProduct.title);
    if(existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...currentProduct, specs: 'Professional AI Security Unit', qty: 1 });
    }
    updateCartCount();
    toggleCartDrawer();
  }
}

function updateCartCount() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartItemCount').innerText = totalQty;
  document.getElementById('drawerItemCount').innerText = totalQty;
}

function changeItemQty(index, delta) {
  cart[index].qty += delta;
  if(cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartCount();
  renderDrawerCart();
}

function removeCartItem(index) {
  cart.splice(index, 1);
  updateCartCount();
  renderDrawerCart();
}

function renderDrawerCart() {
  const container = document.getElementById('drawerCartItems');
  if(cart.length === 0) {
    container.innerHTML = '<p style="text-align:center; color: #64748b; padding: 40px 0;">Your cart is empty.</p>';
    return;
  }
  let html = '';
  cart.forEach((item, index) => {
    html += `<div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.4); padding-bottom:15px; background:rgba(255,255,255,0.6); padding:12px; border-radius:14px;">
      <div style="display:flex; gap:12px;">
        <img src="${item.img}" alt="Product" style="width:65px; height:65px; object-fit:contain; border-radius:10px; background:#fff; border:1px solid #e2e8f0; padding:4px;" />
        <div>
          <h5 style="font-size:0.92rem; font-weight:800; margin-bottom:3px; color:#0f172a; line-height:1.3; max-width:180px;">${item.title}</h5>
          <p style="font-size:0.75rem; color:#64748b; margin-bottom:8px; font-weight:600;">Specs: ${item.specs}</p>
          <div style="display:flex; align-items:center; gap:8px;">
            <button onclick="changeItemQty(${index}, -1)" style="width:26px; height:26px; border-radius:50%; border:1px solid var(--border-light); background:#fff; cursor:pointer; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.05);">-</button>
            <span style="font-weight:800; font-size:0.9rem;">${item.qty}</span>
            <button onclick="changeItemQty(${index}, 1)" style="width:26px; height:26px; border-radius:50%; border:1px solid var(--border-light); background:#fff; cursor:pointer; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.05);">+</button>
          </div>
        </div>
      </div>
      <button onclick="removeCartItem(${index})" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:1.1rem; padding:5px;"><i class="fa-solid fa-trash"></i></button>
    </div>`;
  });
  container.innerHTML = html;
}

// Fully Expanded Order Summary (Showing full product name and details clearly)
function renderCheckoutSummary() {
  const container = document.getElementById('checkoutSummaryList');
  if(cart.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);">No items in cart.</p>';
    return;
  }
  let html = '';
  cart.forEach((item) => {
    html += `<div style="display:flex; align-items:flex-start; gap:16px; margin-bottom:18px; background:rgba(255,255,255,0.9); padding:16px; border-radius:16px; border:1px solid #e2e8f0; box-shadow:0 4px 15px rgba(0,0,0,0.02);">
      <img src="${item.img}" alt="Product" style="width:70px; height:70px; object-fit:contain; border-radius:10px; background:#fff; border:1px solid #e2e8f0; padding:4px; flex-shrink:0;" />
      <div style="flex-grow: 1;">
        <h4 style="font-size:0.95rem; margin-bottom:6px; font-weight:800; color:#0f172a; line-height:1.3;">${item.title}</h4>
        <p style="font-size:0.8rem; color:#64748b; margin-bottom:8px; line-height:1.4;">${item.specs}</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.85rem; color:var(--red); font-weight:800;">Quantity: ${item.qty}</span>
          <span style="font-size:0.75rem; background:#f1f5f9; padding:2px 8px; border-radius:99px; font-weight:700; color:#334155;">Verified Device</span>
        </div>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

function buyNowDirect() {
  if(currentProduct) {
    const phone = "923211222500";
    const message = `🛡️ *Product Inquiry from SecureCom*%0A📦 *Product:* ${currentProduct.title}%0A📍 *Please share pricing and details.*`;
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  }
}

function toggleWishlist(btn) {
  const icon = btn.querySelector('i');
  if(icon.classList.contains('fa-regular')) {
    icon.classList.remove('fa-regular');
    icon.classList.add('fa-solid');
    icon.style.color = '#dc2626';
  } else {
    icon.classList.remove('fa-solid');
    icon.classList.add('fa-regular');
    icon.style.color = 'inherit';
  }
}

function submitWhatsAppOrder(e) {
  e.preventDefault();
  if(cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const fname = document.getElementById('chk_fname').value;
  const lname = document.getElementById('chk_lname').value;
  const phone = document.getElementById('chk_phone').value;
  const email = document.getElementById('chk_email').value;
  const address = document.getElementById('chk_address').value;
  const city = document.getElementById('chk_city').value;
  const state = document.getElementById('chk_state').value;
  const country = document.getElementById('chk_country').value;
  const postal = document.getElementById('chk_postal').value;

  let itemsText = cart.map((i, idx) => `${idx + 1}. ${i.title} (${i.specs}) - Qty: ${i.qty}`).join('%0A');

  const newOrder = {
    date: new Date().toLocaleDateString(),
    customer: `${fname} ${lname}`,
    phone: phone,
    items: cart.map(i => `${i.title} (x${i.qty})`).join(', ')
  };
  allOrdersHistory.push(newOrder);
  localStorage.setItem('securecom_orders', JSON.stringify(allOrdersHistory));

  const businessPhone = "923211222500";
  const message = `🛡️ *New Order Inquiry - SecureCom*%0A%0A👤 *Customer Details:*%0A• Name: ${fname} ${lname}%0A• Mobile: ${phone}%0A• Email: ${email || 'N/A'}%0A• Address: ${address}, ${city}, ${state}, ${country} (${postal})%0A%0A📦 *Ordered Products:*%0A${itemsText}%0A%0A📍 *Please confirm availability and final pricing.*`;

  window.open(`https://wa.me/${businessPhone}?text=${message}`, "_blank");
}

function toggleSearchOverlay() {
  const overlay = document.getElementById('searchOverlay');
  overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex';
  if(overlay.style.display === 'flex') {
    document.getElementById('liveSearchInput').focus();
  }
}

function performLiveSearch(query) {
  const container = document.getElementById('searchResultsContainer');
  if(!query.trim()) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Start typing to search products...</p>';
    return;
  }
  const filtered = productsDatabase.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()));
  if(filtered.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No security products found matching your query.</p>';
    return;
  }
  let html = '';
  filtered.forEach(p => {
    html += `<div onclick="openProductDetail('${p.title}', '${p.img}', '${p.desc}'); toggleSearchOverlay();" style="display:flex; align-items:center; gap:15px; padding:10px; border-bottom:1px solid #e2e8f0; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='rgba(248,250,252,0.8)'" onmouseout="this.style.background='transparent'">
      <img src="${p.img}" alt="Cam" style="width:45px; height:45px; object-fit:contain;" />
      <div>
        <h5 style="font-size:0.9rem; font-weight:700; margin-bottom:2px;">${p.title}</h5>
        <span style="font-size:0.75rem; color:var(--red); font-weight:600;">${p.category}</span>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

// Profile & Auth Logic
function openAuthModal() {
  const modal = document.getElementById('authModal');
  modal.style.display = 'flex';
  if(loggedInUser) {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('userProfileView').style.display = 'block';
    renderUserProfileData();
  } else {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('userProfileView').style.display = 'none';
    switchToLogin();
  }
}

function closeAuthModal() {
  document.getElementById('authModal').style.display = 'none';
}

function setAuthRole(role) {
  currentAuthRole = role;
  const btnCust = document.getElementById('btnRoleCust');
  const btnAdmin = document.getElementById('btnRoleAdmin');
  
  if(role === 'customer') {
    btnCust.className = 'portal-switch-btn active-portal';
    btnAdmin.className = 'portal-switch-btn inactive-portal';
    document.getElementById('authModalTitle').innerText = 'Customer Portal';
  } else {
    btnAdmin.className = 'portal-switch-btn active-portal';
    btnCust.className = 'portal-switch-btn inactive-portal';
    document.getElementById('authModalTitle').innerText = 'Admin Management Portal';
  }
}

function switchToSignUp() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
}

function switchToLogin() {
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

function handleSignUpSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  const existing = registeredUsersDB.find(u => u.email === email);
  if(existing) {
    alert('Account already exists with this Gmail! Please login.');
    switchToLogin();
    return;
  }

  const newUser = { name, email, password, role: currentAuthRole, avatar: '' };
  registeredUsersDB.push(newUser);
  localStorage.setItem('securecom_users_db', JSON.stringify(registeredUsersDB));

  alert(`Account successfully created! A confirmation link has been sent to your Gmail (${email}). Please log in.`);
  switchToLogin();
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const found = registeredUsersDB.find(u => u.email === email && u.password === password);
  if(!found) {
    loggedInUser = { email, role: currentAuthRole, name: email.split('@')[0], avatar: '' };
  } else {
    loggedInUser = found;
  }

  localStorage.setItem('securecom_user', JSON.stringify(loggedInUser));
  openAuthModal();
}

function socialLogin(provider) {
  loggedInUser = {
    email: `user_${provider.toLowerCase()}@gmail.com`,
    role: currentAuthRole,
    name: `${provider} User`,
    avatar: ''
  };
  localStorage.setItem('securecom_user', JSON.stringify(loggedInUser));
  openAuthModal();
}

function uploadProfilePic(e) {
  const file = e.target.files[0];
  if(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const base64Img = event.target.result;
      loggedInUser.avatar = base64Img;
      localStorage.setItem('securecom_user', JSON.stringify(loggedInUser));
      renderUserProfileData();
    };
    reader.readAsDataURL(file);
  }
}

function renderUserProfileData() {
  document.getElementById('profileDisplayName').innerText = loggedInUser.name + (loggedInUser.role === 'admin' ? ' (Admin)' : ' (Customer)');
  document.getElementById('profileDisplayEmail').innerText = loggedInUser.email;
  
  const avatarImg = document.getElementById('userAvatarImg');
  const avatarIcon = document.getElementById('userAvatarIcon');
  if(loggedInUser.avatar) {
    avatarImg.src = loggedInUser.avatar;
    avatarImg.style.display = 'block';
    avatarIcon.style.display = 'none';
  } else {
    avatarImg.style.display = 'none';
    avatarIcon.style.display = 'block';
  }

  if(loggedInUser.role === 'admin') {
    document.getElementById('customerHistoryBox').style.display = 'none';
    document.getElementById('adminDashboardBox').style.display = 'block';
    document.getElementById('adminOrderCount').innerText = allOrdersHistory.length;
  } else {
    document.getElementById('customerHistoryBox').style.display = 'block';
    document.getElementById('adminDashboardBox').style.display = 'none';
    
    const listContainer = document.getElementById('customerOrdersList');
    if(allOrdersHistory.length === 0) {
      listContainer.innerHTML = '<p>No orders placed yet.</p>';
    } else {
      let h = '';
      allOrdersHistory.slice(-5).reverse().forEach(o => {
        h += `<div style="background:rgba(248,250,252,0.8); padding:8px; border-radius:8px; margin-bottom:6px;"><strong>${o.date}</strong>: ${o.items}</div>`;
      });
      listContainer.innerHTML = h;
    }
  }
}

function handleLogout() {
  loggedInUser = null;
  localStorage.removeItem('securecom_user');
  openAuthModal();
}

// Slider
const cameraSlides = [
  { img: "hero-camera.png", title: "3D AI Security Camera - Model 01" },
  { img: "hero-camera-2.png", title: "4K Dual-Lens PTZ - Model 02" },
  { img: "hero-camera-3.png", title: "Solar 4G Outdoor Cam - Model 03" }
];

let currentCamIndex = 0;
const heroSliderImg = document.getElementById("heroSliderImg");
const camTitleText = document.getElementById("camTitleText");

if (heroSliderImg) {
  setInterval(() => {
    currentCamIndex = (currentCamIndex + 1) % cameraSlides.length;
    const slide = cameraSlides[currentCamIndex];
    heroSliderImg.style.opacity = 0;
    setTimeout(() => {
      heroSliderImg.src = slide.img;
      if (camTitleText) camTitleText.innerText = slide.title;
      heroSliderImg.style.opacity = 1;
    }, 400);
  }, 5000);
}