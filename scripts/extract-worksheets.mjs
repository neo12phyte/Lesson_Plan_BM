import {readFile,mkdir,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const html=await readFile(new URL('public/original.html',root),'utf8');
const match=html.match(/<script[^>]*id="course-data"[^>]*>([\s\S]*?)<\/script>/);
if(!match)throw new Error('Original course data is missing.');
const data=JSON.parse(match[1]);
await mkdir(new URL('public/worksheets/',root),{recursive:true});
let count=0;
for(const week of data.weeks){for(const activity of week.activities){
 const encoded=data.pdfs[activity.pdf];if(!encoded)continue;
 if(!/^[a-zA-Z0-9_-]+$/.test(activity.id))throw new Error('Invalid worksheet ID');
 const bytes=Buffer.from(encoded.split(',').pop(),'base64');
 if(bytes.subarray(0,5).toString()!=='%PDF-')throw new Error('Invalid PDF: '+activity.id);
 await writeFile(new URL(`public/worksheets/${activity.id}.pdf`,root),bytes);count++;
}}
console.log(`Extracted ${count} original worksheets.`);
