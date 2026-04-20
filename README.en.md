# Shot Template Studio

> A reusable shot template library for AI video generation.
> Natural-language templates that work across Kling, Runway, Pika, Sora, and Midjourney Video.

---

## Motivation

AI video generation has a memory problem.

Every time you craft a complex multi-character shot prompt—a first-person POV with a character intercepting another mid-scene, a silent farewell in the rain, a chance encounter with a lingering look—you start from scratch. The craft you invested in one prompt evaporates after use.

**Shot Template Studio turns craft into assets.**

Save a shot once. Reuse it with different characters, in different scenes, for different projects.

---

## How It Works

A shot is stored as a plain-text template with placeholders for images:

```
【Over-the-Shoulder Interception】

Required images:
- {scene}: setting
- {character_B}: approaching figure (distant)
- {character_C}: intercepting figure (close)
- {character_D}: first-person subject

---

In {scene}, from {character_D}'s first-person point of view.

{character_B} approaches in the distance, waving, running toward 
the camera. Depth of field focuses on {character_B}.

{character_D} slowly raises the left hand, palm up.

{character_C}'s right hand enters from the left edge of frame 
and clasps {character_D}'s hand. {character_C} steps out from 
the left, their figure eclipsing {character_B} in the background. 
Depth of field pulls in tight.

{character_C}'s upper body fills the frame, looking into the 
camera with deep affection, tilting their head slightly, and 
smiling. They cup {character_D}'s hand against their cheek, 
eyes half-closed, savoring the moment.

---

Applicable: emotional reversal, unexpected intervention, love triangles
Duration: 8-12 seconds
```

To use this template, provide four reference images. The skill replaces each `{placeholder}` with the image description and emits a production-ready prompt for your video model of choice.

---

## Bidirectional Workflow

```
Template → Prompt:
  /shot use <template>
    → provide reference images
    → get ready-to-paste prompt

Video → Template:
  /shot extract <video_or_description>
    → AI analyzes shot structure
    → produces reusable template file
    → save to library
```

See this loop as the core value: **every shot you admire becomes reusable; every shot you craft becomes shareable.**

---

## Installation

```bash
git clone https://github.com/zuiho-kai/shot-template-studio.git
cp shot-template-studio/.claude/commands/shot.md ~/.claude/commands/
```

Templates in `shot-template-studio/templates/` are automatically discovered.

---

## Commands

### `/shot list`
Lists all templates with their tags and use cases.

### `/shot use <name>`
Interactive prompt composition. You provide images for each placeholder; the skill returns a complete natural-language prompt compatible with any major video generation model.

### `/shot extract <source>`
Analyzes a video file or descriptive text and produces a new template. The AI identifies required image inputs, shot sequencing, pacing, and applicability tags.

### `/shot save <name>`
Persists a prompt you've written (or refined) as a reusable template. Automatically abstracts character/scene specifics into placeholders.

### `/shot ui`
Launches the visual web interface. Starts a local server and opens the browser automatically.

---

## Web UI

A visual interface for non-technical users. No code required.

```bash
python server.py
# Opens at http://localhost:8090
```

Features:
- Browse all templates visually
- Add new templates (paste `.txt` content or upload file) → writes directly to disk
- Delete templates (removes the `.txt` file)
- Export templates (download `.txt` to share with others)
- AI-assisted generation (copies `/shot extract` command to clipboard)
- Assign reference image numbers to each placeholder
- One-click copy prompt for Kling / Runway / Pika

Templates are persisted as `.txt` files in `templates/`. Sharing a template = sending the `.txt` file.

---

## Template Design Principles

**Natural language, not structured data.**

The target consumers are (a) creative professionals who may not write code, and (b) video generation models whose training distribution is natural language. Any structured intermediate representation—JSON, YAML, DSL—adds cognitive cost for the former and translation overhead for the latter.

**Placeholders in the user's native language.**

`{角色A}` reads more naturally than `{character_a}` for Chinese directors. Templates are bilingual-by-default.

**Editor-friendly.**

Every template is a `.txt` file. A director unfamiliar with Git can open it in Notepad, adjust a phrase, save, and use it. No parsing errors, no schema violations.

**Model-agnostic output.**

Compiled prompts are plain descriptive text, working uniformly across Kling, Runway Gen-3, Pika, Sora, Hailuo, and Midjourney Video without model-specific tuning.

---

## Repository Structure

```
shot-template-studio/
├── .claude/commands/shot.md        ← skill definition
├── server.py                       ← local server (Python, zero dependencies)
├── web/                            ← visual UI
│   ├── index.html
│   ├── style.css
│   └── app.js
├── templates/                      ← shot templates (.txt)
├── example/                        ← workflow demonstrations
├── README.md                       ← language selector
├── README.en.md                    ← English (this document)
├── README.zh.md                    ← Chinese
└── README.ja.md                    ← Japanese
```

---

## Roadmap

### v0.1 — Foundation *(current)*
- [x] Skill with four core commands
- [x] Initial template collection
- [x] Multilingual documentation

### v0.2 — Template Marketplace
A centralized registry where creators share templates and discover others' work.

- [ ] Marketplace backend (GitHub-based, no central server required)
- [ ] `/shot search <keyword>` — search remote templates
- [ ] `/shot install <template>` — fetch and install a template
- [ ] `/shot publish` — submit your template via pull request
- [ ] Metadata: author, rating, category, compatibility notes
- [ ] Curated collections: *Romance*, *Action*, *Documentary*, *Music Video*, etc.
- [ ] Template versioning and update notifications

### v0.3 — Compositional Features
- [ ] Template chaining for long-form sequences
- [ ] Shared character bibles across templates
- [ ] Style transfer between templates
- [ ] Integration with `continuous-scene-designer` for scene-locked shot sequences

### v0.4 — Professional Tooling
- [ ] VS Code extension for template editing with preview
- [ ] CLI for headless usage outside Claude Code
- [ ] Export presets for specific platforms (Kling-optimized, Runway-optimized, etc.)

---

## The Marketplace Vision

Individual template libraries scale linearly. A shared marketplace scales exponentially.

Imagine browsing curated shot collections:

- **Wong Kar-wai collection** — lingering close-ups, reflective surfaces, neon palettes
- **Christopher Nolan collection** — practical-scale IMAX compositions, parallel editing primitives
- **K-drama collection** — meet-cute shots, rain confessions, slow-motion eye contact
- **Documentary collection** — talking head frames, b-roll transitions, interview cutaways

Community templates submitted as pull requests to a central `shot-template-marketplace` repository. Curators review for quality. Users browse and install. Template authors build portfolios; directors save hours per project.

---

## Related Work

- **[continuous-scene-designer](https://github.com/zuiho-kai/continuous-scene-designer)** — Sibling project for spatial consistency in multi-agent image editing. Addresses still-image workflows; this project addresses video shot workflows.

| | continuous-scene-designer | shot-template-studio |
|---|---|---|
| Domain | Still-image editing | Video shot composition |
| State representation | Structured JSON | Natural-language templates |
| Primary audience | Multi-agent frameworks | Directors and creators |
| Artifact | `scene_state.json` | `<shot_name>.txt` |

Common principle: **preserve creative decisions as reusable state**.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

## Contributing

Template contributions welcome. See `CONTRIBUTING.md` *(forthcoming)*.

## Author

Zuiho — [@zuiho-kai](https://github.com/zuiho-kai)
