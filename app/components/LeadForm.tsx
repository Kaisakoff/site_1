'use client';
import {useState,type FormEvent} from 'react';
import Link from 'next/link';
export default function LeadForm(){
 const [pending,setPending]=useState(false),[status,setStatus]=useState(''),[sent,setSent]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(pending||sent)return;
  const form=event.currentTarget,data=new FormData(form);setPending(true);setStatus('');
  const utm=Object.fromEntries([...new URLSearchParams(location.search)].filter(([key])=>['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].includes(key)));
  try{
   const response=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:data.get('name'),phone:data.get('phone'),tour:data.get('tour'),message:data.get('message'),website:data.get('website'),consent:data.get('consent')==='on',page:location.pathname,utm}),signal:AbortSignal.timeout(15000)});
   const result=await response.json();
   if(response.ok&&result.ok===true){setSent(true);setStatus('Заявка доставлена в «БасТур». Спасибо за обращение!');form.reset()}
   else setStatus(result.error||'Не удалось отправить заявку. Позвоните: +375 (29) 621-44-77');
  }catch{setStatus('Не удалось подтвердить доставку. Позвоните: +375 (29) 621-44-77')}
  finally{setPending(false)}
 }
 return <section className="lead-section wrap section" id="request"><div><p className="eyebrow">Ваша поездка начинается здесь</p><h2>Поможем выбрать<br/>путешествие</h2><p className="lead-intro">Оставьте имя и телефон — передадим ваше обращение менеджеру «БасТур».</p><a className="text-link" href="tel:+375296214477">Или позвоните: +375 (29) 621-44-77</a></div><form className="lead-form" onSubmit={submit} aria-label="Заявка на подбор тура"><fieldset disabled={pending||sent}><div className="form-row"><label>Ваше имя<input name="name" autoComplete="name" required maxLength={80}/></label><label>Телефон<input type="tel" name="phone" autoComplete="tel" required maxLength={40} pattern={String.raw`[+]?[0-9\s\(\)\-]{7,40}`} placeholder="+375 (29) 123-45-67"/><small>С кодом страны, например +375</small></label></div><label>Какой тур вас интересует?<select name="tour" defaultValue=""><option value="">Нужна помощь с выбором</option><option>Мир и Несвиж</option><option>Экскурсия на болото Ельня</option><option>Гродно + Августовский канал</option><option>Другой маршрут</option></select></label><label>Пожелания <span className="optional">(необязательно)</span><textarea name="message" maxLength={1500} rows={3} placeholder="Желаемая дата, количество участников…"/></label><div className="form-trap" aria-hidden="true"><label>Ваш сайт<input name="website" tabIndex={-1} autoComplete="off"/></label></div><label className="consent"><input type="checkbox" name="consent" required/><span>Согласен на обработку имени, телефона и сообщения для ответа на заявку, включая передачу через Telegram, согласно <Link href="/privacy">политике обработки данных</Link></span></label><button className="button" type="submit">{pending?'Отправляем…':sent?'Заявка доставлена':'Отправить заявку'}</button></fieldset><p role="status" aria-live="polite" className={sent?'form-status success':'form-status'}>{status}</p><noscript>Для отправки формы включите JavaScript или позвоните: +375 (29) 621-44-77</noscript></form></section>
}
