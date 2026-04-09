# MedPregnancy App — دواء الحمل

A bilingual (Arabic / English) React Native app that identifies medications and displays their FDA pregnancy safety category.

## Features

- **Text search** — type the medication name in Arabic or English
- **Camera scan** — take a photo of the medication box/label
- **Gallery upload** — select a photo from your gallery
- **AI recognition** — Claude Vision identifies the medication from the photo
- **Database-only answers** — all pregnancy category data comes exclusively from your provided database
- **Arabic & English** — full RTL support for Arabic

## Setup

### 1. Install dependencies

```bash
cd medication-app
npm install
```

### 2. Add your Anthropic API key

```bash
cp .env.example .env
# Edit .env and set EXPO_PUBLIC_ANTHROPIC_API_KEY=your_key_here
```

Get your key at: https://console.anthropic.com/

### 3. Run the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) or press `a` for Android emulator / `i` for iOS simulator.

## Adding Your Medication Database

Edit `src/data/medications.json`. Each entry follows this structure:

```json
{
  "id": 1,
  "searchTerms": ["generic-name", "brand-name", "اسم-عربي"],
  "nameEn": "Medication Name",
  "nameAr": "اسم الدواء",
  "pregnancyCategory": "B",
  "descriptionEn": "English description of the medication and pregnancy safety...",
  "descriptionAr": "الوصف العربي للدواء وسلامة الحمل...",
  "warningEn": "Safety warning in English.",
  "warningAr": "تحذير السلامة بالعربية."
}
```

**Pregnancy Categories:**
| Category | Meaning |
|----------|---------|
| A | Safest — adequate studies show no fetal risk |
| B | Likely safe — animal studies show no risk |
| C | Use with caution — benefits may outweigh risks |
| D | Risky — evidence of fetal risk exists |
| X | Contraindicated — do not use in pregnancy |

## Architecture

```
src/
├── data/medications.json     ← Your medication database (add entries here)
├── services/
│   ├── database.ts           ← Search logic (only searches local DB)
│   └── aiService.ts          ← Claude Vision API for image recognition
├── i18n/translations.ts      ← All Arabic/English UI strings
├── context/LanguageContext.tsx
├── components/
│   ├── SearchBar.tsx
│   ├── ImagePickerButton.tsx
│   ├── MedicationCard.tsx
│   └── LanguageToggle.tsx
└── screens/HomeScreen.tsx
```
