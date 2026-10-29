// Loaded only in the GitHub Pages build. SDK modules come from Google's official CDN.
const sdk='https://www.gstatic.com/firebasejs/13.1.0/';
const moduleFrom=(name:string)=>import(/* @vite-ignore */ sdk+'firebase-'+name+'.js');
export async function connectFirebase(config:any){
 const [appSdk,authSdk,dbSdk]=await Promise.all(['app','auth','firestore'].map(moduleFrom));
 const app=appSdk.initializeApp(config.firebase),auth=authSdk.getAuth(app),db=dbSdk.getFirestore(app);
 await auth.authStateReady();
 const teacherUids=Array.from(new Set([config.teacherUid,...(Array.isArray(config.teacherUids)?config.teacherUids:[])].filter((uid:any)=>typeof uid==='string'&&uid.length>0)));
 const isTeacher=()=>!!auth.currentUser&&teacherUids.includes(auth.currentUser.uid);
 const requireTeacher=()=>{if(!isTeacher())throw Error('Sign in with the configured teacher account to edit lessons.')};
 const root=dbSdk.doc(db,'courses','business-management');
 const lessons=dbSdk.collection(root,'lessons');
 const seed=(await import('./seed.json')).default;
 const backend={
  async load(){requireTeacher();return dbSdk.runTransaction(db,async(tx:any)=>{const meta=await tx.get(root);if(!meta.exists())return {data:seed,version:'initial'};const ids=meta.data().lessonIds;if(!Array.isArray(ids))throw Error('Invalid course index');const docs=await Promise.all(ids.map((id:string)=>tx.get(dbSdk.doc(lessons,id))));return {data:{weeks:docs.map((d:any)=>{if(!d.exists())throw Error('A lesson is missing');return JSON.parse(d.data().json)})},version:meta.data().version}})},
  async save(data:any,version:string){requireTeacher();if(!Array.isArray(data.weeks)||data.weeks.length>100)throw Error('A course can contain up to 100 weeks.');const next=crypto.randomUUID();await dbSdk.runTransaction(db,async(tx:any)=>{const meta=await tx.get(root);const current=meta.exists()?meta.data().version:'initial';if(current!==version)throw Error('This course changed in another tab. Reload before editing.');for(const week of data.weeks){const json=JSON.stringify(week);if(new TextEncoder().encode(json).length>800000)throw Error('This lesson is too large. Split its activities into another week.');tx.set(dbSdk.doc(lessons,String(week.n)),{json})}tx.set(root,{version:next,lessonIds:data.weeks.map((w:any)=>String(w.n)),updatedAt:dbSdk.serverTimestamp()})});return {version:next}},
 };
 const provider=new authSdk.GoogleAuthProvider();
 provider.setCustomParameters({prompt:'select_account'});
 return {backend,isTeacher,auth,login:()=>authSdk.signInWithPopup(auth,provider),logout:()=>authSdk.signOut(auth)};
}
