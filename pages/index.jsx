import React, { useState, useEffect } from 'react';
import { Star, Mail, Video, Send } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Supabase Konfiguration
const supabaseUrl = 'https://fvmkfpqstkadeihudcty.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtmcHFzdGthZGVpaHVkY3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzYxODMsImV4cCI6MjA3ODExMjE4M30.4J0g_Fc9w7fNodK5-BIjV889-npNE1AhM2-0UA4ZccQ';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function EierPlattform() {
  const WHATSAPP_NUMMER = "4915168472345";
  const preisProEi = 0.40;

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
    { id: 2, titel: "Wie die Hühner gefüttert werden", datei: "/videos/IMG_0089.MP4" }
  ];

  // Angepasste Bestellfunktion für iOS & Desktop
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

  // Bewertungsfunktion ebenfalls angepasst
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

    setBewertungstext('');
    setName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <header className="bg-amber-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="text-6xl">🐓</div>
          <div>
            <h1 className="text-4xl font-bold">FredEggs</h1>
            <p className="text-amber-100">Direkt aus Ihrer Nachbarschaft</p>
          </div>
        </div>
      </header>

      {/* Hero-Bild mit bratenden Eiern */}
      <div className="w-full h-64 md:h-96 relative overflow-hidden">
        <img 
          src="/images/bratende-eier.jpg" 
          alt="Frische Eier in der Pfanne" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/50 to-transparent flex items-end justify-center pb-8">
          <h2 className="text-white text-3xl md:text-4xl font-bold drop-shadow-lg">
            Frische Eier aus Ihrer Nachbarschaft 🥚
          </h2>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-amber-800 mb-6">Eier bestellen</h2>
          
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <p className="text-lg font-semibold text-green-800">
              📦 Aktuell auf Lager: <span className="text-2xl">{eierAufLager}</span> frische Eier
            </p>
            <p className="text-md text-green-700 mt-2">
              🛒 Davon bestellt: <span className="text-xl font-semibold">{eierInBestellung}</span> Eier
            </p>
            <p className="text-md text-green-700 mt-1">
              ✅ Noch verfügbar: <span className="text-xl font-semibold">{Math.max(0, eierAufLager - eierInBestellung)}</span> Eier
            </p>
          </div>

          {kartonsBedarf && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-lg font-semibold text-blue-800">
                ℹ️ Wir haben aktuell Bedarf an Eierkartons!
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Anzahl der Eier: {eierAnzahl} Stück</label>
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xl font-bold text-amber-800">
                  Preis: {(eierAnzahl * preisProEi).toFixed(2)} € <span className="text-sm font-normal text-gray-600">({preisProEi} € pro Ei)</span>
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
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
                <span>10</span>
                <span>12</span>
                <span>14</span>
                <span>16</span>
                <span>18</span>
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

        <div className="bg-white rounded-xl shadow-lg p-8">
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

        <div className="bg-white rounded-xl shadow-lg p-8">
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

        <div className="bg-white rounded-xl shadow-lg p-8">
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
              <p className="text-gray-600">Melde dich an, um den Eierbestand zu aktualisieren</p>
              <input 
                type="password" 
                value={adminPasswort} 
                onChange={(e) => setAdminPasswort(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && adminLogin()}
                className="w-full border-2 border-gray-300 rounded-lg p-3" 
                placeholder="Passwort eingeben" 
              />
              <button 
                onClick={adminLogin}
                className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700"
              >
                Anmelden
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">✓ Erfolgreich angemeldet!</p>
              </div>
              
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  📦 Aktueller Bestand: <span className="font-bold text-xl">{eierAufLager}</span> Eier
                </p>
                <p className="text-blue-700 mt-1">
                  🛒 Davon bestellt: <span className="font-semibold">{eierInBestellung}</span> Eier
                </p>
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Neuer Bestand: {neuerBestand} Eier
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={neuerBestand} 
                  onChange={(e) => setNeuerBestand(Number(e.target.value))}
                  className="w-full h-3 bg-amber-200 rounded-lg" 
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <p className="text-gray-800 font-semibold mb-3">Bedarf an Eierkartons:</p>
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
      </div>

      <footer className="bg-amber-800 text-white text-center p-6">
        <p>© 2024 Fredeggs 🐔</p>
      </footer>
    </div>
  );
}
