import {SUPABASE_URL,SUPABASE_KEY} from './config.js';
export class ApiError extends Error {constructor(message,status,code){super(message);this.status=status;this.code=code;}}
export async function request(path,{method='GET',body,token,prefer,headers={}}={}){
 let r;try{r=await fetch(SUPABASE_URL+path,{method,headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+(token||SUPABASE_KEY),'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{}),...headers},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});}catch{throw new ApiError('تعذر الاتصال. تحقق من الإنترنت ثم حاول مرة أخرى.',0);}
 const data=await r.json().catch(()=>null);
 if(!r.ok){let message='تعذر إتمام العملية. حاول مرة أخرى.';if(data?.code==='23505')message='سبق تسجيل بيانات بهذه الهوية. للتعديل تواصل مع إدارة المدرسة.';if(['PGRST205','42P01'].includes(data?.code))message='النموذج لم يُفعّل لاستقبال البيانات بعد. يرجى مراجعة إدارة المدرسة.';if(r.status===401||r.status===403)message='بيانات الدخول غير صحيحة أو ليس لديك صلاحية.';if(r.status===429)message='محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة.';if(data?.code==='23514')message='تأكد من صحة البيانات المطلوبة قبل الإرسال.';throw new ApiError(message,r.status,data?.code);}
 return {data,headers:r.headers};
}
export const submitRecord=data=>request('/rest/v1/teacher_submissions',{method:'POST',body:data,prefer:'return=minimal'});
export async function signIn(email,password){return (await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}})).data;}
export async function refresh(refresh_token){return (await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token}})).data;}
export async function checkAdmin(token){const {data}=await request('/rest/v1/teacher_form_admins?select=user_id&limit=1',{token});return data?.length>0;}
export async function readAll(token){const result=[];for(let offset=0;;offset+=500){const {data}=await request('/rest/v1/teacher_submissions?select=*&order=created_at.desc,id.desc&offset='+offset+'&limit=500',{token});result.push(...data);if(data.length<500)break;}return result;}
