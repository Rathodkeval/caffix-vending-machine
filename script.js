// CAFFIX Luxury Kiosk Controller

const FLAVOURS = {
  classic: {
    id: 'classic',
    name: 'Reserve Espresso',
    tagline: 'Rich, aromatic & intense pure arabica blend',
    desc: 'An exquisite double shot espresso extracted from single-origin dark roasted Arabica beans, showcasing a dense golden crema, robust body, and notes of dark chocolate.',
    basePrice: 25,
    image: 'assets/classic_coffee.png',
    tags: ['100% Arabica', 'Intense Roast', 'Double Espresso', 'Crema Gold']
  },
  vanilla: {
    id: 'vanilla',
    name: 'Vanilla Bean Latte',
    tagline: 'Creamy espresso with Madagascar vanilla beans',
    desc: 'A velvety layers of smooth espresso and micro-foamed milk infused with genuine Madagascar vanilla pod syrup, creating a balanced and comforting beverage.',
    basePrice: 25,
    image: 'assets/vanilla_coffee.png',
    tags: ['Madagascar Vanilla', 'Velvet Foam', 'Medium Roast', 'Sweet Aroma']
  },
  hazelnut: {
    id: 'hazelnut',
    name: 'Hazelnut Macchiato',
    tagline: 'Bold espresso layered with roasted hazelnut',
    desc: 'Our signature dark-roasted espresso shot layered over steamed milk and drizzled with a rich, roasted hazelnut cream infusion, giving a delicious nutty finish.',
    basePrice: 25,
    image: 'assets/hazelnut_coffee.png',
    tags: ['Roasted Hazelnut', 'Dense Microfoam', 'Bold Notes', 'Satin Finish']
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1);

  if (page === 'flavour-details.html') {
    initDetailsPage();
  } else if (page === 'payment.html') {
    initPaymentPage();
  } else if (page === 'success.html') {
    initSuccessPage();
  } else if (page === 'failure.html') {
    initFailurePage();
  }
});

// Navigation actions
function navigateToSelection() {
  window.location.href = 'flavour-selection.html';
}

function navigateToHome() {
  window.location.href = 'index.html';
}

// Select flavor and proceed to details/customization
function selectFlavour(id) {
  if (FLAVOURS[id]) {
    localStorage.setItem('selectedFlavour', id);
    // Set default customizations
    localStorage.setItem('cupSize', 'Regular');
    localStorage.setItem('sugarLevel', 'Medium');
    localStorage.setItem('coffeeStrength', 'Medium');
    window.location.href = 'flavour-details.html';
  }
}

// Details Page Controller (Cup Size, Sugar, Strength)
function initDetailsPage() {
  const flavourId = localStorage.getItem('selectedFlavour');
  const flavour = FLAVOURS[flavourId];

  if (!flavour) {
    navigateToSelection();
    return;
  }

  // Populate basic flavor details
  document.getElementById('coffee-name').textContent = flavour.name;
  document.getElementById('coffee-desc').textContent = flavour.desc;
  document.getElementById('coffee-image').style.backgroundImage = `url('${flavour.image}')`;

  // Render Tags
  const tagsContainer = document.getElementById('tags-container');
  tagsContainer.innerHTML = '';
  flavour.tags.forEach(tag => {
    const tagEl = document.createElement('div');
    tagEl.className = 'detail-tag';
    tagEl.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <span>${tag}</span>
    `;
    tagsContainer.appendChild(tagEl);
  });

  // Calculate and update prices based on size Selection
  function updatePrice() {
    const selectedSize = localStorage.getItem('cupSize') || 'Regular';
    const priceVal = selectedSize === 'Large' ? flavour.basePrice + 10 : flavour.basePrice;
    document.getElementById('coffee-price').textContent = `₹${priceVal}`;
    localStorage.setItem('currentPrice', priceVal);
  }

  // Wire Customization Toggles
  setupToggleGroup('size-toggles', 'cupSize', updatePrice);
  setupToggleGroup('sugar-toggles', 'sugarLevel');
  setupToggleGroup('strength-toggles', 'coffeeStrength');

  // Initial price calculation
  updatePrice();

  // Buy now routing
  const buyBtn = document.getElementById('buy-now-btn');
  buyBtn.addEventListener('click', () => {
    window.location.href = 'payment.html';
  });
}

// Toggle selection helper
function setupToggleGroup(containerId, storageKey, callback = null) {
  const container = document.getElementById(containerId);
  const buttons = container.querySelectorAll('.btn-toggle');
  
  const currentVal = localStorage.getItem(storageKey) || 'Medium';
  buttons.forEach(btn => {
    const btnText = btn.getAttribute('data-value') || btn.childNodes[0].textContent.trim();
    if (btnText === currentVal) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      localStorage.setItem(storageKey, btnText);
      if (callback) callback();
    });
  });
}

// Payment Page Controller
function initPaymentPage() {
  const flavourId = localStorage.getItem('selectedFlavour');
  const flavour = FLAVOURS[flavourId];

  if (!flavour) {
    navigateToHome();
    return;
  }

  // Populate order summary
  const price = localStorage.getItem('currentPrice') || flavour.basePrice;
  document.getElementById('summary-name').textContent = flavour.name;
  document.getElementById('summary-price').textContent = `₹${price}`;
  document.getElementById('summary-img').style.backgroundImage = `url('${flavour.image}')`;
  
  // Customizations recap
  const size = localStorage.getItem('cupSize') || 'Regular';
  const sugar = localStorage.getItem('sugarLevel') || 'Medium';
  const strength = localStorage.getItem('coffeeStrength') || 'Medium';
  document.getElementById('recap-size').textContent = size;
  document.getElementById('recap-sugar').textContent = sugar;
  document.getElementById('recap-strength').textContent = strength;

  // Generate Unique Order ID
  const orderNum = 'CFX-' + Math.floor(1000 + Math.random() * 9000);
  document.getElementById('order-number').textContent = orderNum;
  localStorage.setItem('lastOrderId', orderNum);

  // Live Gateway status sequence
  const logEl = document.getElementById('log-text');
  const logs = [
    { delay: 0, text: 'Connecting to Secure Gateway...' },
    { delay: 1800, text: 'Generating UPI QR Transaction Code...' },
    { delay: 3500, text: 'Awaiting Payment Verification (Scan QR)...' }
  ];

  logs.forEach(log => {
    setTimeout(() => {
      if (logEl) logEl.textContent = log.text;
    }, log.delay);
  });

  // Automatically trigger payment approval after 9 seconds of waiting (simulates user scanning QR)
  const autoPayTimer = setTimeout(() => {
    logEl.textContent = 'Payment Approved! Starting brewing...';
    logEl.style.color = 'var(--color-success)';
    setTimeout(() => {
      window.location.href = 'success.html';
    }, 1200);
  }, 9500);

  // Interactive buttons
  document.getElementById('pay-now-btn').addEventListener('click', () => {
    clearTimeout(autoPayTimer);
    window.location.href = 'success.html';
  });

  document.getElementById('cancel-btn').addEventListener('click', () => {
    clearTimeout(autoPayTimer);
    window.location.href = 'index.html';
  });
}

// Success (Brewing/Preparing) Page Controller
function initSuccessPage() {
  const fill = document.getElementById('progress-fill');
  const stepText = document.getElementById('brewing-step-text');
  const tempVal = document.getElementById('spec-temp');
  const pressVal = document.getElementById('spec-pressure');
  const statusSubtitle = document.getElementById('status-subtitle');
  
  const flavourId = localStorage.getItem('selectedFlavour') || 'classic';

  const steps = [
    { progress: 10, text: 'Preheating espresso boilers...', temp: '42°C', press: '0.0 Bar' },
    { progress: 25, text: 'Grinding fresh select beans...', temp: '75°C', press: '0.2 Bar' },
    { progress: 40, text: 'Compressing coffee grounds...', temp: '88°C', press: '1.2 Bar' },
    { progress: 60, text: 'Pre-infusing water into coffee...', temp: '92°C', press: '4.5 Bar' },
    { progress: 75, text: 'Extracting rich espresso crema...', temp: '92°C', press: '9.0 Bar' },
    { progress: 90, text: flavourId === 'classic' ? 'Topping up double shot...' : 'Frothing creamy milk layers...', temp: '91°C', press: '8.2 Bar' },
    { progress: 98, text: 'Finishing preparation...', temp: '85°C', press: '2.0 Bar' },
    { progress: 100, text: 'Preparation Completed!', temp: '70°C', press: '0.0 Bar' }
  ];

  let currentStep = 0;
  
  function executeBrewStep() {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      fill.style.width = `${step.progress}%`;
      stepText.textContent = step.text;
      
      if (tempVal) tempVal.textContent = step.temp;
      if (pressVal) pressVal.textContent = step.press;
      
      let delay = 900;
      if (currentStep === 4) delay = 1600; // Extraction phase takes longer
      if (currentStep === 5) delay = 1200; // Milk phase
      
      currentStep++;
      setTimeout(executeBrewStep, delay);
    } else {
      statusSubtitle.textContent = 'Dispensing Finished! Enjoy!';
      stepText.textContent = 'Please collect your premium beverage from the tray.';
      stepText.style.color = 'var(--color-gold-bright)';
      
      setTimeout(() => {
        navigateToHome();
      }, 4500);
    }
  }

  // Start sequence
  setTimeout(executeBrewStep, 600);
}

// Failure Page
function initFailurePage() {
  document.getElementById('try-again-btn').addEventListener('click', () => {
    window.location.href = 'payment.html';
  });

  document.getElementById('home-btn').addEventListener('click', () => {
    navigateToHome();
  });
}
