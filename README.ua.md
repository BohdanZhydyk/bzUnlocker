# bzUnlocker

[English](README.md) | [Polski](README.pl.md) | [Українська](README.ua.md)

---

Легка системна утиліта для Windows для виявлення та звільнення процесів, що блокують файли та папки.

**Технології:** Electron 22 + React 18 + SCSS + Vite + Windows Restart Manager API (`rstrtmgr.dll`).

---

## Завантажити готові інсталятори (Windows)

* ⬇️ [Завантажити bzUnlocker Setup x64 (64-bit)](https://github.com/BohdanZhydyk/bzUnlocker/raw/main/release/bzUnlocker-Setup-x64.exe)
* ⬇️ [Завантажити bzUnlocker Setup x86 (32-bit)](https://github.com/BohdanZhydyk/bzUnlocker/raw/main/release/bzUnlocker-Setup-x86.exe)

---

## Швидкий запуск (Скрипти CMD)

Усі допоміжні скрипти знаходяться в папці `scripts/`:

| Скрипт | Дія |
|---|---|
| `scripts\START-WINDOWS.cmd` | Запускає Vite + Electron у режимі розробки (авто-UAC). |
| `scripts\BUILD-x64.cmd` | Створює 64-бітний інсталятор NSIS (`release\bzUnlocker-Setup-x64.exe`). |
| `scripts\BUILD-x86.cmd` | Створює 32-бітний інсталятор NSIS (`release\bzUnlocker-Setup-x86.exe`). |

---

## Команди консолі (NPM)

### 1. Встановлення залежностей
```bash
npm install
```

### 2. Запуск у режимі розробки (Live reload)
```bash
npm run dev
```
> **Примітка:** Щоб програма мала повні права для завершення процесів у dev, запустіть термінал / VS Code від імені Адміністратора (або використовуйте `scripts\START-WINDOWS.cmd`).

### 3. Компіляція інсталяторів
```bash
# Збірка фронтенду
npm run build

# 64-бітний інсталятор
npm run dist:x64

# 32-бітний інсталятор (x86)
npm run dist:x86
```
Результати компіляції потрапляють до каталогу `release/`.

---

## Ключові можливості

* **Виявлення блокувань:** Нативний Windows Restart Manager API сканує ресурси без важких сторонніх бібліотек.
* **Auto-rescan:** Після завершення процесів програма автоматично перевіряє стан файлу або папки.
* **Тихе розблокування:** Пункт у контекстному меню Windows (*Розблокувати (bzUnlocker)*) працює у фоні з прапорцем `--silent` — звільняє ресурс і показує системне сповіщення toast без відкриття вікна GUI.
* **Багатомовність:** Інтерфейс підтримує EN, PL та UA (чисті векторні SVG-прапори).
* **Вимоги:** Windows 7 / 10 / 11 (x86 / x64), Node.js 18 LTS.
