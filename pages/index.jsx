import React, { useState, useEffect } from 'react';
import { Star, Mail, Video, Send } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Supabase Konfiguration
const supabaseUrl = 'https://fvmkfpqstkadeihudcty.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtmcHFzdGthZGVpaHVkY3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzYxODMsImV4cCI6MjA3ODExMjE4M30.4J0g_Fc9w7fNodK5-BIjV889-npNE1AhM2-0UA4ZccQ';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function EierPlattform() {
  const WHATSAPP_NUMMER = "4915168472345";
  const preisProEi = 0.35;

  const [eierAnzahl, setEierAnzahl] = useState(0);
  const [eierInBestellung, setEierInBestellung] = useState(0);
  const [lieferart, setLieferart] = useState('abholen');
  const [wunschzeit, setWunschzeit] = useState('');
  const [bewertung, setBewertung] = useState(5);
  const [bewertungstext, setBewertungstext] = useState('');
  const [name, setName] = useState('');
  const [kundenName, setKundenName] = useState('');
  const [kundenAdresse, setKundenAdresse] = useState('');
  const [eierAufLager, setEierAufLager] = useState(10);
  const [eierkartonsMitbringen, setEierkartonsMitbringen] = useState(false);
  const [kartonsBedarf, setKartonsBedarf] = useState(true);

  // Admin-Bereich
  const [adminPasswort, setAdminPasswort] = useState('');
  const [istAngemeldet, setIstAngemeldet] = useState(false);
  const [neuerBestand, setNeuerBestand] = useState(10);
  const ADMIN_PASSWORT = "Fredeggs2024";
  
  // Adventskalender
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [currentStory, setCurrentStory] = useState({ day: 0, text: '', icon: '' });

  // Lade gespeicherte Werte beim Start aus Supabase
  useEffect(() => {
    ladeBestandAusSupabase();
    
    // Echtzeit-Updates abonnieren
    const channel = supabase
      .channel('bestand-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bestand' }, 
        () => {
          ladeBestandAusSupabase();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const ladeBestandAusSupabase = async () => {
    const { data, error } = await supabase
      .from('bestand')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (data) {
      setEierAufLager(data.eier_anzahl);
      setNeuerBestand(data.eier_anzahl);
      setKartonsBedarf(data.kartons_bedarf);
    }
  };

  const adminLogin = () => {
    if (adminPasswort === ADMIN_PASSWORT) {
      setIstAngemeldet(true);
      setAdminPasswort('');
    } else {
      alert('Falsches Passwort!');
    }
  };

  const bestandAktualisieren = async () => {
    const { error } = await supabase
      .from('bestand')
      .update({ 
        eier_anzahl: neuerBestand,
        kartons_bedarf: kartonsBedarf 
      })
      .eq('id', 1);
    
    if (error) {
      alert('Fehler beim Speichern: ' + error.message);
    } else {
      setEierAufLager(neuerBestand);
      setEierInBestellung(0);
      alert(`Bestand aktualisiert auf ${neuerBestand} Eier!`);
    }
  };

  const handleEierAnzahlChange = (anzahl) => {
    setEierAnzahl(anzahl);
    setEierInBestellung(anzahl);
  };

  const besitzerInfo = {
    name: "Fredeggs, Münster",
    email: "Feldhege.Frederik@T-online.de",
    whatsapp: "+49 123 456789"
  };

  const videos = [
    { id: 1, titel: "Unsere Haltungsart", datei: "/videos/IMG_0089.MP4" },
    { id: 2, titel: "Wie die Hühner gefüttert werden", datei: "/videos/Fuetterung.mp4" }
  ];

  const bestellungAbsenden = async () => {
    if (!kundenName) {
      alert('Bitte Namen eingeben!');
      return;
    }

    const neuerBestand = Math.max(0, eierAufLager - eierAnzahl);
    const { error } = await supabase
      .from('bestand')
      .update({ eier_anzahl: neuerBestand })
      .eq('id', 1);

    if (error) {
      alert('Fehler beim Aktualisieren des Bestands');
      return;
    }

    setEierAufLager(neuerBestand);
    setEierInBestellung(0);

    const nachricht = `🐓 *Neue Eierbestellung - Fredeggs*\n\n👤 Name: ${kundenName}${kundenAdresse ? `\n📍 Adresse: ${kundenAdresse}` : ''}\n\n🥚 Anzahl: ${eierAnzahl} Eier\n💰 Preis: ${(eierAnzahl * preisProEi).toFixed(2)} €\n\n${lieferart === 'abholen' ? '🏪 Selbst abholen' : `🚚 Lieferung${wunschzeit ? ` um ${wunschzeit} Uhr` : ''}`}\n\n${eierkartonsMitbringen ? '📦 Ich kann Eierkartons mitbringen' : ''}`;

    const waUrl = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      ? `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMMER}&text=${encodeURIComponent(nachricht)}`
      : `https://wa.me/${WHATSAPP_NUMMER}?text=${encodeURIComponent(nachricht)}`;

    window.location.href = waUrl;

    setEierAnzahl(0);
    setKundenName('');
    setKundenAdresse('');
    setWunschzeit('');
    setEierkartonsMitbringen(false);
  };

  const bewertungSenden = () => {
    if (!name || !bewertungstext) {
      alert('Bitte Name und Bewertung eingeben!');
      return;
    }

    const nachricht = `⭐ *Neue Bewertung - Fredeggs*\n\n👤 Von: ${name}\n⭐ Bewertung: ${bewertung} Sterne\n\n💬 Nachricht:\n${bewertungstext}`;

    const waUrl = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      ? `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMMER}&text=${encodeURIComponent(nachricht)}`
      : `https://wa.me/${WHATSAPP_NUMMER}?text=${encodeURIComponent(nachricht)}`;

    window.location.href = waUrl;

    setName('');
    setBewertung(5);
    setBewertungstext('');
  };

  // Adventskalender Daten
  const stories = {
    1: "Im Hühnerstall herrscht Panik: Die vier Advents-Eier sind verschwunden! Berta, Dotti, Henriette und Frieda gackern durcheinander.",
    2: "Berta verdächtigt sofort den Fuchs Felix. Dotti schüttelt den Kopf: \"Der frisst Eier sofort!\"",
    3: "Die Hühner-Detektivinnen starten ihre Suche. Henriette findet eine goldene Feder beim Zaun!",
    4: "\"Das ist vom Weihnachtsengel!\", ruft Frieda. Berta verdreht die Augen: \"Das ist von Ute, der Nachbarshenne!\"",
    5: "Sie verhören Ute im Nachbargehege. \"Keine Zeit für Eierklau, ich muss zum Hühnerfriseur!\"",
    6: "Am Nikolaustag finden sie einen Stiefel voller Körner. Berta futtert sofort los – vielleicht eine Falle?",
    7: "Verdächtiges Kichern im Stall! Sie erwischen Hahn Hermann beim Eierlegen-Üben.",
    8: "Hermann wird rot wie sein Kamm. Die Hühner lachen sich die Federn aus dem Gefieder!",
    9: "Berta hat eine Theorie: \"Die Eier haben sich selbst versteckt!\" Frieda seufzt: \"Zu viele Krimis geguckt...\"",
    10: "Mysteriöse Pfotenabdrücke im Gehege! Das Kaninchen Klaus wird verdächtigt.",
    11: "Klaus protestiert empört: \"Ich esse nur Karotten!\" Er hoppelt beleidigt davon und vergisst seine Brille.",
    12: "Mit Klaus' Brille entdecken sie eine Botschaft: \"Die Eier sind näher als ihr denkt!\" Wer war das?",
    13: "Berta untersucht die Schrift mit Lupe. \"Das ist eindeutig Gänseschrift!\"",
    14: "Gans Gisela lacht sich halbtot: \"Ich bin viel zu faul zum Eierverstecken!\" Drei Federn fallen aus.",
    15: "Henriette will systematisch suchen. Dotti: \"Aber erst nach dem Mittagessen!\"",
    16: "Nach 47 Schnecken durchwühlen sie alles. Kompost, Stroh, Futtertröge – nichts!",
    17: "Frieda hat eine Erleuchtung: \"Vielleicht hat jemand die Eier FÜR uns versteckt?\" Das ergibt Sinn!",
    18: "Ein Zettel am Stalltor: \"Findet eure 4 Eier bis Heiligabend! Eure Weihnachtsfee.\" Die Hühner sind baff!",
    19: "\"Eine Weihnachtsfee für Hühner?\", fragt Dotti. Berta nickt: \"Warum nicht?\"",
    20: "Sie teilen das Gehege in vier Suchzonen. Wer zuerst sein Ei findet, kriegt extra Mais!",
    21: "Henriette findet ihr Ei hinter dem Wassertrog! Es glänzt golden in der Sonne.",
    22: "Dotti entdeckt ihres unter Laub, Frieda ihres im Futterkasten. Nur Berta sucht noch verzweifelt!",
    23: "Berta findet ihr Ei in ihrem eigenen Nest. Sie hatte die ganze Zeit darauf gesessen!",
    24: "Bauer Fritz gesteht: ER war die Weihnachtsfee! Alle gackern glücklich bis Mitternacht. 🎄✨"
  };

  const storyIcons = {
    1: "😱", 2: "🦊", 3: "🔍", 4: "👼", 5: "💇♀️", 6: "🥾",
    7: "😂", 8: "🤣", 9: "📺", 10: "🐰", 11: "👓", 12: "📜",
    13: "🔎", 14: "🦆", 15: "🍽️", 16: "🐌", 17: "💡", 18: "✉️",
    19: "🤔", 20: "🌽", 21: "✨", 22: "🍂", 23: "🪺", 24: "🎅"
  };

  const doorEmojis = {
    1: "🐔", 2: "🐓", 3: "🐤", 4: "🐥", 5: "🐣", 6: "🥚",
    7: "🪺", 8: "🌾", 9: "🌽", 10: "🐰", 11: "🦊", 12: "📜",
    13: "🔍", 14: "🦆", 15: "🍂", 16: "🐌", 17: "💡", 18: "✉️",
    19: "🎄", 20: "⭐", 21: "✨", 22: "🎁", 23: "🔔", 24: "🎅"
  };

  const openDoor = (day) => {
    if (typeof window !== 'undefined') {
      const openedDoors = JSON.parse(localStorage.getItem('openedDoors') || '[]');
      if (!openedDoors.includes(day)) {
        openedDoors.push(day);
        localStorage.setItem('openedDoors', JSON.stringify(openedDoors));
      }
    }
    
    setCurrentStory({
      day: day,
      text: stories[day],
      icon: storyIcons[day]
    });
    setShowStoryModal(true);
  };

  const renderAdventCalendar = () => {
    const heute = new Date();
    const currentDay = heute.getDate();
    const currentMonth = heute.getMonth() + 1;
    
    if (currentMonth !== 12) return null;
    
    const openedDoors = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('openedDoors') || '[]')
      : [];
    const numbers = Array.from({length: 24}, (_, i) => i + 1);
    numbers.sort(() => Math.random() - 0.5);

    return (
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-12 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-yellow-400 mb-3" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.7)'}}>
            🎄 Hühner-Adventskalender 🐔
          </h1>
          <p className="text-center text-orange-300 text-lg mb-8" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>
            Die große Eiersuche von Berta, Dotti, Henriette und Frieda
          </p>
          
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-w-4xl mx-auto">
            {numbers.map(num => {
              const canOpen = num <= currentDay;
              const isActive = num === currentDay && !openedDoors.includes(num);
              const isOpened = openedDoors.includes(num);
              
              return (
                <div 
                  key={num}
                  onClick={() => canOpen && openDoor(num)}
                  className={`
                    aspect-[0.87] rounded-xl border-4 flex flex-col items-center justify-center relative overflow-hidden
                    ${!canOpen ? 'bg-gradient-to-br from-gray-600 to-gray-800 border-gray-500 opacity-60 cursor-not-allowed' : ''}
                    ${isActive ? 'bg-gradient-to-br from-yellow-400 to-orange-400 border-red-900 animate-pulse cursor-pointer hover:scale-105' : ''}
                    ${isOpened && canOpen ? 'bg-gradient-to-br from-green-700 to-green-900 border-green-400 cursor-pointer hover:scale-105' : ''}
                    ${!isActive && !isOpened && canOpen ? 'bg-gradient-to-br from-red-700 to-red-900 border-yellow-400 cursor-pointer hover:scale-105' : ''}
                    transition-transform duration-300
                  `}
                >
                  <div className="text-4xl md:text-5xl mb-2">
                    {doorEmojis[num]}
                  </div>
                  <div className={`
                    text-3xl md:text-4xl font-bold px-3 py-1 rounded-lg
                    ${isActive ? 'bg-red-900 text-yellow-400' : 'bg-black bg-opacity-80 text-yellow-400'}
                    border-2 border-yellow-400
                  `} style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                    {num}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Story Modal */}
      {showStoryModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-80 z-50"
            onClick={() => setShowStoryModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-3xl max-w-lg w-11/12 z-50 border-8 border-amber-800 shadow-2xl">
            <div className="text-6xl text-center mb-4">{currentStory.icon}</div>
            <h2 className="text-3xl font-bold text-center text-red-900 mb-6">
              {currentStory.day}. Dezember
            </h2>
            <p className="text-xl leading-relaxed text-gray-800 mb-8">
              {currentStory.text}
            </p>
            <button 
              onClick={() => setShowStoryModal(false)}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-red-900 py-4 px-8 text-xl font-bold rounded-xl hover:scale-105 transition-transform"
            >
              Schließen
            </button>
          </div>
        </>
      )}

      {/* Adventskalender */}
      {renderAdventCalendar()}

      {/* Header */}
      <header className="bg-amber-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center">🥚 Fredeggs - Frische Eier vom Hof 🐔</h1>
          <p className="text-center mt-2 text-lg">Bestellen Sie jetzt Ihre frischen Bio-Eier!</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Bestandsanzeige */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-amber-800">Verfügbare Eier</h2>
              <p className="text-gray-600">Aktueller Bestand</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-amber-600">{eierAufLager}</p>
              <p className="text-gray-500">Stück</p>
            </div>
          </div>
          {kartonsBedarf && (
            <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-blue-800">📦 <strong>Eierkartons werden benötigt!</strong></p>
            </div>
          )}
          {eierInBestellung > 0 && (
            <div className="mt-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
              <p className="text-green-800">📦 In Bestellung: {eierInBestellung} Eier</p>
            </div>
          )}
        </div>

        {/* Bestellformular */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-amber-800 mb-6">Jetzt bestellen</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Anzahl der Eier: {eierAnzahl} Stück</label>
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xl font-bold text-amber-800">
                  Preis: {(eierAnzahl * preisProEi).toFixed(2)} € <span className="text-sm font-normal text-gray-600">({preisProEi.toFixed(2)} € pro Ei PREISSENKUNG)</span>
                </p>
              </div>
              <input 
                type="range" 
                min="0" 
                max="20" 
                step="2" 
                value={eierAnzahl} 
                onChange={(e) => handleEierAnzahlChange(Number(e.target.value))} 
                className="w-full h-3 bg-amber-200 rounded-lg" 
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Ihr Name: <span className="text-red-600">*</span></label>
              <input type="text" value={kundenName} onChange={(e) => setKundenName(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-3" placeholder="Max Mustermann" />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Ihre Adresse: <span className="text-gray-400 text-sm">(optional)</span></label>
              <input type="text" value={kundenAdresse} onChange={(e) => setKundenAdresse(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-3" placeholder="Musterstraße 123" />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-3">Lieferart:</label>
              <div className="space-y-3">
                <div onClick={() => setLieferart('abholen')} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer ${lieferart === 'abholen' ? 'border-amber-600 bg-amber-50' : 'border-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${lieferart === 'abholen' ? 'border-amber-600' : 'border-gray-400'}`}>
                    {lieferart === 'abholen' && <div className="w-3 h-3 rounded-full bg-amber-600"></div>}
                  </div>
                  <span className="ml-3">Selbst abholen</span>
                </div>
                <div onClick={() => setLieferart('liefern')} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer ${lieferart === 'liefern' ? 'border-amber-600 bg-amber-50' : 'border-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${lieferart === 'liefern' ? 'border-amber-600' : 'border-gray-400'}`}>
                    {lieferart === 'liefern' && <div className="w-3 h-3 rounded-full bg-amber-600"></div>}
                  </div>
                  <span className="ml-3">Lieferung nach Hause</span>
                </div>
              </div>
            </div>

            {lieferart === 'liefern' && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Wunschzeit für Lieferung:</label>
                <input 
                  type="text" 
                  value={wunschzeit} 
                  onChange={(e) => setWunschzeit(e.target.value)} 
                  className="w-full border-2 border-gray-300 rounded-lg p-3" 
                  placeholder="z.B. 15:00 oder 14:30-17:00" 
                />
              </div>
            )}

            <div onClick={() => setEierkartonsMitbringen(!eierkartonsMitbringen)} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer ${eierkartonsMitbringen ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${eierkartonsMitbringen ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}>
                {eierkartonsMitbringen && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              <span className="ml-3">Ich kann Eierkartons mitbringen</span>
            </div>

            <button onClick={bestellungAbsenden} className="w-full bg-amber-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-amber-700">
              Jetzt per WhatsApp bestellen
            </button>

            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">💡 <strong>Hinweis:</strong> WhatsApp öffnet sich mit vorausgefüllter Bestellung!</p>
            </div>

            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-sm text-red-800">⚠️ <strong>Stornierung:</strong> Nur bis 1 Tag vorher möglich!</p>
            </div>
          </div>
        </div>

        {/* Videos */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-2">
            <Video className="w-7 h-7" />
            Videos über unsere Hühner
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="border-2 border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-center mb-3">{video.titel}</h3>
                <video 
                  controls 
                  className="w-full rounded-lg"
                  poster="/videos/thumbnail.jpg"
                >
                  <source src={video.datei} type="video/mp4" />
                  Dein Browser unterstützt keine Videos.
                </video>
              </div>
            ))}
          </div>
        </div>

        {/* Bewertung */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-amber-800 mb-6">Bewertung abgeben</h2>
          <div className="space-y-4">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border-2 p-3 rounded-lg" placeholder="Ihr Name" />
            
            <div>
              <p className="mb-2">Bewertung: {bewertung} Sterne</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((stern) => (
                  <Star key={stern} className={`w-10 h-10 cursor-pointer ${stern <= bewertung ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} onClick={() => setBewertung(stern)} />
                ))}
              </div>
            </div>

            <textarea value={bewertungstext} onChange={(e) => setBewertungstext(e.target.value)} className="w-full border-2 p-3 h-32 rounded-lg" placeholder="Ihre Nachricht..." />
            
            <button onClick={bewertungSenden} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              Bewertung senden
            </button>
          </div>
        </div>

        {/* Kontakt */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-amber-800 mb-6">Kontakt</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🐓</div>
              <div>
                <h3 className="font-bold text-lg">{besitzerInfo.name}</h3>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-amber-600" />
              <a href={`mailto:${besitzerInfo.email}`} className="text-blue-600 hover:underline">{besitzerInfo.email}</a>
            </div>
          </div>
        </div>

        {/* Admin-Bereich */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-amber-600">
          <h2 className="text-2xl font-bold text-amber-800 mb-4 flex items-center gap-2">
            🔐 Admin-Bereich
          </h2>
          
          {!istAngemeldet ? (
            <div className="space-y-4">
              <input 
                type="password" 
                value={adminPasswort} 
                onChange={(e) => setAdminPasswort(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && adminLogin()}
                className="w-full border-2 p-3 rounded-lg" 
                placeholder="Admin-Passwort" 
              />
              <button onClick={adminLogin} className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700">
                Anmelden
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">Neuer Bestand:</label>
                <input 
                  type="number" 
                  value={neuerBestand} 
                  onChange={(e) => setNeuerBestand(Number(e.target.value))}
                  className="w-full border-2 p-3 rounded-lg" 
                />
              </div>
              
              <div>
                <label className="block mb-2 font-semibold">Eierkartons benötigt?</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setKartonsBedarf(true)}
                    className={`flex-1 py-2 rounded-lg font-semibold ${kartonsBedarf ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Ja, Bedarf
                  </button>
                  <button 
                    onClick={() => setKartonsBedarf(false)}
                    className={`flex-1 py-2 rounded-lg font-semibold ${!kartonsBedarf ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Kein Bedarf
                  </button>
                </div>
              </div>
              
              <button 
                onClick={bestandAktualisieren}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
              >
                Bestand speichern
              </button>
              
              <button 
                onClick={() => setIstAngemeldet(false)}
                className="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
              >
                Abmelden
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-amber-800 text-white text-center p-6">
        <p>© 2024 Fredeggs 🐔</p>
      </footer>
    </div>
  );
}
