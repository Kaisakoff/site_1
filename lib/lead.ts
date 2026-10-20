type Lead = {name:string;phone:string;tour:string;message:string;consent:true;page:string;utm:Record<string,string>};
type Settings = {token?:string;chatId?:string;enabled:boolean;siteUrl?:string;send?:typeof fetch};
const attempts=new Map<string,{count:number;expires:number}>();
function reply(status:number,error?:string){return Response.json(error?{ok:false,error}:{ok:true},{status,headers:{'Cache-Control':'no-store'}})}
export function validateLead(value:unknown):Lead|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const v=value as Record<string,unknown>;
 const text=(key:string,max:number)=>typeof v[key]==='string'&&(v[key] as string).trim().length<=max?(v[key] as string).trim():null;
 const name=text('name',80),phone=text('phone',40),tour=text('tour',150),message=text('message',1500),page=text('page',250);
 if(!name||!phone||tour===null||message===null||page===null||v.consent!==true||v.website||/[\r\n]/.test(name+phone+tour))return null;
 const digits=phone.replace(/\D/g,'');
 if(!/^\+?[\d\s()\-]+$/.test(phone)||digits.length<7||digits.length>15)return null;
 if(!page.startsWith('/')||page.startsWith('//')||/[\r\n?#]/.test(page))return null;
 const utm:Record<string,string>={};
 if(v.utm&&typeof v.utm==='object')for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']){
  const item=(v.utm as Record<string,unknown>)[key];if(typeof item==='string')utm[key]=item.replace(/[\r\n]/g,' ').slice(0,150);
 }
 return {name,phone,tour,message,consent:true,page,utm};
}
export async function handleLead(request:Request,settings:Settings):Promise<Response>{
 const origin=request.headers.get('origin');
 const allowed=new Set([new URL(request.url).origin]);
 if(settings.siteUrl){try{allowed.add(new URL(settings.siteUrl).origin)}catch{return reply(503,'Форма временно недоступна. Позвоните нам: +375 (29) 621-44-77')}}
 let matchingHost=false;try{matchingHost=!!origin&&new URL(origin).host===request.headers.get('host')}catch{}
 if(!origin||(!allowed.has(origin)&&!matchingHost))return reply(403,'Обновите страницу сайта и повторите отправку');
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply(415,'Не удалось отправить форму. Обновите страницу');
 let value:unknown;
 try{
  const reader=request.body?.getReader();if(!reader)return reply(400,'Заполните форму');
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>8192){await reader.cancel();return reply(413,'Сообщение слишком длинное')}chunks.push(part.value)}
  const buffer=new Uint8Array(size);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.length}
  value=JSON.parse(new TextDecoder().decode(buffer));
 }catch{return reply(400,'Не удалось прочитать форму. Проверьте данные')}
 const lead=validateLead(value);if(!lead)return reply(400,'Проверьте имя, телефон и согласие на обработку данных');
 if(!settings.enabled||!settings.token||!settings.chatId)return reply(503,'Заявки через форму пока недоступны. Позвоните нам: +375 (29) 621-44-77');
 const now=Date.now();for(const [key,value] of attempts)if(value.expires<=now)attempts.delete(key);
 const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
 const current=attempts.get(ip);if(current&&current.count>=5)return reply(429,'Слишком много попыток. Попробуйте через 10 минут или позвоните нам');
 if(!current&&attempts.size>=10000)return reply(503,'Попробуйте позже или позвоните нам');
 attempts.set(ip,{count:(current?.count||0)+1,expires:current?.expires||now+600000});
 const text=['Новая заявка с сайта БасТур',`Имя: ${lead.name}`,`Телефон: ${lead.phone}`,`Тур: ${lead.tour||'Нужна помощь с выбором'}`,`Комментарий: ${lead.message||'—'}`,`Страница: ${lead.page}`,Object.entries(lead.utm).map(([k,v])=>`${k}: ${v}`).join('\n'),'Согласие на обработку данных: получено',`Время: ${new Date().toLocaleString('ru-RU',{timeZone:'Europe/Minsk'})}`].filter(Boolean).join('\n');
 try{
  const result=await (settings.send||fetch)(`https://api.telegram.org/bot${settings.token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:settings.chatId,text}),signal:AbortSignal.timeout(10000),cache:'no-store'});
  if(!result.ok)return reply(502,'Не удалось доставить заявку. Попробуйте позже или позвоните: +375 (29) 621-44-77');
  const data=await result.json();if(data.ok!==true||!Number.isInteger(data.result?.message_id))return reply(502,'Не удалось подтвердить доставку. Позвоните: +375 (29) 621-44-77');
  return reply(200);
 }catch{return reply(502,'Не удалось подтвердить доставку. Позвоните: +375 (29) 621-44-77')}
}
