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
    // === Utilidad: leer requisitos desde data-requisitos (acepta ['a','b'] o 'a,b') ===
function getReqs(node) {
  const raw = node.dataset.requisitos || "[]";
  try {
    // Soporta "['id']" (comillas simples) convirtiéndolo a JSON válido
    if (raw.trim().startsWith('[')) return JSON.parse(raw.replace(/'/g, '"')).filter(Boolean);
  } catch(e){}
  return raw.replace(/[\[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean);
}

// === ¿Está satisfecho este requisito? ===
// - Si existe un elemento con ese id, debe estar aprobado.
// - Si NO existe, se interpreta como "requisito agrupado": TODAS las materias cuyo id
//   empiece con `${req}-` deben estar aprobadas (ej. 'clinica-ii' -> 'clinica-ii-*').
function requisitoCumplido(req, aprobadasSet) {
  const direct = document.getElementById(req);
  if (direct) return aprobadasSet.has(req);
  const grupo = [...document.querySelectorAll(`.materia[id^="${req}-"]`)];
  if (grupo.length === 0) {
    // Aviso silencioso en consola para ayudarte a detectar ids mal escritos
    console.warn(`Requisito "${req}" no coincide con ningún id ni prefijo de materias.`);
    return false;
  }
  return grupo.every(m => aprobadasSet.has(m.id));
}

// === Recalcular estados de TODAS las materias y desbloqueo de ciclos ===
function recalcEstados() {
  const materias = [...document.querySelectorAll('.materia')];
  const aprobadas = new Set(materias.filter(m => m.classList.contains('aprobada')).map(m => m.id));

  // Materias: decidir si están habilitadas (tienen TODOS sus reqs cumplidos)
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

  // Ciclos: el 1º siempre desbloqueado; el siguiente se desbloquea si el anterior terminó
  const ciclos = [...document.querySelectorAll('.semestre')];
  ciclos.forEach((sem, idx) => {
    const prev = ciclos[idx - 1];
    const prevOk = !prev || [...prev.querySelectorAll('.materia')].every(m => m.classList.contains('aprobada'));
    sem.classList.toggle('desbloqueado', idx === 0 || prevOk);
  });
}

// === Toggle aprobar/desaprobar con recálculo global ===
function onMateriaClick(e) {
  const m = e.currentTarget;

  // Si el ciclo está bloqueado, no permitir
  const ciclo = m.closest('.semestre');
  if (ciclo && !ciclo.classList.contains('desbloqueado')) return;

  // Alternar aprobado
  m.classList.toggle('aprobada');

  // Si se des-aprueba, limpiamos señales visuales residuales
  if (!m.classList.contains('aprobada')) {
    m.classList.remove('habilitada', 'recien');
  }

  // Recalcular TODO
  recalcEstados();
}

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.materia').forEach(m => {
    m.removeEventListener?.('click', onMateriaClick);
    m.addEventListener('click', onMateriaClick);
  });
  recalcEstados();
})
    
 
