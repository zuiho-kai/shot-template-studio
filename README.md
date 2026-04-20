# Shot Template Studio

> A reusable shot template library for AI video generation.
> Natural-language templates that work across Kling, Runway, Pika, Sora, and Midjourney Video.

[English](README.en.md) | [中文](README.zh.md) | [日本語](README.ja.md)

---

## What it is

A skill that turns cinematic shots into reusable, shareable templates.

- **Use template** → fill in reference images → get a production-ready prompt
- **Extract from video** → AI analyzes footage → generates a reusable template
- **Save your own** → capture what you wrote → build your personal shot library
- **Share via marketplace** *(roadmap)* → discover and contribute community templates

Templates are plain `.txt` files with `{placeholders}`. No JSON. No DSL. No code.

---

## Quick Start

```bash
# 1. Install the skill
cp .claude/commands/shot.md ~/.claude/commands/

# 2. Browse templates
/shot list

# 3. Use a template
/shot use 半路截胡

# 4. Extract from a video you like
/shot extract [video_file_or_description]

# 5. Open the visual UI
/shot ui
# Or manually: python server.py → open http://localhost:8090
```

---

## Commands

| Command | Purpose |
|---------|---------|
| `/shot list` | List all available templates |
| `/shot use <name>` | Compose a prompt from a template + reference images |
| `/shot extract <source>` | Analyze a video and generate a template |
| `/shot save <name>` | Save the current prompt as a reusable template |
| `/shot ui` | Launch the visual web interface |

---

## Web UI

A visual interface for non-technical users. No code required.

```bash
python server.py
# Opens at http://localhost:8090
```

Features:
- Browse all templates visually
- Add new templates (paste `.txt` content or upload file)
- Delete templates (removes the `.txt` file from disk)
- Export templates (download `.txt` to share with others)
- AI-assisted generation (copies `/shot extract` command for Claude Code)
- Assign reference images to numbered slots
- One-click copy prompt for Kling / Runway / Pika

Templates are persisted as `.txt` files in `templates/`. Share a template = send the `.txt` file.

---

## Template Format

Each template is a `.txt` file with natural language and `{placeholders}`:

```
【Shot Name】

Required images:
- {scene}: location
- {character_A}: description

---

[Flowing natural-language shot description with {placeholders}
 referring to the provided reference images]

---

Applicable: [scenario tags]
Duration: [X-Y seconds]
```

**Design rationale:** Templates are written for directors, not engineers.
Any text editor can modify them. LLMs consume them directly without parsing overhead.

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
│   ├── 半路截胡.txt
│   ├── 雨中告别.txt
│   └── 擦肩回眸.txt
├── example/
│   └── video-to-template.md        ← extraction workflow example
└── README.{en,zh,ja}.md            ← translated documentation
```

---

## Roadmap

**v0.1** (current)
- [x] Core skill: list / use / extract / save
- [x] Starter template collection (3 shots)
- [x] Multilingual documentation

**v0.2** — Template Marketplace
- [ ] Central registry of community templates
- [ ] `/shot install <template>` — fetch from marketplace
- [ ] `/shot publish` — submit your template for review
- [ ] Rating, categorization, search
- [ ] Curated collections (romance / action / documentary / etc.)

**v0.3** — Advanced Features
- [ ] Template chaining for long-form video
- [ ] Style transfer between templates
- [ ] Integration with `continuous-scene-designer` for scene-locked shot sequences

---

## Related Projects

- **[continuous-scene-designer](https://github.com/zuiho-kai/continuous-scene-designer)** — Scene consistency protocol for multi-agent image editing. Complementary use case: locks spatial consistency across rounds.

| | continuous-scene-designer | shot-template-studio |
|---|---|---|
| Problem | Multi-round image edit drift | Shot prompt reusability |
| State | JSON (spatial constraints) | Natural-language templates |
| Audience | Multi-agent frameworks | Individual directors / creators |
| Format | Structured | Plain text |

Both address the same underlying challenge: **turning transient AI creative work into reusable assets.**

---

## License

MIT

## Author

Built by Zuiho ([@zuiho-kai](https://github.com/zuiho-kai))
