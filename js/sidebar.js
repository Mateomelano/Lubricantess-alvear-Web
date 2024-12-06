// sidebar.js

export function initLogout() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authenticated');
            window.location.hash = '#/';

        });
    }
}


window.addEventListener('hashchange', () => {
    updateSidebarActiveLink(window.location.hash);
});


export function updateSidebarActiveLink(path) {
    const navItems = document.querySelectorAll('.sidebar-wrapper .nav li');
    navItems.forEach(item => {
        const anchor = item.querySelector('a');
        if (anchor && anchor.getAttribute('href') === path) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

export function modificarSidebar() {

    const sidebarWrapper = document.querySelector('.sidebar-wrapper .nav');

    if (sidebarWrapper) {
        // Primero, agregar los enlaces predeterminados que siempre estarán presentes
        const enlacesFijos = [
            { titulo: 'Menu', url: '#/menu', icono: 'fa-solid fa-bars', activo: false },
            { titulo: 'Productos', url: '#/productos', icono: 'fa-solid fa-box-open', activo: false },
            //Ocultar las ofertas combos y novedades.
            //{ titulo: 'Ofertas', url: '#/ofertas', icono: 'fa-solid fa-tags', activo: false },
            //{ titulo: 'Combos', url: '#/combos', icono: 'fa-solid fa-layer-group', activo: false },
            //{ titulo: 'Novedades', url: '#/novedades', icono: 'fa-solid fa-star', activo: false },
        ];

        // Añadir los enlaces fijos a la barra lateral
        enlacesFijos.forEach(enlace => {
            const item = document.createElement('li');
            item.innerHTML = `
                <a href="${enlace.url}">
                    <i class="${enlace.icono}"></i>
                    <p>${enlace.titulo}</p>
                </a>
            `;
            sidebarWrapper.appendChild(item);
        });

        // Llamar a la función para actualizar el enlace activo al cargar la página
        updateSidebarActiveLink(window.location.hash);
    }
}

export function nav() {

    const navbarLinks = document.getElementById('navbar-links');
    if (!navbarLinks) {
        console.error('El elemento navbar-links no se encontró en el DOM.');
        return;
    }

    const currentUrl = window.location.hash; // Obtiene la URL actual (hash)

    // Enlaces predeterminados con iconos específicos
    const enlacesPredeterminados = [
        { titulo: 'Menú', url: '#/menu', icono: 'nc-icon nc-layout-11' },
        { titulo: 'Productos', url: '#/productos', icono: 'nc-icon nc-box' },
        //Ocultar las ofertas combos y novedades
        //{ titulo: 'Ofertas', url: '#/ofertas', icono: 'nc-icon nc-tag-content' },
        //{ titulo: 'Combos', url: '#/combos', icono: 'nc-icon nc-basket' },
        //{ titulo: 'Novedades', url: '#/novedades', icono: 'nc-icon nc-bell-55' }
    ];

    // Cargar los enlaces predeterminados con su clase y icono
    enlacesPredeterminados.forEach(enlace => {
        const item = document.createElement('li');
        item.classList.add('enlace'); // Agregar la clase "enlace"
        item.innerHTML = `
            <a href="${enlace.url}" class="${currentUrl === enlace.url ? 'active' : ''}">
                <i class="${enlace.icono}"></i>
                <p>${enlace.titulo}</p>
            </a>
        `;
        navbarLinks.appendChild(item);
    });

    // Obtener el objeto 'sub' del Local Storage y convertirlo a un objeto JSON
    const eParam = JSON.parse(localStorage.getItem('sub'));

    if (eParam) {
        const elementos = [
            //{ titulo: eParam.titRubro, flag: eParam.filRubro, url: '#/rubros', icono: 'nc-icon nc-single-copy-04' },
            //{ titulo: eParam.titSubRu, flag: eParam.filSubRu, url: '#/subrubro', icono: 'nc-icon nc-bullet-list-67' },
            //{ titulo: eParam.titSCat1, flag: eParam.filSCat1, url: '#/marcas', icono: 'nc-icon nc-diamond' },
            //{ titulo: eParam.titSCat2, flag: eParam.filSCat2, url: '#/submarca', icono: 'nc-icon nc-tag-content' },
            //{ titulo: eParam.titSCat3, flag: eParam.filSCat3, url: '#/subcategoria3', icono: 'nc-icon nc-box-2' },
            //{ titulo: eParam.titSCat4, flag: eParam.filSCat4, url: '#/subcategoria4', icono: 'nc-icon nc-bullet-list-67' },
            //{ titulo: eParam.titSCat5, flag: eParam.filSCat5, url: '#/subcategoria5', icono: 'nc-icon nc-app' },
            //{ titulo: eParam.titSCat6, flag: eParam.filSCat6, url: '#/subcategoria6', icono: 'nc-icon nc-briefcase-24' }
        ];

        elementos.forEach(elemento => {
            if (elemento.flag === 1) {
                const item = document.createElement('li');
                item.classList.add('enlace');
                item.innerHTML = `
                    <label>${elemento.titulo}</label>
                    <select>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                `;
                navbarLinks.appendChild(item);
            }
        });
    } else {
        console.error('No se encontraron datos en Local Storage.');
    }

    document.getElementById('close-navigation').addEventListener('click', function () {
        const navbarCollapse = document.getElementById('navigation');
        if (navbarCollapse.classList.contains('show')) {
            navbarCollapse.classList.remove('show');
        }
    });
    document.addEventListener('DOMContentLoaded', () => {
        const closeBtn = document.getElementById('close-navigation');
        const navigation = document.getElementById('navigation');
        
        if (closeBtn && navigation) {
            closeBtn.addEventListener('click', () => {
                // Colapsar el menú hamburguesa quitando la clase `show`
                navigation.classList.remove('show');
    
                // Opcional: Si tu menú usa un `data-` o cualquier otro control de estado, ajusta aquí
                // Ejemplo: navigation.style.display = 'none';
            });
        }
    });
    
}


