/* ==========
   Malla interactiva – desbloqueo por requisitos + ciclos encadenados
   - Toggle: clic = aprobar / desaprobar
   - Estados: bloqueada (pastel), habilitada (rosa fuerte + pulso), aprobada (lila)
   - Desbloqueo de ciclos: el 1º siempre activo; N+1 se activa si N está 100% aprobado
   - Requisitos "agrupados": si no existe un id exacto, se toma como prefijo (req-*)
   ========== */

/* Lee requisitos desde data-requisitos: acepta ['id'] o 'id1,id2' o [] */
function getReqs(node) {
  const raw = (node.dataset.requisitos || "").trim();
  if (!raw) return [];
  try {
    if (raw.startsWith('[')) {
      // Soporta comillas simples: ['a','b'] -> ["a","b"]
      return JSON.parse(raw.replace(/'/g, '"')).filter(Boolean);
    }
  } catch (e) {
    // continuará abajo con el parser por comas
  }
  return raw.replace(/[\[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean);
}

/* Un requisito se considera cumplido si:
   - Existe un elemento con ese id y está aprobado; o
   - No existe ese id, y TODAS las materias cuyo id empiece por `${req}-` están aprobadas (prefijo/grupo) */
function requisitoCumplido(req, aprobadasSet) {
  const exact = document.getElementById(req);
  if (exact) return aprobadasSet.has(req);

  const grupo = [...document.querySelectorAll(`.materia[id^="${req}-"]`)];
  if (grupo.length === 0) {
    // Id inexistente y sin prefijos: ayuda de depuración, no rompe
    // console.warn(`Requisito "${req}" no coincide con id ni con prefijo alguno.`);
    return false;
  }
  return grupo.every(m => aprobadasSet.has(m.id));
}

/* Recalcula estados de todas las materias y desbloqueo de ciclos */
function recalcEstados() {
  const materias = [...document.querySelectorAll('.materia')];
  const aprobadas = new Set(materias.filter(m => m.classList.contains('aprobada')).map(m => m.id));

  // Materias: habilitada / bloqueada / aprobada
  materias.forEach(m => {
    const reqs = getReqs(m);
    const wasUnlocked = m.dataset.unlocked === 'true';
    const isUnlocked = reqs.every(r => requisitoCumplido(r, aprobadas));

    m.dataset.unlocked = isUnlocked ? 'true' : 'false';
    m.classList.remove('habilitada', 'bloqueada');

    if (isUnlocked) {
      if (!m.classList.contains('aprobada')) {
        m.classList.add('habilitada');
      }
      if (!wasUnlocked && !m.classList.contains('aprobada')) {
        // efecto “recién desbloqueada”
        m.classList.add('recien');
        setTimeout(() => m.classList.remove('recien'), 1600);
      }
    } else {
      if (!m.classList.contains('aprobada')) {
        m.classList.add('bloqueada');
      }
    }
  });

  // Ciclos: el primero siempre desbloqueado. Del 2º en adelante, se desbloquea si el anterior está 100% aprobado.
const ciclos = [...document.querySelectorAll('.semestre')];
ciclos.forEach((sem, idx) => {
  const mats = [...sem.querySelectorAll('.materia')];
  const activo = idx === 0 || mats.some(m => m.classList.contains('aprobada') || m.dataset.unlocked === 'true');
  sem.classList.toggle('desbloqueado', activo);
});

/* Toggle aprobar/desaprobar con recálculo global */
/* ==========
   Malla interactiva – desbloqueo por requisitos + ciclos encadenados
   - Toggle: clic = aprobar / desaprobar
   - Estados: bloqueada (pastel), habilitada (rosa fuerte + pulso), aprobada (lila)
   - Desbloqueo de ciclos: el 1º siempre activo; N+1 se activa si N está 100% aprobado
   - Requisitos "agrupados": si no existe un id exacto, se toma como prefijo (req-*)
   ========== */

/* Lee requisitos desde data-requisitos: acepta ['id'] o 'id1,id2' o [] */
function getReqs(node) {
  const raw = (node.dataset.requisitos || "").trim();
  if (!raw) return [];
  try {
    if (raw.startsWith('[')) {
      // Soporta comillas simples: ['a','b'] -> ["a","b"]
      return JSON.parse(raw.replace(/'/g, '"')).filter(Boolean);
    }
  } catch (e) {
    // continuará abajo con el parser por comas
  }
  return raw.replace(/[\[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean);
}

/* Un requisito se considera cumplido si:
   - Existe un elemento con ese id y está aprobado; o
   - No existe ese id, y TODAS las materias cuyo id empiece por `${req}-` están aprobadas (prefijo/grupo) */
function requisitoCumplido(req, aprobadasSet) {
  const exact = document.getElementById(req);
  if (exact) return aprobadasSet.has(req);

  const grupo = [...document.querySelectorAll(`.materia[id^="${req}-"]`)];
  if (grupo.length === 0) {
    // Id inexistente y sin prefijos: ayuda de depuración, no rompe
    // console.warn(`Requisito "${req}" no coincide con id ni con prefijo alguno.`);
    return false;
  }
  return grupo.every(m => aprobadasSet.has(m.id));
}

/* Recalcula estados de todas las materias y desbloqueo de ciclos */
function recalcEstados() {
  const materias = [...document.querySelectorAll('.materia')];
  const aprobadas = new Set(materias.filter(m => m.classList.contains('aprobada')).map(m => m.id));

  // Materias: habilitada / bloqueada / aprobada
  materias.forEach(m => {
    const reqs = getReqs(m);
    const wasUnlocked = m.dataset.unlocked === 'true';
    const isUnlocked = reqs.every(r => requisitoCumplido(r, aprobadas));

    m.dataset.unlocked = isUnlocked ? 'true' : 'false';
    m.classList.remove('habilitada', 'bloqueada');

    if (isUnlocked) {
      if (!m.classList.contains('aprobada')) {
        m.classList.add('habilitada');
      }
      if (!wasUnlocked && !m.classList.contains('aprobada')) {
        // efecto “recién desbloqueada”
        m.classList.add('recien');
        setTimeout(() => m.classList.remove('recien'), 1600);
      }
    } else {
      if (!m.classList.contains('aprobada')) {
        m.classList.add('bloqueada');
      }
    }
  });

  // Ciclos: el primero siempre desbloqueado. Del 2º en adelante, se desbloquea si el anterior está 100% aprobado.
  const ciclos = [...document.querySelectorAll('.semestre')];
  ciclos.forEach((sem, idx) => {
    const previo = ciclos[idx - 1];
    const prevOk = !previo || [...previo.querySelectorAll('.materia')]
      .every(m => m.classList.contains('aprobada'));
    sem.classList.toggle('desbloqueado', idx === 0 || prevOk);
  });
}

/* Toggle aprobar/desaprobar con recálculo global */
function onMateriaClick(e) {
  const m = e.currentTarget;

  // Alternar aprobado SIEMPRE que el usuario haga clic
  m.classList.toggle('aprobada');

  // Si se des-aprueba, limpia marcas visuales
  if (!m.classList.contains('aprobada')) {
    m.classList.remove('habilitada', 'recien');
  }

  // Recalcular toda la red
  recalcEstados();
}

/* Inicialización */
document.addEventListener('DOMContentLoaded', () => {
  // Eventos de clic (evita duplicados si recargas parciales)
  document.querySelectorAll('.materia').forEach(m => {
    m.removeEventListener?.('click', onMateriaClick);
    m.addEventListener('click', onMateriaClick);
  });

  // Primer pintado
  recalcEstados();
});

/* Inicialización */
document.addEventListener('DOMContentLoaded', () => {
  // Eventos de clic (evita duplicados si recargas parciales)
  document.querySelectorAll('.materia').forEach(m => {
    m.removeEventListener?.('click', onMateriaClick);
    m.addEventListener('click', onMateriaClick);
  });

  // Primer pintado
  recalcEstados();
});
