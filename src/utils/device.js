export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function getViewportHeight() {
  return window.innerHeight || document.documentElement.clientHeight
}

export function getViewportWidth() {
  return window.innerWidth || document.documentElement.clientWidth
}

export function preventZoom() {
  document.addEventListener('gesturestart', function (e) {
    e.preventDefault()
  })
  
  document.addEventListener('gesturechange', function (e) {
    e.preventDefault()
  })
  
  document.addEventListener('gestureend', function (e) {
    e.preventDefault()
  })
}

export function hapticFeedback(type = 'light') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [50, 100, 50]
    }
    navigator.vibrate(patterns[type] || patterns.light)
  }
}