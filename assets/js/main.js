/* ==========================================================================
   Portfolio d'Aiman Belouanas : scripts
   --------------------------------------------------------------------------
   Pas de bibliothèque : du JavaScript natif, découpé en petites fonctions.
   Règle suivie partout : le contenu est lisible SANS JavaScript ;
   le script ajoute seulement du mouvement et de l'interaction.
   ========================================================================== */

// L'utilisateur a-t-il demandé de réduire les animations dans son système ?
const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const courbe = "cubic-bezier(0.2, 0.7, 0.2, 1)";

/* --------------------------------------------------------------------------
   1. En-tête : une bordure apparaît dès qu'on a défilé
   -------------------------------------------------------------------------- */
function initEnTete() {
  const entete = document.querySelector(".site-header");
  if (!entete) return;
  const maj = () => entete.classList.toggle("is-scrolled", window.scrollY > 8);
  maj();
  window.addEventListener("scroll", maj, { passive: true });
}

/* --------------------------------------------------------------------------
   2. Tri de cartes animé
   Les classements viennent de mon vrai tableau Miro (projet Strasspot).
   Jaune = catégorie créée par le participant, vert = carte à classer.
   -------------------------------------------------------------------------- */
const TRIS = {
  // Accueil : une partie du classement d'un participant
  accueil: [
    { titre: "Restauration", cartes: ["fastfood", "restaurant", "menu10"] },
    { titre: "Soirées", cartes: ["bars", "boite", "cinema"] },
    { titre: "Activités sportives", cartes: ["salle", "exterieur", "assos"] },
    { titre: "Découvrir", cartes: ["musee", "theatre", "parcs"] },
  ],
  // Strasspot : trois participants, trois logiques différentes
  "participant-1": [
    { titre: "Culture", cartes: ["musee", "opera", "theatre", "cinema"] },
    { titre: "Sorties musicales", cartes: ["boite", "concerts"] },
    { titre: "Sorties nature", cartes: ["parcs", "rando"] },
    { titre: "Sport", cartes: ["assos", "exterieur", "salle", "interieur"] },
    { titre: "Nourriture", cartes: ["restaurant", "menu10", "fastfood", "bars"] },
  ],
  "participant-2": [
    { titre: "Restauration", cartes: ["fastfood", "restaurant", "menu10"] },
    { titre: "Découvrir", cartes: ["musee", "opera", "theatre", "rando", "parcs"] },
    { titre: "Soirées", cartes: ["bars", "boite", "cinema"] },
    { titre: "Activités sportives", cartes: ["interieur", "exterieur", "salle", "assos"] },
    { titre: "Événements", cartes: ["concerts"] },
  ],
  "participant-3": [
    { titre: "Activité", cartes: ["boite", "parcs", "cinema", "bars", "exterieur"] },
    { titre: "Culture", cartes: ["theatre", "musee", "opera"] },
    { titre: "Sports", cartes: ["assos", "interieur", "salle", "rando"] },
    { titre: "Restauration", cartes: ["restaurant", "fastfood", "menu10"] },
    { titre: "Événement", cartes: ["concerts"] },
  ],
};

// Mémorise la position de chaque post-it (pour l'animation « FLIP »)
function positions(notes) {
  const map = new Map();
  notes.forEach((n) => map.set(n, n.getBoundingClientRect()));
  return map;
}

// FLIP : on déplace les post-its dans le DOM, puis on anime
// de l'ancienne position vers la nouvelle. Le navigateur ne fait qu'une
// animation de transform : c'est fluide, même sur un téléphone.
function animerDeplacement(notes, avant, rotations) {
  if (mouvementReduit) return;
  notes.forEach((note, i) => {
    const a = avant.get(note);
    const b = note.getBoundingClientRect();
    if (!a) return;
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    const rotDepart = rotations?.get(note) ?? 0;
    const rotFin = parseFloat(note.style.getPropertyValue("--rot")) || 0;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && rotDepart === rotFin) return;
    note.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) rotate(${rotDepart}deg)` },
        { transform: `translate(0, 0) rotate(${rotFin}deg)` },
      ],
      { duration: 700, delay: i * 28, easing: courbe, fill: "backwards" }
    );
  });
}

function rotationsActuelles(notes) {
  const map = new Map();
  notes.forEach((n) => map.set(n, parseFloat(n.style.getPropertyValue("--rot")) || 0));
  return map;
}

// Range les post-its selon un classement donné
function trier(sorter, groupes) {
  const notes = [...sorter.querySelectorAll(".note")];
  const parId = new Map(notes.map((n) => [n.dataset.id, n]));
  const avant = positions(notes);
  const rotations = rotationsActuelles(notes);

  const liste = sorter.querySelector(".sorter__groupes");
  liste.innerHTML = "";
  groupes.forEach((g) => {
    const li = document.createElement("li");
    li.className = "sorter__groupe";
    const titre = document.createElement("p");
    titre.className = "sorter__titre";
    titre.textContent = g.titre;
    const ul = document.createElement("ul");
    ul.className = "sorter__cartes";
    g.cartes.forEach((id) => {
      const note = parId.get(id);
      if (note) {
        note.style.setProperty("--rot", "0deg");
        ul.appendChild(note);
      }
    });
    li.append(titre, ul);
    liste.appendChild(li);
    if (!mouvementReduit) {
      titre.animate([{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], {
        duration: 400, delay: 250, easing: courbe, fill: "backwards",
      });
    }
  });
  sorter.classList.remove("is-pile");
  animerDeplacement(notes, avant, rotations);
}

// Remet les post-its en tas, légèrement de travers
function melanger(sorter) {
  const notes = [...sorter.querySelectorAll(".note")];
  const avant = positions(notes);
  const rotations = rotationsActuelles(notes);
  const pile = sorter.querySelector(".sorter__pile");
  notes
    .map((n) => ({ n, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .forEach(({ n }) => {
      n.style.setProperty("--rot", `${(Math.random() * 10 - 5).toFixed(1)}deg`);
      pile.appendChild(n);
    });
  sorter.classList.add("is-pile");
  sorter.querySelector(".sorter__groupes").innerHTML = "";
  animerDeplacement(notes, avant, rotations);
}

function initTriAccueil() {
  const sorter = document.querySelector('[data-sorter="accueil"]');
  if (!sorter) return;
  const bouton = sorter.closest("figure")?.querySelector("[data-trier]");
  if (!bouton) return;
  let range = false;

  const basculer = () => {
    if (range) melanger(sorter); else trier(sorter, TRIS.accueil);
    range = !range;
    bouton.textContent = range ? "Mélanger les post-its" : "Trier les post-its";
  };
  bouton.addEventListener("click", basculer);

  // Le tri se joue une fois, quand le tableau devient visible (sur mobile,
  // il est sous le texte) : c'est le seul mouvement automatique du site.
  // Avec « mouvement réduit », les post-its sont rangés tout de suite.
  if (mouvementReduit || !("IntersectionObserver" in window)) {
    basculer();
    return;
  }
  const observateur = new IntersectionObserver(
    (entrees) => {
      if (!entrees[0].isIntersecting) return;
      observateur.disconnect();
      setTimeout(() => { if (!range) basculer(); }, 600);
    },
    { threshold: 0.5 }
  );
  observateur.observe(sorter);
}

function initTriParticipants() {
  const zone = document.querySelector('[data-sorter="participants"]');
  if (!zone) return;
  const boutons = [...document.querySelectorAll("[data-participant]")];
  const annonce = document.querySelector("[data-annonce-tri]");
  boutons.forEach((b) => {
    b.addEventListener("click", () => {
      const cle = b.dataset.participant;
      boutons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      trier(zone, TRIS[cle]);
      const groupeCinema = TRIS[cle].find((g) => g.cartes.includes("cinema"));
      if (annonce && groupeCinema) {
        annonce.textContent = `${b.textContent} : le cinéma est rangé dans « ${groupeCinema.titre} ».`;
      }
    });
  });
}

/* --------------------------------------------------------------------------
   3. Comparateur wireframe / maquette
   Un vrai <input type="range"> : souris, doigt et clavier (flèches) marchent.
   -------------------------------------------------------------------------- */
function initComparateurs() {
  document.querySelectorAll(".compare").forEach((c) => {
    const curseur = c.querySelector('input[type="range"]');
    const maj = () => c.style.setProperty("--pos", `${curseur.value}%`);
    curseur.addEventListener("input", maj);
    maj();
  });
}

/* --------------------------------------------------------------------------
   4. Onglets accessibles (ordinateur / tablette / mobile)
   -------------------------------------------------------------------------- */
function initOnglets() {
  document.querySelectorAll('[role="tablist"]').forEach((liste) => {
    const onglets = [...liste.querySelectorAll('[role="tab"]')];
    const activer = (onglet, focus) => {
      onglets.forEach((o) => {
        const actif = o === onglet;
        o.setAttribute("aria-selected", String(actif));
        o.tabIndex = actif ? 0 : -1;
        document.getElementById(o.getAttribute("aria-controls")).hidden = !actif;
      });
      if (focus) onglet.focus();
    };
    onglets.forEach((o, i) => {
      o.addEventListener("click", () => activer(o, false));
      o.addEventListener("keydown", (e) => {
        let cible = null;
        if (e.key === "ArrowRight") cible = onglets[(i + 1) % onglets.length];
        if (e.key === "ArrowLeft") cible = onglets[(i - 1 + onglets.length) % onglets.length];
        if (e.key === "Home") cible = onglets[0];
        if (e.key === "End") cible = onglets[onglets.length - 1];
        if (cible) { e.preventDefault(); activer(cible, true); }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   5. Sommaire des études de cas : surligne la partie en cours de lecture
   -------------------------------------------------------------------------- */
function initSommaire() {
  const liens = [...document.querySelectorAll(".sommaire a")];
  if (!liens.length || !("IntersectionObserver" in window)) return;
  const parId = new Map(liens.map((l) => [l.hash.slice(1), l]));
  const observateur = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((e) => {
        if (!e.isIntersecting) return;
        liens.forEach((l) => l.removeAttribute("aria-current"));
        parId.get(e.target.id)?.setAttribute("aria-current", "true");
      });
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );
  parId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observateur.observe(section);
  });
}

/* --------------------------------------------------------------------------
   6. Données qui s'animent quand on les atteint
   (barres du graphique, point sur la carte de positionnement).
   Par défaut, tout est déjà affiché : on ne « cache » un élément que s'il
   est hors de l'écran au chargement, pour le révéler quand il arrive.
   -------------------------------------------------------------------------- */
function initDonneesAnimees() {
  if (mouvementReduit || !("IntersectionObserver" in window)) return;
  const elements = [...document.querySelectorAll("[data-anime]")];
  const observateur = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((e) => {
        if (!e.isIntersecting) return;
        setTimeout(() => e.target.classList.remove("is-en-attente"), 150);
        observateur.unobserve(e.target);
      });
    },
    { threshold: 0.45 }
  );
  elements.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top > window.innerHeight) {
      el.classList.add("is-en-attente");
      observateur.observe(el);
    }
  });
}


/* --------------------------------------------------------------------------
   7. Court métrage : la vidéo s'ouvre dans une fenêtre au-dessus de la page.
   Sans JavaScript, le lien ouvre simplement le fichier vidéo.
   -------------------------------------------------------------------------- */
function initVideo() {
  const fenetre = document.querySelector(".lecteur:not(.lecteur--images)");
  const liens = document.querySelectorAll("[data-video-ouvrir]");
  if (!fenetre || !liens.length || typeof fenetre.showModal !== "function") return;
  const video = fenetre.querySelector("video");
  const titre = fenetre.querySelector(".lecteur__tete h2");
  let origine = null; // le lien qui a ouvert la fenetre, pour y rendre le focus

  liens.forEach((lien) => {
    lien.addEventListener("click", (e) => {
      e.preventDefault();
      origine = lien;
      const src = lien.getAttribute("href");
      // On ne charge la video qu'au clic, et seulement si elle change
      if (video.getAttribute("src") !== src) {
        video.setAttribute("src", src);
        if (lien.dataset.poster) video.setAttribute("poster", lien.dataset.poster);
      }
      if (lien.dataset.titre) titre.textContent = lien.dataset.titre;
      // Le format adapte la largeur de la fenetre (vertical, carre ou paysage)
      fenetre.dataset.format = lien.dataset.format || "paysage";
      fenetre.showModal();
      video.play().catch(() => {}); // lecture lancee par le clic de l'utilisateur
    });
  });
  fenetre.querySelector("[data-video-fermer]").addEventListener("click", () => fenetre.close());
  // Un clic sur le fond sombre (en dehors de la video) ferme aussi la fenetre
  fenetre.addEventListener("click", (e) => { if (e.target === fenetre) fenetre.close(); });
  // A la fermeture (bouton, Echap ou clic dehors), on met la video en pause
  fenetre.addEventListener("close", () => { video.pause(); if (origine) origine.focus(); });
}

/* --------------------------------------------------------------------------
   Lancement
   -------------------------------------------------------------------------- */
/* ---------- Apercu en grand des travaux visuels ----------
   Un clic ouvre les images en grand dans une fenetre. Sans JavaScript,
   le lien ouvre simplement l'image. */
function initApercu() {
  const fenetre = document.querySelector(".lecteur--images");
  const liens = document.querySelectorAll("[data-apercu]");
  if (!fenetre || !liens.length || typeof fenetre.showModal !== "function") return;
  const contenu = fenetre.querySelector(".visionneuse__contenu");
  const titre = fenetre.querySelector("h2");
  let origine = null;

  liens.forEach((lien) => {
    lien.addEventListener("click", (e) => {
      e.preventDefault();
      origine = lien;
      let images;
      try { images = JSON.parse(lien.dataset.images); }
      catch { images = [{ src: lien.getAttribute("href"), alt: "" }]; }
      // Construction sans innerHTML : uniquement des elements et du texte
      contenu.replaceChildren(...images.map((im) => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = im.src;
        img.alt = im.alt || "";
        if (im.w) { img.width = im.w; img.height = im.h; }
        img.decoding = "async";
        figure.append(img);
        if (im.legende) {
          const legende = document.createElement("figcaption");
          legende.textContent = im.legende;
          figure.append(legende);
        }
        return figure;
      }));
      fenetre.dataset.nombre = String(images.length);
      titre.textContent = lien.dataset.titre || "";
      fenetre.showModal();
      contenu.scrollTop = 0;
    });
  });
  fenetre.querySelector("[data-visionneuse-fermer]").addEventListener("click", () => fenetre.close());
  fenetre.addEventListener("click", (e) => { if (e.target === fenetre) fenetre.close(); });
  fenetre.addEventListener("close", () => { if (origine) origine.focus(); });
}

/* ---------- Copier l'adresse e-mail ----------
   Le lien mailto ouvre la messagerie par defaut de l'ordinateur, qui n'est
   pas toujours configuree. Copier l'adresse marche dans tous les cas. */
function initCopierAdresse() {
  const bouton = document.querySelector("[data-copier]");
  const adresse = document.querySelector("[data-adresse]");
  const etat = document.querySelector("[data-copier-etat]");
  if (!bouton || !adresse || !navigator.clipboard) return;
  bouton.hidden = false;
  bouton.addEventListener("click", () => {
    navigator.clipboard.writeText(adresse.textContent.trim()).then(() => {
      bouton.textContent = "Adresse copiée";
      etat.textContent = "Adresse e-mail copiée dans le presse-papiers.";
      setTimeout(() => {
        bouton.textContent = "Copier l’adresse";
        etat.textContent = "";
      }, 2500);
    });
  });
}

initEnTete();
initTriAccueil();
initTriParticipants();
initComparateurs();
initOnglets();
initSommaire();
initDonneesAnimees();
initVideo();
initApercu();
initCopierAdresse();
