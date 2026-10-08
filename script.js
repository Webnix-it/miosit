/* ============================================================
   WEBNIX — script.js
   JavaScript Vanilla puro (niente framework).
   Richiede config.js caricato PRIMA di questo file.

   Moduli:
   1. Global loader (#global-loader2)
   2. Menu mobile (hamburger + drawer, chiusura tap outside/ESC/link, scroll lock)
   3. Scroll fluido + stato [attivo] touch per #bottone1
   4. Reveal on scroll (IntersectionObserver one-shot, visible="si")
   5. Filtri portfolio (attributo [categoria])
   6. Recensioni Firebase REST + fallback demo, anti-XSS
   7. Form contatti -> WhatsApp
   8. Admin recensioni (lista + eliminazione)
   ============================================================ */

(function () {
  "use strict";

  var CFG = window.WEBNIX_CONFIG || {};
  var fb = CFG.firebase || {};
  var NODE = CFG.reviewsNode || "recensioni";
  var LIMIT = CFG.reviewCharLimit || 1000; // uniformato a 1000 (ex commento fuorviante "max 200")

  function $(id) { return document.getElementById(id); }

  /* ============================================================
     1. GLOBAL LOADER — progresso fino a 100%, dissolvenza,
        scroll lock, timeout di sicurezza, display:none post-fade.
     ============================================================ */
  function initLoader() {
    var loader = $("global-loader2");
    if (!loader) return;
    var fill = $("loader-barra-riempimento");
    var label = $("loader-percentuale");
    document.body.style.overflow = "hidden"; // scroll lock

    var progress = 0;
    var finished = false;

    function chiudi() {
      if (finished) return;
      finished = true;
      clearInterval(tick);
      if (fill) fill.style.width = "100%";
      if (label) label.textContent = "100%";
      setTimeout(function () {
        loader.style.opacity = "0";
        setTimeout(function () {
          loader.style.display = "none"; // fix: fuori dal flusso dopo la dissolvenza
          document.body.style.overflow = "";
        }, 650);
      }, 350);
    }

    var tick = setInterval(function () {
      progress = Math.min(100, progress + Math.random() * 18 + 6);
      if (fill) fill.style.width = progress + "%";
      if (label) label.textContent = Math.round(progress) + "%";
      if (progress >= 100) chiudi();
    }, 90);

    window.addEventListener("load", function () { setTimeout(chiudi, 900); });
    setTimeout(chiudi, 4500); // timeout di sicurezza
  }

  /* ============================================================
     2. MENU MOBILE — drawer attivo solo <=900px (CSS),
        stato aperto irrobustito con body[data-menu="aperto"].
     ============================================================ */
  function initMenu() {
    var apri = $("pulsante-menu-mobile");
    var chiudiBtn = $("chiusura-menu");
    var overlay = $("overlay-menu");
    var drawer = $("menu-mobile");
    if (!drawer) return;

    function aperto() { return document.body.getAttribute("data-menu") === "aperto"; }

    function setMenu(stato) {
      if (stato) {
        document.body.setAttribute("data-menu", "aperto");
        if (apri) apri.setAttribute("aria-expanded", "true");
      } else {
        document.body.removeAttribute("data-menu");
        if (apri) apri.setAttribute("aria-expanded", "false");
      }
    }

    if (apri) apri.addEventListener("click", function () { setMenu(!aperto()); });
    if (chiudiBtn) chiudiBtn.addEventListener("click", function () { setMenu(false); });
    if (overlay) overlay.addEventListener("click", function () { setMenu(false); }); // tap outside
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && aperto()) setMenu(false); // ESC
    });
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); }); // chiusura su link
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && aperto()) setMenu(false);
    });
  }

  /* ============================================================
     3. SCROLL FLUIDO (anchor interni) + [attivo] per i bottoni su touch
     ============================================================ */
  function initSmoothAndTouch() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        var target = id ? $(id) : null;
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          if (history.replaceState) history.replaceState(null, "", "#" + id);
        }
      });
    });

    ["bottone1", "glow-button"].forEach(function (id) {
      var btn = $(id);
      if (!btn) return;
      btn.addEventListener("touchstart", function () {
        btn.setAttribute("attivo", "");
      }, { passive: true });
      btn.addEventListener("touchend", function () {
        setTimeout(function () { btn.removeAttribute("attivo"); }, 350);
      }, { passive: true });
    });
  }

  /* ============================================================
     4. REVEAL ON SCROLL — IntersectionObserver one-shot
        [visible] -> visible="si"; delay a cascata [delay="1..3"];
        fallback senza IO / reduced-motion: tutto subito visibile.
     ============================================================ */
  function initReveal() {
    var elementi = document.querySelectorAll("[visible]");
    if (!elementi.length) return;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      elementi.forEach(function (el) { el.setAttribute("visible", "si"); });
      return;
    }
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.setAttribute("visible", "si");
          io.unobserve(entry.target); // one-shot
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    elementi.forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     5. FILTRI PORTFOLIO
     ============================================================ */
  function initFiltri() {
    var barra = $("barra-filtri");
    var griglia = $("griglia-portfolio");
    if (!barra || !griglia) return;
    var pulsanti = barra.querySelectorAll("[valore-filtro]");
    var card = griglia.querySelectorAll(".card-portfolio");
    pulsanti.forEach(function (p) {
      p.addEventListener("click", function () {
        var valore = p.getAttribute("valore-filtro");
        pulsanti.forEach(function (x) { x.removeAttribute("filtro-attivo"); });
        p.setAttribute("filtro-attivo", "");
        card.forEach(function (c) {
          var cat = c.getAttribute("categoria") || "";
          if (valore === "tutti" || cat === valore) c.removeAttribute("nascosta");
          else c.setAttribute("nascosta", "");
        });
      });
    });
  }

  /* ============================================================
     6. RECENSIONI — Firebase Realtime Database via REST (fetch),
        SDK non necessario: solo JS puro. Fallback demo se DB
        vuoto/irraggiungibile. Anti-XSS: createElement + textContent.

        Struttura oggetto nel nodo "recensioni":
        { name, text, url ('' se vuoto), stars 1..5, timestamp }
     ============================================================ */
  var DEMO_REVIEWS = [
    { name: "Giulia M.", text: "Bozza arrivata in 48 ore come promesso. Ho visto il risultato prima di pagare: raro e trasparente.", url: "", stars: 5, timestamp: Date.now() - 86400000 * 9 },
    { name: "Marco R.", text: "Avevo solo Instagram e vivevo nel terrore del blocco dell'account. Ora ho un sito mio, veloce e senza canoni mensili.", url: "", stars: 5, timestamp: Date.now() - 86400000 * 21 },
    { name: "Sara L.", text: "Finalmente mi trovano su Google Maps! Il nuovo sito mi ha portato i primi clienti dal territorio in una settimana.", url: "", stars: 5, timestamp: Date.now() - 86400000 * 35 }
  ];

  function dbUrl(path) {
    if (!fb.databaseURL) return null;
    return String(fb.databaseURL).replace(/\/+$/, "") + "/" + path + ".json";
  }

  function stelline(n) {
    var out = "";
    for (var i = 0; i < 5; i++) out += i < n ? "\u2605" : "\u2606";
    return out;
  }

  function initiali(nome) {
    var parti = String(nome || "?").trim().split(/\s+/);
    var ini = (parti[0] || "?").charAt(0);
    if (parti.length > 1) ini += (parti[parti.length - 1] || "").charAt(0);
    return ini.toUpperCase();
  }

  function costruisciCard(r) {
    var card = document.createElement("article");
    card.className = "card-recensione";

    var stelle = document.createElement("div");
    stelle.className = "stelle-recensione";
    stelle.setAttribute("aria-label", (r.stars || 0) + " stelle su 5");
    stelle.textContent = stelline(Number(r.stars) || 0);
    card.appendChild(stelle);

    var testo = document.createElement("p");
    testo.textContent = String(r.text || ""); // textContent => nessun XSS
    card.appendChild(testo);

    var firma = document.createElement("div");
    firma.className = "firma-recensione";
    var avatar = document.createElement("span");
    avatar.className = "iniziali-recensore";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = initiali(r.name);
    var blocco = document.createElement("div");
    var nome = document.createElement("strong");
    nome.textContent = String(r.name || "Anonimo");
    blocco.appendChild(nome);
    if (r.url && /^https?:\/\//i.test(String(r.url))) {
      var link = document.createElement("a");
      link.href = String(r.url);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Visita sito";
      blocco.appendChild(link);
    }
    firma.appendChild(avatar);
    firma.appendChild(blocco);
    card.appendChild(firma);
    return card;
  }

  function renderReviews(recs, isDemo) {
    var griglia = $("griglia-recensioni");
    if (!griglia) return;
    griglia.innerHTML = "";
    recs.slice()
      .sort(function (a, b) { return (b.timestamp || 0) - (a.timestamp || 0); })
      .slice(0, 9)
      .forEach(function (r) { griglia.appendChild(costruisciCard(r)); });

    var mediaEl = $("media-stelle");
    var countEl = $("conteggio-recensioni");
    var nota = $("nota-demo-recensioni");
    var media = recs.length
      ? recs.reduce(function (s, r) { return s + (Number(r.stars) || 0); }, 0) / recs.length
      : 0;
    if (mediaEl) mediaEl.textContent = stelline(Math.round(media));
    if (countEl) countEl.textContent = recs.length + (recs.length === 1 ? " recensione" : " recensioni");
    if (nota) nota.textContent = isDemo
      ? "Recensioni dimostrative in attesa di connessione al database."
      : "";
  }

  function caricaRecensioni() {
    var griglia = $("griglia-recensioni");
    if (!griglia) return;
    var url = dbUrl(NODE);

    function usaDemo() {
      if (CFG.reviewDemoFallback !== false) renderReviews(DEMO_REVIEWS, true);
      else renderReviews([], false);
    }

    if (!url) { usaDemo(); return; }

    var fatto = false;
    var timer = setTimeout(function () { if (!fatto) { fatto = true; usaDemo(); } }, 5000);

    fetch(url, { headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (fatto) return;
        fatto = true;
        clearTimeout(timer);
        var recs = [];
        if (data) Object.keys(data).forEach(function (k) { if (data[k] && data[k].text) recs.push(data[k]); });
        if (recs.length) renderReviews(recs, false);
        else usaDemo();
      })
      .catch(function () {
        if (fatto) return;
        fatto = true;
        clearTimeout(timer);
        usaDemo();
      });
  }

  /* --- Form recensione rapida: POST su Firebase REST --- */
  function initFormRecensione() {
    var form = $("modulo-recensione");
    if (!form) return;
    var starButtons = form.querySelectorAll(".valutatore-stele");
    var scelta = 0;
    var text = $("testo-recensione");
    var contatore = $("contatore-caratteri");
    var msg = $("messaggio-modulo");

    function aggiornaContatore() {
      if (!text || !contatore) return;
      var restanti = LIMIT - text.value.length; // limite uniforme: 1000 caratteri
      contatore.textContent = restanti + " caratteri rimanenti";
      contatore.style.color = restanti < 0 ? "#ff7b7b" : "";
    }
    if (text) {
      text.setAttribute("maxlength", String(LIMIT));
      text.addEventListener("input", aggiornaContatore);
      aggiornaContatore();
    }

    starButtons.forEach(function (b) {
      b.addEventListener("click", function () {
        scelta = Number(b.getAttribute("valore-stella")) || 0;
        starButtons.forEach(function (x) {
          if (Number(x.getAttribute("valore-stella")) <= scelta) x.setAttribute("selected", "");
          else x.removeAttribute("selected");
        });
      });
    });

    function setMsg(t, ok) {
      if (!msg) return;
      msg.textContent = t;
      msg.removeAttribute("errore");
      msg.removeAttribute("ok");
      if (ok) msg.setAttribute("ok", ""); else msg.setAttribute("errore", "");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nomeEl = $("nome-recensore");
      var urlEl = $("url-sito-recensore");
      var nome = nomeEl ? nomeEl.value : "";
      var urlRev = urlEl ? urlEl.value.trim() : "";
      var corpo = text ? text.value.trim() : "";

      if (!nome.trim()) return setMsg("Inserisci il tuo nome.", false);
      if (!corpo) return setMsg("Scrivi una recensione.", false);
      if (corpo.length > LIMIT) return setMsg("Massimo " + LIMIT + " caratteri.", false);
      if (scelta < 1) return setMsg("Seleziona un numero di stelle.", false);
      if (urlRev && !/^https?:\/\//i.test(urlRev)) return setMsg("Il link deve iniziare con http:// o https://", false);

      var recensione = {
        name: nome.trim(),
        text: corpo,
        url: urlRev || "",
        stars: scelta,
        timestamp: Date.now()
      };

      var pushUrl = dbUrl(NODE);
      if (!pushUrl) return setMsg("Database non configurato: apertura in modalità demo.", false);

      fetch(pushUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recensione)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          setMsg("Grazie! La tua recensione è stata pubblicata.", true);
          form.reset();
          scelta = 0;
          starButtons.forEach(function (x) { x.removeAttribute("selected"); });
          aggiornaContatore();
          caricaRecensioni();
        })
        .catch(function () {
          setMsg("Invio non riuscito (database non raggiungibile). Riprova più tardi.", false);
        });
    });
  }

  /* ============================================================
     7. FORM CONTATTI -> WHATSAPP (richiesta bozza gratuita)
     ============================================================ */
  function initFormContatti() {
    var form = $("modulo-contatti");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $("messaggio-contatti");
      function setMsg(t, ok) {
        if (!msg) return;
        msg.textContent = t;
        msg.removeAttribute("errore");
        msg.removeAttribute("ok");
        if (ok) msg.setAttribute("ok", ""); else msg.setAttribute("errore", "");
      }
      var nomeEl = $("campo-nome");
      var attEl = $("campo-attivita");
      var servEl = $("campo-servizio");
      var detEl = $("campo-dettagli");
      var nome = nomeEl ? nomeEl.value.trim() : "";
      var attivita = attEl ? attEl.value.trim() : "";
      var servizio = servEl ? servEl.value : "Sito Web Base";
      var dettagli = detEl ? detEl.value.trim() : "";

      if (!nome) return setMsg("Inserisci il tuo nome.", false);
      if (!attivita) return setMsg("Indica il nome della tua attività.", false);

      var testo =
        "Ciao Webnix! Vorrei la bozza gratuita.\n" +
        "Nome: " + nome + "\n" +
        "Attività: " + attivita + "\n" +
        "Servizio: " + servizio + "\n" +
        (dettagli ? "Dettagli: " + dettagli : "");
      var numero = (CFG.contacts || {}).phoneRaw || "14132259397";
      window.open("https://wa.me/" + numero + "?text=" + encodeURIComponent(testo), "_blank", "noopener");
      setMsg("Sto aprendo WhatsApp per completare la richiesta. Grazie!", true);
      form.reset();
    });
  }

  /* ============================================================
     8. ADMIN recensioni — accesso locale + lista + DELETE REST
     ============================================================ */
  function initAdmin() {
    var lista = $("lista-admin-recensioni");
    if (!lista) return;
    var passInput = $("password-admin");
    var accesso = $("accesso-admin");
    var pannello = $("contenuto-admin");
    var SESSION_KEY = "webnix-admin-ok";

    function rigaSemplice(testo) {
      var li = document.createElement("li");
      var span = document.createElement("span");
      span.className = "testo-lista";
      span.textContent = testo; // anti-XSS
      li.appendChild(span);
      return li;
    }

    function mostraLista() {
      var url = dbUrl(NODE);
      if (!url) { lista.innerHTML = ""; lista.appendChild(rigaSemplice("Database non configurato in config.js.")); return; }
      fetch(url)
        .then(function (r) { if (!r.ok) throw new Error("HTTP"); return r.json(); })
        .then(function (data) {
          lista.innerHTML = "";
          if (!data) { lista.appendChild(rigaSemplice("Nessuna recensione nel database.")); return; }
          Object.keys(data).forEach(function (key) {
            var r = data[key];
            var li = document.createElement("li");
            var info = document.createElement("span");
            info.className = "testo-lista";
            info.textContent = "★" + (r.stars || 0) + " · " + (r.name || "?") + " — " + String(r.text || "").slice(0, 80);
            var btn = document.createElement("button");
            btn.className = "pulsante-pericolo";
            btn.type = "button";
            btn.textContent = "Elimina";
            btn.addEventListener("click", function () {
              fetch(url.replace(".json", "/" + key + ".json"), { method: "DELETE" })
                .then(mostraLista)
                .catch(mostraLista);
            });
            li.appendChild(info);
            li.appendChild(btn);
            lista.appendChild(li);
          });
        })
        .catch(function () {
          lista.innerHTML = "";
          lista.appendChild(rigaSemplice("Database non raggiungibile."));
        });
    }

    if (accesso) {
      accesso.addEventListener("submit", function (e) {
        e.preventDefault();
        var v = passInput ? passInput.value : "";
        if (v === "webnix2026") {
          try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (err) {}
          if (pannello) pannello.hidden = false;
          accesso.hidden = true;
          mostraLista();
        }
      });
      var giaDentro = false;
      try { giaDentro = sessionStorage.getItem(SESSION_KEY) === "1"; } catch (err) {}
      if (giaDentro) {
        if (pannello) pannello.hidden = false;
        accesso.hidden = true;
        mostraLista();
      }
    }
  }

  /* ============================================================
     AVVIO
     ============================================================ */
  document.addEventListener("DOMContentLoaded", function () {
    initLoader();
    initMenu();
    initSmoothAndTouch();
    initReveal();
    initFiltri();
    caricaRecensioni();
    initFormRecensione();
    initFormContatti();
    initAdmin();
  });
})();
