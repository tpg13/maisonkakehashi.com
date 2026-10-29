import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const LANGS = ["en", "fr", "it", "de"] as const;
export type Lang = (typeof LANGS)[number];

const en = {
  banner: "Possibility of covering part of your notary fees*",
  bannerSmall: "*depending on the case",
  nav: { home: "Home", services: "Services", story: "My story", projects: "Projects", faq: "FAQ", book: "Book a call" },
  hero: {
    eyebrow: "Japan Property Consulting",
    title: "Construction professional, Swiss resident, property owner in Japan",
    subtitle: "Maison Kakehashi — Japan Property Consulting. Japan is closer than you think.",
    cta: "Book a call",
    secondary: "Discover the services",
    scroll: "Scroll to transform",
  },
  projects: {
    eyebrow: "Your project, your way",
    title: "Every journey to Japan starts with a different dream",
    cards: [
      ["A holiday home for you", "Your retreat in Japan, ready for every stay."],
      ["A holiday home rented out while you're away", "Enjoy it during your stays, rent it out the rest of the year."],
      ["Short-term rental investment*", "Tourist rental income, managed locally for you."],
      ["Long-term rental investment", "Steady rental income, with local management."],
      ["Relocation or retirement project", "Prepare your new life in Japan, step by step."],
      ["A base for long stays", "Live Japan several months a year, like at home."],
    ],
    note: "*subject to Japanese regulations",
  },
  services: {
    eyebrow: "Leistungen",
    title: "Klare Begleitung, von der Suche bis zur Schlüsselübergabe",
    s0: "Kostenloses Erstgespräch",
    s0Subtitle: "Ein 30-minütiges unverbindliches Gespräch über alle Möglichkeiten",
    s0Items: [
      "Erklärung der verschiedenen Anlageformen",
      "Erläuterung des Kaufprozesses & der wichtigsten Anforderungen für ausländische Käufer in Japan",
      "Verständnis Ihres individuellen Projekts",
    ],
    s0Cta: "Kostenloses Gespräch buchen",
    s0Free: "Kostenlos",
    s1: "Kaufbegleitung & Unterstützung",
    step1: "Schritt 1 — Suche & Auswahl",
    step1Items: [
      "Immobiliensuche & Objektanalyse",
      "Bereitstellung aktueller Foto- und Videoaufnahmen des Objekts und der Umgebung",
    ],
    step2: "Schritt 2 — Kauf",
    step2Items: [
      "Preisverhandlung",
      "Vertragsdetails",
      "Unterzeichnung aus der Ferne",
      "Hilfe bei Konten und Tools, die in Japan nötig sind",
      "Zahlung am Tag des Verkaufs",
    ],
    pricing: "Preise nach Immobilienpreis",
    tiers: [
      ["0 – 12k CHF", "1.350 CHF"],
      ["12k – 50k CHF", "1.850 CHF"],
      ["50k – 95k CHF", "2.750 CHF"],
      ["Über 95k CHF", "3.250 CHF"],
    ],
    payment: "Zahlung: 35 % bei Vertragsunterzeichnung, 65 % beim Kauf.",
    extras: [
      ["Renovierungsbegleitung", "(Mind. 5k CHF) 9 % der Renovierungskosten · Über 25k CHF: 7,5 %"],
      ["Vermittlung an einen Mietverwalter", "Kostenlos"],
      ["Tatsächliche Kosten", "Zum Selbstkostenpreis weiterberechnet"],
    ],
    calc: "Honorar schätzen",
    calcLabel: "Immobilienpreis (CHF)",
    calcFee: "Honorar",
    calcDeposit: "Bei Vertrag (35 %)",
    calcBalance: "Beim Kauf (65 %)",
    s2: "Inseratsprüfung",
    s2Subtitle: "Echtheit eines Immobilieninserats prüfen",
    s2Title: "Prüfen Sie, ob ein Hausinserat legitim ist, bevor Sie zahlen.",
    s2Included: "Inklusive",
    s2Items: [
      "Übersetzung",
      "Dokumentenprüfung",
      "Wichtige Kernpunkte",
      "Fallstricke: Grundstück, Wiederaufbaurecht, Baujahr, Zugang, Zustand",
      "Risikozonen",
      "Seriosität der Agentur & Kontakte",
    ],
    s2Option1Price: "75 CHF",
    s2Option1Title: "Echtheitsprüfung Inserat",
    s2Option1Desc: "Echtheitsprüfung jedes in Japan inserierten Objekts, das ein Kunde selbst findet und bei dem er unsicher ist.",
    s2Option2Price: "320 CHF",
    s2Option2Title: "Ganztägige Besichtigungstour vor Ort",
    s2Option2Desc: "Ganztägige Besichtigungstour von 3 bis 4 Häusern mit echten Videoaufnahmen durch unsere professionell registrierten Partneragenten.",
    fixed: "Festpreis",
    order: "Inseratsprüfung bestellen",
  },
  form: {
    name: "Name", email: "E-Mail", link: "Link zum Inserat", message: "Nachricht", phone: "Telefon (optional)",
    continue: "Weiter zur Zahlung", pay: "45 € bezahlen", card: "Kartennummer", expiry: "MM/JJ", cvc: "CVC",
    secure: "Simulierter sicherer Checkout — es wird keine echte Zahlung ausgeführt.",
    paid: "Vielen Dank! Ihre Inseratsprüfung ist bestätigt. Sie erhalten den Bericht in wenigen Tagen per E-Mail.",
    send: "Nachricht senden", sent: "Vielen Dank — Ihre Nachricht ist eingegangen. Ich antworte in Kürze.",
    required: "Bitte füllen Sie dieses Feld korrekt aus.", back: "Zurück",
  },
  story: {
    eyebrow: "Meine Geschichte",
    title: "Die Brücke zwischen Ihnen und Japan",
    kanji: "かけはし — Kakehashi, die Brücke",
    p1: "Mein Name ist James Loder. Seit vielen Jahren begeistere ich mich für die japanische Kultur — ihre Architektur, ihr Handwerk, ihre stille Liebe zum Detail.",
    p2: "Ich habe auf Baustellen als Kranführer in Frankreich, Belgien, Monaco und der Schweiz gearbeitet und an vielen Renovierungsprojekten mitgewirkt. Ich weiß, wie ein Gebäude entsteht — und worauf man achten muss, wenn nicht.",
    p3: "Mein eigenes Haus in Kōfu, Präfektur Yamanashi, habe ich vollständig aus der Ferne von der Schweiz aus gekauft. Alles, was ich dabei gelernt habe, stelle ich heute in Ihren Dienst.",
    p4: "Maison Kakehashi ist diese Brücke: zwischen Ihnen und Japan, zwischen Ihrem Projekt und seiner Wirklichkeit.",
    timeline: [
      ["Die Leidenschaft", "Entdeckung der japanischen Kultur, Architektur und Handwerkskunst."],
      ["Die Baustellen", "Kranführer in Frankreich, Belgien, Monaco und der Schweiz."],
      ["Renovierung", "Praktische Erfahrung auf Renovierungsbaustellen."],
      ["Kōfu", "Kauf eines Hauses in Yamanashi, vollständig aus der Ferne aus der Schweiz."],
      ["Maison Kakehashi", "Kunden sicher auf demselben Weg begleiten."],
    ],
  },
  cases: {
    eyebrow: "Meine Projekte & Kundenprojekte",
    title: "Echte Fälle, echte Häuser",
    items: [
      ["Mein Haus in Kōfu — in Arbeit", "Aus der Schweiz aus der Ferne gekauft. Renovierung mit lokalen Handwerkern im Gange, unter Erhalt der originalen Zedernstruktur und mit Öffnung zum Fuji."],
      ["Landhaus — für einen Kunden analysiert", "Ein traditionelles zweistöckiges Haus in einem ruhigen Dorf. Wiederaufbaurecht und Zugang geprüft; ein verstecktes Grundstücksproblem wurde vor jeder Verpflichtung entdeckt."],
      ["Stadthaus — für einen Kunden analysiert", "Ein kompaktes Haus für lange Aufenthalte. Baujahr, Zustand und Seriosität der Agentur geprüft; die Verhandlung brachte den Preis auf ein faires Niveau."],
    ],
    hidden: "Standort verborgen",
    different: "Jeder Fall ist anders.",
  },
  book: {
    eyebrow: "Gespräch buchen",
    title: "Ein 30-minütiges Kennenlerngespräch",
    intro: "Erzählen Sie mir von Ihrem Projekt. Unverbindlich — einfach ein klares Gespräch darüber, was möglich ist.",
    lunch: "Mittag", evening: "Abend",
    pick: "Termin wählen", selected: "Gewählter Termin", confirm: "Diesen Termin anfragen",
    confirmed: "Ihre Anfrage wurde gesendet. Sie erhalten eine Bestätigung per E-Mail.",
    calendly: "Online-Kalender folgt in Kürze — die angezeigten Termine sind eine Vorschau.",
    contact: "Oder schreiben Sie mir",
    tz: "Zeiten in Schweizer Zeit (MEZ)",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Häufige Fragen",
    items: [
      ["Kann ein Ausländer in Japan ein Haus kaufen?", "Ja. Japan schränkt den Immobilienkauf durch Ausländer nicht ein — weder Wohnsitz noch Visum sind nötig, um Eigentümer zu werden."],
      ["Muss ich für den Kauf nach Japan reisen?", "Nein. Der gesamte Kauf kann aus der Ferne erfolgen: Besichtigungen per Video, Unterzeichnung und Zahlung aus der Ferne. Ich habe mein eigenes Haus so von der Schweiz aus gekauft."],
      ["Ich spreche weder Japanisch noch Englisch. Ist das ein Problem?", "Überhaupt nicht. Ich begleite Sie, übersetze und erkläre jedes Dokument und jeden Austausch mit Agenturen und Notaren."],
      ["Was kostet ein Haus wirklich?", "Manche Häuser werden für wenige tausend Euro angeboten, doch hinzu kommen Steuern, Notarkosten, eventuelle Renovierung und laufende Kosten. Wir prüfen gemeinsam das Gesamtbudget, bevor Sie sich verpflichten."],
      ["Wie funktioniert die Begleitung?", "Zuerst ein kostenloses Kennenlerngespräch. Dann Suche & Auswahl, gefolgt vom Kauf — Verhandlung, Verträge, Unterzeichnung und Zahlung — mit klaren Festhonoraren."],
    ],
  },
  cta: { title: "Japan ist näher, als Sie denken.", text: "Sprechen wir in einem 30-minütigen Gespräch über Ihr Projekt.", button: "Gespräch buchen" },
  footer: {
    consultant: "Maison Kakehashi handelt als Berater, nicht als Immobilienmakler.",
    tagline: "Immobilienberatung in Japan",
    legal: "Impressum", privacy: "Datenschutz", lang: "Sprache", rights: "Alle Rechte vorbehalten.",
  },
  legal: {
    title: "Impressum",
    body: [
      "Maison Kakehashi — Japan Property Consulting. Herausgeber: James Loder, Schweiz.",
      "Maison Kakehashi handelt als Berater, nicht als Immobilienmakler. Transaktionen werden zwischen Käufer und Verkäufer über zugelassene japanische Agenturen und Notare abgeschlossen.",
      "Kontakt: über das Buchungsformular dieser Website.",
    ],
  },
  privacy: {
    title: "Datenschutz",
    body: [
      "Über die Formulare übermittelte Daten (Name, E-Mail, Nachricht, Inseratslink) werden nur zur Beantwortung Ihrer Anfrage verwendet und niemals verkauft.",
      "Sie können jederzeit über das Kontaktformular Auskunft, Berichtigung oder Löschung Ihrer Daten verlangen.",
      "Diese Website speichert Ihre Sprachwahl lokal in Ihrem Browser.",
    ],
  },
};

export const DICTS: Record<Lang, Dict> = { en, fr, it, de };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: en });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = localStorage.getItem("mk-lang") as Lang | null;
    if (saved && LANGS.includes(saved)) setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("mk-lang", l);
  };
  return <I18nContext.Provider value={{ lang, setLang, t: DICTS[lang] }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
