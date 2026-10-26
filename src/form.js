import {fields,validate,normalize} from './model.js';
import {submitRecord} from './api.js';
const form=document.querySelector('#teacher-form'),content=document.querySelector('#form-content'),next=document.querySelector('#next'),back=document.querySelector('#back'),status=document.querySelector('#status');
let step=0,busy=false;const values=Object.fromEntries(fields.map(f=>[f.key,f.default??'']));
const titles=['المدرسة والمرحلة','البيانات الشخصية','البيانات المهنية','مراجعة بياناتك'];
const subs=['ابدأ بتحديد بيانات المدرسة والمرحلة التي تعمل بها.','أدخل بياناتك كما تظهر في الوثائق الرسمية.','حدّث بيانات وظيفتك ونتائج اختبارات الرخصة المهنية.','راجع البيانات التالية قبل إرسالها إلى إدارة المدرسة.'];
function text(tag,value,cls){const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el;}
function snapshot(){for(const el of content.querySelectorAll('input,select'))if(el.name)values[el.name]=el.value;}
function showMessage(message){status.textContent=message;status.hidden=!message;}
function render(){
 content.replaceChildren();showMessage('');document.querySelector('#step-count').textContent=`الخطوة ${step+1} من 4`;document.querySelector('#progress-bar').style.width=`${(step+1)*25}%`;
 document.querySelectorAll('.journey li').forEach((el,i)=>{el.classList.toggle('active',i===step);el.classList.toggle('done',i<step);});
 const h=text('h2',titles[step]);h.tabIndex=-1;content.append(h,text('p',subs[step],'section-sub'));
 if(step<3){const grid=text('div','','field-grid');for(const f of fields.filter(f=>f.section===step)){
 const wrap=text('div','','field');const label=text('label',f.label);label.htmlFor=f.key;if(!f.optional)label.append(text('span',' *','star'));else label.append(text('small',' (اختياري)'));
 const el=document.createElement(f.options?'select':'input');el.name=el.id=f.key;el.required=!f.optional;el.setAttribute('aria-describedby',f.key+'-hint '+f.key+'-error');
 if(f.options){el.append(new Option('اختر من القائمة',''));for(const option of f.options)el.append(new Option(option,option));}else{el.type=f.type??(f.score?'text':'text');el.maxLength=200;el.autocomplete={full_name:'name',email:'email',mobile:'tel',national_id:'off'}[f.key]??'off';if(f.placeholder)el.placeholder=f.placeholder;if(f.inputmode||f.score)el.inputMode=f.inputmode??'decimal';if(f.list){el.setAttribute('list',f.key+'-list');const list=document.createElement('datalist');list.id=f.key+'-list';for(const x of f.list)list.append(new Option(x,x));wrap.append(list);}}
 if(['mobile','email','national_id','ministry_number'].includes(f.key)||f.score)el.dir='ltr';el.value=values[f.key]??'';
 el.addEventListener('input',()=>{el.removeAttribute('aria-invalid');document.getElementById(f.key+'-error').textContent='';});
 wrap.append(label,el);const hint=text('small',f.hint??'','hint');hint.id=f.key+'-hint';const error=text('small','','field-error');error.id=f.key+'-error';wrap.append(hint,error);grid.append(wrap);
 }content.append(grid);
 }else{
 for(let s=0;s<3;s++){const group=text('div','','review-group');const head=text('div','','review-heading');const edit=text('button','تعديل','edit-button');edit.type='button';edit.addEventListener('click',()=>{step=s;render();focusHeading();});head.append(text('h3',titles[s]),edit);group.append(head);const dl=document.createElement('dl');for(const f of fields.filter(f=>f.section===s)){const row=document.createElement('div');row.append(text('dt',f.label),text('dd',String(values[f.key]??'').trim()||'لم يؤدِّ الاختبار'));dl.append(row);}group.append(dl);content.append(group);}
 const consent=text('label','','consent');const cb=document.createElement('input');cb.type='checkbox';cb.id='consent';consent.append(cb,text('span','أقر بصحة البيانات المدخلة، وأوافق على استخدامها لتحديث سجلات المدرسة.'));content.append(consent);
 }
 next.innerHTML=step===3?'إرسال البيانات <span aria-hidden="true">✓</span>':'متابعة <span aria-hidden="true">←</span>';back.hidden=step===0;
}
function focusHeading(){content.querySelector('h2').focus({preventScroll:true});document.querySelector('.form-wrap').scrollIntoView({behavior:'smooth',block:'start'});}
function errorsForStep(){snapshot();const {errors}=validate(values);let first;
 for(const f of fields.filter(f=>f.section===step)){const el=document.getElementById(f.key);document.getElementById(f.key+'-error').textContent=errors[f.key]??'';if(errors[f.key]){el.setAttribute('aria-invalid','true');first??=el;}}
 if(first){first.focus();return false;}return true;}
next.addEventListener('click',async()=>{
 if(busy)return;
 if(step<3){if(!errorsForStep())return;step++;render();focusHeading();return;}
 if(!document.querySelector('#consent').checked){showMessage('يرجى تأكيد صحة البيانات قبل الإرسال.');document.querySelector('#consent').focus();return;}
 if(form.elements.website.value)return;
 const {data,errors}=validate(values);if(Object.keys(errors).length){step=fields.find(f=>errors[f.key]).section;render();errorsForStep();return;}
 busy=true;next.disabled=true;back.disabled=true;next.textContent='جارٍ حفظ البيانات…';showMessage('');
 try{await submitRecord(data);form.hidden=true;document.querySelector('#success').hidden=false;document.querySelector('#sent-at').textContent=new Intl.DateTimeFormat('ar-SA',{dateStyle:'long',timeStyle:'short',timeZone:'Asia/Riyadh'}).format(new Date());document.querySelector('#success').focus();document.querySelectorAll('.journey li').forEach(x=>x.classList.add('done'));for(const key of Object.keys(values))values[key]='';document.querySelector('#progress-bar').style.width='100%';}
 catch(e){showMessage(e.message);next.innerHTML='إعادة محاولة الإرسال';}finally{busy=false;next.disabled=false;back.disabled=false;}
});
back.addEventListener('click',()=>{if(busy)return;snapshot();step--;render();focusHeading();});form.addEventListener('submit',e=>{e.preventDefault();next.click();});render();
