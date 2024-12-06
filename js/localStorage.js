(function() {
    // Verificar si el usuario está autenticado
    const isAuthenticated = localStorage.getItem('authenticated');

    if (isAuthenticated === 'true') {
        // El usuario está autenticado, accedemos a los datos almacenados
        const token = localStorage.getItem('token');
        const idUsuario = localStorage.getItem('idUsuario');
        const sub = JSON.parse(localStorage.getItem('sub')); // Obtenemos el objeto completo
        const rol = localStorage.getItem('rol');

        
        // Acceder a eParam dentro del objeto sub
        const eParam = sub;


        // Aquí puedes hacer otras cosas, como mostrar información del usuario
        // o redirigir a otras secciones de la página.
    } else {
        // Si no está autenticado, redirigir al login o mostrar un mensaje
        localStorage.removeItem('token');
        localStorage.removeItem('idUsuario');
        localStorage.removeItem('authenticated');
        localStorage.removeItem('sub');
        localStorage.removeItem('rolUsuario');
        window.location.href = 'index.html'; // Redirigir al login
    }
    
})();