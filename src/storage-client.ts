export type Backend={load:()=>Promise<any>,save:(data:any,version:string)=>Promise<any>};
declare global{interface Window{bmBackend?:Backend;bmBase?:string}}
export function resourceUrl(url:string){if(typeof window!=='undefined'&&window.bmBase&&/^\/(?!\/)/.test(url))return window.bmBase+url.slice(1);return url}
export async function loadCourse(){if(window.bmBackend)return window.bmBackend.load();const r=await fetch('/api/course');if(!r.ok)throw Error('Could not load course');return r.json()}
export async function saveCourse(data:any,version:string){if(window.bmBackend)return window.bmBackend.save(data,version);const r=await fetch('/api/course',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data,version})});if(!r.ok)throw Error(await r.text());return r.json()}
