document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('moreFeaturesBtn');
  if (!button) return;

  const SNAP_MARGIN = 12;
  const MOVE_THRESHOLD = 5;
  const targetUrl = button.dataset.href || 'features.html';

  let pointerActive = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let moved = false;

  const ensureAbsolutePosition = () => {
    const rect = button.getBoundingClientRect();
    button.style.left = `${rect.left}px`;
    button.style.top = `${rect.top}px`;
    button.style.right = 'auto';
    button.style.bottom = 'auto';
  };

  const clampPosition = (left, top) => {
    const maxLeft = window.innerWidth - button.offsetWidth - SNAP_MARGIN;
    const maxTop = window.innerHeight - button.offsetHeight - SNAP_MARGIN;
    return {
      left: Math.min(Math.max(SNAP_MARGIN, left), maxLeft),
      top: Math.min(Math.max(SNAP_MARGIN, top), maxTop),
    };
  };

  const snapToEdge = () => {
    const rect = button.getBoundingClientRect();
    const distances = {
      left: rect.left,
      right: window.innerWidth - rect.right,
      top: rect.top,
      bottom: window.innerHeight - rect.bottom,
    };
    const closest = Object.entries(distances).sort((a, b) => a[1] - b[1])[0]?.[0];
    let finalLeft = rect.left;
    let finalTop = rect.top;

    switch (closest) {
      case 'left':
        finalLeft = SNAP_MARGIN;
        break;
      case 'right':
        finalLeft = window.innerWidth - button.offsetWidth - SNAP_MARGIN;
        break;
      case 'top':
        finalTop = SNAP_MARGIN;
        break;
      case 'bottom':
        finalTop = window.innerHeight - button.offsetHeight - SNAP_MARGIN;
        break;
    }

    button.style.transition = 'left 0.2s ease, top 0.2s ease';
    button.style.left = `${finalLeft}px`;
    button.style.top = `${finalTop}px`;
    window.setTimeout(() => {
      button.style.transition = 'transform 0.1s ease';
    }, 200);
  };

  button.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerActive = true;
    moved = false;
    startX = event.clientX;
    startY = event.clientY;
    ensureAbsolutePosition();
    const rect = button.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    button.style.transition = 'transform 0.1s ease';
    button.setPointerCapture(event.pointerId);
  });

  button.addEventListener('pointermove', (event) => {
    if (!pointerActive) return;
    event.preventDefault();
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (!moved && Math.hypot(deltaX, deltaY) > MOVE_THRESHOLD) {
      moved = true;
    }
    if (!moved) return;
    const { left, top } = clampPosition(startLeft + deltaX, startTop + deltaY);
    button.style.left = `${left}px`;
    button.style.top = `${top}px`;
  });

  const handlePointerEnd = (event) => {
    if (!pointerActive) return;
    pointerActive = false;
    button.releasePointerCapture(event.pointerId);
    if (moved) {
      snapToEdge();
    } else {
      window.location.href = targetUrl;
    }
  };

  button.addEventListener('pointerup', handlePointerEnd);
  button.addEventListener('pointercancel', handlePointerEnd);

  window.addEventListener('resize', () => {
    const rect = button.getBoundingClientRect();
    const { left, top } = clampPosition(rect.left, rect.top);
    button.style.left = `${left}px`;
    button.style.top = `${top}px`;
  });
});