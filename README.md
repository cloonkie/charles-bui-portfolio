# Charles Bui Portfolio

Static marketing portfolio for **Charles Bui** — digital media strategist based in Los Angeles. Built with plain HTML, CSS, and JavaScript. No framework, no build step.

## Pages

| File | Description |
|---|---|
| `index.html` | Home — hero, about, featured work, writing |
| `work.html` | All projects with filter pills by discipline |
| `resume.html` | Experience, education, and hobbies |
| `projects/indeed.html` | Indeed 2023 Media Plan — visual case study |
| `projects/usc-capstone.html` | USC Capstone — Live Music Experience gallery + sizzle reel |

## Assets

```
assets/
├── indeed/deck/          # 34 renamed presentation slides (PNG)
└── usc-capstone/
    ├── events/           # 5 event photos (JPG)
    └── sizzle/           # 18 sizzle reel clips (MP4)
```

The resume download is hosted externally on Cloudflare R2 and linked from `resume.html`.

## Design

- **Theme:** Light-only, earthy palette (`#f4ede3` bg / `#1c1309` text / `#7a6852` muted)
- **Fonts:** Instrument Serif (headings) · Host Grotesk (nav/labels) · Inter (body)
- **Style reference:** Franco Framer template

## Run locally

Open `index.html` in a browser, or serve with any static file server:

```bash
npx serve .
# or
python -m http.server
```
