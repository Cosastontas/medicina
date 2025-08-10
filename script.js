/* ==========
   Malla interactiva basada en requisitos (sin bloqueo por ciclo)
   - Estados:
       bloqueada (pastel) -> no clic
       habilitada (rosa fuerte) -> clic para aprobar
       aprobada (lila) -> clic para desaprobar
   - Recién habilitada: animación "pulso"
   - Requisitos "agrupados": si no existe id exacto, usa prefijo (req-*)
   ========== */

/* Lee requisitos desde data-requisitos:
   acepta ['id'] o "id1,id2" o []  */
function getReqs(node) {
  const raw = (node.dataset.requisitos || "").trim();
  if (!raw) return [];
  try {
    if (raw.startsWith('[')) {
      return JSON.parse(raw.replace(/'/g, '"')).filter(Boolean);
    }
  } catch (e) { /* fallback abajo */ }
  return raw.replace(/[\[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean);
}

/* Un requisito se cumple si:
   - Existe un elemento con ese id y está aprobado; o
   - No existe ese id, y TODAS las materias cuyo id empiece por `${req}-`
     están aprobadas (prefijo/grupo) */
function requisitoCumplido(req, aprobadasSet) {
  const exact = document.getElementById(req);
  if (exact) return aprobadasSet.has(req);

  const grupo = [...document.querySelectorAll(`.materia[id^="${req}-"]`)];
  if (grupo.length === 0) {
    // No encontró id ni prefijo. Considera no cumplido (y avisa en consola para depurar ids)
    // console.warn(`Requisito "${req}" no coincide con id ni prefijo.`);
    return false;
  }
  return grupo.every(m => aprobadasSet.has(m.id));
}

/* Recalcula estados de todas las materias según requisitos */
function recalcEstados() {
  const materias = [...document.querySelectorAll('.materia')];
  const aprobadas = new Set(materias.filter(m => m.classList.contains('aprobada')).map(m => m.id));

  materias.forEach(m => {
    const reqs = getReqs(m);
    const wasUnlocked = m.dataset.unlocked === 'true';
    const isUnlocked = reqs.every(r => requisitoCumplido(r, aprobadas));

    // Guardar flag de desbloqueo para detectar "recién habilitada"
    m.dataset.unlocked = isUnlocked ? 'true' : 'false';

    // Limpiar estados previos (menos "aprobada")
    m.classList.remove('habilitada', 'bloqueada', 'recien');

    if (m.classList.contains('aprobada')) {
      // Si ya está aprobada, queda lila (sin importar requisitos)
      return;
    }

    if (isUnlocked) {
      m.classList.add('habilitada');
      if (!wasUnlocked) {
        // Efecto pulso la primera vez que se habilita
        m.classList.add('recien');
        setTimeout(() => m.classList.remove('recien'), 1600);
      }
    } else {
      m.classList.add('bloqueada');
    }
  });
}

/* Toggle aprobar/desaprobar materia */
function onMateriaClick(e) {
  const m = e.currentTarget;

  // Si está bloqueada (no cumple requisitos y no está aprobada), no permitir toggle
  if (m.classList.contains('bloqueada') && !m.classList.contains('aprobada')) return;

  // Alternar estado aprobado
  m.classList.toggle('aprobada');

  // Al desaprobar, quitamos marcas visuales que no aplican
  if (!m.classList.contains('aprobada')) {
    m.classList.remove('habilitada', 'recien');
  }

  // Recalcular para propagar desbloqueos/bloqueos en dependientes
  recalcEstados();
}

/* Inicialización */
document.addEventListener('DOMContentLoaded', () => {
  // Vincular eventos (evitar duplicados si hay hot reload)
  document.querySelectorAll('.materia').forEach(m => {
    m.removeEventListener?.('click', onMateriaClick);
    m.addEventListener('click', onMateriaClick);
  });

  // Pintado inicial
  recalcEstados();
});
