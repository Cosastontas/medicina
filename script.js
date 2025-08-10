/* ==========
   Malla interactiva por requisitos (sin bloqueo por ciclo)
   - Estados automáticos:
       bloqueada (pastel): no cumple reqs -> sin clic
       habilitada (rosa fuerte): cumple reqs -> clic la selecciona
       seleccionada: resaltada para planificar (no aprueba)
       aprobada (lila): doble clic (o clic estando seleccionada)
   - Reversible: des-aprobar y todo se recalcula
   - Requisitos agrupados: 'prefijo' = exige TODAS las materias con id que empiece por 'prefijo-'
   ========== */

/* Lee requisitos desde data-requisitos: ['id'] o "id1,id2" o [] */
function getReqs(node) {
  const raw = (node.dataset.requisitos || "").trim();
  if (!raw) return [];
  try {
    if (raw.startsWith('[')) {
      return JSON.parse(raw.replace(/'/g, '"')).filter(Boolean);
    }
  } catch (e) {}
  return raw.replace(/[\[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean);
}

/* ¿Requisito cumplido?
   - Si existe un id exacto: ese id debe estar aprobado.
   - Si no existe: toma como prefijo y exige TODAS las materias con id que empiece por `${req}-`. */
function requisitoCumplido(req, aprobadasSet) {
  const exact = document.getElementById(req);
  if (exact) return aprobadasSet.has(req);

  const grupo = [...document.querySelectorAll(`.materia[id^="${req}-"]`)];
  if (grupo.length === 0) {
    // console.warn(`Requisito "${req}" no coincide con id ni prefijo.`);
    return false;
  }
  return grupo.every(m => aprobadasSet.has(m.id));
}

/* Recalcular estados según requisitos y aprobaciones actuales */
function recalcEstados() {
  const materias = [...document.querySelectorAll('.materia')];
  const aprobadas = new Set(materias.filter(m => m.classList.contains('aprobada')).map(m => m.id));

  materias.forEach(m => {
    const reqs = getReqs(m);
    const wasUnlocked = m.dataset.unlocked === 'true';
    const isUnlocked = reqs.every(r => requisitoCumplido(r, aprobadas));

    m.dataset.unlocked = isUnlocked ? 'true' : 'false';

    // Limpia estados transitorios (conserva 'aprobada' si existe)
    m.classList.remove('habilitada', 'bloqueada', 'recien');
    if (!m.classList.contains('aprobada')) {
      m.classList.remove('seleccionada'); // si pierde requisitos, también pierde selección
    }

    if (m.classList.contains('aprobada')) {
      // Si está aprobada, queda lila independientemente de reqs
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

/* Clic simple: seleccionar/deseleccionar si habilitada; si ya estaba seleccionada, aprobar */
function onMateriaClick(e) {
  const m = e.currentTarget;

  // Bloqueada no permite interacción
  if (m.classList.contains('bloqueada') && !m.classList.contains('aprobada')) return;

  if (m.classList.contains('aprobada')) {
    // Si está aprobada, clic simple la des-aprueba
    m.classList.remove('aprobada');
    recalcEstados();
    return;
  }

  if (m.classList.contains('seleccionada')) {
    // Si ya estaba seleccionada → aprobar con clic
    m.classList.remove('seleccionada');
    m.classList.add('aprobada');
    recalcEstados();
  } else if (m.classList.contains('habilitada')) {
    // Si está habilitada, el primer clic solo la selecciona (plan)
    m.classList.add('seleccionada');
  }
}

/* Doble clic: aprobar directo si está habilitada; si está aprobada, la revierte */
function onMateriaDblClick(e) {
  const m = e.currentTarget;
  if (m.classList.contains('bloqueada')) return;

  m.classList.toggle('aprobada');
  m.classList.remove('seleccionada', 'recien');
  recalcEstados();
}

/* Inicialización */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.materia').forEach(m => {
    m.removeEventListener?.('click', onMateriaClick);
    m.removeEventListener?.('dblclick', onMateriaDblClick);
    m.addEventListener('click', onMateriaClick);
    m.addEventListener('dblclick', onMateriaDblClick);
  });
  recalcEstados();
});
