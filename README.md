# 📄 ATS-Optimized Resume Studio & Templates

A clean, modern, ATS-compliant (Applicant Tracking System) resume suite featuring standalone HTML/CSS templates, Markdown format, structured JSON dataset, and a live interactive customizer web application.

---

## 🌟 What's Included

```
resume/
├── index.html              # 🖥️ Interactive Web Builder & Live Preview Studio
├── style.css               # 🎨 Stylesheet, theme variables & print rules
├── app.js                  # ⚡ Reactive editor, JSON sync, and ATS scorer
├── resume.md               # 📝 Clean Markdown format resume
├── data/
│   └── sample_data.json    # 📊 Schema dataset (Software Engineer, PM, Data Scientist)
├── templates/
│   ├── classic-ats.html    # 🏛️ Traditional single-column ATS corporate template
│   ├── modern-tech.html    # 🚀 Contemporary tech & software engineer template
│   └── minimal.html        # 🖋️ Clean minimalist executive template
└── README.md               # 📖 Documentation & ATS guide
```

---

## 🚀 Getting Started

### 1. Using the Interactive Web Studio
Simply open [index.html](file:///c:/Users/Lenovo/resume/index.html) in any modern web browser (Chrome, Edge, Firefox, Safari).

- **Live Form Editor:** Edit your contact info, summary, experience, skills, and projects with immediate live rendering.
- **Role Presets:** Switch between pre-filled profiles (Software Engineer, Senior Product Manager, Data Scientist / ML Engineer).
- **Style Customizer:** Toggle between **Classic ATS**, **Modern Tech**, and **Minimalist** layouts, customize fonts, and tweak accent colors.
- **Real-Time ATS Checker:** Automatically analyzes action verbs, quantifiable metrics (`$`, `%`, `numbers`), contact completeness, and keyword formatting.
- **Export Options:**
  - `🖨️ Print / Save to PDF`: Opens native browser print dialog with optimized `@media print` rules (clean pagination, no cutoffs, perfect A4/Letter margins).
  - `🌐 Export HTML`: Downloads a standalone `.html` file of your resume.
  - `💾 Export JSON`: Saves your resume data into standard JSON schema.
  - `📋 Copy Markdown`: Copies clean Markdown directly to your clipboard.

### 2. Using the Standalone HTML Templates
If you want zero-dependency, pure HTML/CSS templates that you can edit in any text editor and print directly:
- [templates/classic-ats.html](file:///c:/Users/Lenovo/resume/templates/classic-ats.html)
- [templates/modern-tech.html](file:///c:/Users/Lenovo/resume/templates/modern-tech.html)
- [templates/minimal.html](file:///c:/Users/Lenovo/resume/templates/minimal.html)

### 3. Using Markdown
Open [resume.md](file:///c:/Users/Lenovo/resume/resume.md) in your favorite Markdown editor or GitHub repository.

---

## 🖨️ How to Save as a Pixel-Perfect PDF

1. In the web studio or standalone HTML file, click **"Print / Save to PDF"** (or press `Ctrl + P` / `Cmd + P`).
2. Set **Destination** to **"Save as PDF"**.
3. Set **Paper size** to **"Letter"** or **"A4"**.
4. Set **Margins** to **"Default"** (or **"None"** since margins are built into the CSS).
5. Ensure **"Background graphics"** is checked.
6. Click **Save**.

---

## 🎯 ATS Optimization Best Practices

1. **Simple Hierarchy:** Avoid complex multi-column tables and non-standard text boxes that break OCR scanners.
2. **Standard Section Titles:** Use unambiguous headings like `Professional Summary`, `Technical Skills`, `Work Experience`, `Education`.
3. **Quantify Your Impact:** Frame achievements using the **Google XYZ formula**: *"Accomplished [X], as measured by [Y], by doing [Z]"*. (e.g. *"Reduced query latency by 45% by implementing Redis caching"*).
4. **Strong Action Verbs:** Start bullet points with strong verbs (e.g., *Spearheaded, Architected, Automated, Optimized, Engineered*).
5. **Clean Plain Text Output:** Ensure your contact details and URLs are clean and accessible.
