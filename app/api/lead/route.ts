import {handleLead} from '@/lib/lead';
export async function POST(request:Request){return handleLead(request,{token:process.env.TELEGRAM_BOT_TOKEN,chatId:process.env.TELEGRAM_CHAT_ID,enabled:process.env.LEADS_ENABLED==='true',siteUrl:process.env.SITE_URL})}
