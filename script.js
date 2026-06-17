/* SideQuest — shared vanilla JS */

// ===== Data =====
const CHALLENGES = [
  { id:'cleanup', title:'Neighborhood Clean-Up Mission', desc:'Grab a bag, grab a friend, leave your block cleaner than you found it. Bonus XP for before/after pics.', time:'30–60 min', xp:120, color:'' },
  { id:'meal', title:'Feed a Stranger Quest', desc:'Pack an extra sandwich, hand it to someone who needs it. Small act. Big main-character energy.', time:'20 min', xp:90, color:'alt' },
  { id:'note', title:'Random Kindness Note Drop', desc:'Write 5 hype notes. Leave them in library books, on car windshields, in coat pockets. Anonymous serotonin.', time:'15 min', xp:60, color:'alt2' },
  { id:'tutor', title:'Mini Tutor Side-Quest', desc:'Help a younger sibling, cousin, or neighbor with homework for an hour. Unlock: legend status.', time:'1 hr', xp:150, color:'' },
  { id:'plant', title:'Guerrilla Garden Drop', desc:'Plant something. Anywhere legal. Tag it. Watch your city level up.', time:'45 min', xp:130, color:'alt' },
  { id:'check', title:'Check-In on a Friend', desc:'Text the friend you keep forgetting to text. Real talk only. No vibes left behind.', time:'10 min', xp:50, color:'alt2' },
];

const STORIES_SEED = [
  { name:'Maya, 19', challenge:'cleanup', text:'BRO. We pulled 14 bags of trash out of the creek behind my school. The ducks literally clapped. 10/10 would quest again.' },
  { name:'Jamal, 22', challenge:'meal', text:'Gave my extra burrito to a guy named Pete outside the train station. He told me about his dog. Made my whole week fr.' },
  { name:'Anonymous Hero', challenge:'note', text:'Left a sticky note that said "you\u2019re killing it" on a stranger\u2019s laptop at the library. She smiled. Mission accomplished.' },
  { name:'Priya, 17', challenge:'tutor', text:'Helped my little cousin pass her math test. She called me a genius. I am now legally a genius. Don\u2019t fact check.' },
  { name:'Ren, 24', challenge:'plant', text:'Planted sunflowers in the empty lot on 4th. Three weeks later: bees, butterflies, one (1) confused raccoon. WIN.' },
  { name:'Sam, 20', challenge:'check', text:'Texted my friend "u good?" She wasn\u2019t. We talked for 2 hours. Sometimes the side quest IS the main quest.' },
];

// ===== Helpers =====
function $(s, root=document){ return root.querySelector(s); }
function $$(s, root=document){ return Array.from(root.querySelectorAll(s)); }
function getChallenge(id){ return CHALLENGES.find(c=>c.id===id); }
function getStories(){
  const stored = JSON.parse(localStorage.getItem('sq_stories')||'[]');
  return [...stored, ...STORIES_SEED];
}

// ===== Active nav =====
document.addEventListener('DOMContentLoaded', ()=>{
  const page = (location.pathname.split('/').pop() || 'index.html');
  $$('.nav a').forEach(a=>{
    if(a.getAttribute('href')===page) a.classList.add('active');
  });

  if($('#challenge-grid')) renderChallenges();
  if($('#story-grid')) { renderStoryFilters(); renderStories(); }
  if($('#submit-form')) setupForm();
  if($('#featured-challenges')) renderFeatured();
});

// ===== Render Challenges =====
function renderChallenges(){
  const grid = $('#challenge-grid');
  grid.innerHTML = CHALLENGES.map(c=>`
    <article class="panel ${c.color}">
      <span class="tag">+${c.xp} XP</span>
      <h3>${c.title}</h3>
      <p>${c.desc}</p>
      <p class="meta">⏱ ${c.time}</p>
      <button class="btn red mt" data-id="${c.id}">Start Mission →</button>
    </article>
  `).join('');
  grid.addEventListener('click', e=>{
    const b = e.target.closest('button[data-id]');
    if(b) openModal(b.dataset.id);
  });
}

function renderFeatured(){
  const grid = $('#featured-challenges');
  grid.innerHTML = CHALLENGES.slice(0,3).map(c=>`
    <article class="panel ${c.color}">
      <span class="tag">+${c.xp} XP</span>
      <h3>${c.title}</h3>
      <p>${c.desc}</p>
      <p class="meta">⏱ ${c.time}</p>
    </article>
  `).join('');

  const sgrid = $('#featured-stories');
  if(sgrid){
    sgrid.innerHTML = STORIES_SEED.slice(0,3).map(s=>{
      const c = getChallenge(s.challenge);
      return `
      <article class="panel">
        <div class="bubble">${s.text}</div>
        <p class="meta">— ${s.name} · ${c?c.title:''}</p>
      </article>`;
    }).join('');
  }
}

// ===== Modal =====
function openModal(id){
  const c = getChallenge(id); if(!c) return;
  const m = $('#modal');
  $('#modal-body').innerHTML = `
    <span class="tag">+${c.xp} XP · ${c.time}</span>
    <h2 style="margin:.6rem 0">${c.title}</h2>
    <p style="margin-bottom:1rem">${c.desc}</p>
    <h3 style="margin-bottom:.4rem">Mission Brief:</h3>
    <ul style="margin:0 0 1.2rem 1.2rem">
      <li>Pick your time + location</li>
      <li>Bring a buddy (optional but legendary)</li>
      <li>Snap a pic of your impact</li>
      <li>Submit your story → unlock badge</li>
    </ul>
    <a class="btn red" href="submit.html">I Accept The Quest</a>
  `;
  m.classList.add('show');
}
function closeModal(){ $('#modal')?.classList.remove('show'); }
document.addEventListener('click', e=>{
  if(e.target.id==='modal' || e.target.classList.contains('modal-close')) closeModal();
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

// ===== Stories =====
let activeFilter = 'all';
function renderStoryFilters(){
  const wrap = $('#story-filters');
  const opts = [{id:'all',title:'All Quests'}, ...CHALLENGES];
  wrap.innerHTML = opts.map(o=>`
    <button class="chip ${o.id===activeFilter?'active':''}" data-f="${o.id}">${o.title}</button>
  `).join('');
  wrap.addEventListener('click', e=>{
    const b = e.target.closest('.chip'); if(!b) return;
    activeFilter = b.dataset.f;
    renderStoryFilters();
    renderStories();
  });
}
function renderStories(){
  const grid = $('#story-grid');
  const list = getStories().filter(s => activeFilter==='all' || s.challenge===activeFilter);
  if(list.length===0){
    grid.innerHTML = `<div class="panel"><h3>No stories yet…</h3><p>Be the first hero to drop one. <a href="submit.html">Share your mission →</a></p></div>`;
    return;
  }
  grid.innerHTML = list.map(s=>{
    const c = getChallenge(s.challenge);
    return `
    <article class="panel">
      ${s.image ? `<img src="${s.image}" alt="" style="width:100%;aspect-ratio:16/10;object-fit:cover;border:3px solid var(--black);margin-bottom:1rem">` : `<div class="imgbox">POW!</div>`}
      <div class="bubble">${escapeHTML(s.text)}</div>
      <span class="tag">${c?c.title:'Side Quest'}</span>
      <p class="meta" style="margin-top:.6rem">— ${escapeHTML(s.name||'Anonymous Hero')}</p>
    </article>`;
  }).join('');
}

function escapeHTML(str=''){
  return str.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// ===== Form =====
function setupForm(){
  const sel = $('#challenge');
  sel.innerHTML = CHALLENGES.map(c=>`<option value="${c.id}">${c.title}</option>`).join('');

  $('#submit-form').addEventListener('submit', e=>{
    e.preventDefault();
    const data = {
      name: $('#name').value.trim() || 'Anonymous Hero',
      challenge: $('#challenge').value,
      text: $('#story').value.trim(),
      image: $('#image').value.trim(),
    };
    if(!data.text){ return; }
    const stored = JSON.parse(localStorage.getItem('sq_stories')||'[]');
    stored.unshift(data);
    localStorage.setItem('sq_stories', JSON.stringify(stored));
    $('#submit-form').reset();
    const t = $('#thanks');
    t.classList.add('show');
    t.scrollIntoView({behavior:'smooth', block:'center'});
  });
}