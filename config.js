/* ============================================================
   WEBNIX — config.js
   Configurazione centralizzata del sito (solo JavaScript puro).
   Firebase, contatti, social, limiti recensioni.
   Caricare PRIMA di script.js in ogni pagina.
   ============================================================ */

const WEBNIX_CONFIG = {

  /* ---------- Brand ---------- */
  brand: {
    name: "Webnix",
    fullName: "Webnix Digital Agency",
    tagline: "Digital Agency",
    year: 2026,
    logoHeader: "loghi/WEBNIX.png",
    logoFooter: "WEBNIX-Logo-Solo-Simbolo-(1).png"
  },

  /* ---------- Contatti ---------- */
  contacts: {
    email: "webnixit@gmail.com",
    phoneDisplay: "+1 413 225 9397",
    phoneRaw: "14132259397",           // per wa.me e tel:
    address: "Genova, Liguria, Italia",
    hours: "Lunedì – Venerdì, 09:00 – 18:00",
    whatsappPrefill: "Ciao Webnix! Vorrei la bozza gratuita del mio sito web."
  },

  /* ---------- Social ---------- */
  /* Instagram uniformato a webnix.it ovunque (footer, JSON-LD, config) */
  social: {
    instagram: "https://www.instagram.com/webnix.it",
    facebook: "https://www.facebook.com/people/Webnix-Digital-Agency/61582890411506/",
    whatsapp: "https://wa.me/14132259397?text=Ciao%20Webnix!%20Vorrei%20la%20bozza%20gratuita%20del%20mio%20sito%20web."
  },

  /* ---------- Recensioni (Firebase Realtime Database) ----------
     Struttura oggetto recensione nel nodo "recensioni":
     { name: string, text: string, url: string ('' se vuoto), stars: 1..5, timestamp: number }
  */
  firebase: {
    apiKey: "AIzaSyB-ESORTIVAgHbQO1hXc0EXAMPLEKEYREPLACE",
    authDomain: "webnix-reviews.firebaseapp.com",
    databaseURL: "https://webnix-reviews-default-rtdb.firebaseio.com",
    projectId: "webnix-reviews",
    storageBucket: "webnix-reviews.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:exampleappid"
  },
  reviewsNode: "recensioni",

  /* Limite caratteri recensioni UNIFORMATO a 1000
     (incoerenza precedente: commento diceva 200, il codice applicava 1000) */
  reviewCharLimit: 1000,

  /* Se true, in assenza di connessione/dati Firebase mostra recensioni demo */
  reviewDemoFallback: true
};

/* Rende la configurazione disponibile agli altri script */
window.WEBNIX_CONFIG = WEBNIX_CONFIG;
