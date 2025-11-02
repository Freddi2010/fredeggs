# FredEggs - Eier-Bestellplattform

## 🥚 Über das Projekt
FredEggs ist eine Bestellplattform für frische Eier direkt aus der Nachbarschaft mit WhatsApp-Integration.

## 🚀 Installation

1. Repository klonen
2. Abhängigkeiten installieren:
```bash
npm install
```

3. Development Server starten:
```bash
npm run dev
```

4. Öffne [http://localhost:3000](http://localhost:3000)

## 📦 Deployment auf Vercel

1. Push das Repository zu GitHub
2. Gehe zu [vercel.com](https://vercel.com)
3. Importiere dein GitHub Repository
4. Klicke "Deploy"

## 🔐 Admin-Bereich

- **Passwort:** Fredeggs2024 (sollte geändert werden!)
- **Zugriff:** Scrolle auf der Website nach unten zum Admin-Bereich

## ⚙️ Konfiguration

### WhatsApp Nummer ändern
In `pages/index.jsx`, Zeile 5:
```javascript
const WHATSAPP_NUMMER = "4915168472345";
```

### Admin-Passwort ändern
In `pages/index.jsx`, Zeile 25:
```javascript
const ADMIN_PASSWORT = "Fredeggs2024";
```

### Kontaktdaten ändern
In `pages/index.jsx`, ab Zeile 51:
```javascript
const besitzerInfo = {
  name: "Familie Huber's Hühnerhof",
  adresse: "Dorfstraße 42, 12345 Landheim",
  telefon: "+49 123 456789",
  email: "info@huehnerhof-huber.de",
  inhaber: "Maria und Josef Huber",
  whatsapp: "+49 123 456789"
};
```

## 📱 Funktionen

- ✅ Eier bestellen per WhatsApp
- ✅ Bestand in Echtzeit einsehen
- ✅ Admin-Bereich für Bestandsverwaltung
- ✅ Kartonsbedarf-Verwaltung
- ✅ Bewertungssystem
- ✅ Responsive Design (Handy & Desktop)

## 🛠️ Technologien

- Next.js 14
- React 18
- Tailwind CSS
- Lucide Icons

---

© 2024 FredEggs 🐔
