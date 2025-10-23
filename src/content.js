// State
let buttonVisible = false;
let button = null;
let deleteZone = null;
let isDragging = false;
let hasMoved = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;

// Constants
const DELETE_ZONE_SIZE = 100; // Size of the delete zone circle
const DELETE_ZONE_THRESHOLD = 80; // Distance to trigger deletion

// Create the floating fullscreen button
function createButton() {
  if (button) return button;
  
  button = document.createElement('div');
  button.id = 'fullscreen-toggle-btn';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" fill="white">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    </svg>
  `;
  
  // Styles
  Object.assign(button.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: '2147483647',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    touchAction: 'none',
    userSelect: 'none'
  });
  
  // Hover effect
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    button.style.transform = 'scale(1.1)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    button.style.transform = 'scale(1)';
  });
  
  document.body.appendChild(button);
  
  // Attach event handlers AFTER button is in DOM
  button.addEventListener('pointerdown', handlePointerDown);
  document.addEventListener('pointermove', handlePointerMove);
  document.addEventListener('pointerup', handlePointerUp);
  document.addEventListener('pointercancel', handlePointerUp);
  
  return button;
}

// Create delete zone in center of screen
function createDeleteZone() {
  if (deleteZone) return deleteZone;
  
  deleteZone = document.createElement('div');
  deleteZone.id = 'fullscreen-delete-zone';
  deleteZone.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 0 24 24" fill="white">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  `;
  
  Object.assign(deleteZone.style, {
    position: 'fixed',
    left: '50%',
    top: '50%',
    width: DELETE_ZONE_SIZE + 'px',
    height: DELETE_ZONE_SIZE + 'px',
    marginLeft: (-DELETE_ZONE_SIZE / 2) + 'px',
    marginTop: (-DELETE_ZONE_SIZE / 2) + 'px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    border: '3px dashed rgba(255, 0, 0, 0.6)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '2147483646',
    pointerEvents: 'none',
    transition: 'all 0.2s ease'
  });
  
  document.body.appendChild(deleteZone);
  return deleteZone;
}

// Show delete zone
function showDeleteZone() {
  if (!deleteZone) createDeleteZone();
  deleteZone.style.display = 'flex';
}

// Hide delete zone
function hideDeleteZone() {
  if (deleteZone) {
    deleteZone.style.display = 'none';
  }
}

// Check if button is over delete zone
function isOverDeleteZone() {
  if (!button || !deleteZone) return false;
  
  const buttonRect = button.getBoundingClientRect();
  const buttonCenterX = buttonRect.left + buttonRect.width / 2;
  const buttonCenterY = buttonRect.top + buttonRect.height / 2;
  
  const screenCenterX = window.innerWidth / 2;
  const screenCenterY = window.innerHeight / 2;
  
  const distance = Math.sqrt(
    Math.pow(buttonCenterX - screenCenterX, 2) +
    Math.pow(buttonCenterY - screenCenterY, 2)
  );
  
  return distance < DELETE_ZONE_THRESHOLD;
}

// Update delete zone visual feedback
function updateDeleteZoneFeedback() {
  if (!deleteZone) return;
  
  if (isOverDeleteZone()) {
    deleteZone.style.backgroundColor = 'rgba(255, 0, 0, 0.6)';
    deleteZone.style.transform = 'scale(1.1)';
  } else {
    deleteZone.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    deleteZone.style.transform = 'scale(1)';
  }
}

// Snap button to nearest edge
function snapToEdge() {
  if (!button) return;
  
  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Calculate distances to each edge
  const distToLeft = centerX;
  const distToRight = window.innerWidth - centerX;
  const distToTop = centerY;
  const distToBottom = window.innerHeight - centerY;
  
  // Find nearest edge
  const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
  
  // Snap to nearest edge with some padding
  const padding = 20;
  
  if (minDist === distToLeft) {
    // Snap to left edge
    button.style.left = padding + 'px';
    button.style.top = Math.max(padding, Math.min(centerY - rect.height / 2, window.innerHeight - rect.height - padding)) + 'px';
  } else if (minDist === distToRight) {
    // Snap to right edge
    button.style.left = (window.innerWidth - rect.width - padding) + 'px';
    button.style.top = Math.max(padding, Math.min(centerY - rect.height / 2, window.innerHeight - rect.height - padding)) + 'px';
  } else if (minDist === distToTop) {
    // Snap to top edge
    button.style.top = padding + 'px';
    button.style.left = Math.max(padding, Math.min(centerX - rect.width / 2, window.innerWidth - rect.width - padding)) + 'px';
  } else {
    // Snap to bottom edge
    button.style.top = (window.innerHeight - rect.height - padding) + 'px';
    button.style.left = Math.max(padding, Math.min(centerX - rect.width / 2, window.innerWidth - rect.width - padding)) + 'px';
  }
  
  button.style.right = 'auto';
  button.style.transform = 'none';
}

// Drag event handlers
function handlePointerDown(e) {
  // Check if the event target is the button or inside it
  if (!button || (!button.contains(e.target) && e.target !== button)) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  isDragging = true;
  hasMoved = false;
  startX = e.clientX;
  startY = e.clientY;
  
  const rect = button.getBoundingClientRect();
  currentX = rect.left;
  currentY = rect.top;
  
  button.style.cursor = 'grabbing';
  button.style.transition = 'none'; // Disable transitions during drag
}

function handlePointerMove(e) {
  if (!isDragging) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;
  
  // Check if user has moved enough to be considered dragging (5px threshold)
  if (!hasMoved && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
    hasMoved = true;
    showDeleteZone();
  }
  
  if (hasMoved) {
    const newX = currentX + deltaX;
    const newY = currentY + deltaY;
    
    // Allow free movement during drag
    const maxX = window.innerWidth - button.offsetWidth;
    const maxY = window.innerHeight - button.offsetHeight;
    
    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));
    
    // Use transform for better performance
    button.style.transform = `translate(${clampedX - currentX}px, ${clampedY - currentY}px)`;
    
    // Update delete zone feedback
    updateDeleteZoneFeedback();
  }
}

function handlePointerUp(e) {
  if (!isDragging) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  // Hide delete zone
  hideDeleteZone();
  
  if (!hasMoved) {
    // It was a tap/click - toggle fullscreen
    toggleFullscreen();
  } else {
    // It was a drag - check if over delete zone
    if (isOverDeleteZone()) {
      // Animate button to center and remove
      button.style.transition = 'all 0.3s ease-out';
      button.style.transform = `translate(${window.innerWidth / 2 - currentX - button.offsetWidth / 2}px, ${window.innerHeight / 2 - currentY - button.offsetHeight / 2}px) scale(0)`;
      button.style.opacity = '0';
      
      setTimeout(() => {
        removeButton();
      }, 300);
    } else {
      // Snap to nearest edge
      const rect = button.getBoundingClientRect();
      button.style.left = rect.left + 'px';
      button.style.top = rect.top + 'px';
      button.style.right = 'auto';
      button.style.transform = 'none';
      button.style.transition = 'all 0.3s ease';
      
      // Wait a frame then snap
      requestAnimationFrame(() => {
        snapToEdge();
      });
    }
  }
  
  isDragging = false;
  hasMoved = false;
  button.style.cursor = 'pointer';
}

// Toggle fullscreen
function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
  } else {
    document.documentElement.requestFullscreen().catch(err => console.error("Error entering fullscreen:", err));
  }
}

// Remove button and clean up
function removeButton() {
  if (button) {
    button.remove();
    button = null;
  }
  if (deleteZone) {
    deleteZone.remove();
    deleteZone = null;
  }
  buttonVisible = false;
  
  // Remove event listeners
  document.removeEventListener('pointermove', handlePointerMove);
  document.removeEventListener('pointerup', handlePointerUp);
  document.removeEventListener('pointercancel', handlePointerUp);
}

// Show/hide button
function toggleButtonVisibility() {
  if (!button) {
    createButton();
    // Snap to edge on first show
    requestAnimationFrame(() => {
      snapToEdge();
    });
  }
  
  buttonVisible = !buttonVisible;
  button.style.display = buttonVisible ? 'flex' : 'none';
}

// Hide button when entering fullscreen
function handleFullscreenChange() {
  if (!button) return;
  
  if (document.fullscreenElement) {
    // Entered fullscreen - hide button
    button.style.display = 'none';
  } else {
    // Exited fullscreen - show button if it was visible
    if (buttonVisible) {
      button.style.display = 'flex';
    }
  }
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', handleFullscreenChange);

// Listen for messages from background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleButton") {
    toggleButtonVisibility();
    sendResponse({ success: true, buttonVisible: buttonVisible });
  }
  return true; // Keep message channel open for async response
});