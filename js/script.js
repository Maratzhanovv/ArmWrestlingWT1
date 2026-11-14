'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const storage = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem('kazaly.' + key)) ?? fallback; } catch { return fallback; } },
    set(key, value) { localStorage.setItem('kazaly.' + key, JSON.stringify(value)); }
};
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastTimer;
function toast(message) {
    $('#toast').textContent = message;
    $('#toast').style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('#toast').style.display = 'none'; }, 4000);
}
function status(form, message, error = false) {
    const target = form.querySelector('.form-status');
    target.textContent = message;
    target.classList.toggle('error', error);
}
function users() { const list = storage.get('users', []); return Array.isArray(list) ? list : []; }
function currentUser() { return users().find(user => user.email === storage.get('session', null)); }
function themeLabel() {
    const label = `Switch to ${document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'} mode`;
    $('#themeToggle').setAttribute('aria-label', label);
    $('#themeToggle').title = label;
}
themeLabel();
$('#themeToggle').addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('kazaly.theme', theme); } catch { toast('Theme changed for this page. Browser storage is unavailable.'); }
    themeLabel();
});
$('.menu-toggle').addEventListener('click', () => {
    const open = $('#navigation').classList.toggle('open');
    $('.menu-toggle').setAttribute('aria-expanded', String(open));
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && $('#navigation').classList.contains('open')) {
        $('#navigation').classList.remove('open');
        $('.menu-toggle').setAttribute('aria-expanded', 'false');
        $('.menu-toggle').focus();
    }
});
if (currentUser()) { $('.account-link').href = 'profile.html'; $('.account-link').textContent = 'My profile'; }

// Forms use novalidate: every error is checked in JavaScript and shown beside its field.
const validators = {
    name: value => value.trim().length >= 2 ? '' : 'Please enter your name (at least 2 characters).',
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Enter an email such as name@example.com.',
    phone: value => /^\+?[\d\s()-]+$/.test(value.trim()) && /^\d{10,15}$/.test(value.replace(/\D/g, '')) ? '' : 'Enter 10–15 digits, for example +7 700 123 45 67.',
    password: value => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/.test(value) ? '' : 'Use 8+ characters with uppercase, lowercase, a number and a symbol; no spaces.',
    message: value => value.trim().length >= 5 ? '' : 'Please write a message of at least 5 characters.'
};
function validate(form, rules) {
    let firstInvalid;
    for (const [name, validator] of Object.entries(rules)) {
        const input = form.elements[name];
        const error = validator(input.value);
        form.querySelector('#' + name + '-error').textContent = error;
        input.setAttribute('aria-invalid', String(Boolean(error)));
        if (error && !firstInvalid) firstInvalid = input;
    }
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
}
function handleForm(id, rules, onSuccess) {
    const form = $(id);
    if (!form) return;
    form.addEventListener('submit', async event => {
        event.preventDefault();
        status(form, '');
        if (!validate(form, rules)) return;
        const button = form.querySelector('[type=submit]');
        button.disabled = true;
        try { await onSuccess(form); }
        catch { status(form, 'Could not save. Allow browser storage and try again.', true); }
        finally { button.disabled = false; }
    });
}
// Passwords are salted and hashed. Authentication remains a local classroom simulation.
async function passwordHash(password, salt) {
    if (!crypto.subtle) throw new Error('Open through localhost or HTTPS.');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256);
    return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2,'0')).join('');
}
handleForm('#signupForm', {
    name:validators.name,email:validators.email,phone:validators.phone,password:validators.password,
    confirmPassword:value => value === $('#password').value ? '' : 'The passwords do not match.'
}, async form => {
    const email = form.elements.email.value.trim().toLowerCase();
    const allUsers = users();
    if (allUsers.some(user => user.email === email)) { status(form, 'This email already has an account. Please log in.', true); return; }
    if (!crypto.subtle) { status(form, 'Open this website through localhost or HTTPS to create an account.', true); return; }
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2,'0')).join('');
    const user = {name:form.elements.name.value.trim(),email,phone:form.elements.phone.value.trim(),experience:form.elements.experience.value,salt,passwordHash:await passwordHash(form.elements.password.value,salt),joined:new Date().toISOString(),saved:[]};
    storage.set('users',[...allUsers,user]); storage.set('session',email);
    location.href = 'profile.html';
});
handleForm('#loginForm', {email:validators.email,password:validators.password}, async form => {
    const email = form.elements.email.value.trim().toLowerCase();
    const user = users().find(user => user.email === email);
    if (!user || await passwordHash(form.elements.password.value,user.salt) !== user.passwordHash) { status(form,'Email or password is incorrect. Check your details and try again.',true); return; }
    storage.set('session',email); location.href='profile.html';
});
handleForm('#contactForm', {name:validators.name,email:validators.email,phone:validators.phone,message:validators.message}, form => {
    const messages=storage.get('messages',[]);
    storage.set('messages',[...(Array.isArray(messages)?messages:[]),{...Object.fromEntries(new FormData(form)),created:new Date().toISOString()}]);
    form.reset(); status(form,'Your demo message was saved on this device. Nothing was sent to the club.');
});
handleForm('#newsletterForm', {newsletterEmail:validators.email}, form => {
    const emails=storage.get('subscriptions',[]);
    storage.set('subscriptions',[...new Set([...(Array.isArray(emails)?emails:[]),form.elements.newsletterEmail.value.trim().toLowerCase()])]);
    form.reset(); status(form,'Subscription saved on this device. No emails will be sent.');
});
const trainings = [
    {id:'strength',day:'Monday',focus:'Strength',title:'Build your foundation',image:'gallery2.jpeg',description:'A session focused on strength, grip and steady progress. Train alongside other club members.'},
    {id:'technique',day:'Wednesday',focus:'Technique',title:'Make every move count',image:'gallery4.jpeg',description:'Develop table awareness and refine your technique through shared practice and feedback.'},
    {id:'practice',day:'Friday',focus:'Practice',title:'Put it into practice',image:'aa.jpg',description:'Bring the week together with friendly practice matches and a supportive training partner.'}
];
function toggleSession(id) {
    const user=currentUser();
    if (!user) { location.href='login.html'; return; }
    const saved=Array.isArray(user.saved)?user.saved:[];
    user.saved=saved.includes(id)?saved.filter(value=>value!==id):[...saved,id];
    try {
        storage.set('users',users().map(item=>item.email===user.email?user:item));
        renderTrainings(); renderProfile();
        toast(user.saved.includes(id)?'Session saved to your profile.':'Session removed from your profile.');
    } catch { toast('Could not save the session. Check browser storage.'); }
}
function renderTrainings() {
    if (!$('#trainingCards')) return;
    const query=$('#trainingSearch').value.trim().toLowerCase();
    const focus=$('#trainingFilter').value;
    const filtered=trainings.filter(item=>(focus==='all'||item.focus===focus)&&`${item.day} ${item.title} ${item.focus} ${item.description}`.toLowerCase().includes(query));
    $('#trainingCount').textContent=`${filtered.length} of ${trainings.length} sessions${filtered.length?'':' · Try another search or reset the filters.'}`;
    $('#trainingCards').innerHTML=filtered.map(item=>`<article class="training-card"><img src="images/${item.image}" alt="Arm wrestling ${item.focus.toLowerCase()}" loading="lazy"><div class="card-body"><p class="eyebrow">${item.day} · 18:00 / ${item.focus}</p><h3>${item.title}</h3><p>${item.description}</p><button class="secondary" data-save="${item.id}" aria-pressed="${Boolean(currentUser()?.saved?.includes(item.id))}">${currentUser()?.saved?.includes(item.id)?'Saved ✓ · Remove':'Save session +'}</button></div></article>`).join('');
}
if ($('#trainingCards')) {
    const filters=storage.get('filters',{});
    $('#trainingSearch').value=typeof filters.query==='string'?filters.query:'';
    $('#trainingFilter').value=['all','Strength','Technique','Practice'].includes(filters.focus)?filters.focus:'all';
    const update=()=>{ renderTrainings(); try { storage.set('filters',{query:$('#trainingSearch').value,focus:$('#trainingFilter').value}); } catch { /* Filtering still works without persistence. */ } };
    $('#trainingSearch').addEventListener('input',update);
    $('#trainingFilter').addEventListener('change',update);
    $('#resetFilters').addEventListener('click',()=>{ $('#trainingSearch').value=''; $('#trainingFilter').value='all'; update(); });
    renderTrainings();
}
document.addEventListener('click',event=>{ const save=event.target.closest('[data-save]'); if(save) toggleSession(save.dataset.save); });
function renderProfile() {
    if (!$('#profileContent')) return;
    const user=currentUser(); if(!user) return;
    const saved=trainings.filter(item=>user.saved?.includes(item.id));
    $('#profileContent').innerHTML=`<div class="profile-grid"><div class="form-card"><p class="eyebrow">MEMBER PROFILE</p><h2>${escapeHtml(user.name)}</h2><dl><dt>Email</dt><dd>${escapeHtml(user.email)}</dd><dt>Phone</dt><dd>${escapeHtml(user.phone)}</dd><dt>Experience</dt><dd>${escapeHtml(user.experience)}</dd><dt>Joined</dt><dd>${escapeHtml(new Date(user.joined).toLocaleDateString('en-GB'))}</dd></dl><button id="logout" class="secondary">Log out →</button></div><div class="form-card"><p class="eyebrow">YOUR WEEK, YOUR WAY</p><h2>Saved sessions <em>${saved.length.toString().padStart(2,'0')}</em></h2><p>These are your personal bookmarks, not confirmed reservations.</p>${saved.length?saved.map(item=>`<div class="saved-session"><div><h3>${item.focus} training</h3><p>${item.day} · 18:00</p></div><button class="secondary" data-save="${item.id}" aria-label="Remove ${item.focus} session">Remove ×</button></div>`).join(''):'<p>No saved sessions yet. Explore the program and save a session to get started.</p>'}<p style="margin-top:25px"><a href="training.html">Explore training →</a></p></div></div>`;
    $('#logout').addEventListener('click',()=>{try{localStorage.removeItem('kazaly.session');location.href='login.html';}catch{toast('Could not log out. Check your browser storage settings.');}});
}
renderProfile();
$('#faqSearch')?.addEventListener('input',()=>{
    const query=$('#faqSearch').value.trim().toLowerCase(); let count=0;
    $$('#faqList details').forEach(item=>{item.hidden=!item.textContent.toLowerCase().includes(query);if(!item.hidden)count++;});
    $('#faqCount').textContent=query?`${count} matching question${count===1?'':'s'}`:'';
});
if ($('#photoDialog')) {
    $$('.gallery-item').forEach(button=>button.addEventListener('click',()=>{
        $('#dialogImage').src=button.dataset.image;$('#dialogImage').alt=button.dataset.caption;$('#dialogCaption').textContent=button.dataset.caption;$('#photoDialog').showModal();
    }));
    $('.close-dialog').addEventListener('click',()=>$('#photoDialog').close());
    $('#photoDialog').addEventListener('click',event=>{if(event.target===$('#photoDialog')){const box=event.target.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)event.target.close();}});
}
$('#copySchedule')?.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText('Kazaly Arm Club: Monday — Strength, Wednesday — Technique, Friday — Practice. All sessions start at 18:00 (Kazakhstan time).');toast('Schedule copied.');}
    catch{toast('Copy unavailable. Select the schedule text and copy it manually.');}
});
async function loadWeather() {
    const target=$('#weather');if(!target)return;
    target.textContent='Loading current weather…';target.setAttribute('aria-busy','true');$('#retryWeather').disabled=true;
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
    try{
        const response=await fetch('https://api.open-meteo.com/v1/forecast?latitude=45.7628&longitude=62.1075&current=temperature_2m,weather_code,wind_speed_10m&timezone=Asia%2FAlmaty',{signal:controller.signal});
        if(!response.ok)throw new Error('Weather request failed');
        const data=await response.json();const current=data.current;
        if(!current||!Number.isFinite(current.temperature_2m)||!Number.isFinite(current.wind_speed_10m)||!Number.isFinite(current.weather_code)||typeof current.time!=='string')throw new Error('Incomplete weather');
        const code=current.weather_code;
        const condition=code===0?'Clear sky':code<=3?'Partly cloudy / cloudy':code<=48?'Foggy':code<=67?'Rain / drizzle':code<=77?'Snow':code<=82?'Rain showers':code<=86?'Snow showers':'Thunderstorms';
        target.innerHTML=`<div class="weather-temp">${Math.round(current.temperature_2m)}°C</div><p>${condition} · Wind ${current.wind_speed_10m} km/h</p><small>Weather model update: ${escapeHtml(current.time.replace('T',' '))} (Kazakhstan time)</small>`;
    }catch{target.textContent='Weather is unavailable right now. Check your connection and try again.';}
    finally{clearTimeout(timeout);$('#retryWeather').disabled=false;target.setAttribute('aria-busy','false');}
}
$('#retryWeather')?.addEventListener('click',loadWeather);
loadWeather();
