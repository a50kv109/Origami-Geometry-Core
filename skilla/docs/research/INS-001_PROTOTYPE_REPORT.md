# INSIGHT PACKAGE INS-001: PROTOTYPE GATE REPORT
## Isolated Experimental Constraint Resolver and Multiplicity Gate in Skilla

**Document ID:** `skilla/docs/research/INS-001_PROTOTYPE_REPORT.md`  
**Classification:** `RESEARCH_PROTOTYPE_REPORT`  
**Target Project:** Skilla — Origami Geometry Reasoning Skill  
**Upstream Artifacts:** `skilla/docs/research/INS-001_INTEGRATION_REPORT.md`, `skilla/docs/research/INS-001_VERIFICATION_REPORT.md`  
**Prototype Directory:** `skilla/src/experimental/constraint-resolution/`  
**Test Suite:** `skilla/scripts/runConstraintTests.ts` (`npm --prefix skilla run test:constraint`)  
**Status:** PROTOTYPE VERIFIED — 100% INVARIANTS PASSING (7 / 7 Tests)  
**Safety Bounds:** Zero modifications to frozen core (`src/core/reflection.ts`, `src/construction/pointToPoint*.ts`, `schemas/pattern-passport.schema.json`)  
**Date:** 2026-10-26  

---

## 1. Executive Summary

В рамках исследовательской инициативы **INS-001** в репозитории `skilla` создан изолированный экспериментальный прототип системы разрешения геометрических ограничений (`Geometric Constraint Resolver`).

Главная цель прототипа — устранить критическую концептуальную ошибку, часто встречающуюся в геометрических ядрах и LLM-пайплайнах: **неявное схлопывание (collapse) пространства допустимых решений в произвольно выбранную линию сгиба**.

Прототип строго реализует 5-звенный архитектурный континуум:
$$\text{GeometricCondition} \implies \text{SolutionSet (Manifold)} \implies \text{SelectionRule} \implies \text{ConcreteSolution} \implies \text{IndependentVerification}$$

### Ключевые результаты испытаний:
1. **Строгий отказ от угадывания:** При отсутствии правила отбора ограничение «точка на прямую» ($P \to L$) не возвращает фиктивную единичную ось (`axis: null`), а возвращает типизированное непрерывное $1D$-семейство решений (`CONTINUOUS_FAMILY`, `INFINITE_CONTINUOUS_1D`) с параметрической функцией-эвалюатором и алгебраическим уравнением прямой.
2. **Точное разрешение Аксиомы 5 Худзиты:** Доказано и экспериментально подтверждено, что связывание с правилом «ось проходит через точку $P_2$» редуцирует непрерывный континуум к задаче пересечения окружности $C(P_2, R=\|P_1 - P_2\|)$ и прямой $L$. Число решений строго определяется знаком дискриминанта $\Delta = R^2 - h^2$ ($h = \text{dist}(P_2, L)$):
   - $h < R \implies$ **2 решения** (`FINITE_MULTIPLE`, секущая);
   - $h = R \implies$ **1 решение** (`UNIQUE`, касательная);
   - $h > R \implies$ **0 решений** (`NO_SOLUTION`, непересекающиеся).
3. **Автономный Zero-Trust верификатор:** Ни одно вычисленное решение не принимается на веру; верификатор независимо проверяет единичную норму оси, точное попадание отражения $R_m(P_1)$ на прямую $L$, совпадение с заявленной точкой $Q$, сохранение метрической изометрии и инцидентность оси точке $P_2$.
4. **Результат прогона тестов:** 7 из 7 тестов (100%) успешно пройдены. Сборка всего приложения и TypeScript-контроль (`tsc --noEmit`) завершаются с кодом 0.

---

## 2. Математическая модель и классификация решений

### 2.1. Постановка задачи
Заданы:
- Точка $P \in \mathbb{R}^2$;
- Прямая $L \subset \mathbb{R}^2$, заданная опорной точкой $A \in \mathbb{R}^2$ и единичным вектором направления $\vec{v} \in \mathbb{R}^2$ ($\|\vec{v}\| = 1$).

Требуется охарактеризовать все оси отражения $m = (M, \vec{u})$, удовлетворяющие условию:
$$R_m(P) \in L.$$

### 2.2. Разбор случаев и мощность множества решений

#### Случай 1: $P \notin L$ (Регулярный, расстояние $h = \text{dist}(P, L) > 0$)
- Точка $P' = R_m(P)$ обязана лежать на $L$. Так как $P \notin L$ и $P' \in L$, то $P' \neq P$.
- Для любой точки $Q \in L$ существует ровно одна ось отражения, переводящая $P$ в $Q$ — серединный перпендикуляр к отрезку $PQ$.
- Параметризуем прямую $L$ скаляром $t \in \mathbb{R}$:
  $$Q(t) = A + t \vec{v}.$$
- Середина отрезка (опорная точка оси):
  $$M(t) = \frac{P + Q(t)}{2}.$$
- Вектор хорды (нормаль к оси):
  $$\vec{w}(t) = Q(t) - P, \quad \|\vec{w}(t)\| \ge h > 0.$$
- Единичный вектор направления оси:
  $$\vec{n}_m(t) = \frac{\vec{w}(t)}{\|\vec{w}(t)\|}, \quad \vec{u}_m(t) = (-n_{m,y}(t), n_{m,x}(t))^T.$$
- **Мощность:** Континуум $2^{\aleph_0}$ ($1D$-параметрическое непрерывное многообразие).
- **Поведение резолвера:** Статус `CONTINUOUS_FAMILY`, `axis: null`. Предоставляется эвалюатор $t \mapsto (m(t), Q(t))$ и аналитические коэффициенты прямой $a(t)x + b(t)y + c(t) = 0$.

#### Случай 2: $P \in L$ (Вырожденный, расстояние $h = 0$)
Условие $R_m(P) \in L$ уже выполнено в исходной конфигурации. Допустимые оси сгиба распадаются на две независимые непрерывные ветви:
1. **Ветвь 1 (Пучок через точку $P$):** Любая прямая $m$, проходящая через $P$ ($P \in m$), оставляет точку $P$ неподвижной: $R_m(P) = P \in L$. Ветвь параметризуется углом наклона $\theta \in [0, \pi)$.
2. **Ветвь 2 (Перпендикуляры к прямой $L$):** Любая прямая $m \perp L$ переводит прямую $L$ в саму себя ($R_m(L) = L$). Следовательно, образ любой точки прямой $L$ снова принадлежит $L$. Ветвь параметризуется положением точки пересечения $A + s \vec{v}$ на прямой $L$.
- **Поведение резолвера:** Статус `ALREADY_SATISFIED`, `axis: null`, возврат функциональных интерфейсов обеих ветвей.

#### Случай 3: Связывание с правилом отбора (Аксиома 5 Худзиты)
Задано правило отбора: ось сгиба $m$ обязана проходить через заданную точку $P_2 \in \mathbb{R}^2$ ($P_2 \in m$).

**Теорема о редукции к пересечению окружности и прямой:**
Так как $P_2 \in m$, отражение оставляет $P_2$ неподвижной ($R_m(P_2) = P_2$). Поскольку плоское отражение является изометрией:
$$\|P' - P_2\| = \|R_m(P_1) - R_m(P_2)\| = \|P_1 - P_2\| = R.$$
Следовательно, образ $P'$ обязан лежать на окружности радиуса $R$ с центром в $P_2$:
$$P' \in L \cap \text{Circle}(P_2, R).$$

Пусть $h = \text{dist}(P_2, L)$, $P_{proj}$ — ортогональная проекция $P_2$ на $L$. Уравнение для смещения точки пересечения вдоль прямой:
$$s^2 = R^2 - h^2.$$

| Условие | Геометрический смысл | Мощность решений | Статус |
| :--- | :--- | :--- | :--- |
| $h > R$ | Окружность не достает до прямой $L$ | **0 решений** | `NO_SOLUTION` |
| $h = R$ | Окружность касается прямой $L$ в точке $P_{proj}$ | **1 решение** | `UNIQUE` |
| $h < R$ | Прямая $L$ является секущей к окружности | **2 решения** | `FINITE_MULTIPLE` |

> **Критическое уточнение исследовательской программы:**  
> Ранее существовавшая гипотеза о том, что Аксиома 5 *всегда* даёт ровно 2 решения, математически неверна. Число решений равно 2 **только при условии** $\text{dist}(P_2, L) < \|P_1 - P_2\|$. Если точка $P_2$ удалена от прямой дальше, чем до точки $P_1$, решений в евклидовой плоскости нет.

---

## 3. Архитектура экспериментального прототипа

Прототип расположен в изолированной директории `skilla/src/experimental/constraint-resolution/` и состоит из 5 компонентов:

```
skilla/src/experimental/constraint-resolution/
├── constraintTypes.ts      # Типы условий, многообразий, правил отбора и кардинальности
├── pointToLineResolver.ts  # Резолвер P -> L (чистое условие без эвристик)
├── selectionRules.ts       # Модуль применения правил отбора (включая Аксиому 5)
├── constraintVerifier.ts   # Автономный Zero-Trust верификатор инвариантов
└── constraintTest.ts       # Исполняемый тестовый набор TC-AMB-01 .. TC-AMB-07
```

### 3.1. `constraintTypes.ts`
Вводит типизированное разграничение сущностей:
- `PointToLineCondition` — спецификация геометрического требования.
- `ConstraintCardinality` — `'ZERO' | 'FINITE_UNIQUE' | 'FINITE_MULTIPLE' | 'INFINITE_CONTINUOUS_1D' | 'ALREADY_SATISFIED_INFINITE'`.
- `ParametricFamily1D` — замкнутая структура с методами `evaluateAxis(t)`, `evaluateTargetPoint(t)` и `evaluateEquation(t)`.
- `SelectionRule` — правило отбора (`PassesThroughPointRule`).
- `ResolvedSelectionResult` — типизированный результат после связывания с правилом отбора.

### 3.2. `pointToLineResolver.ts`
Функция `resolvePointToLineConstraint(p, targetLine, options)`:
- Вычисляет расстояние $h = \text{pointLineDistance}(p, \text{targetLine})$.
- При $h < \epsilon_{incidence}$ возвращает `ALREADY_SATISFIED` с двумя ветвями эвалюаторов.
- При $h \ge \epsilon_{incidence}$ возвращает `CONTINUOUS_FAMILY`, в котором `axis === null`, исключая неявную фиксацию складки.

### 3.3. `selectionRules.ts`
Функция `applySelectionRule(resolution, rule, options)`:
- Не смешивает геометрию условия с правилом отбора.
- Анализирует дискриминант $\Delta = R^2 - h^2$.
- Порождает ровно столько конкретных решений `ConcreteSolution`, сколько существует математически (0, 1 или 2).

### 3.4. `constraintVerifier.ts`
Функция `verifyConcreteSolution` и процедуры аудита:
- Проверяют единичную норму направления оси $\|\vec{u}\| = 1$.
- Вычисляют отражение $P' = R_m(P)$ и расстояние $\text{dist}(P', L) < 10^{-9}$.
- Проверяют расстояние от оси до точки привязки $\text{dist}(P_2, m) < 10^{-9}$.
- Для непрерывных семейств тестируют набор свидетелей (witnesses) при $t \in \{0, 1, -1, 2, -2.5\}$.

---

## 4. Результаты выполнения тестового набора

Запуск тестового набора выполнен через скрипт `skilla/scripts/runConstraintTests.ts` с помощью команды:
```bash
npm --prefix skilla run test:constraint
```

### 4.1. Сводная таблица тестов

| ID теста | Категория | Входные данные | Ожидаемый статус | Факт. статус | Решений | Верификатор | Итог |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **TC-AMB-01** | UNDERCONSTRAINED | $P(0,1)$, $L: y=0$, без правила | `CONTINUOUS_FAMILY` | `CONTINUOUS_FAMILY` | 0 (`axis: null`) | `EXPECTED_CONTINUOUS_FAMILY` | **PASS** |
| **TC-AMB-02** | DEGENERACY | $P(2,0)$, $L: y=0$ ($P \in L$) | `ALREADY_SATISFIED` | `ALREADY_SATISFIED` | 0 (`axis: null`) | `EXPECTED_ALREADY_SATISFIED` | **PASS** |
| **TC-AMB-03** | AXIOM_5_BINDING | $P_1(0,1)$, $L: y=0$, $P_2(0,0)$ | `FINITE_MULTIPLE` | `FINITE_MULTIPLE` | 2 | `ALL_INVARIANTS_SATISFIED` | **PASS** |
| **TC-AMB-04** | NEGATIVE_CONTROL | $P_1(0,2)$, $L: y=0$, $P_2(0,5)$ | `NO_SOLUTION` | `NO_SOLUTION` | 0 | `EXPECTED_NO_SOLUTION` | **PASS** |
| **TC-AMB-05** | AXIOM_5_BINDING | $P_1(0,2)$, $L: y=0$, $P_2(0,1)$ | `UNIQUE` | `UNIQUE` | 1 | `ALL_INVARIANTS_SATISFIED` | **PASS** |
| **TC-AMB-06** | OBLIQUE | $P_1(0,2)$, $L: y=x$, $P_2(1,1)$ | `FINITE_MULTIPLE` | `FINITE_MULTIPLE` | 2 | `ALL_INVARIANTS_SATISFIED` | **PASS** |
| **TC-AMB-07** | NEGATIVE_CONTROL | $P_1(\text{NaN},1)$, $L: \vec{v}=[0,0]$ | `INVALID_INPUT` | `INVALID_INPUT` | 0 | `EXPECTED_NO_SOLUTION` | **PASS** |

### 4.2. Фактический вывод консоли терминала (Ground Truth)

```text
> skilla@0.1.0 test:constraint
> tsx scripts/runConstraintTests.ts

================================================================
  SKILLA EXPERIMENTAL LAB — INS-001 CONSTRAINT RESOLVER PROTOTYPE
  Constraint Resolution & Solution Multiplicity (Axiom 5 Gate)  
  Formal Separation: Condition != SolutionSet != SelectionRule  
================================================================

[TC-AMB-01] ✓ PASS: Pure Point-to-Line constraint: 1D Continuous Family (No arbitrary collapse)
  Category:     UNDERCONSTRAINED
  Status:       CONTINUOUS_FAMILY (Expected: CONTINUOUS_FAMILY)
  Cardinality:  INFINITE_CONTINUOUS_1D (Solutions: 0)
  Verifier:     Audit Passed = true (Verdict: EXPECTED_CONTINUOUS_FAMILY)
  Diagnostic:   Point P does not lie on target line L (distance h = 1.000000). Unconstrained condition yields a 1D continuous family of fold axes parameterized by t in R. Refusing to select an arbitrary axis without an explicit SelectionRule.
  Audit detail: Axis refusal: PASS (axis === null)
  Audit detail: Witness t=0 PASS: dist(P', L) < tol.
  Audit detail: Witness t=1 PASS: dist(P', L) < tol.

[TC-AMB-02] ✓ PASS: Incident Point on Line: ALREADY_SATISFIED (Pencil and Perpendicular branches)
  Category:     DEGENERACY
  Status:       ALREADY_SATISFIED (Expected: ALREADY_SATISFIED)
  Cardinality:  ALREADY_SATISFIED_INFINITE (Solutions: 0)
  Verifier:     Audit Passed = true (Verdict: EXPECTED_ALREADY_SATISFIED)
  Diagnostic:   Point P(2, 0) already lies on target line L (distance h = 0.0000e+0 < eps). Constraint is trivially satisfied; two infinite branches exist (pencil through P and perpendiculars to L). Refusing to select an arbitrary axis.
  Audit detail: Axis refusal on degeneracy: PASS (axis === null)
  Audit detail: Pencil branch identity invariant: PASS
  Audit detail: Perpendicular branch invariance: PASS

[TC-AMB-03] ✓ PASS: Huzita Axiom 5 Secant: Pivot P2=(0,0) yields exactly 2 solutions (y = x, y = -x)
  Category:     AXIOM_5_BINDING
  Status:       FINITE_MULTIPLE (Expected: FINITE_MULTIPLE)
  Cardinality:  FINITE_MULTIPLE (Solutions: 2)
  Verifier:     Audit Passed = true (Verdict: ALL_INVARIANTS_SATISFIED)
  Diagnostic:   Exactly two distinct solutions found (Huzita Axiom 5). Distance h = 0.000000 < R = 1.000000. Circle intersects line L at two distinct points Q1(1.0000, 0.0000) and Q2(-1.0000, 0.0000).
  Audit detail: Solution 1 (Solution 1 of 2: Reflection axis reflecting P1 to Q(1.0000, 0.0000) and passing through pivot P2(0, 0).) VERIFIED.
  Audit detail: Solution 2 (Solution 2 of 2: Reflection axis reflecting P1 to Q(-1.0000, 0.0000) and passing through pivot P2(0, 0).) VERIFIED.

[TC-AMB-04] ✓ PASS: Huzita Axiom 5 Negative Control: h > R yields NO_SOLUTION (0 solutions)
  Category:     NEGATIVE_CONTROL
  Status:       NO_SOLUTION (Expected: NO_SOLUTION)
  Cardinality:  ZERO (Solutions: 0)
  Verifier:     Audit Passed = true (Verdict: EXPECTED_NO_SOLUTION)
  Diagnostic:   No real solutions exist. Distance from pivot point P2 to target line (h = 5.000000) strictly exceeds radius R = ||P1 - P2|| = 3.000000 (disc = -1.6000e+1 < 0). Circle does not intersect target line.
  Audit detail: Zero solutions confirmation: PASS

[TC-AMB-05] ✓ PASS: Huzita Axiom 5 Tangency: h == R yields UNIQUE tangent solution (y = 1)
  Category:     AXIOM_5_BINDING
  Status:       UNIQUE (Expected: UNIQUE)
  Cardinality:  FINITE_UNIQUE (Solutions: 1)
  Verifier:     Audit Passed = true (Verdict: ALL_INVARIANTS_SATISFIED)
  Diagnostic:   Unique tangent solution. Distance from pivot point P2 to target line equals radius R = 1.000000 (disc = 0.0000e+0). Single contact point on line.
  Audit detail: Solution 1 (Solution 1 of 1 (tangent): Reflection axis reflecting P1 to Q(0.0000, 0.0000) and passing through pivot P2(0, 1).) VERIFIED.

[TC-AMB-06] ✓ PASS: Oblique Line Invariant: Non-axis-aligned line verifies frame independence
  Category:     OBLIQUE
  Status:       FINITE_MULTIPLE (Expected: FINITE_MULTIPLE)
  Cardinality:  FINITE_MULTIPLE (Solutions: 2)
  Verifier:     Audit Passed = true (Verdict: ALL_INVARIANTS_SATISFIED)
  Diagnostic:   Exactly two distinct solutions found (Huzita Axiom 5). Distance h = 0.000000 < R = 1.414214. Circle intersects line L at two distinct points Q1(2.0000, 2.0000) and Q2(-0.0000, -0.0000).
  Audit detail: Solution 1 (Solution 1 of 2: Reflection axis reflecting P1 to Q(2.0000, 2.0000) and passing through pivot P2(1, 1).) VERIFIED.
  Audit detail: Solution 2 (Solution 2 of 2: Reflection axis reflecting P1 to Q(-0.0000, -0.0000) and passing through pivot P2(1, 1).) VERIFIED.

[TC-AMB-07] ✓ PASS: Input Validation: Rejection of NaN coordinates and degenerate zero direction vector
  Category:     NEGATIVE_CONTROL
  Status:       INVALID_INPUT (Expected: INVALID_INPUT)
  Cardinality:  ZERO (Solutions: 0)
  Verifier:     Audit Passed = true (Verdict: EXPECTED_NO_SOLUTION)
  Diagnostic:   Invalid input: point coordinates and line parameters must be finite numbers.
  Audit detail: Strict numerical rejection confirmed

================================================================
INS-001 PROTOTYPE RESULTS: 7 / 7 TESTS PASSED (100.0% PASS RATE)
ALL AMBIGUITY, SELECTION, AND INVARIANT GATES VERIFIED: YES
================================================================
```

---

## 5. Анализ интеграции в JSON Schema и канонический статус

### 5.1. Анализ паспорта паттерна (`pattern-passport.schema.json`)
Действующая схема `pattern-passport.schema.json` v1.0.0 строго заморожена. Она ожидает однозначный маппинг входов на выходы:
```json
"inputs_and_outputs": {
  "required": ["inputs", "coordinate_system", "output_descriptor", "error_conditions"]
}
```
Экспериментальный прототип доказал, что для недетерминированных геометрических операций требуется расширение спецификации на уровне метасхемы (`v2.0.0-draft`):
```json
{
  "constraint_semantics": {
    "type": "object",
    "properties": {
      "solution_manifold": {
        "type": "string",
        "enum": ["CONTINUOUS_1D", "DISCRETE_MULTIPLE", "ALREADY_SATISFIED", "EMPTY"]
      },
      "selection_rules_supported": {
        "type": "array",
        "items": { "type": "string" }
      },
      "refuse_unconstrained_evaluation": { "type": "boolean" }
    }
  }
}
```

### 5.2. Статус канонизации
- Созданный модуль `skilla/src/experimental/constraint-resolution/` является **исследовательским прототипом (Experimental Prototype)**.
- Он **НЕ** объявляется каноническим примитивом C2 ядра Skilla.
- Любое перемещение в `src/construction/` или обновление схемы паспортов требует отдельного решения рабочей группы и прохождения Formal Gating.

---

## 6. Аудит границ безопасности

1. **Замороженное ядро PCRS:**
   - `skilla/src/core/reflection.ts` — 0 изменений.
   - `skilla/src/construction/pointToPoint.ts` — 0 изменений.
   - `skilla/src/construction/pointToPointVerifier.ts` — 0 изменений.
   - `skilla/src/construction/pointToPointTest.ts` — 0 изменений.
   - `skilla/schemas/pattern-passport.schema.json` — 0 изменений.
   - Канонические тесты (`npm --prefix skilla test`): 12 из 12 пройдены (100%).
2. **Первичные источники и документы:**
   - Ни один PDF, скан, книга или внешний источник не были изменены или удалены.
3. **GitHub Export:**
   - Никаких действий по публикации или экспорту в GitHub не производилось.

---
*Отчёт сформирован в рамках выполнения Prototype Gate для INS-001.*  
*Все геометрические инварианты экспериментально подтверждены.*
