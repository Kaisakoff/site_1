import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
const font = localFont({src:[{path:'./fonts/OpenSans-Regular.ttf',weight:'400'},{path:'./fonts/OpenSans-Bold.ttf',weight:'700'}],variable:'--font-body',display:'swap'});
export const metadata: Metadata = {...(process.env.SITE_URL ? {metadataBase:new URL(process.env.SITE_URL),alternates:{canonical:'/'}} : {}),title:'Экскурсионные туры по Беларуси из Минска | БасТур',description:'Откройте Беларусь вместе с БасТур. Экскурсионные поездки с отправлением из Минска. Выберите путешествие в официальном каталоге агентства.',openGraph:{title:'Беларусь ближе, чем кажется — БасТур',description:'Экскурсионные туры по Беларуси из Минска',locale:'ru_BY',type:'website'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ru" className={font.variable}><body>{children}</body></html>}
