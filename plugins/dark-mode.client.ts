export default defineNuxtPlugin(() => {
  // This runs on client-side only
  const savedPreferDark = localStorage.getItem('vue-sfc-playground-prefer-dark');

  if (
    savedPreferDark === 'true'
    || (!savedPreferDark && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark');
  }
});
