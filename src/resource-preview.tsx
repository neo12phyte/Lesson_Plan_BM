'use client';
import {useEffect,useState,useRef} from 'react';
import {Eye,X,Maximize2,ArrowUpRight} from 'lucide-react';
import {resourceUrl} from './storage-client';
export function previewUrl(input:string){
 const url=resourceUrl(input);
 try{const u=new URL(url,location.origin);
 if(u.hostname==='drive.google.com'){const id=u.pathname.match(/\/file\/d\/([^/]+)/)?.[1];if(id)return `https://drive.google.com/file/d/${id}/preview`;}
 if(['youtube.com','www.youtube.com','youtu.be'].includes(u.hostname)){const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v');if(id&&/^[\w-]+$/.test(id))return `https://www.youtube-nocookie.com/embed/${id}`;}
 return url;
 }catch{return ''}
}
export default function PreviewCard({activity,children,className}:{activity:any,children:React.ReactNode,className:string}){
 const [open,setOpen]=useState(false),[pinned,setPinned]=useState(false),[selected,setSelected]=useState(0);
 const enter=useRef<ReturnType<typeof setTimeout>|null>(null),leave=useRef<ReturnType<typeof setTimeout>|null>(null);
 const links=activity.links.filter((l:any)=>/^https?:\/\//i.test(l.url)||/^\/(?!\/)/.test(l.url));
 const clear=()=>{if(enter.current)clearTimeout(enter.current);if(leave.current)clearTimeout(leave.current)};
 const close=()=>{clear();setOpen(false);setPinned(false)};
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')close()};window.addEventListener('keydown',key);return ()=>{clear();window.removeEventListener('keydown',key)}},[]);
 function start(){if(!matchMedia('(hover: hover)').matches)return;clear();enter.current=setTimeout(()=>setOpen(true),450)}
 function stop(){clear();if(!pinned)leave.current=setTimeout(()=>setOpen(false),250)}
 return <article className={className} onMouseEnter={start} onMouseLeave={stop} onClickCapture={e=>{const target=e.target as HTMLElement;if(target.closest('.resource-preview'))return;if(target.closest('button')&&!target.closest('.preview-trigger')){close();return}const anchor=target.closest('a');if(!anchor)return;const i=links.findIndex((l:any)=>resourceUrl(l.url)===anchor.getAttribute('href'));if(i>=0){e.preventDefault();clear();setSelected(i);setOpen(true);setPinned(true)}}}>
 {children}
 <button className="preview-trigger" onClick={()=>{clear();setOpen(true);setPinned(true)}}><Eye size={15}/> Preview activity <span>Hover or click</span></button>
 {open&&<div className={pinned?'preview-backdrop':'preview-hover-container'} onMouseEnter={clear} onMouseLeave={stop} onClick={e=>{if(e.target===e.currentTarget&&pinned)close()}}><section className={'resource-preview '+(pinned?'expanded':'')} role="dialog" aria-modal={pinned||undefined} aria-label={'Preview: '+activity.title}>
 <div className="preview-header"><div><small>ACTIVITY PREVIEW</small><h3>{activity.title}</h3></div><div>{!pinned&&<button aria-label="Expand preview" onClick={()=>setPinned(true)}><Maximize2 size={17}/></button>}<button aria-label="Close preview" onClick={close}><X size={19}/></button></div></div>
 {links.length>1&&<label className="preview-select">Resource<select value={selected} onChange={e=>setSelected(+e.target.value)}>{links.map((l:any,i:number)=><option key={i} value={i}>{l.label||'Resource '+(i+1)}</option>)}</select></label>}
 {links[selected]?<iframe key={links[selected].url} src={previewUrl(links[selected].url)} title={activity.title+' resource'} sandbox={/\.pdf(?:[?#]|$)/i.test(links[selected].url)?undefined:"allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"} referrerPolicy="no-referrer" allow="fullscreen"/>:<div className="preview-empty"><Eye size={30}/><p>{activity.description}</p><small>No resource attached yet. Add a link or file using Edit activity.</small></div>}
 <div className="preview-bottom"><span>{links.length?'Some websites block embedding. If the preview is blank, open the original.':'Your activity details are shown above.'}</span>{links[selected]&&<a href={resourceUrl(links[selected].url)} target="_blank" rel="noreferrer">Open original <ArrowUpRight size={14}/></a>}</div>
 </section></div>}
 </article>
}
