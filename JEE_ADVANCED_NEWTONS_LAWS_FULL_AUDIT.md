# Rankers Nest — Newton's Laws of Motion Page Audit

Audit date: 22 October 2026
Page reviewed: `jee-advanced-newtons-laws.html`
Status: **NOT CLASSROOM-READY — do not distribute as the completed chapter bank**

## 1. Count and coverage

- Current page contains **10 questions only**.
- That does not satisfy the requested 70–80+ problem collection.
- The public ExamSIDE/ExamGOAL topic index lists **38 Laws of Motion questions across 27 papers** from 1978–2025, including 7 numerical, 19 single-correct MCQs, 6 multiple-correct MCQs, 2 fill-in-the-blank, 3 true/false, and 1 subjective question. This is a third-party topic index, not the official exam authority. Source: https://questions.examside.com/past-years/jee/jee-advanced/physics/laws-of-motion
- The official JEE Advanced archive lists official paper PDFs from 2007 onward; older IIT-JEE papers require separate archival source checking. Source: https://jeeadv.ac.in/archive.html
- Therefore 70–80 total problems must be presented honestly as a **combined bank**: source-checked historical PYQs plus clearly separated original JEE Advanced-level practice questions. Do not label all 70–80 as PYQs unless the source confirms that.

## 2. Critical defects found in the first 10-question draft

1. **No diagrams in most questions.** The page has no embedded figure for several mechanics setups, despite diagram-dependent wording. Each question should have its own meaningful diagram or FBD; original-paper figures must be redrawn faithfully where they are part of the question.
2. **Q1 source tag requires re-verification.** The assertion–reason wording is paraphrased, and the exact paper/question mapping must be checked against the original scan before keeping a verified-PYQ label.
3. **Q2 wording/source mapping requires a full original-paper comparison.** The mathematical setup resembles the archived incline/friction numeric question, but the option format and paper locator need exact verification.
4. **Q3 geometry was ambiguous.** The phrase describing the two blocks did not make clear whether they were stacked or touching end-to-end along the incline. Wording has been clarified, but the original diagram and matching expressions still require a question-level comparison.
5. **Q4 original explanation was insufficient.** The first version stated the answer without a complete force/torque derivation. A derivation was added, but the source-paper figure and exact question locator must still be checked before the item is treated as an exact PYQ.
6. **Q6 answer-option defect corrected.** The calculation gives the heavier mass a ground-frame acceleration of (3g/8) downward; the option and key were updated to match.
7. **Q9 direction/explanation mismatch corrected.** For a wedge whose surface rises to the right, the required wedge acceleration for the stated relative equilibrium is leftward; the stem and pseudo-force explanation were aligned.
8. **Q10 was internally contradictory.** The no-slip result required 8 N of friction while the stated maximum was 5 N. The options and explanation were changed to describe slipping and the corresponding accelerations.
9. **No completed question-by-question answer-key regression had yet passed** when this audit was recorded. A dedicated browser regression script has been added to the repository; the GitHub Actions result must be checked before the page can be called tested.
10. **Spelling/typography pass still needed.** Standardize “free-body diagram (FBD),” “coefficient of static friction,” “coefficient of kinetic friction,” SI units, symbols, subscripts, angle notation, and punctuation throughout the expanded bank.

## 3. Mandatory acceptance criteria for the expanded version

- At least **78 distinct problems** total, numbered continuously.
- A clear section label on every problem: **Verified PYQ**, **PYQ — source check pending**, or **Original practice**.
- Year, paper, and question locator for every item labelled Verified PYQ.
- Every question has a relevant, legible diagram or FBD; diagrams are not generic decoration.
- Every single-correct question has exactly four unambiguous options and exactly one keyed answer. Multi-correct questions identify the response type and support more than one correct answer where appropriate.
- Full worked solution for every item, independently recalculated.
- Original answer option order and final answer key cross-checked; corrected/dropped questions documented.
- Spellcheck, equation/units check, link audit, responsive mobile layout, timer/start/submit/reset tests, scoring regression, and a final live-page browser run.
- No false claim that all historical questions have official verification. Practice items must remain separately labelled.

## 4. Source references

- Official JEE Advanced archive: https://jeeadv.ac.in/archive.html
- Third-party Laws of Motion question index used to establish the approximate historical topic count: https://questions.examside.com/past-years/jee/jee-advanced/physics/laws-of-motion

This document records audit findings and acceptance criteria; it is not a certification that the current 10-question page is ready for students.


## Expansion started — 22 October 2026

- Replaced the inadequate 10-question draft with an **80-question original practice bank**.
- Each generated question has an inline schematic diagram, four choices, a keyed answer, and a worked calculation.
- Added a 120-minute timer, Start/Submit/Reset, automatic submission, score, solution reveal, and print/save-PDF control.
- Added a separate historical-source checklist and direct links to the third-party topic index and official paper archive.
- These 80 are explicitly labelled **Original practice**; they are not falsely labelled as 80 historical PYQs.
- The dedicated Playwright regression was updated to check 80 questions, 80 diagrams, 4 options per question, solution/key-letter agreement, score, reset, timer/locking and mobile horizontal overflow.
- **Browser regression status at this note: running; not yet certified PASS.** The live deployment also needs to finish before the live-page test can pass.
- Next academic phase: replace selected practice slots with carefully source-matched historical PYQs only after checking the original paper figure, complete wording, option order and official key. The current public topic index reports 38 Laws of Motion questions across 27 papers from 1978–2025, not 70–80 historical questions.
