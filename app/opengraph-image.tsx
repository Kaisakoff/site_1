import {ImageResponse} from 'next/og';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
export const alt='БасТур — экскурсионные туры по Беларуси из Минска';
export const size={width:1200,height:630};
export const contentType='image/png';
export default async function Image(){const font=await readFile(path.join(process.cwd(),'app/fonts/OpenSans-Bold.ttf'));return new ImageResponse(<div style={{display:'flex',flexDirection:'column',justifyContent:'space-between',width:'100%',height:'100%',background:'#153f32',color:'#fff',padding:'65px',fontFamily:'Open Sans'}}><div style={{fontSize:38,color:'#f4d25b'}}>БасТур</div><div style={{display:'flex',flexDirection:'column',fontSize:72,lineHeight:1.2}}><span>Экскурсионные туры</span><span>по Беларуси</span></div><div style={{fontSize:30}}>Отправление из Минска</div></div>,{...size,fonts:[{name:'Open Sans',data:font,weight:700,style:'normal'}]});}
