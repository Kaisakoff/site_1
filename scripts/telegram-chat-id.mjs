import {existsSync} from 'node:fs';
if(existsSync('.env.local'))process.loadEnvFile('.env.local');
const token=process.env.TELEGRAM_BOT_TOKEN;
if(!token){console.error('Добавьте TELEGRAM_BOT_TOKEN в защищённые настройки или .env.local. Не отправляйте токен в чат.');process.exit(1)}
try{
 const response=await fetch(`https://api.telegram.org/bot${token}/getUpdates`,{signal:AbortSignal.timeout(10000)});
 const body=await response.json();
 if(!response.ok||body.ok!==true){console.error('Telegram не вернул список чатов. Проверьте токен и доступ к API.');process.exit(1)}
 const chats=new Map();for(const item of body.result||[]){const chat=item.message?.chat||item.channel_post?.chat||item.my_chat_member?.chat;if(chat)chats.set(String(chat.id),{id:chat.id,type:chat.type})}
 if(!chats.size){console.log('Откройте бота, нажмите «Старт» и отправьте ему сообщение, затем повторите команду.');process.exit(1)}
 console.log('Доступные TELEGRAM_CHAT_ID (проверьте нужный чат перед включением):');for(const chat of chats.values())console.log(`${chat.id} (${chat.type})`);
}catch{console.error('Не удалось обратиться к Telegram. Проверьте сетевой доступ и повторите.');process.exit(1)}
