/**
 * ATS Resume Builder & Viewer Application Engine
 */

let resumeData = {};
let currentProfile = 'praveen_kumar';
let currentTheme = 'classic';
let currentZoom = 1.0;
let profilesData = {};

// Common High-Impact Action Verbs for ATS analysis
const ACTION_VERBS = [
  'accelerated', 'achieved', 'administered', 'advised', 'advocated', 'analyzed', 'architected',
  'authored', 'automated', 'boosted', 'built', 'centralized', 'championed', 'coached',
  'collaborated', 'conceived', 'consolidated', 'constructed', 'converted', 'coordinated',
  'created', 'decreased', 'delivered', 'deployed', 'designed', 'developed', 'devised',
  'directed', 'doubled', 'drove', 'eliminated', 'enabled', 'engineered', 'enhanced',
  'established', 'executed', 'expanded', 'expedited', 'formulated', 'generated', 'guided',
  'implemented', 'improved', 'increased', 'initiated', 'inspected', 'integrated', 'introduced',
  'launched', 'lead', 'led', 'leveraged', 'managed', 'maximized', 'mentored', 'migrated',
  'minimized', 'modernized', 'negotiated', 'optimized', 'orchestrated', 'overhauled',
  'pioneered', 'planned', 'produced', 'programmed', 'reduced', 'refactored', 'resolved',
  'revamped', 'scaled', 'secured', 'simplified', 'spearheaded', 'standardized', 'streamlined',
  'strengthened', 'structured', 'surpassed', 'synthesized', 'transformed', 'upgraded', 'yielded'
];

document.addEventListener('DOMContentLoaded', async () => {
  await loadSampleData();
  setupEventListeners();
  renderForm();
  renderPreview();
  updateATSScore();
});

/**
 * Load default dataset
 */
async function loadSampleData() {
  const urlParams = new URLSearchParams(window.location.search);
  const profileParam = urlParams.get('profile');
  const profileSelect = document.getElementById('profileSelect');

  if (profileParam) {
    if (profileParam === 'praveen' || profileParam === 'praveen_kumar') {
      currentProfile = 'praveen_kumar';
    } else if (profileParam === 'blank' || profileParam === 'empty') {
      currentProfile = 'blank';
    } else if (profileParam === 'software_engineer' || profileParam === 'sample') {
      currentProfile = 'software_engineer';
    }
    if (profileSelect) profileSelect.value = currentProfile;
  } else if (profileSelect && profileSelect.value) {
    currentProfile = profileSelect.value;
  }

  try {
    const response = await fetch('./data/sample_data.json?t=' + new Date().getTime(), { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      profilesData = data.profiles;
      if (profilesData[currentProfile]) {
        resumeData = JSON.parse(JSON.stringify(profilesData[currentProfile]));
      } else if (currentProfile === 'blank') {
        resumeData = getBlankProfile();
      } else if (profilesData['praveen_kumar']) {
        resumeData = JSON.parse(JSON.stringify(profilesData['praveen_kumar']));
      } else {
        resumeData = getDefaultProfile();
      }
    } else {
      throw new Error('Fallback to inline sample');
    }
  } catch (err) {
    console.warn('Using embedded default profile', err);
    if (currentProfile === 'blank') {
      resumeData = getBlankProfile();
    } else {
      resumeData = getDefaultProfile();
    }
  }
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.style.display = 'block';

      if (targetId === 'tab-json') {
        syncDataToJsonEditor();
      } else if (targetId === 'tab-ats') {
        updateATSScore();
      }
    });
  });

  // Profile Selector
  const profileSelect = document.getElementById('profileSelect');
  if (profileSelect) {
    profileSelect.addEventListener('change', (e) => {
      currentProfile = e.target.value;
      if (profilesData[currentProfile]) {
        resumeData = JSON.parse(JSON.stringify(profilesData[currentProfile]));
      } else if (currentProfile === 'blank') {
        resumeData = getBlankProfile();
      }
      renderForm();
      renderPreview();
      updateATSScore();
      showToast(`Loaded ${e.target.options[e.target.selectedIndex].text}`);
    });
  }

  // Clear / Start Blank Button
  const btnClearForm = document.getElementById('btnClearForm');
  if (btnClearForm) {
    btnClearForm.addEventListener('click', () => {
      if (confirm('Start a fresh blank resume? You can fill in your own details.')) {
        resumeData = getBlankProfile();
        if (profileSelect) profileSelect.value = 'blank';
        renderForm();
        renderPreview();
        updateATSScore();
        showToast('Fresh blank resume started! Fill your details on the left.');
      }
    });
  }

  // Theme Selector
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      currentTheme = e.target.value;
      renderPreview();
    });
  }

  // Accent Color Picker
  const accentPicker = document.getElementById('accentPicker');
  if (accentPicker) {
    accentPicker.addEventListener('input', (e) => {
      document.documentElement.style.setProperty('--resume-accent', e.target.value);
    });
  }

  // Font Picker
  const fontSelect = document.getElementById('fontSelect');
  if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
      const paper = document.getElementById('resumePaper');
      if (paper) paper.style.fontFamily = e.target.value;
    });
  }

  // Zoom Controls
  const zoomSelect = document.getElementById('zoomSelect');
  if (zoomSelect) {
    zoomSelect.addEventListener('change', (e) => {
      currentZoom = parseFloat(e.target.value);
      const paper = document.getElementById('resumePaper');
      if (paper) paper.style.transform = `scale(${currentZoom})`;
    });
  }

  // JSON Editor Apply
  const applyJsonBtn = document.getElementById('applyJsonBtn');
  if (applyJsonBtn) {
    applyJsonBtn.addEventListener('click', () => {
      try {
        const text = document.getElementById('jsonTextarea').value;
        const parsed = JSON.parse(text);
        resumeData = parsed;
        renderForm();
        renderPreview();
        updateATSScore();
        showToast('JSON data successfully synced to resume!');
      } catch (err) {
        alert('Invalid JSON syntax. Please check for syntax errors:\n' + err.message);
      }
    });
  }

  // Export / Print Triggers
  document.getElementById('btnPrint')?.addEventListener('click', () => window.print());
  document.getElementById('btnDownloadJson')?.addEventListener('click', downloadJsonFile);
  document.getElementById('btnExportHtml')?.addEventListener('click', exportHtmlFile);
  document.getElementById('btnCopyMarkdown')?.addEventListener('click', copyMarkdownToClipboard);
}

/**
 * Render the interactive form from resumeData
 */
function renderForm() {
  const container = document.getElementById('formEditorContainer');
  if (!container) return;

  const p = resumeData.personal || {};

  let html = `
    <!-- Contact Info Card -->
    <div class="form-card">
      <div class="form-card-header">
        <span class="card-title">👤 Personal & Contact Info</span>
      </div>
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" id="inp_name" value="${escapeHtml(p.name || '')}">
      </div>
      <div class="form-group">
        <label>Professional Title / Headline</label>
        <input type="text" id="inp_title" value="${escapeHtml(p.title || '')}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Location (City, State / Country)</label>
          <input type="text" id="inp_location" value="${escapeHtml(p.location || '')}">
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" id="inp_phone" value="${escapeHtml(p.phone || '')}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="inp_email" value="${escapeHtml(p.email || '')}">
        </div>
        <div class="form-group">
          <label>LinkedIn (URL or username)</label>
          <input type="text" id="inp_linkedin" value="${escapeHtml(p.linkedin || '')}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>GitHub</label>
          <input type="text" id="inp_github" value="${escapeHtml(p.github || '')}">
        </div>
        <div class="form-group">
          <label>Portfolio / Website</label>
          <input type="text" id="inp_portfolio" value="${escapeHtml(p.portfolio || '')}">
        </div>
      </div>
    </div>

    <!-- Summary Card -->
    <div class="form-card">
      <div class="form-card-header">
        <span class="card-title">📝 Professional Summary</span>
      </div>
      <div class="form-group">
        <textarea id="inp_summary" rows="4">${escapeHtml(resumeData.summary || '')}</textarea>
      </div>
    </div>

    <!-- Skills Card -->
    <div class="form-card">
      <div class="form-card-header">
        <span class="card-title">⚡ Skills & Technologies</span>
        <button type="button" class="btn btn-secondary btn-sm" onclick="addSkillCategory()">+ Add Category</button>
      </div>
      <div id="skillsList">
        ${(resumeData.skills || []).map((s, idx) => `
          <div class="entry-card" data-idx="${idx}">
            <div class="entry-card-header">
              <span class="entry-num">Skill Category #${idx + 1}</span>
              <button class="btn-icon" onclick="removeSkillCategory(${idx})">✕</button>
            </div>
            <div class="form-group">
              <label>Category Name</label>
              <input type="text" class="skill-cat-name" value="${escapeHtml(s.category || '')}" oninput="updateSkillCategory(${idx})">
            </div>
            <div class="form-group">
              <label>Items (comma-separated)</label>
              <input type="text" class="skill-cat-items" value="${escapeHtml(s.items || '')}" oninput="updateSkillCategory(${idx})">
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Experience Card -->
    <div class="form-card">
      <div class="form-card-header">
        <span class="card-title">💼 Work Experience</span>
        <button type="button" class="btn btn-secondary btn-sm" onclick="addExperienceEntry()">+ Add Job</button>
      </div>
      <div id="experienceList">
        ${(resumeData.experience || []).map((exp, idx) => `
          <div class="entry-card" data-idx="${idx}">
            <div class="entry-card-header">
              <span class="entry-num">Job #${idx + 1}</span>
              <button class="btn-icon" onclick="removeExperienceEntry(${idx})">✕</button>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Job Title</label>
                <input type="text" class="exp-role" value="${escapeHtml(exp.role || '')}" oninput="updateExperienceEntry(${idx})">
              </div>
              <div class="form-group">
                <label>Company</label>
                <input type="text" class="exp-company" value="${escapeHtml(exp.company || '')}" oninput="updateExperienceEntry(${idx})">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Location</label>
                <input type="text" class="exp-location" value="${escapeHtml(exp.location || '')}" oninput="updateExperienceEntry(${idx})">
              </div>
              <div class="form-group">
                <label>Date Range (e.g. Mar 2022 – Present)</label>
                <input type="text" class="exp-period" value="${escapeHtml(exp.period || '')}" oninput="updateExperienceEntry(${idx})">
              </div>
            </div>
            <div class="form-group">
              <label>Key Accomplishments (one bullet per line)</label>
              <textarea class="exp-highlights" rows="4" oninput="updateExperienceEntry(${idx})">${(exp.highlights || []).join('\n')}</textarea>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Projects Card -->
    <div class="form-card">
      <div class="form-card-header">
        <span class="card-title">🚀 Key Projects</span>
        <button type="button" class="btn btn-secondary btn-sm" onclick="addProjectEntry()">+ Add Project</button>
      </div>
      <div id="projectsList">
        ${(resumeData.projects || []).map((proj, idx) => `
          <div class="entry-card" data-idx="${idx}">
            <div class="entry-card-header">
              <span class="entry-num">Project #${idx + 1}</span>
              <button class="btn-icon" onclick="removeProjectEntry(${idx})">✕</button>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Project Name</label>
                <input type="text" class="proj-name" value="${escapeHtml(proj.name || '')}" oninput="updateProjectEntry(${idx})">
              </div>
              <div class="form-group">
                <label>Technologies</label>
                <input type="text" class="proj-tech" value="${escapeHtml(proj.technologies || '')}" oninput="updateProjectEntry(${idx})">
              </div>
            </div>
            <div class="form-group">
              <label>Project URL / GitHub</label>
              <input type="text" class="proj-link" value="${escapeHtml(proj.link || '')}" oninput="updateProjectEntry(${idx})">
            </div>
            <div class="form-group">
              <label>Highlights (one bullet per line)</label>
              <textarea class="proj-highlights" rows="3" oninput="updateProjectEntry(${idx})">${(proj.highlights || []).join('\n')}</textarea>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Education Card -->
    <div class="form-card">
      <div class="form-card-header">
        <span class="card-title">🎓 Education</span>
        <button type="button" class="btn btn-secondary btn-sm" onclick="addEducationEntry()">+ Add Degree</button>
      </div>
      <div id="educationList">
        ${(resumeData.education || []).map((edu, idx) => `
          <div class="entry-card" data-idx="${idx}">
            <div class="entry-card-header">
              <span class="entry-num">Education #${idx + 1}</span>
              <button class="btn-icon" onclick="removeEducationEntry(${idx})">✕</button>
            </div>
            <div class="form-group">
              <label>Degree / Field of Study</label>
              <input type="text" class="edu-degree" value="${escapeHtml(edu.degree || '')}" oninput="updateEducationEntry(${idx})">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>University / School</label>
                <input type="text" class="edu-institution" value="${escapeHtml(edu.institution || '')}" oninput="updateEducationEntry(${idx})">
              </div>
              <div class="form-group">
                <label>Years</label>
                <input type="text" class="edu-period" value="${escapeHtml(edu.period || '')}" oninput="updateEducationEntry(${idx})">
              </div>
            </div>
            <div class="form-group">
              <label>GPA / Honors / Details</label>
              <input type="text" class="edu-details" value="${escapeHtml(edu.details || '')}" oninput="updateEducationEntry(${idx})">
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Certifications Card -->
    <div class="form-card">
      <div class="form-card-header">
        <span class="card-title">📜 Certifications</span>
      </div>
      <div class="form-group">
        <label>Certifications (one per line)</label>
        <textarea id="inp_certifications" rows="3">${(resumeData.certifications || []).join('\n')}</textarea>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Bind top level input listeners
  ['inp_name', 'inp_title', 'inp_location', 'inp_phone', 'inp_email', 'inp_linkedin', 'inp_github', 'inp_portfolio'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        const key = id.replace('inp_', '');
        if (!resumeData.personal) resumeData.personal = {};
        resumeData.personal[key] = el.value;
        renderPreview();
        updateATSScore();
      });
    }
  });

  const summaryEl = document.getElementById('inp_summary');
  if (summaryEl) {
    summaryEl.addEventListener('input', () => {
      resumeData.summary = summaryEl.value;
      renderPreview();
      updateATSScore();
    });
  }

  const certEl = document.getElementById('inp_certifications');
  if (certEl) {
    certEl.addEventListener('input', () => {
      resumeData.certifications = certEl.value.split('\n').filter(s => s.trim().length > 0);
      renderPreview();
      updateATSScore();
    });
  }
}

/**
 * Render the Live Resume Sheet inside the Preview Canvas
 */
function renderPreview() {
  const paper = document.getElementById('resumePaper');
  if (!paper) return;

  paper.className = `resume-paper theme-${currentTheme}`;
  const p = resumeData.personal || {};

  // Build Contact Items
  const linkItems = [];
  if (p.linkedin) {
    const href = getLinkedInUrl(p.linkedin);
    linkItems.push(`<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.linkedin)}</a>`);
  }
  if (p.github) {
    const href = getGithubUrl(p.github);
    linkItems.push(`<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.github)}</a>`);
  }
  if (p.portfolio) {
    const isUrl = p.portfolio.includes('.') || p.portfolio.startsWith('http');
    const href = isUrl ? (p.portfolio.startsWith('http') ? p.portfolio : `https://${p.portfolio.replace(/^https?:\/\//, '')}`) : '#';
    linkItems.push(`<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.portfolio)}</a>`);
  }

  const infoItems = [];
  if (p.email) infoItems.push(`<span>Email: <a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></span>`);
  if (p.phone) infoItems.push(`<span>Mobile: <a href="tel:${escapeHtml(p.phone.replace(/[\s-()]/g, ''))}">${escapeHtml(p.phone)}</a></span>`);
  if (p.location) infoItems.push(`<span>Location: ${escapeHtml(p.location)}</span>`);

  let resumeHtml = `
    <!-- Header -->
    <header class="resume-header">
      <div>
        <h1>${escapeHtml(p.name || 'YOUR NAME')}</h1>
        <div class="role-title">${escapeHtml(p.title || '')}</div>
      </div>
      ${linkItems.length ? `<div class="contact-links-row">${linkItems.join(' | ')}</div>` : ''}
      <div class="contact-row">
        ${infoItems.join(' | ')}
      </div>
    </header>
  `;

  // Summary
  if (resumeData.summary && resumeData.summary.trim()) {
    resumeHtml += `
      <section class="section-block">
        <h2 class="sec-title">Profile Summary</h2>
        <p style="text-align: justify;">${escapeHtml(resumeData.summary)}</p>
      </section>
    `;
  }

  // Skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    resumeHtml += `
      <section class="section-block">
        <h2 class="sec-title">Technical Skills</h2>
        <div style="display: flex; flex-direction: column; gap: 3px;">
          ${resumeData.skills.map(s => `
            <div><strong>${escapeHtml(s.category)}:</strong> ${escapeHtml(s.items)}</div>
          `).join('')}
        </div>
      </section>
    `;
  }

  // Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    resumeHtml += `
      <section class="section-block">
        <h2 class="sec-title">Work Experience</h2>
        ${resumeData.experience.map(exp => `
          <div class="entry-item" style="margin-bottom: 8px;">
            <div class="entry-row">
              <div><span class="entry-name">${escapeHtml(exp.role)}</span> – <span class="entry-company">${escapeHtml(exp.company)}</span></div>
              <div class="entry-date">${escapeHtml(exp.location || '')}</div>
            </div>
            <div class="entry-row" style="margin-bottom: 2px;">
              <div style="font-size: 8.8pt; color: #64748b;">${escapeHtml(exp.team || '')}</div>
              <div class="entry-date">${escapeHtml(exp.period || '')}</div>
            </div>
            ${exp.highlights && exp.highlights.length ? `
              <ul class="resume-bullets">
                ${exp.highlights.map(h => `<li>${formatMetrics(escapeHtml(h))}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </section>
    `;
  }

  // Projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    resumeHtml += `
      <section class="section-block">
        <h2 class="sec-title">Key Projects</h2>
        ${resumeData.projects.map(proj => `
          <div class="entry-item" style="margin-bottom: 7px;">
            <div class="entry-row">
              <div>
                <span class="entry-name">${escapeHtml(proj.name)}</span>
                ${proj.technologies ? `<span style="font-style: italic; color: #555; font-size: 9pt;"> | ${escapeHtml(proj.technologies)}</span>` : ''}
              </div>
              <div class="entry-date">${proj.link && proj.link.trim() ? `<a href="${escapeHtml(proj.link.startsWith('http') ? proj.link : 'https://' + cleanUrl(proj.link))}" target="_blank" style="color: inherit;">${escapeHtml(proj.link)}</a>` : ''}</div>
            </div>
            ${proj.highlights && proj.highlights.length ? `
              <ul class="resume-bullets">
                ${proj.highlights.map(h => `<li>${formatMetrics(escapeHtml(h))}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </section>
    `;
  }

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    resumeHtml += `
      <section class="section-block">
        <h2 class="sec-title">Education</h2>
        ${resumeData.education.map(edu => `
          <div class="entry-item" style="margin-bottom: 4px;">
            <div class="entry-row">
              <div><span class="entry-name">${escapeHtml(edu.institution)}</span> – <span>${escapeHtml(edu.degree)}</span></div>
              <div class="entry-date">${escapeHtml(edu.period || '')}</div>
            </div>
            ${edu.details ? `<div style="font-size: 9pt; color: #555; margin-top: 1px;">${escapeHtml(edu.details)}</div>` : ''}
          </div>
        `).join('')}
      </section>
    `;
  }

  // Certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    resumeHtml += `
      <section class="section-block">
        <h2 class="sec-title">Certifications</h2>
        <ul class="resume-bullets">
          ${resumeData.certifications.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
        </ul>
      </section>
    `;
  }

  paper.innerHTML = resumeHtml;
}

/**
 * Format percentages and metrics bold for visual punch
 */
function formatMetrics(text) {
  // Highlights percentages (e.g. 45%), dollar amounts ($12M), or numbers with multipliers
  return text.replace(/(\b\d+%(?:\+)?|\$\d+(?:\.\d+)?[MBK]?(?:\+)?|\b\d+k\+?|\b\d{1,3}(?:,\d{3})+\b)/gi, '<strong>$1</strong>');
}

/**
 * Real-time ATS Scorer and Optimization Engine
 */
function updateATSScore() {
  let score = 0;
  const checklist = [];

  const p = resumeData.personal || {};

  // 1. Contact Completeness (20 pts)
  const hasContact = p.name && p.email && p.phone && p.location;
  if (hasContact) {
    score += 20;
    checklist.push({ pass: true, text: 'Essential contact info complete (Name, Email, Phone, Location)' });
  } else {
    score += 8;
    checklist.push({ pass: false, text: 'Incomplete contact info. Make sure Email, Phone, and Location are filled.' });
  }

  // 2. Professional Links (10 pts)
  if (p.linkedin || p.github || p.portfolio) {
    score += 10;
    checklist.push({ pass: true, text: 'Professional online presence provided (LinkedIn, GitHub, or Portfolio)' });
  } else {
    checklist.push({ pass: false, text: 'Add a LinkedIn or GitHub link to increase recruiter response rate' });
  }

  // 3. Professional Summary (15 pts)
  const summaryLength = (resumeData.summary || '').trim().split(/\s+/).length;
  if (summaryLength >= 25 && summaryLength <= 80) {
    score += 15;
    checklist.push({ pass: true, text: `Professional summary length is optimal (${summaryLength} words)` });
  } else if (summaryLength > 0) {
    score += 8;
    checklist.push({ pass: false, text: `Summary is ${summaryLength} words. Aim for 30–60 punchy words.` });
  } else {
    checklist.push({ pass: false, text: 'Add a concise 2–3 line summary highlighting your core value.' });
  }

  // 4. Action Verbs in Bullet Points (25 pts)
  let totalBullets = 0;
  let actionVerbBullets = 0;
  let metricBullets = 0;

  const allBullets = [];
  (resumeData.experience || []).forEach(e => (e.highlights || []).forEach(h => allBullets.push(h)));
  (resumeData.projects || []).forEach(p => (p.highlights || []).forEach(h => allBullets.push(h)));

  totalBullets = allBullets.length;

  allBullets.forEach(b => {
    const firstWord = b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (ACTION_VERBS.includes(firstWord)) {
      actionVerbBullets++;
    }
    if (/(\d+(?:\.\d+)?(?:\s*(?:%|x|k|km|m|ms|s|bps|kbps|hz|mhz|ghz|byte|bit|dbm|hours?|\+))|\b\d{2,}\b|\$\d+)/i.test(b)) {
      metricBullets++;
    }
  });

  if (totalBullets > 0 && actionVerbBullets / totalBullets >= 0.6) {
    score += 25;
    checklist.push({ pass: true, text: `Strong action verbs in ${actionVerbBullets}/${totalBullets} accomplishment bullets` });
  } else if (totalBullets > 0) {
    score += 12;
    checklist.push({ pass: false, text: `Start more bullets with strong action verbs (e.g. Spearheaded, Architected, Automated)` });
  } else {
    checklist.push({ pass: false, text: 'Add experience bullets with measurable achievements.' });
  }

  // 5. Quantifiable Metrics (20 pts)
  if (totalBullets > 0 && metricBullets / totalBullets >= 0.3) {
    score += 20;
    checklist.push({ pass: true, text: `High impact: ${metricBullets}/${totalBullets} bullets include quantifiable metrics (%, numbers, measurements)` });
  } else if (metricBullets > 0) {
    score += 12;
    checklist.push({ pass: false, text: `Add more quantifiable metrics (found ${metricBullets}/${totalBullets} bullets with numbers/measurements)` });
  } else {
    checklist.push({ pass: false, text: 'No quantifiable numbers detected. ATS and recruiters prioritize quantified technical impact.' });
  }

  // 6. Skills Categorization (10 pts)
  if (resumeData.skills && resumeData.skills.length >= 3) {
    score += 10;
    checklist.push({ pass: true, text: 'Skills are cleanly categorized for ATS keyword scanning' });
  } else {
    score += 5;
    checklist.push({ pass: false, text: 'Group skills into at least 3 distinct categories (Languages, Frameworks, Cloud, etc.)' });
  }

  // Update UI
  const scoreNum = document.getElementById('atsScoreNum');
  if (scoreNum) scoreNum.textContent = `${Math.min(score, 100)}%`;

  const checklistEl = document.getElementById('atsChecklist');
  if (checklistEl) {
    checklistEl.innerHTML = checklist.map(c => `
      <li class="checklist-item ${c.pass ? 'pass' : 'warn'}">
        <span class="check-icon">${c.pass ? '✓' : '⚠'}</span>
        <span>${escapeHtml(c.text)}</span>
      </li>
    `).join('');
  }
}

/**
 * Skill handlers
 */
window.addSkillCategory = function () {
  if (!resumeData.skills) resumeData.skills = [];
  resumeData.skills.push({ category: 'Tools & Technologies', items: 'Git, Docker, VS Code' });
  renderForm();
  renderPreview();
  updateATSScore();
};

window.removeSkillCategory = function (idx) {
  resumeData.skills.splice(idx, 1);
  renderForm();
  renderPreview();
  updateATSScore();
};

window.updateSkillCategory = function (idx) {
  const card = document.querySelector(`#skillsList .entry-card[data-idx="${idx}"]`);
  if (!card) return;
  resumeData.skills[idx] = {
    category: card.querySelector('.skill-cat-name').value,
    items: card.querySelector('.skill-cat-items').value
  };
  renderPreview();
  updateATSScore();
};

/**
 * Experience handlers
 */
window.addExperienceEntry = function () {
  if (!resumeData.experience) resumeData.experience = [];
  resumeData.experience.unshift({
    role: 'Software Engineer',
    company: 'Company Name',
    location: 'City, ST',
    period: '2023 – Present',
    highlights: ['Engineered scalable features improving system performance by 25%.']
  });
  renderForm();
  renderPreview();
  updateATSScore();
};

window.removeExperienceEntry = function (idx) {
  resumeData.experience.splice(idx, 1);
  renderForm();
  renderPreview();
  updateATSScore();
};

window.updateExperienceEntry = function (idx) {
  const card = document.querySelector(`#experienceList .entry-card[data-idx="${idx}"]`);
  if (!card) return;
  resumeData.experience[idx] = {
    role: card.querySelector('.exp-role').value,
    company: card.querySelector('.exp-company').value,
    location: card.querySelector('.exp-location').value,
    period: card.querySelector('.exp-period').value,
    highlights: card.querySelector('.exp-highlights').value.split('\n').filter(s => s.trim().length > 0)
  };
  renderPreview();
  updateATSScore();
};

/**
 * Project handlers
 */
window.addProjectEntry = function () {
  if (!resumeData.projects) resumeData.projects = [];
  resumeData.projects.push({
    name: 'New Project',
    technologies: 'React, Node.js',
    link: 'github.com/user/project',
    highlights: ['Developed end-to-end functionality resulting in 500+ active users.']
  });
  renderForm();
  renderPreview();
  updateATSScore();
};

window.removeProjectEntry = function (idx) {
  resumeData.projects.splice(idx, 1);
  renderForm();
  renderPreview();
  updateATSScore();
};

window.updateProjectEntry = function (idx) {
  const card = document.querySelector(`#projectsList .entry-card[data-idx="${idx}"]`);
  if (!card) return;
  resumeData.projects[idx] = {
    name: card.querySelector('.proj-name').value,
    technologies: card.querySelector('.proj-tech').value,
    link: card.querySelector('.proj-link').value,
    highlights: card.querySelector('.proj-highlights').value.split('\n').filter(s => s.trim().length > 0)
  };
  renderPreview();
  updateATSScore();
};

/**
 * Education handlers
 */
window.addEducationEntry = function () {
  if (!resumeData.education) resumeData.education = [];
  resumeData.education.push({
    degree: 'B.S. in Computer Science',
    institution: 'University Name',
    period: '2019 – 2023',
    details: 'GPA: 3.8 / 4.0'
  });
  renderForm();
  renderPreview();
  updateATSScore();
};

window.removeEducationEntry = function (idx) {
  resumeData.education.splice(idx, 1);
  renderForm();
  renderPreview();
  updateATSScore();
};

window.updateEducationEntry = function (idx) {
  const card = document.querySelector(`#educationList .entry-card[data-idx="${idx}"]`);
  if (!card) return;
  resumeData.education[idx] = {
    degree: card.querySelector('.edu-degree').value,
    institution: card.querySelector('.edu-institution').value,
    period: card.querySelector('.edu-period').value,
    details: card.querySelector('.edu-details').value
  };
  renderPreview();
  updateATSScore();
};

/**
 * Helpers
 */
function syncDataToJsonEditor() {
  const textarea = document.getElementById('jsonTextarea');
  if (textarea) {
    textarea.value = JSON.stringify(resumeData, null, 2);
  }
}

function downloadJsonFile() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${(resumeData.personal?.name || 'resume').toLowerCase().replace(/\s+/g, '_')}_resume.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('JSON resume downloaded!');
}

function exportHtmlFile() {
  const paper = document.getElementById('resumePaper');
  if (!paper) return;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(resumeData.personal?.name || 'Resume')}</title>
  <style>
    ${document.querySelector('style')?.innerHTML || ''}
    body { background: #f4f4f6; display: flex; justify-content: center; padding: 20px 0; }
    .resume-paper { width: 8.5in; min-height: 11in; background: #ffffff; padding: 0.55in 0.65in; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
    @media print {
      body { background: transparent; padding: 0; }
      .resume-paper { width: 100%; box-shadow: none; padding: 0; }
      @page { size: letter; margin: 0.5in; }
    }
  </style>
</head>
<body>
  <main class="resume-paper theme-${currentTheme}">
    ${paper.innerHTML}
  </main>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(resumeData.personal?.name || 'resume').toLowerCase().replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Standalone HTML resume exported!');
}

function copyMarkdownToClipboard() {
  const p = resumeData.personal || {};
  let md = `# ${p.name || 'PRAVEEN KUMAR'}\n`;
  md += `**${p.title || 'Embedded Systems & IoT Engineer'}**\n`;
  const contacts = [];
  if (p.location) contacts.push(p.location);
  if (p.phone) contacts.push(p.phone);
  if (p.email) contacts.push(`[${p.email}](mailto:${p.email})`);
  if (p.linkedin) {
    const isUrl = p.linkedin.includes('.') || p.linkedin.startsWith('http');
    const href = isUrl ? (p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`) : 'https://linkedin.com';
    contacts.push(`[${p.linkedin}](${href})`);
  }
  if (p.github) {
    const isUrl = p.github.includes('.') || p.github.startsWith('http');
    const href = isUrl ? (p.github.startsWith('http') ? p.github : `https://${p.github}`) : 'https://github.com';
    contacts.push(`[${p.github}](${href})`);
  }
  if (p.portfolio) {
    const isUrl = p.portfolio.includes('.') || p.portfolio.startsWith('http');
    const href = isUrl ? (p.portfolio.startsWith('http') ? p.portfolio : `https://${p.portfolio}`) : '#';
    contacts.push(`[${p.portfolio}](${href})`);
  }
  md += contacts.join(' | ') + '\n\n---\n\n';

  if (resumeData.summary) {
    md += `## PROFILE SUMMARY\n${resumeData.summary}\n\n---\n\n`;
  }

  if (resumeData.skills && resumeData.skills.length) {
    md += `## TECHNICAL SKILLS\n`;
    resumeData.skills.forEach(s => {
      md += `- **${s.category}:** ${s.items}\n`;
    });
    md += `\n---\n\n`;
  }

  if (resumeData.projects && resumeData.projects.length) {
    md += `## PROJECTS\n\n`;
    resumeData.projects.forEach(pr => {
      md += `### **${pr.name}**\n`;
      if (pr.technologies) md += `*${pr.technologies}*\n`;
      (pr.highlights || []).forEach(h => {
        md += `- ${h}\n`;
      });
      md += `\n`;
    });
    md += `---\n\n`;
  }

  if (resumeData.experience && resumeData.experience.length) {
    md += `## PROFESSIONAL EXPERIENCE\n\n`;
    resumeData.experience.forEach(e => {
      md += `### **${e.role}** | ${e.company} | *${e.location || ''}*\n*${e.period || ''}*\n`;
      (e.highlights || []).forEach(h => {
        md += `- ${h}\n`;
      });
      md += `\n`;
    });
    md += `---\n\n`;
  }

  if (resumeData.education && resumeData.education.length) {
    md += `## EDUCATION\n\n`;
    resumeData.education.forEach(edu => {
      md += `### **${edu.degree}**\n**${edu.institution}** | *${edu.period || ''}*\n`;
      if (edu.details) md += `- ${edu.details}\n`;
      md += `\n`;
    });
    md += `---\n\n`;
  }

  if (resumeData.certifications && resumeData.certifications.length) {
    md += `## CERTIFICATIONS\n`;
    resumeData.certifications.forEach(c => {
      md += `- ${c}\n`;
    });
  }

  navigator.clipboard.writeText(md).then(() => {
    showToast('Markdown format copied to clipboard!');
  }).catch(() => {
    alert('Failed to copy. Please allow clipboard permissions.');
  });
}

function showToast(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span> <span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str || '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function cleanUrl(url) {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '');
}

function getLinkedInUrl(val) {
  if (!val) return 'https://www.linkedin.com/in/praveenreddy007m';
  const clean = val.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  if (clean.includes('linkedin.com/in/')) return 'https://' + clean.replace(/^https?:\/\//, '');
  if (clean.toLowerCase() === 'linkedin') return 'https://www.linkedin.com/in/praveenreddy007m';
  return 'https://www.linkedin.com/in/' + clean.replace(/^@/, '');
}

function getGithubUrl(val) {
  if (!val) return 'https://github.com/praveenreddy0073';
  const clean = val.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  if (clean.includes('github.com/')) return 'https://' + clean.replace(/^https?:\/\//, '');
  if (clean.toLowerCase() === 'github') return 'https://github.com/praveenreddy0073';
  return 'https://github.com/' + clean.replace(/^@/, '');
}

function getDefaultProfile() {
  return {
    personal: {
      name: "PRAVEEN KUMAR",
      title: "Electronics Engineering Student",
      location: "Bangalore, Karnataka, India",
      phone: "+91 9632629692",
      email: "praveenreddy007m@gmail.com",
      linkedin: "linkedin.com/in/praveenreddy007m",
      github: "github.com/praveenreddy0073",
      portfolio: ""
    },
    summary: "Electronics and Communication Engineering undergraduate with practical experience in Embedded Systems, Firmware Development, and Digital VLSI. Skilled in developing microcontroller-based systems (ESP32, STM32, Arduino, 8051), wireless communication protocols (LoRa, BLE, Wi-Fi), sensor interfacing (I2C, SPI, UART), and PCB design using KiCad. Experienced in building reliable hardware-software projects.",
    skills: [
      { category: "Programming Languages", items: "C, Embedded C, Python, Verilog HDL, Assembly (8051)" },
      { category: "Microcontrollers & Hardware", items: "ESP32, STM32, Arduino Uno, 8051" },
      { category: "Communication & Protocols", items: "UART, SPI, I2C, LoRa (SX1278 @ 433MHz), Bluetooth / BLE, Wi-Fi" },
      { category: "Core Electronics Skills", items: "Digital Electronics, Analog Electronics, Embedded Systems, PCB Design, Computer Networks, IoT" },
      { category: "Tools & Technologies", items: "KiCad, EasyEDA, Xilinx Vivado, Keil µVision, Arduino IDE, MATLAB Simulink" }
    ],
    experience: [],
    projects: [
      {
        name: "LoRa-Based Long-Range Disaster Communication Network",
        technologies: "ESP32, LoRa (SX1278 @ 433MHz), Wi-Fi Captive Portal, Embedded C",
        link: "",
        highlights: [
          "Built an off-grid emergency communication network enabling long-range SOS transmission across a 1.8 km range without cellular connectivity.",
          "Implemented an autonomous Wi-Fi Captive Portal on the ESP32 User Node, allowing survivors to connect via any smartphone browser to submit distress messages with GPS coordinates.",
          "Programmed multi-hop packet forwarding across Relay Nodes with message deduplication, delivering alerts with <500 ms latency to the central Base Station dashboard.",
          "Achieved compressed voice transmission over LoRa using Codec2 technology."
        ]
      },
      {
        name: "Intelligent Assistive Exoskeleton for Human Mobility Support",
        technologies: "ESP32, Arduino IDE, IMU Sensor, FSR Pressure Sensors, Bluetooth (BLE)",
        link: "",
        highlights: [
          "Developed a motorized lower-limb robotic exoskeleton prototype featuring automated closed-loop and manual control modes to assist mobility.",
          "Implemented sensor fusion using an IMU and in-sole FSR pressure sensors for real-time movement detection with <20 ms response latency.",
          "Integrated Bluetooth (BLE) wireless communication for remote control and telemetry monitoring within a 10 m range, designing a custom power PCB in KiCad."
        ]
      }
    ],
    education: [
      {
        degree: "Bachelor of Technology (B.Tech) in Electronics & Communication Engineering",
        institution: "Reva University",
        location: "Bangalore, Karnataka",
        period: "2023 – 2027",
        details: "CGPA: 8.2 / 10.0"
      },
      {
        degree: "Class XII (Pre-University Course - PCMB)",
        institution: "Sarvajna PU College",
        location: "Kalaburagi, Karnataka",
        period: "2022 – 2023",
        details: "Percentage: 90.5%"
      },
      {
        degree: "Class X (CBSE)",
        institution: "Nekkanti Ramarao CBSE High School",
        location: "Koppal, Karnataka",
        period: "2020 – 2021",
        details: "Percentage: 90.0%"
      }
    ],
    certifications: [
      "PCB Design & Fabrication – Issued by Enthu EdTech",
      "Digital Electronics and VLSI Architecture – Issued by Codec Technologies",
      "Embedded Systems – Issued by EMERTXE"
    ]
  };
}

function getBlankProfile() {
  return {
    personal: {
      name: "",
      title: "",
      location: "",
      phone: "",
      email: "",
      linkedin: "",
      github: "",
      portfolio: ""
    },
    summary: "",
    skills: [
      { category: "Programming Languages", items: "" },
      { category: "Frameworks & Libraries", items: "" },
      { category: "Tools & Technologies", items: "" }
    ],
    experience: [],
    projects: [
      {
        name: "",
        technologies: "",
        link: "",
        highlights: [""]
      }
    ],
    education: [
      {
        degree: "",
        institution: "",
        location: "",
        period: "",
        details: ""
      }
    ],
    certifications: []
  };
}
