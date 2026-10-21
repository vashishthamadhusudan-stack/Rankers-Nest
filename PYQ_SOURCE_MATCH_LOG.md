# PYQ Source Match Log — Batch 1

Last updated: 21 October 2026

This is a live audit log, not a claim that the entire site is verified. A row is marked verified only for the specific source comparison stated in that row.

## Confirmed question-level matches

| Site page | Site item | Source match | Site key / solution | Status |
|---|---|---|---|---|
| neet-rotational-dynamics-pyq.html | Q1: flywheel speed 600 rpm to 1200 rpm in 10 s | NEET UG 2026 question; the same wording and answer are present in the Code-11/13 solution documents. | Site options are reordered; option A = 150 revolutions. Calculation: average speed 900 rpm = 15 rev/s; over 10 s gives 150 revolutions. | **Question and numerical answer verified against secondary question-paper/solution copies; official NTA final-key mapping still needs code/session confirmation.** |
| neet-rotational-dynamics-pyq.html | Q2: Sun-like uniform sphere expands to twice its radius | NEET UG 2025 Code-45, Q17, with answer 108 days. | Site options are reordered; option C = 108 days. Angular momentum conservation gives T' = 4T = 108 days. | **Question and answer verified against a question-paper/solution copy.** |
| neet-rotational-dynamics-pyq.html | Q3: 0.5 kg, 2 m rod balanced at 40 cm with a 2 kg mass at 20 cm | Matches a NEET 2021 question-paper solution copy. | Site option A = 1/12 kg. Moments about the 40 cm pivot: 2×20 = 0.5×60 + m×120, giving m=1/12 kg. | **Question and calculation verified against a secondary source copy.** |
| neet-rotational-dynamics-pyq.html | Q6: angular speed rises from 1200 rpm to 3120 rpm in 16 s | Matches the NEET 2022 question wording in available solution sources. | Site option B = 4π rad s⁻²; Δω = 64π rad/s and α=Δω/16=4π rad s⁻². | **Question and answer verified against secondary sources.** |
| neet-rotational-dynamics-pyq.html | Q15: translational kinetic energy / total kinetic energy for a rolling solid sphere | Matches a NEET 2018 PYQ compilation. | Site option B = 5/7. Ktrans=½mv² and Ktotal=7/10 mv², so the ratio is 5/7. | **Question and calculation verified; official answer-key code mapping still pending.** |

### Sources for the confirmed matches

- NEET UG 2026 Code-13 solution PDF: https://dcx0p3on5z8dw.cloudfront.net/Aakash/s3fs-public/pdf_management_files/target_solutions/NEET_2026_Answer_Key_Solution_Code_13_Download.pdf
- NEET UG 2026 Code-11 solution PDF: https://dcx0p3on5z8dw.cloudfront.net/Aakash/s3fs-public/pdf_management_files/target_solutions/NEET_2026_Answer_Key_Solution_Code_11_Download.pdf.pdf
- NEET UG 2025 Code-45 solution PDF: https://dcx0p3on5z8dw.cloudfront.net/Aakash/s3fs-public/pdf_management_files/target_solutions/neet-question-paper-solution-physics-code-45.pdf
- NEET 2021 rod-balance question source copy: https://askfilo.com/user-question-answers-smart-solutions/a-uniform-rod-of-length-200-cm-and-mass-500-g-is-balanced-on-3133303138363533
- NEET 2022 flywheel-angular-acceleration question: https://www.neet720.in/neet/pyq/2022
- NEET 2018 rolling-sphere kinetic-energy ratio source compilation: https://www.scribd.com/document/772215403/Arihant-34-Year-neet-Physics-Chapter-wise
- Official NEET NTA documents: https://neet.nta.nic.in/documents/
- Official NEET UG 2026 re-examination final answer keys: https://neet.nta.nic.in/final-answer-keys-for-neet-ug-2026-re-examination/

**Important:** NTA publishes separate material for the 3 May 2026 examination and the 21 June 2026 re-examination. The site must distinguish the exam date/code and not infer that an answer key for one paper validates another.

## Items flagged for source proof (not yet verified)

| Site page | Finding | Required action |
|---|---|---|
| neet-laws-of-motion-pyq.html | The question “A block is just about to slide on a rough plane at 37°...” has no visible year/shift/question ID in its data and looks like generic concept practice. | Find an exact source match. Until then, do not advertise this individual item as a confirmed PYQ. |
| neet-rotational-dynamics-pyq.html | Q4 (90° arc removed) has not yet been matched to a source; Q9 and Q21 are explicitly tagged “concept check,” not PYQ. Other items still need one-by-one source matching. | Keep Q9/Q21 clearly classified as concept practice; verify Q4 and remaining year-tagged items before claiming the entire set is source-verified. |
| jee-main-capacitors.html | Multiple questions explicitly depend on original circuit/graph/geometry figures that are absent from the current page; some solution text itself says the source figure is required. | Restore only from the matching source paper figure; otherwise replace with a fully specified text-only question or hold it from a PYQ-only set. |

## Batch status

- Full website inventory: 81 HTML pages scanned; 60 quiz/PYQ-like pages detected.
- First whole-site browser pass: 75 internal URLs checked; no broken internal links were reported, but two inline-JavaScript syntax errors were found in JEE Main Circular Motion and Newton's Laws pages and fixed in commits.
- Four critical JEE Main tests (Electric Field & Potential, Gauss's Law, Capacitors, Current Electricity): browser regression checks passed for question count/options, scoring scenario, timer auto-submit, solution reveal, locking/restart, and displayed answer keys against stored keys.
- Overall academic status: **IN PROGRESS — not all questions are source-verified.**
