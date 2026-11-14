const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const path = require('node:path');
const elements = new Map();
const memory = new Map();
function element() {
    return {textContent:'',innerHTML:'',value:'',style:{},dataset:{},attributes:{},listeners:{},classList:{toggle(){},contains(){return false},remove(){}},
        setAttribute(k,v){this.attributes[k]=v},addEventListener(k,v){this.listeners[k]=v},focus(){this.focused=true}};
}
['#toast','#themeToggle','.menu-toggle','#navigation','.account-link'].forEach(key=>elements.set(key,element()));
const context = vm.createContext({
    document:{querySelector:s=>elements.get(s)||null,querySelectorAll:()=>[],addEventListener(){},documentElement:{dataset:{theme:'dark'}}},
    localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},
    location:{href:''},crypto:webcrypto,TextEncoder,Uint8Array,Date,FormData,AbortController,
    setTimeout:()=>1,clearTimeout(){},navigator:{},console
});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/script.js'),'utf8'),context);
const run=source=>vm.runInContext(source,context);
function form(names, values={}) {
    const fields=Object.fromEntries(names.map(name=>[name,Object.assign(element(),{value:values[name]||''})]));
    const errors=Object.fromEntries(names.map(name=>['#'+name+'-error',element()]));
    const status=element(),button=element();
    return {...element(),elements:fields,querySelector:s=>s==='.form-status'?status:s==='[type=submit]'?button:errors[s],reset(){},status};
}
async function submit(f){ await f.listeners.submit({preventDefault(){}}); }
(async()=>{
    for(const [rule,valid,invalid] of [
        ['name','Test Member',''],['email','test@example.com','bad@'],
        ['phone','+7 700 123 45 67','123'],['phone','+7 (700) 123-45-67','abcdefghijk'],
        ['password','DemoPass1!','password'],['password','DemoPass1!','Abc1!'],
        ['message','Hello club','']
    ]){
        assert.equal(run(`validators.${rule}(${JSON.stringify(valid)})`),'');
        assert.notEqual(run(`validators.${rule}(${JSON.stringify(invalid)})`),'');
    }
    assert.equal(run(`escapeHtml('<img onerror="x">')`),'&lt;img onerror=&quot;x&quot;&gt;');
    memory.set('kazaly.broken','not-json');assert.equal(run(`storage.get('broken',42)`),42);
    // Register handlers against controlled form elements and exercise complete auth flows.
    const signup=form(['name','email','phone','password','confirmPassword','experience'],{name:'Demo Member',email:'DEMO@example.com',phone:'+7 700 123 45 67',password:'DemoPass1!',confirmPassword:'DemoPass1!',experience:'Beginner'});
    const login=form(['email','password'],{email:'demo@example.com',password:'WrongPass1!'});
    elements.set('#signupForm',signup);elements.set('#password',signup.elements.password);elements.set('#loginForm',login);
    // Fresh context avoids redeclaring top-level const bindings.
    const context2=vm.createContext({...context});
    vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/script.js'),'utf8'),context2);
    await submit(signup);
    let saved=JSON.parse(memory.get('kazaly.users'));
    assert.equal(saved.length,1);assert.equal(saved[0].email,'demo@example.com');assert.equal(saved[0].password,undefined);
    assert.equal(saved[0].passwordHash.length,64);assert.equal(context2.location.href,'profile.html');
    await submit(signup);assert.equal(JSON.parse(memory.get('kazaly.users')).length,1);assert.match(signup.status.textContent,/already/);
    memory.delete('kazaly.session');context2.location.href='';await submit(login);
    assert.match(login.status.textContent,/incorrect/);assert.equal(memory.has('kazaly.session'),false);
    login.elements.password.value='DemoPass1!';await submit(login);assert.equal(context2.location.href,'profile.html');
    vm.runInContext(`toggleSession('strength')`,context2);saved=JSON.parse(memory.get('kazaly.users'));assert.deepEqual(saved[0].saved,['strength']);
    vm.runInContext(`toggleSession('strength')`,context2);assert.deepEqual(JSON.parse(memory.get('kazaly.users'))[0].saved,[]);
    const search=element(),filter=element(),cards=element(),count=element();filter.value='all';
    elements.set('#trainingSearch',search);elements.set('#trainingFilter',filter);elements.set('#trainingCards',cards);elements.set('#trainingCount',count);
    search.value='Wednesday';vm.runInContext('renderTrainings()',context2);assert.match(count.textContent,/1 of 3/);assert.match(cards.innerHTML,/Technique/);
    search.value='no match';vm.runInContext('renderTrainings()',context2);assert.match(count.textContent,/0 of 3/);
    search.value='';filter.value='Practice';vm.runInContext('renderTrainings()',context2);assert.match(count.textContent,/1 of 3/);
    await elements.get('#themeToggle').listeners.click();assert.equal(memory.get('kazaly.theme'),'light');
    const weather=element(),retry=element();elements.set('#weather',weather);elements.set('#retryWeather',retry);
    context2.fetch=async()=>({ok:true,json:async()=>({current:{temperature_2m:12.4,weather_code:0,wind_speed_10m:7,time:'2026-11-14T18:00'}})});
    await vm.runInContext('loadWeather()',context2);assert.match(weather.innerHTML,/12°C/);assert.equal(retry.disabled,false);
    context2.fetch=async()=>{throw new Error('offline')};await vm.runInContext('loadWeather()',context2);assert.match(weather.textContent,/unavailable/);assert.equal(weather.attributes['aria-busy'],'false');
    context2.fetch=async()=>({ok:true,json:async()=>({current:{}})});await vm.runInContext('loadWeather()',context2);assert.match(weather.textContent,/unavailable/);
    console.log('PASS: validation, escaped profile content, malformed storage, signup, duplicate email, wrong/correct login, saved sessions, filtering, theme persistence, weather success/error/invalid response.');
})().catch(error=>{console.error(error);process.exitCode=1;});
