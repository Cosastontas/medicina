// Función que maneja la interacción y desbloqueo de materias
document.querySelectorAll('.materia').forEach(materia => {
    materia.addEventListener('click', () => {
        // Si la materia ya está aprobada, no hacer nada
        if (materia.classList.contains('aprobada')) return;

        // Aprobar la materia al hacer clic
        materia.classList.add('aprobada');
        
        // Verificar y desbloquear requisitos de otras materias
        desbloquearRequisitos(materia);
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
}
