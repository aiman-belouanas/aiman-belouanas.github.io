(function () {
  var html = document.documentElement;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  html.classList.add("anim");
  setTimeout(function () { if (!window.__animPrete) html.classList.remove("anim"); }, 2000);
})();
