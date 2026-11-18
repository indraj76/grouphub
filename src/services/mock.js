// DEV ONLY – used only when VITE_USE_MOCK=true. Clearly demo data.
const cats = ['Education','Technology','Jobs & Careers','Business','Entertainment','Gaming','Sports','News','Finance','Health & Fitness','Travel','Lifestyle','Programming','Marketing','Shopping','Movies & Web Series','Music','Government Jobs','Competitive Exams','Other']
const slug = (s) => s.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
export const mockCategories = cats.map((n,i)=>({id:i+1,name:n,slug:slug(n),description:`Telegram groups about ${n.toLowerCase()}.`,groupCount:10+i*3}))
const cc=[['IN','India'],['US','United States'],['GB','United Kingdom'],['AE','United Arab Emirates']], lg=[['en','English'],['hi','Hindi'],['es','Spanish']], st=['APPROVED','APPROVED','PENDING','REJECTED']
export const mockGroups = Array.from({length:48},(_,i)=>{const c=mockCategories[i%20],[a,an]=cc[i%4],[l,ln]=lg[i%3];return{id:i+1,slug:`demo-group-${i+1}`,name:`Demo ${c.name} Group ${i+1}`,category:c.name,categoryId:c.id,categorySlug:c.slug,
 description:'Demo description for development only. Replace with real API data.',tags:['demo',c.slug],countryCode:a,countryName:an,languageCode:l,languageName:ln,status:st[i%4],views:1000+i*57,inviteLink:'https://t.me/demo',createdAt:new Date(Date.now()-i*864e5).toISOString()}})
export const page = (list, p=0, size=12) => ({content:list.slice(p*size,p*size+size),totalElements:list.length,totalPages:Math.ceil(list.length/size),number:p})
