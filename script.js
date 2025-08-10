/* Malla por requisitos (sin bloqueo por ciclo):
   - bloqueada (pastel): no cumple todas las reqs → no clic
   - habilitada (rosa fuerte): cumple todas las reqs → clic para aprobar
   - aprobada (lila): clic de nuevo para des-aprobar
   - Requisitos múltiples con AND (todas), y “agrupados” por prefijo (req-*)
*/

/* Lee requisitos: ['id1','id2'] o "id1,id2" o [] */
function getReqs(node) {
  const raw = (node.dataset.requisitos || "").trim();
  if (!raw) return [];
  try {
    if (raw.startsWith('[')) return JSON.parse(raw.replace(/'/g, '"')).filter(Boolean);
  } catch(e){}
  return raw.replace(/[\[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean);
}

/* Un requisito se cumple si:
   - Existe un elemento con ese id y está aprobado; o
   - No existe ese id, y TODAS las materias cuyo id empiece por `${req}-` están aprobadas. */
function requisitoCumplido(req, aprobadasSet) {
  const exact = document.getElementById(req);
  if (exact) return aprobadasSet.has(req);
  const grupo = [...document.querySelectorAll(`.materia[id^="${req}-"]`)];
  if (grupo.length === 0) return false;
  return grupo.every(m => aprobadasSet.has(m.id));
}

/* Recalcula estados de TODAS las materias */
function recalcEstados() {
  const materias = [...document.querySelectorAll('.materia')];
  const aprobadas = new Set(materias.filter(m => m.classList.contains('aprobada')).map(m => m.id));

  materias.forEach(m => {
    const reqs = getReqs(m);
    const wasUnlocked = m.dataset.unlocked === 'true';
    const isUnlocked = reqs.every(r => requisitoCumplido(r, aprobadas));

    m.dataset.unlocked = isUnlocked ? 'true' : 'false';
    m.classList.remove('habilitada', 'bloqueada', 'recien');

    if (m.classList.contains('aprobada')) {
      // Si ya está aprobada, queda en lila independientemente de reqs
      return;
    }

    if (isUnlocked) {
      m.classList.add('habilitada');
      if (!wasUnlocked) {
        m.classList.add('recien');
        setTimeout(() => m.classList.remove('recien'), 1600);
      }
    } else {
      m.classList.add('bloqueada');
    }
  });
}

/* Clic = toggle aprobar (solo si no está bloqueada) */
function onMateriaClick(e) {
  const m = e.currentTarget;
  if (m.classList.contains('bloqueada') && !m.classList.contains('aprobada')) return;
  m.classList.toggle('aprobada');
  if (!m.classList.contains('aprobada')) m.classList.remove('recien');
  recalcEstados();
}

/* Init */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.materia').forEach(m => {
    m.removeEventListener?.('click', onMateriaClick);
    m.addEventListener('click', onMateriaClick);
  });
  recalcEstados();
});
