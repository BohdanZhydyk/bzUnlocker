# bzUnlocker

[English](README.md) | [Polski](README.pl.md) | [Українська](README.ua.md)

---

Lekkie narzędzie systemowe dla Windows do wykrywania i zwalniania procesów blokujących pliki oraz foldery.

**Technologie:** Electron 22 + React 18 + SCSS + Vite + Windows Restart Manager API (`rstrtmgr.dll`).

---

## Pobierz gotowe instalatory (Windows)

* ⬇️ [Pobierz bzUnlocker Setup x64 (64-bit)](https://github.com/BohdanZhydyk/bzUnlocker/raw/main/release/bzUnlocker-Setup-x64.exe)
* ⬇️ [Pobierz bzUnlocker Setup x86 (32-bit)](https://github.com/BohdanZhydyk/bzUnlocker/raw/main/release/bzUnlocker-Setup-x86.exe)

---

## Szybkie uruchamianie (Skrypty CMD)

Wszystkie skrypty pomocnicze znajdują się w katalogu `scripts/`:

| Skrypt | Działanie |
|---|---|
| `scripts\START-WINDOWS.cmd` | Uruchamia Vite + Electron w trybie deweloperskim (auto-podniesienie UAC). |
| `scripts\BUILD-x64.cmd` | Buduje instalator 64-bit NSIS (`release\bzUnlocker-Setup-x64.exe`). |
| `scripts\BUILD-x86.cmd` | Buduje instalator 32-bit NSIS (`release\bzUnlocker-Setup-x86.exe`). |

---

## Polecenia z konsoli (NPM)

### 1. Instalacja zależności
```bash
npm install
```

### 2. Uruchomienie deweloperskie (Live reload)
```bash
npm run dev
```
> **Uwaga:** Aby aplikacja miała pełne uprawnienia do zamykania procesów systemowych w dev, uruchom terminal / VS Code jako Administrator (lub użyj `scripts\START-WINDOWS.cmd`).

### 3. Kompilacja instalatorów
```bash
# Budowa frontendu
npm run build

# Instalator 64-bit
npm run dist:x64

# Instalator 32-bit (x86)
npm run dist:x86
```
Wyniki kompilacji trafiają do katalogu `release/`.

---

## Kluczowe funkcje

* **Wykrywanie blokad:** Windows Restart Manager API skanuje zasoby bez używania ciężkich bibliotek zewnętrznych.
* **Auto-rescan:** Po zamknięciu blokujących aplikacji program automatycznie weryfikuje stan zasobu.
* **Ciche odblokowanie:** Opcja w menu kontekstowym Windows (*Odblokuj (bzUnlocker)*) działa w tle z flagą `--silent` – zwalnia zasób i wyświetla systemowy dymek toast bez otwierania pełnego okna GUI.
* **Wielojęzyczność:** Interfejs w językach PL, EN i UA (flagi wektorowe SVG).
* **Wymagania:** Windows 7 / 10 / 11 (x86 / x64), Node.js 18 LTS.
