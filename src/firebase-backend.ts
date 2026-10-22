// Loaded only in the GitHub Pages build. SDK modules come from Google's official CDN.
const sdk='https://www.gstatic.com/firebasejs/13.1.0/';
const moduleFrom=(name:string)=>import(/* @vite-ignore */ sdk+'firebase-'+name+'.js');
export async function connectFirebase(config:any){
 const [appSdk,authSdk,dbSdk,storageSdk]=await Promise.all(['app','auth','firestore','storage'].map(moduleFrom));
 const app=appSdk.initializeApp(config.firebase),auth=authSdk.getAuth(app),db=dbSdk.getFirestore(app),storage=storageSdk.getStorage(app);
 await auth.authStateReady();
 const isTeacher=()=>!!auth.currentUser&&auth.currentUser.uid===config.teacherUid;
 const requireTeacher=()=>{if(!isTeacher())throw Error('Sign in with the configured teacher account to edit lessons.')};
 const root=dbSdk.doc(db,'courses','business-management');
 const lessons=dbSdk.collection(root,'lessons');
 const seed=(await import('./seed.json')).default;
 const backend={
  async load(){requireTeacher();return dbSdk.runTransaction(db,async(tx:any)=>{const meta=await tx.get(root);if(!meta.exists())return {data:seed,version:'initial'};const ids=meta.data().lessonIds;if(!Array.isArray(ids))throw Error('Invalid course index');const docs=await Promise.all(ids.map((id:string)=>tx.get(dbSdk.doc(lessons,id))));return {data:{weeks:docs.map((d:any)=>{if(!d.exists())throw Error('A lesson is missing');return JSON.parse(d.data().json)})},version:meta.data().version}})},
  async save(data:any,version:string){requireTeacher();if(!Array.isArray(data.weeks)||data.weeks.length>100)throw Error('A course can contain up to 100 weeks.');const next=crypto.randomUUID();await dbSdk.runTransaction(db,async(tx:any)=>{const meta=await tx.get(root);const current=meta.exists()?meta.data().version:'initial';if(current!==version)throw Error('This course changed in another tab. Reload before editing.');for(const week of data.weeks){const json=JSON.stringify(week);if(new TextEncoder().encode(json).length>800000)throw Error('This lesson is too large. Split its activities into another week.');tx.set(dbSdk.doc(lessons,String(week.n)),{json})}tx.set(root,{version:next,lessonIds:data.weeks.map((w:any)=>String(w.n)),updatedAt:dbSdk.serverTimestamp()})});return {version:next}},
  async upload(file:File){requireTeacher();if(file.size>10*1024*1024)throw Error('Please choose a file under 10 MB.');const name=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const ref=storageSdk.ref(storage,`resources/${auth.currentUser.uid}/${crypto.randomUUID()}/${name}`);await storageSdk.uploadBytes(ref,file,{contentType:file.type||'application/octet-stream'});return {url:await storageSdk.getDownloadURL(ref),label:file.name}}
 };
 return {backend,isTeacher,auth,login:()=>authSdk.signInWithPopup(auth,new authSdk.GoogleAuthProvider()),logout:()=>authSdk.signOut(auth)};
}
