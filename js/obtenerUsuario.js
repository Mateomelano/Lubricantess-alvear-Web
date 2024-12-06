(function() {
    const BASE_URL = window.API_BASE_URL;
    // Obtiene el idUsuario, el token y el rol del Local Storage
    const idUsuario = localStorage.getItem('idUsuario');
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    // Verifica si el idUsuario y el token están disponibles
    if (idUsuario && token) {
        // Configura los parámetros para la solicitud
        const parametros = {
            idUsuario: idUsuario
        };

        // Realiza la solicitud fetch a la API
        fetch(`${BASE_URL}/Usuarios/ObtenerCliente`, {
            method: 'POST', // Método HTTP
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Token de autenticación
            },
            body: JSON.stringify(parametros)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
            }
            return response.json(); // Convierte la respuesta a JSON
        })
        .then(data => {
            // Reemplaza el nombre de usuario en el DOM
            document.getElementById('nombre-usuario').textContent = data.nombreUsuario;
            
            // Si el rol no es 1, también muestra el saldo
            if (rol !== '1') {
                document.getElementById('saldo').textContent = `Saldo ${data.saldo.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        console.error('idUsuario o token no encontrado en Local Storage');
    }
})();
