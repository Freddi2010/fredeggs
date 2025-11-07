import React, { useState, useEffect } from 'react';
import { Star, Mail, Video, Send } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

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

  const [adminPasswort, setAdminPasswort] = useState('');
  const [istAngemeldet, setIstAngemeldet] = useState(false);
  const [neuerBestand, setNeuerBestand] = useState(10);
  const ADMIN_PASSWORT = "Fredeggs2024";

  useEffect(() => {
    ladeBestandAusSupabase();
    const channel = supabase
      .channel('bestand-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bestand' }, 
        () => { ladeBestandAusSupabase(); }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const ladeBestandAusSupabase = async () => {
    const { data } = await supabase.from('bestand').select('*').eq('id', 1).single();
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
    } else alert('Falsches Passwort!');
  };

  const bestandAktualisieren = async () => {
    const { error } = await supabase
      .from('bestand')
      .update({ eier_anzahl: neuerBestand, kartons_bedarf: kartonsBedarf })
      .eq('id', 1);
    if (error) alert('Fehler beim Speichern: ' + error.message);
    else {
      setEierAufLager(neuerBestand);
      setEierInBestellung(0);
      alert(`Bestand aktualisiert auf ${neuerBestand} Eier!`);
    }
  };

  const handleEierAnzahlChange = (anzahl) => {
    setEierAnzahl(anzahl);
    setEierInBestellung(anzahl);
  };

  const bestellungAbsenden = async () => {
    if (!kundenName) {
      alert('Bitte Namen eingeben!');
      return;
    }

    const neuerBestand = Math.max(0, eierAufLager - eierAnzahl);
    const { error } = await supabase.from('bestand').update({ eier_anzahl: neuerBestand }).eq('id', 1);
    if (error) {
      alert('Fehler beim Aktualisieren des Bestands');
      return;
    }

    setEierAufLager(neuerBestand);
    setEierInBestellung(0);

    const nachricht =
`🐓 *Neue Eierbestellung - Fredeggs*

👤 Name: ${kundenName}${kundenAdresse ? `\n📍 Adresse: ${kundenAdresse}` : ''}

🥚 Anzahl: ${eierAnzahl} Eier
💰 Preis: ${(eierAnzahl * preisProEi).toFixed(2)} €

${lieferart === 'abholen' ? '🏪 Selbst abholen' : `🚚 Lieferung${wunschzeit ? ` um ${wunschzeit} Uhr` : ''}`}
${eierkartonsMitbringen ? '\n📦 Ich kann Eierkartons mitbringen' : ''}`;

    window.open(`https://wa.me/${WHATSAPP_NUMMER}?text=${encodeURIComponent(nachricht)}`, '_blank');
  };

  const bewertungSenden = () => {
    if (!name || !bewertungstext) {
      alert('Bitte Name und Bewertung eingeben!');
      return;
    }
    const nachricht =
`⭐ *Neue Bewertung - Fredeggs*

👤 Von: ${name}
⭐ Bewertung: ${bewertung} Sterne

💬 Nachricht:
${bewertungstext}`;

    window.open(`https://wa.me/${WHATSAPP_NUMMER}?text=${encodeURIComponent(nachricht)}`, '_blank');
    setBewertungstext('');
    setName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">

      {/* --- Header --- */}
      <header className="bg-amber-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="text-6xl">🐓</div>
          <div>
            <h1 className="text-4xl font-bold">FredEggs</h1>
            <p className="text-amber-100">Direkt aus Ihrer Nachbarschaft</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* --- Bestellbereich --- */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-amber-800 mb-6">Eier bestellen</h2>

          <div className="space-y-6">
            {/* Eieranzahl */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Ihr Name *</label>
              <input type="text" value={kundenName} onChange={(e) => setKundenName(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-3" placeholder="Max Mustermann" />
            </div>

            <button 
              type="button"
              onClick={bestellungAbsenden} 
              className="w-full bg-amber-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-amber-700"
            >
              Jetzt per WhatsApp bestellen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
