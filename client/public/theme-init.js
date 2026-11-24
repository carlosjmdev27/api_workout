// Applies the saved theme before React renders, so a light-mode user never sees a dark flash.
// External same-origin file on purpose: the Content-Security-Policy forbids inline scripts.
// Keep the key in sync with src/theme/theme-storage.ts. Default (no preference) = dark.
(function () {
  try {
    if (localStorage.getItem('auraworkout-theme') === 'light') {
      document.documentElement.classList.remove('dark');
    }
  } catch (error) {
    // Storage blocked (private mode...): keep the default dark theme.
  }
})();
