let templates = [];
let currentTemplate = null;
const slotImages = {};

function parseTemplateText(content) {
  const nameMatch = content.match(/【(.+?)】/);
  if (!nameMatch) return null;
  const name = nameMatch[1];

  const sections = content.split(/^---$/m).map(s => s.trim());
  if (sections.length < 3) return null;

  const headerSection = sections[0];
  const body = sections[1];
  const footerSection = sections[2];

  const placeholderKeys = [];
  const seen = new Set();
  const phRegex = /\{([^}]+)\}/g;
  let m;
  while ((m = phRegex.exec(body)) !== null) {
    if (!seen.has(m[1])) { seen.add(m[1]); placeholderKeys.push(m[1]); }
  }

  const imgLines = headerSection.match(/^- .+$/gm) || [];
  const placeholders = placeholderKeys.map(key => {
    const line = imgLines.find(l => l.includes(key));
    let label = '';
    if (line) {
      const colonMatch = line.match(/[：:]\s*(.+?)(?:[（(]|$)/);
      if (colonMatch) label = colonMatch[1].trim();
      else {
        const parenMatch = line.match(/[（(](.+?)[）)]/);
        if (parenMatch) label = parenMatch[1];
      }
    }
    const type = key.includes('场景') || key.includes('scene') ? 'scene' : 'char';
    return { key, label: label || key, type };
  });

  const tagsMatch = footerSection.match(/适用[：:]\s*(.+)/);
  const durationMatch = footerSection.match(/时长参考[：:]\s*(.+)/);

  return {
    name,
    placeholders,
    tags: tagsMatch ? tagsMatch[1].trim() : '',
    duration: durationMatch ? durationMatch[1].trim() : '',
    body
  };
}

async function init() {
  await loadTemplates();
  renderGallery();
}

async function loadTemplates() {
  const res = await fetch('/api/templates');
  const data = await res.json();
  templates = data.map(t => {
    const parsed = parseTemplateText(t.content);
    if (!parsed) return { name: t.name, placeholders: [], tags: '', duration: '', body: t.content };
    return parsed;
  });
}

function renderGallery() {
  document.querySelector('.gallery-view').classList.remove('hidden');
  document.querySelector('.builder').classList.remove('active');
  const gallery = document.getElementById('gallery');
  const cards = templates.map((t, i) => `
    <div class="card" onclick="openBuilder(${i})">
      <div class="card-index">${String(i + 1).padStart(2, '0')}</div>
      <div class="card-body">
        <div class="card-name">${t.name}</div>
        <div class="card-tags">${t.tags}</div>
      </div>
      <div class="card-meta">
        <div>${t.duration}</div>
        <div>${t.placeholders.length} 张图</div>
        <div class="card-actions">
          <button class="action-btn" onclick="exportTemplate(${i}, event)" title="导出">↓</button>
          <button class="action-btn delete-btn" onclick="deleteTemplate(${i}, event)" title="删除">&times;</button>
        </div>
      </div>
    </div>
  `).join('');
  const actionCards = `
    <div class="card card-add" onclick="showAddModal()">
      <div class="card-index">+</div>
      <div class="card-body">
        <div class="card-name">新增模板</div>
        <div class="card-tags">粘贴或上传 .txt 模板文件</div>
      </div>
      <div class="card-meta"></div>
    </div>
    <div class="card card-add" onclick="showAiModal()">
      <div class="card-index">AI</div>
      <div class="card-body">
        <div class="card-name">AI 生成</div>
        <div class="card-tags">描述你想要的镜头，让 AI 生成模板</div>
      </div>
      <div class="card-meta"></div>
    </div>
  `;
  gallery.innerHTML = cards + actionCards;
}

function openBuilder(idx) {
  currentTemplate = templates[idx];
  if (!currentTemplate) return;
  Object.keys(slotImages).forEach(k => delete slotImages[k]);
  document.querySelector('.gallery-view').classList.add('hidden');
  const builder = document.querySelector('.builder');
  builder.classList.add('active');
  document.querySelector('.builder-title').textContent = currentTemplate.name;
  document.querySelector('.builder-subtitle').textContent = currentTemplate.tags + ' · ' + currentTemplate.duration;
  renderSlots();
  updatePreview();
}

function renderSlots() {
  const grid = document.getElementById('slotGrid');
  grid.innerHTML = currentTemplate.placeholders.map((p, i) => `
    <div class="slot-card">
      <div class="slot-number">IMG_${String(i + 1).padStart(2, '0')}</div>
      <div class="slot-name">${p.key}</div>
      <div class="slot-desc">${p.label}</div>
      <div class="drop-zone" id="drop-${i}"
           ondragover="handleDragOver(event)"
           ondragleave="handleDragLeave(event)"
           ondrop="handleDrop(event, ${i})"
           onclick="triggerUpload(${i})">
        拖入参考图
      </div>
      <input type="file" id="file-${i}" accept="image/*" style="display:none"
             onchange="handleFileSelect(event, ${i})">
    </div>
  `).join('');
}

function handleDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('dragover'); }
function handleDragLeave(e) { e.currentTarget.classList.remove('dragover'); }
function handleDrop(e, idx) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) previewImage(file, idx);
}
function triggerUpload(idx) { document.getElementById('file-' + idx).click(); }
function handleFileSelect(e, idx) {
  const file = e.target.files[0];
  if (file) previewImage(file, idx);
}
function previewImage(file, idx) {
  const reader = new FileReader();
  reader.onload = function(e) {
    slotImages[idx] = true;
    document.getElementById('drop-' + idx).innerHTML = `<img src="${e.target.result}" alt="ref">`;
  };
  reader.readAsDataURL(file);
}

function buildPrompt() {
  let text = currentTemplate.body;
  currentTemplate.placeholders.forEach((p, i) => {
    const ref = p.type === 'scene' ? `图片${i+1}中的场景` : `图片${i+1}中的人物`;
    text = text.replaceAll(`{${p.key}}`, ref);
  });
  return text;
}

function buildGuide() {
  return currentTemplate.placeholders.map((p, i) =>
    `图片${i+1} = ${p.key}（${p.label}）`
  ).join('\n');
}

function updatePreview() {
  const preview = document.getElementById('promptPreview');
  let html = currentTemplate.body;
  currentTemplate.placeholders.forEach((p, i) => {
    const ref = p.type === 'scene' ? `图片${i+1}中的场景` : `图片${i+1}中的人物`;
    html = html.replaceAll(`{${p.key}}`, `<span class="placeholder">${ref}</span>`);
  });
  preview.innerHTML = html;
}

async function copyPrompt() {
  await navigator.clipboard.writeText(buildPrompt());
  showToast('prompt copied');
}
async function copyGuide() {
  await navigator.clipboard.writeText(buildGuide());
  showToast('guide copied');
}

async function deleteTemplate(idx, e) {
  e.stopPropagation();
  const t = templates[idx];
  if (!confirm(`删除「${t.name}」？此操作会删除磁盘上的 .txt 文件。`)) return;
  await fetch(`/api/templates/${encodeURIComponent(t.name)}`, { method: 'DELETE' });
  await loadTemplates();
  renderGallery();
  showToast('已删除: ' + t.name);
}

function exportTemplate(idx, e) {
  e.stopPropagation();
  const t = templates[idx];
  window.open(`/api/templates/${encodeURIComponent(t.name)}?download=1`, '_blank');
}

function showAddModal() {
  document.getElementById('addModal').classList.add('show');
  document.getElementById('templateInput').value = '';
}
function closeAddModal() {
  document.getElementById('addModal').classList.remove('show');
}

async function confirmAdd() {
  const text = document.getElementById('templateInput').value.trim();
  if (!text) return;
  const parsed = parseTemplateText(text);
  if (!parsed) { showToast('格式错误：需要【名称】+ --- 分隔'); return; }
  await fetch('/api/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: parsed.name, content: text })
  });
  closeAddModal();
  await loadTemplates();
  renderGallery();
  showToast('已保存: ' + parsed.name);
}

function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    document.getElementById('templateInput').value = ev.target.result;
  };
  reader.readAsText(file, 'utf-8');
  e.target.value = '';
}

function showAiModal() {
  document.getElementById('aiModal').classList.add('show');
  document.getElementById('aiInput').value = '';
}
function closeAiModal() {
  document.getElementById('aiModal').classList.remove('show');
}
async function confirmAiGenerate() {
  const desc = document.getElementById('aiInput').value.trim();
  if (!desc) return;
  const cmd = `/shot extract ${desc}`;
  await navigator.clipboard.writeText(cmd);
  closeAiModal();
  showToast('已复制命令，粘贴到 Claude Code 执行');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function goBack() {
  currentTemplate = null;
  renderGallery();
}

document.addEventListener('DOMContentLoaded', init);
