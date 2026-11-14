/* Charge avant l'affichage : prepare les animations d'entree sans "flash".
   Si les animations ne demarrent pas (script bloque, erreur), tout
   reapparait au bout de 2,5 secondes : le contenu reste toujours lisible. */
(function () {
  var html = document.documentElement;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  html.classList.add("anim");
  // Arrivee depuis une autre page du site, sur un navigateur sans View Transitions :
  // le rideau couleur post-it est deja ferme, il se levera au demarrage.
  try {
    if (sessionStorage.getItem("rideau")) {
      sessionStorage.removeItem("rideau");
      html.classList.add("rideau-entree");
    }
  } catch (e) { /* navigation privee : pas de rideau */ }
  setTimeout(function () {
    if (!window.__animPrete) html.classList.remove("anim", "rideau-entree");
  }, 2500);
})();
