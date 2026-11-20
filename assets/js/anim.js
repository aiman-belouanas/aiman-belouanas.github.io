(function () {
  "use strict";
  var html = document.documentElement;
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduit || !window.gsap || !window.ScrollTrigger) { html.classList.remove("anim"); return; }

  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, SplitText = window.SplitText;
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  gsap.defaults({ ease: "power3.out", duration: 0.6 });
  var tous = function (sel, racine) { return Array.prototype.slice.call((racine || document).querySelectorAll(sel)); };

  function initTitres() {
    if (!SplitText) return;
    tous("h1").forEach(function (el) {
      SplitText.create(el, {
        type: "lines,words", mask: "lines", autoSplit: true, linesClass: "ligne",
        onSplit: function (self) {
          return gsap.from(self.words, { yPercent: 110, duration: 0.8, ease: "power4.out", stagger: 0.035 });
        }
      });
    });
  }

  function initEntree() {
    var bloc = tous(".hero__texte > *:not(h1), .cs-hero .wrap > *:not(h1):not(.cs-couverture)");
    if (bloc.length) gsap.from(bloc, { autoAlpha: 0, y: 14, stagger: 0.06, delay: 0.15, duration: 0.5 });
    var tableau = document.querySelector(".hero figure");
    if (tableau) gsap.from(tableau, { autoAlpha: 0, duration: 0.5, delay: 0.25 });
    var couv = document.querySelector(".cs-couverture");
    if (couv) gsap.from(couv, { autoAlpha: 0, y: 24, duration: 0.7, delay: 0.3 });
  }

  function initApparitions() {
    var cibles = [
      ".section__tete", ".projet", ".autre", ".boite-outils > div", ".apropos__texte",
      ".bloc > h2", ".bloc > p", ".bloc > ul", ".bloc > ol", ".bloc > h3", ".bloc > .figure", ".bloc > .declinaison",
      ".bloc > .ecrans", ".bloc > .board", ".bloc > .segmented", ".bloc > .barres", ".persona",
      ".chiffres > div", ".tables > *", ".decision", ".contact .wrap > *", ".suivant .wrap > *", ".appel-stage .wrap > *"
    ].join(",");
    var elements = tous(cibles).filter(function (el) {
      return el.getBoundingClientRect().top > window.innerHeight * 0.92 && !el.closest(".hero, .cs-hero");
    });
    gsap.set(elements, { autoAlpha: 0, y: 14 });
    ScrollTrigger.batch(elements, {
      start: "top 94%", once: true,
      onEnter: function (lot) {
        var visibles = lot.filter(function (el) { return el.getBoundingClientRect().top > 0; });
        gsap.set(lot.filter(function (el) { return visibles.indexOf(el) < 0; }), { clearProps: "transform,opacity,visibility" });
        gsap.to(visibles, { autoAlpha: 1, y: 0, stagger: Math.min(0.05, 0.3 / visibles.length), duration: 0.45, overwrite: true, clearProps: "transform,opacity,visibility" });
      }
    });
  }

  function initEntete() {
    var entete = document.querySelector(".site-header");
    if (!entete) return;
    var cache = false;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (self) {
        var doitCacher = self.direction === 1 && self.scroll() > 400 && !entete.contains(document.activeElement);
        if (doitCacher === cache) return;
        cache = doitCacher;
        gsap.to(entete, { yPercent: cache ? -105 : 0, duration: 0.35, overwrite: true });
      }
    });
  }

  function initDefile() {
    var section = document.querySelector(".defile");
    if (!section) return;
    var liste = section.querySelector(".defile__liste"), fenetre = section.querySelector(".defile__fenetre");
    var barre = section.querySelector(".defile__ligne span"), num = section.querySelector("[data-defile-num]");
    var total = tous(".post", section).length;
    var afficher = function (p) {
      gsap.set(barre, { scaleX: p });
      num.textContent = String(Math.min(total, Math.round(p * (total - 1)) + 1)).padStart(2, "0");
    };
    var mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (pointer: fine)", function () {
      section.classList.add("is-epingle");
      var distance = function () { return Math.max(0, liste.scrollWidth - fenetre.clientWidth); };
      var tween = gsap.to(liste, {
        x: function () { return -distance(); }, ease: "none",
        scrollTrigger: {
          trigger: section, start: "top top", end: function () { return "+=" + distance(); },
          pin: true, scrub: 0.4, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) { afficher(self.progress); }
        }
      });
      return function () { section.classList.remove("is-epingle"); tween.kill(); gsap.set(liste, { clearProps: "transform" }); };
    });
    mm.add("(max-width: 899px), (pointer: coarse)", function () {
      var maj = function () {
        var max = fenetre.scrollWidth - fenetre.clientWidth;
        afficher(max > 0 ? fenetre.scrollLeft / max : 0);
      };
      fenetre.addEventListener("scroll", maj, { passive: true });
      maj();
      return function () { fenetre.removeEventListener("scroll", maj); };
    });
  }

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
      var lacher = function () { if (tween.scrollTrigger) tween.scrollTrigger.kill(); tween.kill(); };
      curseur.addEventListener("pointerdown", lacher, { once: true });
      curseur.addEventListener("keydown", lacher, { once: true });
    });
  }

  var lance = false;
  function lancer() {
    if (lance) return;
    lance = true;
    window.__animPrete = true;
    html.classList.remove("anim");
    initEntree();
    initTitres();
    initApparitions();
    initEntete();
    initDefile();
    initComparaisons();
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
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
    setTimeout(lancer, 1000);
  } else lancer();
})();
