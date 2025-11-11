/* Student Management System (separate files)
   Features:
   - Add / Edit / Delete
   - Search + Filter by class + Sort
   - Persist in localStorage
   - Import & Export CSV
*/
const STORAGE_KEY = 'sms_students_v1'
let students = []
let editingId = null

// elements
const tbody = document.querySelector('#studentsTable tbody')
const addBtn = document.getElementById('addStudentBtn')
const modal = document.getElementById('modalBackdrop')
const studentForm = document.getElementById('studentForm')
const modalTitle = document.getElementById('modalTitle')
const cancelBtn = document.getElementById('cancelBtn')
const countEl = document.getElementById('count')
const searchInput = document.getElementById('searchInput')
const filterClass = document.getElementById('filterClass')
const sortBy = document.getElementById('sortBy')
const exportBtn = document.getElementById('exportBtn')
const importBtn = document.getElementById('importBtn')
const fileInput = document.getElementById('fileInput')
const clearAllBtn = document.getElementById('clearAllBtn')

// form fields
const nameF = document.getElementById('name')
const rollF = document.getElementById('roll')
const classF = document.getElementById('classInput')
const emailF = document.getElementById('email')
const phoneF = document.getElementById('phone')
const notesF = document.getElementById('notes')

// init
load()
render()
populateClassFilter()

// events
addBtn.addEventListener('click', ()=>openModal())
cancelBtn.addEventListener('click', closeModal)
modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal() })
studentForm.addEventListener('submit', onSave)
searchInput.addEventListener('input', render)
filterClass.addEventListener('change', render)
sortBy.addEventListener('change', render)
exportBtn.addEventListener('click', exportCSV)
importBtn.addEventListener('click', ()=>fileInput.click())
fileInput.addEventListener('change', onFile)
clearAllBtn.addEventListener('click', ()=>{ if(confirm('Clear all students?')) { students=[]; save(); render(); } })

function openModal(student){
  modal.style.display = 'flex'
  modal.setAttribute('aria-hidden','false')
  if(student){
    modalTitle.textContent = 'Edit Student'
    editingId = student.id
    nameF.value = student.name
    rollF.value = student.roll
    classF.value = student.class
    emailF.value = student.email
    phoneF.value = student.phone
    notesF.value = student.notes
  } else {
    modalTitle.textContent = 'Add Student'
    editingId = null
    studentForm.reset()
  }
}
function closeModal(){ modal.style.display = 'none'; modal.setAttribute('aria-hidden','true'); studentForm.reset(); editingId = null }

function onSave(e){
  e.preventDefault()
  const data = {
    id: editingId || cryptoRandomId(),
    name: nameF.value.trim(),
    roll: rollF.value.trim(),
    class: classF.value.trim(),
    email: emailF.value.trim(),
    phone: phoneF.value.trim(),
    notes: notesF.value.trim(),
    created: new Date().toISOString()
  }
  if(!data.name || !data.roll || !data.class){
    alert('Name, roll and class required')
    return
  }

  if(editingId){
    const idx = students.findIndex(s=>s.id===editingId)
    if(idx>-1) students[idx] = data
  } else {
    students.push(data)
  }
  save()
  populateClassFilter()
  render()
  closeModal()
}

function render(){
  const q = searchInput.value.trim().toLowerCase()
  const classFilter = filterClass.value
  const sort = sortBy.value
  let list = students.slice()

  if(classFilter) list = list.filter(s=>s.class===classFilter)
  if(q) list = list.filter(s => (s.name+s.roll+s.class+s.email+s.phone+s.notes).toLowerCase().includes(q))

  list.sort((a,b)=>{
    if(sort==='name_asc') return a.name.localeCompare(b.name)
    if(sort==='name_desc') return b.name.localeCompare(a.name)
    if(sort==='roll_asc') return a.roll.localeCompare(b.roll, undefined, {numeric:true})
    if(sort==='roll_desc') return b.roll.localeCompare(a.roll, undefined, {numeric:true})
    return 0
  })

  tbody.innerHTML = ''
  list.forEach((s,i)=>{
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.roll)}</td>
      <td>${escapeHtml(s.class)}</td>
      <td>${escapeHtml(s.email||'')}</td>
      <td>${escapeHtml(s.phone||'')}</td>
      <td class="actions">
        <button class="btn secondary" data-id="${s.id}" data-action="view">View</button>
        <button class="btn" data-id="${s.id}" data-action="edit">Edit</button>
        <button class="btn danger" data-id="${s.id}" data-action="delete">Delete</button>
      </td>
    `
    tbody.appendChild(tr)
  })

  tbody.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.dataset.id
      const action = b.dataset.action
      if(action==='edit') onEdit(id)
      if(action==='delete') onDelete(id)
      if(action==='view') onView(id)
    })
  })

  countEl.textContent = `${list.length} students shown • total ${students.length}`
}

function onEdit(id){
  const s = students.find(x=>x.id===id)
  if(!s) return
  openModal(s)
}
function onDelete(id){
  if(!confirm('Delete this student?')) return
  students = students.filter(s=>s.id!==id)
  save()
  render()
}
function onView(id){
  const s = students.find(x=>x.id===id)
  if(!s) return
  alert(`Name: ${s.name}\nRoll: ${s.roll}\nClass: ${s.class}\nEmail: ${s.email}\nPhone: ${s.phone}\nNotes: ${s.notes}`)
}

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(students)) }
function load(){
  try{ students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch(e){ students=[] }
}

function populateClassFilter(){
  const set = new Set(students.map(s=>s.class).filter(Boolean))
  filterClass.innerHTML = `<option value="">All Classes</option>`
  Array.from(set).sort().forEach(c=>{
    const opt = document.createElement('option'); opt.value=c; opt.textContent=c; filterClass.appendChild(opt)
  })
}

function exportCSV(){
  if(!students.length){ alert('No students to export'); return }
  const header = ['id','name','roll','class','email','phone','notes','created']
  const rows = students.map(s=>header.map(h => csvEscape(s[h]||'')).join(','))
  const csv = [header.join(','), ...rows].join('\n')
  const blob = new Blob([csv], {type:'text/csv'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href=url; a.download='students.csv'; a.click(); URL.revokeObjectURL(url)
}

function onFile(e){
  const file = e.target.files[0]
  if(!file) return
  const reader = new FileReader()
  reader.onload = ()=>{
    try{ const parsed = parseCSV(reader.result)
      parsed.forEach(r=>{
        const obj = {
          id: r.id || cryptoRandomId(),
          name: r.name || r.Name || r.NAME || '',
          roll: r.roll || r.Roll || r.ROLL || '',
          class: r.class || r.Class || '',
          email: r.email || r.Email || '',
          phone: r.phone || r.Phone || '',
          notes: r.notes || r.Notes || ''
        }
        if(obj.name && obj.roll) students.push(obj)
      })
      save(); populateClassFilter(); render();
      alert('Import complete')
    } catch(err){ alert('Failed to parse CSV: '+err.message) }
  }
  reader.readAsText(file)
  fileInput.value = ''
}

/* small utils */
function cryptoRandomId(){ return 's_'+Math.random().toString(36).slice(2,9) }
function escapeHtml(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

function csvEscape(s){
  if(s==null) return ''
  const str = String(s)
  if(str.includes(',')||str.includes('"')||str.includes('\n')){
    return '"'+str.replaceAll('"','""')+'"'
  }
  return str
}

function parseCSV(text){
  const lines = []
  let i=0, cur=''
  let inQuotes=false
  let row=[]
  while(i<text.length){
    const ch = text[i]
    if(ch==='"'){
      if(inQuotes && text[i+1]==='"'){ cur+='"'; i+=2; continue }
      inQuotes = !inQuotes; i++; continue
    }
    if(ch==='\r'){ i++; continue }
    if(ch==='\n' && !inQuotes){ row.push(cur); lines.push(row); row=[]; cur=''; i++; continue }
    if(ch===',' && !inQuotes){ row.push(cur); cur=''; i++; continue }
    cur += ch; i++
  }
  if(cur!=='') row.push(cur)
  if(row.length) lines.push(row)
  if(!lines.length) return []
  const header = lines[0].map(h=>h.trim())
  const out = []
  for(let r=1;r<lines.length;r++){
    const obj = {}
    for(let c=0;c<header.length;c++) obj[header[c]] = lines[r][c] || ''
    out.push(obj)
  }
  return out
}
