import * as sidebar from './sidebar.js';
import { initLogin } from './login.js'; // Importa la función desde login.js
import { modificarSidebar } from './sidebar.js';
import { nav } from './sidebar.js';
export class Router {
    constructor() {
        this.routes = {
            '/': 'login.html',
            '/menu': 'menu.html',
            '/sidebar': 'sidebar.html',
            '/productos': 'productos.html',
            '/ofertas': 'ofertas.html',
            '/combos': 'combos.html',
            '/novedades': 'novedades.html',
            '/footer': 'footer.html',
        };
    }

    init() {
        this.handleHashChange();
        window.addEventListener('hashchange', () => this.handleHashChange());
    }

    handleHashChange() {
        const path = window.location.hash.replace('#', '') || '/';
        this.loadRoute(path);
    }
    loadRoute(path) {
        const htmlFile = this.routes[path];

        if (htmlFile) {
            fetch(htmlFile)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                })
                .then(html => {
                    document.getElementById('content-area').innerHTML = html;
                    this.removeAllStyles();
                    if (path === '/') {
                        this.loadLoginStyles();
                        this.loadLoginScripts();
                        initLogin();
                        this.hideSidebarNavbar();
                    } else {
                        if (path === '/menu') {
                            this.loadMenuStyles();
                            this.loadMenuScripts();
                            this.initMenu();
                            this.showSidebarNavbar();
                            this.loadFooter();
                        } else if (path === '/productos') {
                            this.loadProductsStyles();
                            this.loadProductsScripts();
                            this.initProducts();
                            this.showSidebarNavbarProductos();
                            this.loadFooter();
                        } else if (path === '/rubros') {
                            this.removeAllScripts();
                            this.loadRubrosStyles();
                            this.loadRubrosScripts();
                            this.initRubros();
                            this.showSidebarNavbar();
                        } else if (path === '/ofertas') {
                            this.loadOfertasStyles();
                            this.loadOfertasScripts();
                            this.initOfertas();
                            this.showSidebarNavbar();
                        } else if (path === '/combos') {
                            this.loadCombosStyles();
                            this.loadCombosScripts();
                            this.initCombos();
                            this.showSidebarNavbar();
                        } else if (path === '/novedades') {
                            this.loadNovedadesStyles();
                            this.loadNovedadesScripts();
                            this.initNovedades();
                            this.showSidebarNavbar();
                        }
                    }
                    sidebar.updateSidebarActiveLink(path);
                })
                .catch(error => console.error('Error loading HTML:', error));
        }
    }
    loadLoginStyles() {
        this.loadStyles('login-styles', '../css/login.css');
    }
    loadLoginScripts() {

    }
    loadMenuStyles() {
        this.loadStyles('menu-styles', '/css/menu.css');
    }
    loadMenuScripts() {
        this.loadScripts('menu-script', '/js/localStorage.js');
        this.loadScripts('obtenerUsuario-script', '/js/obtenerUsuario.js');
        this.loadScripts('banner-script', '/js/banner.js');
    }
    loadProductsScripts() {
        // Llamar a removeAllScripts antes de cargar nuevos scripts
        this.removeAllScripts();
        // Cargar scripts en el orden necesario
        this.loadScripts('carrito-script', '/js/carrito.js');
        this.loadScripts('searchbar-script', '/js/searchbar.js');
        this.loadScripts('addrubro-script', '/js/addrubro.js');
        this.loadScripts('menu-script', '/js/localStorage.js');
        this.loadScripts('obtenerUsuario-script', '/js/obtenerUsuario.js');
    }
    loadProductsStyles() {
        this.loadStyles('products-styles', '/css/productos.css');
    }

    loadOfertasStyles() {
        this.loadStyles('ofertas-styles', '/css/ofertas.css');
    }

    loadOfertasScripts() {
        this.loadScripts('menu-script', '/js/localStorage.js');
        this.loadScripts('obtenerUsuario-script', '/js/obtenerUsuario.js');
    }

    loadCombosStyles() {
        this.loadStyles('combos-styles', '/css/combos.css');
    }

    loadCombosScripts() {
        this.loadScripts('menu-script', '/js/localStorage.js');
        this.loadScripts('obtenerUsuario-script', '/js/obtenerUsuario.js');
    }

    loadNovedadesStyles() {
        this.loadStyles('novedades-styles', '/css/novedades.css');
    }
    loadNovedadesScripts() {
        this.loadScripts('menu-script', '/js/localStorage.js');
        this.loadScripts('obtenerUsuario-script', '/js/obtenerUsuario.js');
    }


    loadStyles(id, href) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    loadScripts(id, src) {
        // Verificar si el script ya está en el DOM


        // Eliminar el script existente si ya está en el DOM
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            document.body.removeChild(existingScript);
        }

        // Crear un nuevo script
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.onload = () => console.log(`Script ${src} cargado correctamente`);
        script.onerror = () => console.error(`Error al cargar el script ${src}`);
        document.body.appendChild(script);
    }

    loadFooter() {
        fetch('footer.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('footer-container').innerHTML = html;
                this.loadStyles('footer-styles', '/css/footer.css'); // Carga el CSS correcto
            })
            .catch(error => console.error('Error al cargar el footer:', error));
    }
    removeAllStyles() {
        ['login-styles', 'menu-styles', 'products-styles', 'ofertas-styles', 'combos-styles', 'novedades-styles', 'footer-styles'].forEach(id => {
            const link = document.getElementById(id);
            if (link) {
                document.head.removeChild(link);
            }
        });
    }
    removeAllScripts() {
        // Define un array con las URLs de los scripts que deseas eliminar
        const scriptSources = [
            '/js/carrito.js',
            '/js/searchbar.js',
            '/js/searchmarca.js',
            '/js/addrubro.js',
            '/js/obtenerUsuario.js',
        ];

        // Itera sobre cada fuente de script
        scriptSources.forEach(src => {
            // Encuentra todos los scripts con el src correspondiente
            const scripts = document.querySelectorAll(`script[src="${src}"]`);

            // Elimina cada script encontrado
            scripts.forEach(script => {
                script.parentNode.removeChild(script);
            });
        });
    }
    hideSidebarNavbar() {
        document.getElementById('sidebar-container').innerHTML = '';
        document.getElementById('navbar-container').innerHTML = '';
        document.getElementById('footer-container').innerHTML = '';
    }
    showSidebarNavbar() {
        fetch('sidebar.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('sidebar-container').innerHTML = html;
                sidebar.initLogout(); // Llama a initLogout después de cargar el sidebar
                sidebar.updateSidebarActiveLink(window.location.hash.replace('#', '') || '/');
                modificarSidebar();
                this.loadStyles('sidebar-styles', '/css/sidebar.css');
            });
        fetch('navbar.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('navbar-container').innerHTML = html;
                sidebar.initLogout(); // Llama a initLogout después de cargar el navbar
                nav();
            });
    }

    showSidebarNavbarProductos() {
        fetch('sidebar.html')
            .then(response => response.text())
            .then(html => {
                this.loadStyles('sidebar-styles', '/css/sidebar.css');
            });
        fetch('navbar.html')
            .then(response => response.text())
            .then(html => {
                nav();
                document.getElementById('navbar-container').innerHTML = html;
                sidebar.initLogout(); // Llama a initLogout después de cargar el navbar
            });
    }

    redirectToMenu() {
        window.location.hash = '#/menu';
        this.removeAllStyles();
    }
    initMenu() {
        // Lógica de inicialización del menu
    }
    initProducts() {
        // Lógica de inicialización de productos
    }

    initOfertas() {
        // Lógica de inicialización de ofertas
    }
    initCombos() {
        // Lógica de inicialización de combos
    }
    initNovedades() {
        // Lógica de inicialización de novedades
    }

}
// Inicializar el router
const router = new Router();
router.init();