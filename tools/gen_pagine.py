import re

index = open('/workspace/index.html', encoding='utf-8').read()

header = re.search(r'(  <!-- ============ HEADER.*?</aside>)', index, re.S).group(1)
loader = re.search(r'(  <!-- ============ GLOBAL LOADER.*?</div>\n  </div>)', index, re.S).group(1)
footer = re.search(r'(  <!-- ============ FOOTER.*?</footer>)', index, re.S).group(1)

HEAD_TMPL = '''<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="icon" href="favicon-96x96.png" sizes="96x96">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>

'''

def build(fname, title, desc, current, main):
    h = header.replace('<a href="index.html" aria-current="page">Home</a>', '<a href="index.html">Home</a>')
    for label, page in [("Servizi", "servizi.html"), ("FAQ", "faq.html"),
                        ("Assistenza", "assistenza.html"), ("Chi Siamo", "chi-siamo.html"),
                        ("Contatti", "contatti.html"), ("Admin", "admin.html")]:
        if page == current:
            h = h.replace('<a href="%s">%s</a>' % (page, label),
                          '<a href="%s" aria-current="page">%s</a>' % (page, label))
    h = h.replace('<a href="index.html" aria-current="page"><i class="fa-solid fa-house"',
                  '<a href="index.html"><i class="fa-solid fa-house"')
    for page in ["servizi.html", "faq.html", "assistenza.html",
                 "chi-siamo.html", "contatti.html", "admin.html"]:
        if page == current:
            h = re.sub('<a href="%s"(?! aria-current)' % page,
                       '<a href="%s" aria-current="page"' % page,
                       h)
    h = h.replace('<a id="link-bozza-header" href="#contatti">', '<a id="link-bozza-header" href="contatti.html">')
    h = h.replace('<a id="link-bozza-drawer" href="#contatti">', '<a id="link-bozza-drawer" href="contatti.html">')

    doc = (HEAD_TMPL.format(title=title, desc=desc) + loader + "\n" + h +
           "\n\n  <main>\n" + main + "  </main>\n\n" + footer + '''
  <script src="config.js"></script>
  <script src="script.js"></script>
</body>
</html>
''')
    open('/workspace/' + fname, 'w', encoding='utf-8').write(doc)
    print("WROTE", fname)

INT = '''    <section id="intestazione-pagina">
      <div class="contenitore-sezione">
        <h1 id="titolo-pagina">{h1}</h1>
        <p>{intro}</p>
        <p id="percorso-navigazione"><a href="index.html">Home</a> &#8250; {crumb}</p>
      </div>
    </section>
'''

# ---------------- servizi.html ----------------
servizi_main = INT.format(h1="I nostri servizi, senza asterischi",
    intro="Prezzi chiari, limiti dichiarati. Scegli il punto di partenza: la bozza gratuita &egrave; sempre inclusa.",
    crumb="Servizi") + '''
    <section id="sezione-servizi-dettaglio">
      <div class="contenitore-sezione">
        <article class="card-servizio" id="sito-base" visible>
          <h3>Sito Web Base &euro;299 una tantum</h3>
          <div class="prezzo-servizio">Il punto di partenza</div>
          <div class="elenco-incluso"><h4>Incluso</h4><ul>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> Sito vetrina fino a 5 pagine responsive</li>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> Codice HTML/CSS/JS consegnato e tuo al 100%</li>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> SEO base + setup scheda Google Maps</li>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> Modulo contatti collegato a WhatsApp</li>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> Messa online inclusa</li>
          </ul></div>
          <div class="elenco-escluso"><h4>Escluso (onest&agrave; prima di tutto)</h4><ul>
            <li><i class="fa-solid fa-xmark" aria-hidden="true"></i> E-commerce e pagamenti online</li>
            <li><i class="fa-solid fa-xmark" aria-hidden="true"></i> Dominio + hosting annuali (~&euro;20&ndash;60/anno)</li>
            <li><i class="fa-solid fa-xmark" aria-hidden="true"></i> Manutenzione illimitata</li>
          </ul></div>
          <div riga-cta><a class="pulsante-servizio" href="contatti.html">Richiedi la bozza</a></div>
        </article>

        <article class="card-servizio" id="sito-completo" visible delay="1">
          <h3>Sito Web Completo &euro;549 una tantum</h3>
          <div class="prezzo-servizio">Per acquisire clienti da subito</div>
          <div class="elenco-incluso"><h4>Incluso (tutto il Base pi&ugrave;)</h4><ul>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> Pagine illimitate + blog/notizie</li>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> Copywriting professionale dei testi</li>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> Prenotazioni o modulo avanzato</li>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> 30 giorni di assistenza post-lancio</li>
          </ul></div>
          <div riga-cta><a class="pulsante-servizio" secondario href="contatti.html">Parliamone</a></div>
        </article>

        <article class="card-servizio" id="identita-maps" visible delay="2">
          <h3>Identit&agrave; &amp; Maps Pack &euro;199 una tantum</h3>
          <div class="prezzo-servizio">Essere trovabili, con stile</div>
          <div class="elenco-incluso"><h4>Incluso</h4><ul>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> Logo professionale + file sorgente</li>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> Scheda Google Business creata/ottimizzata</li>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> Kit social base</li>
          </ul></div>
          <div riga-cta><a class="pulsante-servizio" secondario href="contatti.html">Metti online il sito</a></div>
        </article>

        <article class="card-servizio" id="hosting" visible delay="3">
          <h3>Hosting statico &amp; dominio</h3>
          <div class="prezzo-servizio">Da &euro;0/anno</div>
          <p class="notizia-prezzo">Netlify o GitHub Pages per partire gratis; dominio personalizzato quando vuoi.</p>
          <div class="elenco-incluso"><h4>Incluso</h4><ul>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> Configurazione CDN + certificato HTTPS</li>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> Redirect www e non-www</li>
            <li><i class="fa-solid fa-check" aria-hidden="true"></i> Formazione per te: impari a gestirlo da solo</li>
          </ul></div>
          <div riga-cta><a class="pulsante-servizio" secondario href="contatti.html">Chiedi consiglio</a></div>
        </article>
      </div>
    </section>
'''
build('servizi.html', "Servizi e prezzi - Webnix | Nessun canone mensile",
      "Sito Web Base 299 euro, Completo 549, Identita e Maps 199. Cosa include e cosa no, scritto nero su bianco.",
      "servizi.html", servizi_main)

# ---------------- faq.html ----------------
def faq(dom, resp):
    return ('        <details class="dettaglio-faq" visible>\n'
            '          <summary>' + dom + '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></summary>\n'
            '          <div class="corpo-faq"><p>' + resp + '</p></div>\n'
            '        </details>\n')

faq_items = [
  ("La bozza gratuita ha davvero qualche costo?",
   "No. Realizziamo una proposta grafica del tuo sito in 48 ore. Se non ti piace, non paghi nulla. Nessuna carta di credito richiesta."),
  ("Perch&eacute; usate solo HTML, CSS e JavaScript?",
   "Perch&eacute; sono gli unici linguaggi che il browser parla nativamente: niente database da aggiornare, niente plugin da pagare, caricamento rapidissimo. &Egrave; anche ci&ograve; che rende il sito tuo per sempre, leggibile e modificabile da chiunque."),
  ("Il sito &egrave; davvero mio?",
   "S&igrave;. Ti consegnamo l'intero codice sorgente. Puoi ospitarlo dove vuoi, anche da un altro fornitore, senza lock-in."),
  ("Quanto costa mantenere il sito?",
   "Con hosting statico (Netlify o GitHub Pages) puoi partire da 0 euro/anno. Il dominio costa circa 10&ndash;15 euro/anno e lo scegli tu. Niente canoni nascosti."),
  ("Mi mettete anche su Google Maps?",
   "S&igrave;: nei pacchetti sito &egrave; incluso il setup della scheda Google Business Profile ottimizzata per la ricerca locale."),
  ("Tempi reali di consegna?",
   "Bozza in 48 ore lavorative. Sito completo finito in 5&ndash;10 giorni dalla tua approvazione."),
  ("Non ho testi n&eacute; foto, &egrave; un problema?",
   "Nessun problema: il copywriting &egrave; incluso nel pacchetto Completo e per le immagini usiamo stock libere o uno shooting coordinato con te."),
  ("Posso modificare il sito da solo dopo?",
   "Il codice &egrave; pulito e commentato: per modifiche semplici ti formiamo gratis. Per il resto c'&egrave; il piano Assistenza."),
]

faq_main = INT.format(h1="Domande frequenti",
    intro="Le risposte che ci chiedete sempre, prima ancora di aprire chat.",
    crumb="FAQ") + '''
    <section id="sezione-faq">
      <div class="contenitore-sezione">
''' + ''.join(faq(d, r) for d, r in faq_items) + '''      </div>
    </section>
'''
build('faq.html', "FAQ - Webnix | Risposte su bozza gratuita, costi e proprieta del sito",
      "Tutte le risposte su bozza gratuita 48h, proprieta del codice, costi di mantenimento e Google Maps.",
      "faq.html", faq_main)

# ---------------- assistenza.html ----------------
assist_main = INT.format(h1="Assistenza continua, senza abbonamenti furtivi",
    intro="Se il sito &egrave; tuo, l'assistenza resta un servizio che scegli &mdash; mai un obbligo.",
    crumb="Assistenza") + '''
    <section id="sezione-assistenza">
      <div class="contenitore-sezione">
        <div id="griglia-servizi">
          <article class="card-servizio" visible>
            <h3>Check-up trimestrale</h3>
            <div class="prezzo-servizio">&euro;49 <small>a check-up</small></div>
            <div class="elenco-incluso"><h4>Cosa facciamo</h4><ul>
              <li><i class="fa-solid fa-check" aria-hidden="true"></i> Controllo velocit&agrave;, link rotti e SEO locale</li>
              <li><i class="fa-solid fa-check" aria-hidden="true"></i> Piccole modifiche testo/immagini incluse</li>
              <li><i class="fa-solid fa-check" aria-hidden="true"></i> Report chiaro in una pagina</li>
            </ul></div>
            <div riga-cta><a class="pulsante-servizio" href="contatti.html">Prenota un check-up</a></div>
          </article>
          <article class="card-servizio" visible delay="1">
            <h3>Intervento singolo</h3>
            <div class="prezzo-servizio">&euro;39 <small>a modifica</small></div>
            <div class="elenco-incluso"><h4>Quando serve</h4><ul>
              <li><i class="fa-solid fa-check" aria-hidden="true"></i> Nuovo listino, nuova sezione, cambio numeri</li>
              <li><i class="fa-solid fa-check" aria-hidden="true"></i> Consegna in 48h lavorative</li>
            </ul></div>
            <div riga-cta><a class="pulsante-servizio" secondario href="contatti.html">Richiedi intervento</a></div>
          </article>
          <article class="card-servizio" visible delay="2">
            <h3>Garanzia primo mese</h3>
            <div class="prezzo-servizio">Gratis <small>inclusa</small></div>
            <div class="elenco-incluso"><h4>Dopo ogni lancio</h4><ul>
              <li><i class="fa-solid fa-check" aria-hidden="true"></i> Bug fix e micro-modifiche senza costi</li>
              <li><i class="fa-solid fa-check" aria-hidden="true"></i> Risposta entro poche ore su WhatsApp</li>
            </ul></div>
            <div riga-cta><span class="notizia-prezzo">Compresa in ogni pacchetto sito.</span></div>
          </article>
        </div>
        <p class="sottotitolo-sezione" visible>Nessuna newsletter obbligatoria. Nessun rinnovo automatico. Chiami, preventiviamo, ripari.</p>
      </div>
    </section>
'''
build('assistenza.html', "Assistenza siti web - Webnix | Check-up e interventi senza abbonamento",
      "Assistenza on-demand per il tuo sito: check-up trimestrale 49 euro, intervento singolo 39 euro, primo mese gratuito.",
      "assistenza.html", assist_main)

# ---------------- chi-siamo.html ----------------
chi_main = INT.format(h1="Chi siamo: due persone, un principio",
    intro="Webnix nasce a Genova con un'idea semplice: la presenza online di una nuova attivit&agrave; non deve essere un lusso opaco. Per questo usiamo solo HTML5 semantico, CSS moderno e JavaScript puro &mdash; gli stessi linguaggi con cui diciamo &ldquo;Dimentica WordPress&rdquo;.",
    crumb="Chi Siamo") + '''
    <section id="sezione-valori">
      <div class="contenitore-sezione">
        <h2 stile-titolo visible>I nostri principi</h2>
        <p class="sottotitolo-sezione" visible delay="1">Scrivili in contratto se serve. Preferiamo non averne bisogno.</p>
        <div id="griglia-valori">
          <div class="card-valore" visible>
            <i class="fa-solid fa-eye" aria-hidden="true"></i>
            <h3>Trasparenza radicale</h3>
            <p>Prezzo pieno prima di iniziare, cosa &egrave; escluso scritto nella card. Niente rinnovi-trappola.</p>
          </div>
          <div class="card-valore" visible delay="1">
            <i class="fa-solid fa-key" aria-hidden="true"></i>
            <h3>Propriet&agrave; totale</h3>
            <p>Il codice viene consegnato a te. Il sito resta tuo anche se un domani non lavoreremo pi&ugrave; insieme.</p>
          </div>
          <div class="card-valore" visible delay="2">
            <i class="fa-solid fa-gauge-high" aria-hidden="true"></i>
            <h3>Prestazioni</h3>
            <p>Pagine leggere che aprono in un battito: i clienti su mobile non aspettano, Google nemmeno.</p>
          </div>
          <div class="card-valore" visible delay="3">
            <i class="fa-solid fa-handshake" aria-hidden="true"></i>
            <h3>Rischio zero</h3>
            <p>Bozza gratuita in 48 ore: giudichi il lavoro prima di spendere un euro.</p>
          </div>
        </div>
      </div>
    </section>
    <section id="sezione-metodo">
      <div class="contenitore-sezione">
        <h2 stile-titolo visible>Perch&eacute; solo HTML, CSS e JS</h2>
        <p class="sottotitolo-sezione" visible delay="1">Sono gli unici tre linguaggi che il browser esegue nativamente. Nessun CMS, nessun database, nessuna dipendenza da piattaforme chiuse: meno superficie d'attacco, pi&ugrave; velocit&agrave;, costi di manutenzione quasi nulli. Il mercato vende complessit&agrave;; noi vendiamo pulizia.</p>
      </div>
    </section>
'''
build('chi-siamo.html', "Chi siamo - Webnix Digital Agency | Trasparenza e rischio zero",
      "Webnix e una digital agency di Genova: trasparenza radicale, proprieta totale del codice, solo HTML CSS e JS.",
      "chi-siamo.html", chi_main)

# ---------------- contatti.html ----------------
contatti_main = INT.format(h1="Parliamo del tuo progetto",
    intro="Due minuti adesso, una bozza reale tra 48 ore. Paghi solo se ti piace.",
    crumb="Contatti") + '''
    <section id="sezione-contatti">
      <div class="contenitore-sezione">
        <div id="disposizione-contatti">
          <div id="colonna-informazioni" visible>
            <h3>Tutti i modi per raggiungerci</h3>
            <div class="riga-contatto">
              <i class="fa-solid fa-envelope" aria-hidden="true"></i>
              <div><strong>Email</strong><br><a href="mailto:webnixit@gmail.com">webnixit@gmail.com</a></div>
            </div>
            <div class="riga-contatto">
              <i class="fa-solid fa-phone" aria-hidden="true"></i>
              <div><strong>Telefono</strong><br><a href="tel:+14132259397">+1 413 225 9397</a></div>
            </div>
            <div class="riga-contatto">
              <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
              <div><strong>Zona</strong><br>Genova, Liguria, Italia</div>
            </div>
            <div class="riga-contatto">
              <i class="fa-solid fa-clock" aria-hidden="true"></i>
              <div><strong>Orari</strong><br>Luned&igrave; &ndash; Venerd&igrave;, 09:00 &ndash; 18:00</div>
            </div>
            <div id="riga-social-contatti">
              <a href="https://wa.me/14132259397?text=Ciao%20Webnix!%20Vorrei%20la%20bozza%20gratuita%20del%20mio%20sito%20web." target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
              <a href="https://www.instagram.com/webnix.it" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a>
              <a href="https://www.facebook.com/people/Webnix-Digital-Agency/61582890411506/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fa-brands fa-facebook-f" aria-hidden="true"></i></a>
            </div>
          </div>
          <form id="modulo-contatti" visible delay="1" novalidate>
            <h3>Modulo bozza gratuita</h3>
            <div class="campo-modulo">
              <label for="campo-nome">Il tuo nome *</label>
              <input id="campo-nome" name="nome" type="text" autocomplete="name" required>
            </div>
            <div class="campo-modulo">
              <label for="campo-attivita">Nome attivit&agrave; *</label>
              <input id="campo-attivita" name="attivita" type="text" placeholder="Es. Parrucchiera Da Anna" required>
            </div>
            <div class="campo-modulo">
              <label for="campo-servizio">Servizio interessato</label>
              <select id="campo-servizio" name="servizio">
                <option value="Sito Web Base">Sito Web Base &mdash; &euro;299</option>
                <option value="Sito Web Completo">Sito Web Completo &mdash; &euro;549</option>
                <option value="Identita Maps Pack">Identit&agrave; &amp; Maps Pack &mdash; &euro;199</option>
                <option value="Non lo so">Non so ancora, consigliatemi voi</option>
              </select>
            </div>
            <div class="campo-modulo">
              <label for="campo-dettagli">Qualche dettaglio (facoltativo)</label>
              <textarea id="campo-dettagli" name="dettagli" placeholder="Cosa vendi, zona, scadenze..."></textarea>
            </div>
            <button class="pulsante-servizio" type="submit">Invia richiesta su WhatsApp</button>
            <p id="messaggio-contatti" role="status"></p>
          </form>
        </div>
      </div>
    </section>
'''
build('contatti.html', "Contatti - Webnix | Richiedi la bozza gratuita in 48 ore",
      "Contatta Webnix: email, telefono, WhatsApp e modulo per richiedere la bozza gratuita del sito in 48 ore.",
      "contatti.html", contatti_main)

# ---------------- admin.html ----------------
admin_main = INT.format(h1="Area Admin",
    intro="Gestionale recensioni: accesso locale di servizio, lista dal database Firebase e possibilit&agrave; di eliminazione.",
    crumb="Admin") + '''
    <section id="sezione-admin">
      <div class="contenitore-sezione">
        <div id="pannello-admin" visible>
          <p class="avviso-admin"><strong>Nota tecnica:</strong> questa protezione &egrave; lato client (solo HTML/CSS/JS, come tutto il sito). Serve a scoraggiare, non a blindare: per sicurezza vera servirebbe autenticazione server, che volontariamente NON adottiamo per restare fedeli al nostro messaggio.</p>
          <form id="accesso-admin" novalidate>
            <div class="campo-modulo">
              <label for="password-admin">Password di servizio</label>
              <input id="password-admin" name="password" type="password" autocomplete="off" required>
            </div>
            <button class="pulsante-servizio" type="submit">Accedi</button>
          </form>
          <div id="contenuto-admin" hidden>
            <h3>Recensioni nel database</h3>
            <ul id="lista-admin-recensioni"></ul>
          </div>
        </div>
      </div>
    </section>
'''
build('admin.html', "Admin - Webnix | Gestione recensioni",
      "Pannello amministrativo recensioni Webnix: consultazione ed eliminazione dal database.",
      "admin.html", admin_main)

print("ALL_PAGES_DONE")
