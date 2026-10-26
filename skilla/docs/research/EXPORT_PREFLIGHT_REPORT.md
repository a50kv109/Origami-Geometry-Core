# КОНТРОЛЬНЫЙ АУДИТ ПЕРЕД ПУБЛИКАЦИЕЙ SKILLA В GITHUB (PRE-FLIGHT REPORT)

**Дата проведения:** 2026-10-26  
**Статус:** Завершён (Контрольная проверка без внесения изменений)  
**Объект аудита:** Рабочее пространство `/app/applet`, модуль `skilla/`, конфигурации экспорта и исключений  
**Целевой репозиторий назначения:** `a50kv109/skilla`  
**Режим:** Read-Only Audit (без удаления, перемещения первоисточников или запуска повторного экспорта)

---

## 1. Текущее состояние конфигурационных файлов `.gitignore`

В рабочем пространстве присутствуют два файла правил игнорирования: корневой (для всего контейнера Remix) и локальный (внутри модуля `skilla/`).

### 1.1. Полное содержимое корневого `/.gitignore`

```gitignore
node_modules/
build/
dist/
coverage/
.DS_Store
*.log
.env*
!.env.example

# Archives & binaries
*.zip
*.tar.gz
skilla.zip

# Large research assets (>20MB PDFs)
public/assets/aistudio/*.pdf
public/assets/aistudio/*.zip
```

### 1.2. Полное содержимое локального `/skilla/.gitignore`

```gitignore
node_modules/
dist/
*.log
.DS_Store
.env
.env.local
```

### 1.3. Анализ конкретных правил исключения

| Правило | Файл `.gitignore` | Что исключает | Эффективность |
| :--- | :--- | :--- | :--- |
| `dist/` | `/.gitignore`, `/skilla/.gitignore` | Директорию сборочных артефактов Vite (167 МБ), включая дубликаты книг | **Критическое** — предотвращает отправку дублированных PDF |
| `*.zip` | `/.gitignore` | Все ZIP-архивы в рабочей среде | **Критическое** — блокирует снимки PCRS, Atlas, AI Geometry Skill |
| `skilla.zip` | `/.gitignore` | Архив снимка модуля `skilla` (37 КБ) в корне | **Подтверждено** |
| `public/assets/aistudio/*.pdf` | `/.gitignore` | Все первичные книги PDF в `public/assets/aistudio/` | **Критическое** — блокирует книги 57 МБ, 50 МБ, 22 МБ, 4.7 МБ |
| `public/assets/aistudio/*.zip` | `/.gitignore` | Вспомогательные архивы репозиториев-доноров | **Подтверждено** |
| `node_modules/` | `/.gitignore`, `/skilla/.gitignore` | Зависимости npm и бинарные компиляторы esbuild/tsc | **Критическое** |

---

## 2. Поведение механизма экспорта Google AI Studio Remix

### 2.1. Подтверждённые факты
1. В интерфейсе Remix кнопка экспорта («Export to GitHub» / «Оформить репозиторий») работает на уровне **всего рабочего пространства** (`/app/applet`), а не отдельной поддиректории.
2. Интерфейс не предоставляет пользователю селектора папок («выбрать каталог для публикации») перед отправкой.
3. Ошибка, зафиксированная на скриншоте: `«Не удалось отправить коммит в GitHub: Запрос содержит недопустимый аргумент»`. В англоязычном API GitHub это соответствует HTTP-статусу `422 Unprocessable Entity` (`Invalid argument`), возникающему при нарушении лимитов GitHub Git Data REST API (лимит на один блоб через REST API составляет 25 МБ).

### 2.2. Не подтверждено (Открытый вопрос архитектуры платформы)
- **НЕ ПОДТВЕРЖДЕНО ЭМПИРИЧЕСКИ:** Учитывает ли внутренний сериализатор платформы Google AI Studio Remix корневой файл `.gitignore` при первичном обходе дерева файлов перед отправкой в GitHub API, либо он отправляет полный снимок виртуальной файловой системы контейнера. В открытых файлах конфигурации рабочего пространства исходный код платформенного обработчика экспорта отсутствует.

---

## 3. Инвентаризация файлов размером более 10 МБ

Инструментальная проверка выполнена через поиск `find . -type f -size +10M` без открытия и без изменения содержимого файлов.

| № | Путь к файлу | Фактический размер | Категория / Назначение | Статус исключения |
| :---: | :--- | :---: | :--- | :--- |
| **1** | `./public/assets/aistudio/Invitation_to_Creative_Playing_with_Origami_44ee61f2.pdf` | **57 МБ** | Первоисточник: Shuzo Fujimoto (1982), *創造する折り纸游びへの招待*. Скан книги для лабораторных геометрических исследований. | Покрыт правилом `public/assets/aistudio/*.pdf` |
| **2** | `./public/assets/aistudio/Solid_Origami_3b32bc97.pdf` | **50 МБ** | Первоисточник: Shuzo Fujimoto (1976), *立体折り纸*. Скан книги по пространственным многогранникам. | Покрыт правилом `public/assets/aistudio/*.pdf` |
| **3** | `./public/assets/aistudio/Twist_Origami_3_b2625781.pdf` | **22 МБ** | Первоисточник: Shuzo Fujimoto, *ねじり折り 3*. Скан книги по твист-паттернам. | Покрыт правилом `public/assets/aistudio/*.pdf` |
| **4** | `./dist/assets/aistudio/Invitation_to_Creative_Playing_with_Origami_44ee61f2.pdf` | **57 МБ** | Автоматическая сборочная копия Vite в `dist/`. | Покрыт правилом `dist/` |
| **5** | `./dist/assets/aistudio/Solid_Origami_3b32bc97.pdf` | **50 МБ** | Автоматическая сборочная копия Vite в `dist/`. | Покрыт правилом `dist/` |
| **6** | `./dist/assets/aistudio/Twist_Origami_3_b2625781.pdf` | **22 МБ** | Автоматическая сборочная копия Vite в `dist/`. | Покрыт правилом `dist/` |
| **7** | `./node_modules/@typescript/typescript-linux-x64/lib/tsc` | **23 МБ** | Бинарный исполняемый файл компилятора TypeScript под Linux x64. | Покрыт правилом `node_modules/` |
| **8** | `./node_modules/@rolldown/binding-linux-x64-musl/rolldown-binding.linux-x64-musl.node` | **20 МБ** | Системный бинарный модуль бандлера. | Покрыт правилом `node_modules/` |
| **9** | `./node_modules/@rolldown/binding-linux-x64-gnu/rolldown-binding.linux-x64-gnu.node` | **19 МБ** | Системный бинарный модуль бандлера. | Покрыт правилом `node_modules/` |
| **10** | `./node_modules/tsx/node_modules/esbuild/node_modules/@esbuild/linux-x64/bin/esbuild` | **11 МБ** | Бинарный компилятор esbuild под Linux x64. | Покрыт правилом `node_modules/` |

**Суммарный объем тяжелых файлов в рабочей среде:** ~311 МБ (из них ~130 МБ — оригиналы PDF и архивы, ~130 МБ — сборочный дубль в `dist/`, ~73 МБ — системные бинарники `node_modules`).

---

## 4. Проверка специальных рисков: `.git`, `skilla.zip` и копии в `dist/`

1. **Вложенные каталоги `.git`:**
   - Команда проверки: `find . -name ".git"`
   - Результат: **0 каталогов найдено**.
   - Факт: В проекте отсутствуют скрытые каталоги `.git` как в корне, так и в `skilla/`. Причина ошибки экспорта **не связана** с конфликтом репозиториев или субмодулей.

2. **Архив `skilla.zip`:**
   - Расположение: `/app/applet/skilla.zip`
   - Размер: **37 749 байт (~37 КБ)**
   - Назначение: Локальный архив сборки модуля Skilla.
   - Статус: В корневом `.gitignore` явно заблокирован директивами `*.zip` и `skilla.zip`.

3. **Копии книг в каталоге `dist/`:**
   - В каталоге `./dist/assets/aistudio/` физически присутствуют 3 копии книг PDF суммарным объёмом **129 МБ**, созданные сборщиком Vite (`npm run build`).
   - Статус: Каталог `dist/` заблокирован в `.gitignore`.

---

## 5. Сравнение отчетов `docs/research/EXPORT_SCOPE_AUDIT.md` и `skilla/docs/research/EXPORT_SCOPE_AUDIT.md`

### 5.1. Результат инструментального сравнения (`diff -u`)
- Расхождения в тексте: **0 байт (файлы абсолютно идентичны)**.
- Число строк: **198 строк** в каждом файле.
- Размер: **17 563 байта** в каждом файле.

### 5.2. Определение канонического расположения
- **Каноническая версия для репозитория `Skilla`:** `skilla/docs/research/EXPORT_SCOPE_AUDIT.md`.
  - *Обоснование:* Репозиторий `skilla` спроектирован как полностью автономная исследовательская лаборатория и специализированный навык (Origami Reasoning Skill). Он должен содержать всю доказательную базу, паспорта и аудиты внутри собственного дерева каталогов, будучи отделимым от родительского монолита.
- **Роль копии в корне (`docs/research/EXPORT_SCOPE_AUDIT.md`):**
  - Является контекстной копией для родительского стенда PCRS Theory Lab.

---

## 6. Точный перечень состава файлов

### 6.1. Белый список (Whitelist): Файлы для публичного репозитория `a50kv109/skilla`
Суммарный объём чистого модуля: **~120 КБ** (текстовые файлы и TypeScript).

1. `skilla/README.md` — Главное описание лаборатории, архитектурные границы и инструкции.
2. `skilla/LICENSE` — Лицензия MIT.
3. `skilla/package.json` — Автономные зависимости модуля.
4. `skilla/tsconfig.json` — Строгая конфигурация TypeScript.
5. `skilla/.gitignore` — Правила исключений для автономного репозитория.
6. `skilla/schemas/pattern-passport.schema.json` — Формальная схема валидации паспортов паттернов.
7. `skilla/src/core/reflection.ts` — Доказанное ядро осевых отражений (Reflection 2D).
8. `skilla/src/construction/pointToPoint.ts` — Реализация примитива B (`FIND_FOLD_AXIS_POINT_TO_POINT`).
9. `skilla/src/construction/pointToPointVerifier.ts` — Формальный математический верификатор складки.
10. `skilla/src/construction/pointToPointTest.ts` — Набор верификационных тестов с предельными случаями.
11. `skilla/scripts/runPointToPoint.ts` — Точка входа для демонстрационного расчета оси складки.
12. `skilla/scripts/runTests.ts` — Автономный запуск тестирования примитива.
13. `skilla/docs/PROJECT_CHARTER.md` — Устав лаборатории Skilla, границы и цели.
14. `skilla/docs/REPOSITORY_MAP.md` — Карта репозитория и зон ответственности.
15. `skilla/docs/CHANGELOG.md` — История изменений и версионирование.
16. `skilla/docs/provenance/SOURCE_MANIFEST.md` — Манифест источников с контрольными суммами SHA-256.
17. `skilla/docs/decisions/DECISION_LOG.md` — Архитектурный журнал решений (ADR-001).
18. `skilla/docs/research/PRIMITIVE_B_INDEPENDENT_AUDIT.md` — Независимый аудит реализации примитива B.
19. `skilla/docs/research/EXPORT_SCOPE_AUDIT.md` — Аудит состава экспорта и исключения первичных источников.
20. `skilla/docs/research/EXPORT_PREFLIGHT_REPORT.md` — Настоящий контрольный отчет pre-flight проверки.

### 6.2. Чёрный список (Blacklist): Файлы, остающиеся строго локально в среде Remix
Эти файлы не должны передаваться в публичный GitHub-репозиторий `skilla`:

1. **Оригиналы книг (PDF):**
   - `public/assets/aistudio/Invitation_to_Creative_Playing_with_Origami_44ee61f2.pdf` (57 МБ)
   - `public/assets/aistudio/Solid_Origami_3b32bc97.pdf` (50 МБ)
   - `public/assets/aistudio/Twist_Origami_3_b2625781.pdf` (22 МБ)
   - `public/assets/aistudio/funwithpaperfold00murr_36df5f8f.pdf` (4.7 МБ)
2. **Архивы снимков и дампов (ZIP):**
   - `skilla.zip` (37 КБ)
   - `public/assets/aistudio/*.zip` (архивы PCRS, AI Geometry Skill, Atlas, 3D Stand)
3. **Графические фрагменты сканов:**
   - `public/assets/fujimoto/`
   - `public/assets/fujimoto_back/`
   - `public/assets/invitation/`
   - `public/assets/invitation_ch7/`
   - `public/assets/twist3/`
4. **Сборочные и платформенные каталоги:**
   - `dist/` (167 МБ)
   - `node_modules/` (238 МБ)
   - `.aistudio/` (9 МБ)
5. **Монолитный UI и стенд родительского PCRS:**
   - `src/App.tsx`, `src/components/`, `EXPERIMENTS/`, `THEORY/`, `ARCHITECTURE/`

---

## 7. Разделение подтверждённых фактов и предположений (гипотез)

### 7.1. Подтверждённые факты (Verified Facts)
1. В рабочей среде присутствуют файлы размером 57 МБ и 50 МБ, превышающие 25-мегабайтный лимит одиночного блоба в GitHub REST API.
2. Каталог `dist/` содержит полные копии этих тяжелых файлов, удваивая нагрузку.
3. В проекте полностью отсутствуют вложенные каталоги `.git` (проверено рекурсивным поиском).
4. Файл `skilla.zip` существует в корне (37 КБ) и добавлен в `.gitignore`.
5. Файлы `docs/research/EXPORT_SCOPE_AUDIT.md` и `skilla/docs/research/EXPORT_SCOPE_AUDIT.md` побайтово идентичны.
6. Модуль `skilla/` полностью автономен, содержит собственные `package.json`, `tsconfig.json`, `src/` и `docs/`, и готов к раздельной публикации.

### 7.2. Предположения и гипотезы (Hypotheses & Assumptions)
1. **Гипотеза о причине ошибки Remix:** Платформа Google AI Studio Remix при нажатии кнопки экспорта пытается передать всё рабочее дерево `/app/applet` через GitHub API, и падает либо из-за того, что размер отдельных файлов превышает 25 МБ, либо из-за того, что экспортер пытается отправить бинарные файлы до применения `.gitignore`.
2. **Гипотеза об интеграции репозитория:** Предполагается, что целевой репозиторий `a50kv109/skilla` должен быть создан либо через чистый экспорт каталога `skilla/`, либо через стандартный импорт чистого архива, чтобы избежать загрязнения монолитным кодом PCRS.

---

## Резюме готовности
Контрольный аудит завершён. В кодовую базу, первоисточники и правила игнорирования изменений не вносилось. Система ожидает подтверждения пользователя перед выполнением любых последующих действий.
