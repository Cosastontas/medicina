// Función que maneja la interacción y desbloqueo de materias
document.querySelectorAll('.materia').forEach(materia => {
    materia.addEventListener('click', () => {
        // Si la materia ya está aprobada, no hacer nada
        if (materia.classList.contains('aprobada')) return;

        // Aprobar la materia al hacer clic
        materia.classList.add('aprobada');
        
        // Verificar y desbloquear requisitos de otras materias
        desbloquearRequisitos(materia);
        desbloquearCiclo();
    });
});

// Función para desbloquear las materias que tienen requisitos
function desbloquearRequisitos(materia) {
    const requisitos = materia.getAttribute('data-requisitos').split(',');

    requisitos.forEach(requisito => {
        const materiaRequisito = document.getElementById(requisito.trim());
        if (materiaRequisito) {
            materiaRequisito.classList.add('requisito-desbloqueado');
        }
    });
    function desbloquearCiclo() {
    document.querySelectorAll('.semestre').forEach(semestre => {
        let cicloCompleto = true;

        semestre.querySelectorAll('.materia').forEach(materia => {
            if (!materia.classList.contains('aprobada')) {
                cicloCompleto = false;
            }
        });

        if (cicloCompleto) {
            const siguiente = semestre.nextElementSibling;
            if (siguiente) {
                siguiente.classList.add('desbloqueado');
            }
        }
    });
}
    // --- Utilidad: parsear data-requisitos robustamente ---
function getReqs(node) {
  const raw = node.dataset.requisitos || "[]";
  // Admite "['id1','id2']" o "[]" o "id1,id2"
  try {
    const jsonish = raw.trim().startsWith('[') ? raw.replace(/'/g, '"') : '[]';
    const arr = JSON.parse(jsonish);
    if (Array.isArray(arr)) return arr.filter(Boolean);
  } catch (e) {}
  return raw
    .replace(/[\[\]]/g, '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

// --- Recalcular estados (bloqueada/habilitada/aprobada) y ciclos ---
function recalcEstados() {
  const materias = [...document.querySelectorAll('.materia')];
  const aprobadas = new Set(
    materias.filter(m => m.classList.contains('aprobada')).map(m => m.id)
  );

  // Materias: decidir si están habilitadas (todas sus reqs aprobadas)
  materias.forEach(m => {
    const reqs = getReqs(m);
    const wasUnlocked = m.dataset.unlocked === 'true';
    const isUnlocked = reqs.every(r => aprobadas.has(r));

    m.dataset.unlocked = isUnlocked ? 'true' : 'false';
    m.classList.remove('habilitada', 'bloqueada');

    if (isUnlocked) {
      if (!m.classList.contains('aprobada')) {
        m.classList.add('habilitada');
      }
      // Efecto “recién desbloqueada”
      if (!wasUnlocked && !m.classList.contains('aprobada')) {
        m.classList.add('recien');
        setTimeout(() => m.classList.remove('recien'), 1600);
      }
    } else {
      if (!m.classList.contains('aprobada')) {
        m.classList.add('bloqueada');
      }
    }
  });

  // Ciclos: el ciclo i está desbloqueado si i=1 o si TODAS las materias del ciclo anterior están aprobadas
  const ciclos = [...document.querySelectorAll('.semestre')];
  ciclos.forEach((sem, idx) => {
    const prev = ciclos[idx - 1];
    const prevOk = !prev || [...prev.querySelectorAll('.materia')].every(m => m.classList.contains('aprobada'));
    sem.classList.toggle('desbloqueado', idx === 0 || prevOk);
  });
}

// --- Toggle de aprobación con recálculo global (afecta dependientes y ciclos) ---
function onMateriaClick(e) {
  const m = e.currentTarget;

  // Si el ciclo está bloqueado, ignora
  const ciclo = m.closest('.semestre');
  if (ciclo && !ciclo.classList.contains('desbloqueado')) return;

  // Toggle aprobar / desaprobar
  m.classList.toggle('aprobada');

  // Al desaprobar, quitamos marcas visuales que no apliquen
  if (!m.classList.contains('aprobada')) {
    m.classList.remove('habilitada', 'recien');
    m.dataset.unlocked = m.dataset.unlocked || 'false';
  }

  // Recalcular TODO (materias + ciclos) tras el cambio
  recalcEstados();
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
  // Vincular eventos (si ya los tenías, puedes reemplazar para evitar duplicados)
  document.querySelectorAll('.materia').forEach(m => {
    m.removeEventListener?.('click', onMateriaClick); // por si ya estaba
    m.addEventListener('click', onMateriaClick);
  });

  // Primer cálculo para pintar estados iniciales
  recalcEstados();
});
}

