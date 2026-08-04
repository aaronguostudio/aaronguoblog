# Image Generation Manifest

## Run

- Article: Builder Note `after-the-trojan-horse-works`
- Generated on: 2026-08-04
- Backend: Codex built-in image generator
- Model or provider when known: built-in imagegen
- Cohesion model: Unified
- Selected concept route: A — After the Gate
- Selected style families: Field Signal Editorial / Quiet Paper Odyssey
- Existing reference images: the three approved Builder Note covers were visually inspected for restraint and archive continuity; they are not edit targets

## Assets

| Asset    | Role                          | Prompt file                                                                                  | Candidate(s)                                                                   | Selected    | Why selected                                                                                                              | Rejected failure                                                                                                                             | Stock candidate |
| -------- | ----------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| 00-cover | clean cover and social master | `prompts/cover-candidate-a-wide-crossing.md`, `prompts/cover-candidate-b-diagonal-return.md` | `cover-candidate-a-wide-crossing.png`, `cover-candidate-b-diagonal-return.png` | Candidate A | Its three-part left-to-right story remains clear at card size and the calm negative space keeps the human return central. | Candidate B is visually strong but its foliage, larger home structure, and diagonal terrain add secondary groups that weaken mobile clarity. | yes             |

## Provenance notes

- Both candidates are new, original generations.
- No film still, actor image, Nolan production-design reference, or other copyrighted visual input is used.
- Candidate A and Candidate B were generated as separate built-in imagegen calls.
- Both candidate outputs: 1672 × 941 PNG, clean 16:9 landscape.
- Selected master: `after-the-trojan-horse-works-master.png`, copied from Candidate A and preserved at 1672 × 941.
- Clean cover: `public/notes-img/after-the-trojan-horse-works.webp`, WebP quality 82, 86 KB.
- Social derivative: `public/notes-img/after-the-trojan-horse-works-social.jpg`, JPEG quality 90, 436 KB.
- Post-processing: accepted PNG compressed with `cwebp` and `sips`; no crop, retouching, title overlay, or semantic edit.

## Integrity

- Every accepted asset has a prompt or source record: yes
- Existing final assets were preserved or versioned: yes
- Cover concepts were compared before style lock: yes
- Accepted images passed visual critique: yes
