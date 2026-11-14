/* ==========================================================================
   Portfolio d'Aiman Belouanas : animations
   --------------------------------------------------------------------------
   Bibliotheques, toutes hebergees sur le site (aucun appel externe) :
   - GSAP + ScrollTrigger + SplitText : apparitions et effets lies au defilement
   - Lenis : defilement adouci a la souris
   - three.js : les post-its en 3D de la section contact (charges a la demande)
   Regles :
   - sans JavaScript, ou avec "mouvement reduit", tout le contenu est affiche ;
   - on n'anime que transform et opacity (fluide, meme sur telephone) ;
   - chaque animation ne se joue qu'une fois.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduit || !window.gsap || !window.ScrollTrigger) { html.classList.remove("anim", "rideau-entree"); return; }

  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, SplitText = window.SplitText;
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  gsap.defaults({ ease: "power3.out", duration: 0.8 });

  var tactile = window.matchMedia("(pointer: coarse)").matches;
  var sourisFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var tous = function (sel, racine) { return Array.prototype.slice.call((racine || document).querySelectorAll(sel)); };

  /* ---------- 1. Defilement adouci (souris uniquement) ---------- */
  var lenis = null;
  function initLenis() {
    if (!window.Lenis || tactile) return;
    lenis = new window.Lenis({ lerp: 0.12, anchors: { offset: -88 } });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    // Une fenetre ouverte (video, image) bloque le defilement de la page
    tous("dialog").forEach(function (d) {
      new MutationObserver(function () { if (d.open) lenis.stop(); else lenis.start(); })
        .observe(d, { attributes: true, attributeFilter: ["open"] });
    });
  }

  /* ---------- 2. Titres : les mots montent ligne par ligne ---------- */
  function initTitres() {
    if (!SplitText) return;
    tous("h1, .section__tete h2, .contact h2, .bloc > h2, .suivant h2, .defile__titre").forEach(function (el) {
      var auChargement = el.matches("h1");
      SplitText.create(el, {
        type: "lines,words", mask: "lines", autoSplit: true, linesClass: "ligne",
        onSplit: function (self) {
          return gsap.from(self.words, {
            yPercent: 115, duration: auChargement ? 1 : 0.85, ease: "power4.out",
            stagger: auChargement ? 0.045 : 0.03, delay: auChargement ? 0.1 : 0,
            scrollTrigger: auChargement ? null : { trigger: el, start: "top 90%", once: true }
          });
        }
      });
    });
  }

  /* ---------- 3. Entree de page ---------- */
  function initEntree() {
    var bloc = tous(".hero__texte > *:not(h1), .cs-hero .wrap > *:not(h1):not(.cs-couverture)");
    if (bloc.length) gsap.from(bloc, { autoAlpha: 0, y: 22, stagger: 0.09, delay: 0.25 });
    var faits = tous(".faits > div");
    if (faits.length) gsap.from(faits, { autoAlpha: 0, y: 14, stagger: 0.07, delay: 0.6, duration: 0.6 });
    var tableau = document.querySelector(".hero figure");
    if (tableau) gsap.from(tableau, { autoAlpha: 0, duration: 0.7, delay: 0.35 });
    var couv = document.querySelector(".cs-couverture");
    if (couv) {
      gsap.from(couv, { autoAlpha: 0, y: 40, duration: 1, delay: 0.45 });
      // La couverture s'efface doucement quand on commence a lire
      gsap.to(couv.querySelector("img"), {
        scale: 0.96, ease: "none",
        scrollTrigger: { trigger: couv, start: "top 20%", end: "bottom top", scrub: true }
      });
    }
    var entete = document.querySelector(".site-header");
    if (entete) gsap.from(entete, { yPercent: -100, duration: 0.7, clearProps: "transform" });
  }

  /* ---------- 4. Apparitions au defilement ---------- */
  function initApparitions() {
    var cibles = [
      ".section__tete p", ".projet__texte > *:not(h3)", ".projet__texte h3", ".autre",
      ".boite-outils > div",
      ".bloc > p", ".bloc > ul:not(.constats):not(.avant-apres)", ".avant-apres li", ".bloc > ol", ".bloc > h3", ".bloc > .figure", ".bloc > .declinaison",
      ".bloc > .ecrans", ".bloc > .board", ".bloc > .segmented", ".bloc > .barres", ".persona", ".constats li",
      ".chiffres > div", ".tables > *", ".contact p", ".contact__liens > *", ".suivant .btn", ".suivant p"
    ].join(",");
    var hautFenetre = window.innerHeight;
    var elements = tous(cibles).filter(function (el) {
      // Rien de ce qui est deja a l'ecran ne clignote : on ne prepare que la suite
      return el.getBoundingClientRect().top > hautFenetre * 0.92 && !el.closest(".hero, .cs-hero");
    });
    gsap.set(elements, { autoAlpha: 0, y: 26 });
    ScrollTrigger.batch(elements, {
      start: "top 92%", once: true,
      onEnter: function (lot) {
        // Apres un grand saut (lien du menu), ce qui est deja au-dessus s'affiche tout de suite
        var passes = lot.filter(function (el) { return el.getBoundingClientRect().bottom < 0; });
        var visibles = lot.filter(function (el) { return passes.indexOf(el) === -1; });
        if (passes.length) gsap.set(passes, { clearProps: "transform,opacity,visibility" });
        gsap.to(visibles, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.7, overwrite: true, clearProps: "transform,opacity,visibility" });
      }
    });
    // Le post-it "mission" se colle sur la page
    tous(".mission").forEach(function (m) {
      gsap.from(m, {
        autoAlpha: 0, scale: 0.9, rotation: -7, y: 30, duration: 0.9, ease: "back.out(1.6)",
        scrollTrigger: { trigger: m, start: "top 88%", once: true }
      });
    });
  }

  /* ---------- 5. Projets : la couverture se devoile, le post-it se colle ---------- */
  function initProjets() {
    tous(".projet").forEach(function (projet) {
      var couv = projet.querySelector(".couverture"), tableau = projet.querySelector(".board");
      var visuel = projet.querySelector(".couverture img, .couverture__visuel"), note = projet.querySelector(".couverture__note");
      if (!couv || couv.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      var tl = gsap.timeline({ scrollTrigger: { trigger: couv, start: "top 82%", once: true } });
      tl.from(tableau, { clipPath: "inset(0% 0% 100% 0% round 22px)", duration: 1.1, ease: "power4.inOut", clearProps: "clipPath" })
        .from(visuel, { scale: 1.18, y: 30, duration: 1.3, ease: "power3.out", clearProps: "transform" }, 0.05);
      if (note) tl.from(note, { autoAlpha: 0, scale: 0.4, rotation: -18, y: -40, duration: 0.7, ease: "back.out(2)", clearProps: "transform,opacity,visibility" }, 0.75);
    });

    // Inclinaison en 3D au survol : le tableau suit le pointeur
    if (!sourisFine) return;
    tous(".projet").forEach(function (projet) {
      var tableau = projet.querySelector(".board");
      if (!tableau) return;
      gsap.set(tableau, { transformPerspective: 900, transformOrigin: "50% 50%" });
      var rx = gsap.quickTo(tableau, "rotationX", { duration: 0.6, ease: "power3.out" });
      var ry = gsap.quickTo(tableau, "rotationY", { duration: 0.6, ease: "power3.out" });
      projet.addEventListener("pointermove", function (e) {
        var r = tableau.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        ry(gsap.utils.clamp(-1, 1, px) * 7); rx(gsap.utils.clamp(-1, 1, py) * -5);
      });
      projet.addEventListener("pointerleave", function () { rx(0); ry(0); });
    });
  }

  /* ---------- 6. Chiffres cles : le compteur monte jusqu'a la valeur ---------- */
  function initCompteurs() {
    tous(".chiffres dt, .couverture__note strong").forEach(function (el) {
      var texte = el.textContent, m = texte.match(/^(\D*?)(\d+)(\D*)$/);
      if (!m || el.getBoundingClientRect().top < window.innerHeight) return;
      var cible = parseInt(m[2], 10), etat = { v: 0 };
      el.setAttribute("aria-label", texte); // les lecteurs d'ecran lisent la vraie valeur
      el.textContent = m[1] + "0" + m[3];
      gsap.to(etat, {
        v: cible, duration: 1.4, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: function () { el.textContent = m[1] + Math.round(etat.v) + m[3]; },
        onComplete: function () { el.textContent = texte; }
      });
    });
  }

  /* ---------- 7. Bandeau "methode" : il avance, et accelere avec le defilement ---------- */
  function initBandeau() {
    var piste = document.querySelector(".bandeau__piste");
    if (!piste) return;
    // On double le contenu pour une boucle sans couture
    var original = piste.innerHTML;
    piste.innerHTML = original + original + original + original;
    var boucle = gsap.to(piste, { xPercent: -25, duration: 22, ease: "none", repeat: -1 });
    var ralentir = gsap.quickTo(boucle, "timeScale", { duration: 0.9, ease: "power2.out" });
    ScrollTrigger.create({
      trigger: ".bandeau", start: "top bottom", end: "bottom top",
      onUpdate: function (self) {
        var v = gsap.utils.clamp(-6, 6, self.getVelocity() / 350);
        gsap.set(boucle, { timeScale: (v < 0 ? -1 : 1) * (1 + Math.abs(v)) });
        ralentir(v < 0 ? -1 : 1);
      },
      onToggle: function (self) { if (self.isActive) boucle.play(); else boucle.pause(); }
    });
  }

  /* ---------- 8. En-tete : il se range quand on descend, revient quand on remonte ---------- */
  function initEntete() {
    var entete = document.querySelector(".site-header");
    if (!entete) return;
    var cache = false;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (self) {
        var doitCacher = self.direction === 1 && self.scroll() > 320 && !entete.contains(document.activeElement);
        if (doitCacher === cache) return;
        cache = doitCacher;
        gsap.to(entete, { yPercent: cache ? -105 : 0, duration: 0.45, ease: "power3.out", overwrite: true });
      }
    });
  }

  /* ---------- 9. Etude de cas "Ecole d'Hiver" : la campagne defile a l'horizontale ---------- */
  function initDefile() {
    var section = document.querySelector(".defile");
    if (!section) return;
    var liste = section.querySelector(".defile__liste"), fenetre = section.querySelector(".defile__fenetre");
    var barre = section.querySelector(".defile__ligne span"), num = section.querySelector("[data-defile-num]");
    var cartes = tous(".post", section), flocons = tous(".flocon", section);

    gsap.from(cartes, {
      autoAlpha: 0, y: 60, rotation: 3, stagger: 0.06, duration: 0.9,
      scrollTrigger: { trigger: section, start: "top 70%", once: true }
    });
    flocons.forEach(function (f, i) {
      gsap.to(f, { rotation: i % 2 ? -360 : 360, duration: 40 + i * 12, ease: "none", repeat: -1 });
    });

    // Relief : la carte du centre reste droite et nette, celles des cotes s'inclinent et reculent
    var figures = cartes.map(function (c) { return c.querySelector("figure"); });
    gsap.set(figures, { transformPerspective: 1100, transformOrigin: "50% 50%" });
    function relief() {
      var centre = window.innerWidth / 2, demi = window.innerWidth * 0.5;
      cartes.forEach(function (carte, i) {
        var r = carte.getBoundingClientRect();
        var d = (r.left + r.width / 2 - centre) / demi;
        var a = Math.max(0, Math.abs(d) - 0.16) / 0.84; // zone neutre au centre
        a = Math.min(a, 1.3);
        gsap.set(figures[i], { rotationY: (d < 0 ? 1 : -1) * a * 17, z: -a * 110, opacity: 1 - Math.min(a, 1) * 0.38 });
      });
    }
    relief();

    var mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (pointer: fine)", function () {
      // Grand ecran : la section se fixe, et le defilement vertical fait avancer les publications
      section.classList.add("is-epingle");
      var distance = function () { return Math.max(0, liste.scrollWidth - fenetre.clientWidth); };
      var tween = gsap.to(liste, {
        x: function () { return -distance(); }, ease: "none",
        scrollTrigger: {
          trigger: section, start: "top top", end: function () { return "+=" + distance(); },
          pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) {
            gsap.set(barre, { scaleX: self.progress });
            num.textContent = String(Math.min(cartes.length, Math.round(self.progress * (cartes.length - 1)) + 1)).padStart(2, "0");
            relief();
          },
          onRefresh: relief
        }
      });
      return function () { section.classList.remove("is-epingle"); tween.kill(); gsap.set(liste, { clearProps: "transform" }); };
    });
    mm.add("(max-width: 899px), (pointer: coarse)", function () {
      // Telephone : on fait glisser les publications au doigt
      var maj = function () {
        var max = fenetre.scrollWidth - fenetre.clientWidth, p = max > 0 ? fenetre.scrollLeft / max : 0;
        gsap.set(barre, { scaleX: p });
        num.textContent = String(Math.round(p * (cartes.length - 1)) + 1).padStart(2, "0");
        relief();
      };
      fenetre.addEventListener("scroll", maj, { passive: true });
      maj();
      return function () { fenetre.removeEventListener("scroll", maj); };
    });
  }

  /* ---------- 10. Post-its en 3D (three.js) ----------
     Accueil : ils tombent en vrac, puis se rangent en ligne quand on defile.
     Contact : ils flottent derriere le texte. La bibliotheque est chargee a la demande. */
  function initScenes() {
    if (!("IntersectionObserver" in window)) return;
    if (navigator.connection && navigator.connection.saveData) return;
    tous("[data-scene]").forEach(function (toile) {
      var mode = toile.getAttribute("data-scene") || "contact";
      var section = toile.closest("section");
      function creer() {
        import("./scene.min.js").then(function (m) {
          var scene = m.creerScene(toile, { mode: mode });
          if (!scene) return;
          toile.classList.add("is-prete");
          var repere = ScrollTrigger.create({
            trigger: section,
            start: mode === "accueil" ? 0 : "top bottom",
            end: "bottom top",
            onToggle: function (self) { scene.actif(self.isActive); },
            onUpdate: function (self) { scene.progression(self.progress); },
            onRefresh: function (self) { scene.progression(self.progress); scene.actif(self.isActive); }
          });
          // Demarrage : on lance le rendu tout de suite si la section est a l'ecran
          var r = section.getBoundingClientRect();
          scene.progression(repere.progress);
          scene.actif(r.bottom > 0 && r.top < window.innerHeight);
        }).catch(function () { /* pas de WebGL : la section reste telle quelle */ });
      }
      if (mode === "accueil") {
        // On laisse d'abord la page s'afficher, puis on fait tomber les post-its
        var plusTard = window.requestIdleCallback || function (f) { return setTimeout(f, 300); };
        if (document.readyState === "complete") plusTard(creer);
        else window.addEventListener("load", function () { plusTard(creer); });
        return;
      }
      var obs = new IntersectionObserver(function (entrees) {
        if (!entrees[0].isIntersecting) return;
        obs.disconnect();
        creer();
      }, { rootMargin: "700px 0px" });
      obs.observe(section);
    });
  }

  /* ---------- 11. Du wireframe a la maquette : le rideau se tire avec le defilement ---------- */
  function initComparaisons() {
    tous(".compare").forEach(function (c) {
      var curseur = c.querySelector('input[type="range"]');
      if (!curseur || c.getBoundingClientRect().top < window.innerHeight * 0.7) return;
      var etat = { v: 94 };
      var poser = function () { curseur.value = etat.v; c.style.setProperty("--pos", etat.v + "%"); };
      poser();
      var tween = gsap.to(etat, {
        v: 6, ease: "none", onUpdate: poser,
        scrollTrigger: { trigger: c, start: "top 72%", end: "bottom 42%", scrub: 0.5 }
      });
      // Des que la personne prend le curseur en main, on lui laisse le controle
      var lacher = function () { if (tween.scrollTrigger) tween.scrollTrigger.kill(); tween.kill(); };
      curseur.addEventListener("pointerdown", lacher, { once: true });
      curseur.addEventListener("keydown", lacher, { once: true });
    });
  }

  /* ---------- 12. A propos : le texte s'encre mot par mot ---------- */
  function initEncrage() {
    var bloc = document.querySelector(".apropos__texte");
    if (!bloc || !SplitText) return;
    var paragraphes = tous("p", bloc);
    if (!paragraphes.length || bloc.getBoundingClientRect().top < window.innerHeight * 0.6) return;
    SplitText.create(paragraphes, {
      type: "words", autoSplit: true,
      onSplit: function (self) {
        return gsap.fromTo(self.words, { opacity: 0.2 }, {
          opacity: 1, ease: "none", stagger: 0.05,
          scrollTrigger: { trigger: bloc, start: "top 78%", end: "bottom 58%", scrub: 0.4 }
        });
      }
    });
  }

  /* ---------- 13. Changement de page : un rideau couleur post-it ----------
     Les navigateurs recents le font en CSS (View Transitions, voir style.css).
     Pour les autres, ce rideau glisse avant de changer de page. */
  function initRideau() {
    if (html.classList.contains("rideau-entree")) {
      html.classList.add("rideau-sortie");
      setTimeout(function () { html.classList.remove("rideau-entree", "rideau-sortie"); }, 800);
    }
    if ("CSSViewTransitionRule" in window) return;
    var rideau = document.createElement("div");
    rideau.className = "rideau";
    rideau.setAttribute("aria-hidden", "true");
    document.body.appendChild(rideau);
    document.addEventListener("click", function (e) {
      var lien = e.target.closest && e.target.closest("a[href]");
      if (!lien || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (lien.target || lien.hasAttribute("download") || lien.origin !== location.origin) return;
      if (!/\.html$|\/$/.test(lien.pathname) || lien.pathname === location.pathname) return;
      e.preventDefault();
      try { sessionStorage.setItem("rideau", "1"); } catch (err) { /* navigation privee */ }
      gsap.fromTo(rideau, { yPercent: 100, autoAlpha: 1 }, {
        yPercent: 0, duration: 0.45, ease: "power3.inOut",
        onComplete: function () { location.href = lien.href; }
      });
    });
    // Retour arriere du navigateur : on ne laisse pas le rideau ferme
    window.addEventListener("pageshow", function (e) { if (e.persisted) gsap.set(rideau, { autoAlpha: 0 }); });
  }

  /* ---------- Lancement : on attend les polices pour decouper les titres juste ---------- */
  var lance = false;
  function lancer() {
    if (lance) return;
    lance = true;
    window.__animPrete = true;
    html.classList.remove("anim");
    initRideau();
    initLenis();
    initEntree();
    initTitres();
    initProjets();
    initApparitions();
    initCompteurs();
    initBandeau();
    initEntete();
    initDefile();
    initComparaisons();
    initEncrage();
    initScenes();
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    // Si la hauteur de la page change (post-its tries, onglet ouvert), on recalcule les reperes
    if ("ResizeObserver" in window) {
      var hauteur = document.body.offsetHeight, attente = 0;
      new ResizeObserver(function () {
        var h = document.body.offsetHeight;
        if (Math.abs(h - hauteur) < 4) return;
        hauteur = h;
        clearTimeout(attente);
        attente = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
      }).observe(document.body);
    }
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(lancer);
    setTimeout(lancer, 1200);
  } else lancer();
})();
