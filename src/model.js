export const stages = ['رياض أطفال','ابتدائي','متوسط','ثانوي'];
export const ranks = ['مساعد معلم','معلم ممارس','معلم متقدم','معلم خبير','لا يوجد'];
export const departments = ['الرياض','القصيم','المنطقة الشرقية','الأحساء','تبوك','الحدود الشمالية','حائل','المدينة المنورة','جدة','مكة المكرمة','الطائف','عسير','جازان','نجران','الجوف','الباحة'];
export const fields = [
 {key:'education_department',label:'إدارة التعليم',options:departments,default:'الحدود الشمالية',section:0},
 {key:'school_name',label:'اسم المدرسة',default:'مدارس نخبة الشمال الأهلية',section:0},
 {key:'ministry_number',label:'الرقم الوزاري',section:0,inputmode:'numeric',hint:'الرقم الوزاري للمدرسة حسب المرحلة الدراسية.'},
 {key:'stage',label:'المرحلة الدراسية',options:stages,section:0},
 {key:'full_name',label:'اسم شاغل الوظيفة التعليمية',section:1,hint:'الاسم كاملًا كما في الهوية أو الإقامة.'},
 {key:'gender',label:'الجنس',options:['ذكر','أنثى'],section:1},
 {key:'nationality',label:'الجنسية',section:1,list:['سعودي','مصري','أردني','سوري','سوداني','فلسطيني','يمني','تونسي']},
 {key:'qualification',label:'المؤهل',section:1,list:['بكالوريوس','ماجستير','دكتوراه','دبلوم','ثانوية عامة']},
 {key:'specialization',label:'التخصص',section:1},
 {key:'mobile',label:'الجوال',section:1,type:'tel',inputmode:'tel',placeholder:'05xxxxxxxx'},
 {key:'email',label:'البريد الالكتروني',section:1,type:'email',placeholder:'name@example.com'},
 {key:'job_title',label:'المسمى الوظيفي',section:2,list:['معلم','مدير مدرسة','وكيل مدرسة','موجه طلابي','رائد نشاط','محضر مختبر','أمين مصادر تعلم']},
 {key:'national_id',label:'السجل المدني/ رقم الإقامة',section:1,inputmode:'numeric',hint:'10 أرقام، دون مسافات.'},
 {key:'teacher_rank',label:'رتبة المعلم',options:ranks,section:2},
 {key:'general_score',label:'درجة اختبار الرخصة المهنية التربوي العام',section:2,score:true,optional:true,hint:'من 0 إلى 100. اتركها فارغة إذا لم تختبر.'},
 {key:'specialist_score',label:'درجة اختبار الرخصة المهنية التخصصي',section:2,score:true,optional:true,hint:'من 0 إلى 100. اتركها فارغة إذا لم تختبر.'},
];
export const digits = value => String(value ?? '').replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776));
export function normalize(raw){
 const out={};
 for(const f of fields){let v=String(raw[f.key]??'').trim();if(['mobile','national_id','ministry_number','general_score','specialist_score'].includes(f.key))v=digits(v);if(['mobile','national_id'].includes(f.key))v=v.replace(/[\s()-]/g,'');out[f.key]=f.score?(v===''?null:Number(v)):v;}
 return out;
}
export function validate(raw){
 const v=normalize(raw), errors={};
 for(const f of fields){const x=v[f.key];if(!f.optional&&(x===''||x==null))errors[f.key]='هذا الحقل مطلوب.';else if(f.options&&x&&!f.options.includes(x))errors[f.key]='اختر قيمة من القائمة.';else if(f.score&&x!==null&&(!Number.isFinite(x)||x<0||x>100))errors[f.key]='أدخل درجة من 0 إلى 100.';else if(typeof x==='string'&&x.length>200)errors[f.key]='الحد الأقصى 200 حرف.';}
 if(v.national_id&&!/^\d{10}$/.test(v.national_id))errors.national_id='أدخل رقم هوية أو إقامة من 10 أرقام.';
 if(v.ministry_number&&!/^\d{1,20}$/.test(v.ministry_number))errors.ministry_number='أدخل الرقم الوزاري بالأرقام فقط.';
 if(v.mobile&&!/^(05\d{8}|(?:\+|00)[1-9]\d{7,14})$/.test(v.mobile))errors.mobile='أدخل جوالًا سعوديًا يبدأ بـ05 أو رقمًا دوليًا يبدأ بـ+ أو 00.';
 if(v.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))errors.email='أدخل بريدًا إلكترونيًا صحيحًا.';
 if(v.full_name&&v.full_name.length<5)errors.full_name='أدخل الاسم كاملًا.';
 return {data:v,errors};
}
