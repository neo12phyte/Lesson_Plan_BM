import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import Page from './page';
import './globals.css';
import {connectFirebase} from './firebase-backend';
window.bmBase=new URL('./',location.href.split('#')[0]).pathname;
function App(){
 const [connection,setConnection]=useState<any>(null),[ready,setReady]=useState(false),[error,setError]=useState(''),[configured,setConfigured]=useState(true),[pending,setPending]=useState(false);
 useEffect(()=>{fetch(window.bmBase+'firebase-config.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Could not read firebase-config.json');return r.json()}).then(async config=>{if(!config.firebase?.projectId||!config.firebase?.apiKey||!config.teacherUid){setConfigured(false);return}const c=await connectFirebase(config);setConnection(c);if(c.isTeacher()){window.bmBackend=c.backend;setReady(true)}}).catch(e=>setError(e.message))},[]);
 async function login(){setPending(true);setError('');try{await connection.login();if(!connection.isTeacher())throw Error('This Google account is not the configured teacher account. Use your teacher account.');window.bmBackend=connection.backend;setReady(true)}catch(e:any){setError(e.message)}finally{setPending(false)}}
 if(ready)return <><div className="firebase-account"><span>Firebase connected · Teacher workspace</span><button onClick={async()=>{await connection.logout();window.bmBackend=undefined;setReady(false)}}>Sign out</button></div><Page/></>;
 return <main className="firebase-welcome"><div className="eyebrow">BM LESSON STUDIO</div><h1>{configured?'Your lessons. Your workspace.':'Ready for Firebase setup.'}</h1><p>{configured?'Sign in with your teacher Google account to open and update your course.':'Add your Firebase web configuration and teacher UID to public/firebase-config.json, then deploy the supplied security rules. The setup guide walks through each step.'}</p>{error&&<div className="error" role="alert">{error}</div>}{configured&&<button className="primary" disabled={!connection||pending} onClick={login}>{pending?'Signing in…':connection?'Sign in with Google':'Connecting…'}</button>}<p className="hosting-note">Hosted on GitHub Pages · Lesson changes in Firestore · Uploaded resources in Firebase Storage</p></main>
}
createRoot(document.getElementById('root')!).render(<App/>);
