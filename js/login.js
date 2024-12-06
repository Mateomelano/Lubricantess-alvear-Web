
import { API_BASE_URL } from './config.js';

export function initLogin() {
    // Redirige automáticamente si ya está autenticado
    if (localStorage.getItem('authenticated') === 'true') {
        redirectToMenu();
    }


    const token = localStorage.getItem('token');
    const idUsuario = localStorage.getItem('idUsuario');
    const sub = localStorage.getItem('eParam');
    const rol = localStorage.getItem('rolUsuario');

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userName = document.getElementById('name').value;
            const password = document.getElementById('password').value;

            const loginData = {
                UserName: userName,
                Password: password
            };
            try {
                const response = await fetch(`${API_BASE_URL}/Usuarios/Login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    
                    body: JSON.stringify(loginData)
                });
                

                if (!response.ok) {
                    // Si la respuesta no es ok, podemos leer el mensaje del cuerpo
                    const errorText = await response.text();
                    // Mostrar el mensaje de error en una alerta
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de autenticación',
                        text: errorText
                    });
                    return; // Salir de la función
                }
                const data = await response.json();
                // Verificar si la respuesta contiene un token y un idUsuario
                if (data && data.token && data.idUsuario) {
                    // Guardar el token y marcar al usuario como autenticado
                    localStorage.setItem('authenticated', 'true');
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('idUsuario', data.idUsuario);
                    localStorage.setItem("sub", JSON.stringify(data.eParam));
                    localStorage.setItem("rol", data.rolUsuario);
                    // Redirigir al menú
                    redirectToMenu();
                } else {
                    // Mostrar un mensaje de error si no hay token o idUsuario
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de autenticación',
                        text: 'Las credenciales no son válidas o el usuario está inactivo',
                    });
                }
            } catch (error) {
                console.error('Error al intentar autenticar:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.',
                });
            }
        });
    }
}

function redirectToMenu() {
    window.location.hash = '#/menu';
}
