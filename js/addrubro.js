(function () {
    const BASE_URL = window.API_BASE_URL; // Usa la URL base global
    const token = localStorage.getItem('token');
    const idUsuario = localStorage.getItem('idUsuario');
    let cambio = false; // Variable global para determinar si se debe mostrar la tabla o las tarjetas
    localStorage.setItem('cambio', JSON.stringify(cambio));

    const requestBody = {
        "idUsuario": idUsuario,
        "textoBuscador": "",
        "soloDisponible": false,
        "filtrosProductos": {
            "rubro": "",
            "subRu": "",
            "sCat1": "",
            "sCat2": "",
            "sCat3": "",
            "sCat4": "",
            "sCat5": "",
            "sCat6": "",
            "pageNumber": 1, // Página actual
            "pageSize": 50    // Tamaño de página
        }
    };
    //Llamado a la api con los produtos
    // Función para introducir un retraso
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchProductos(cambio) {
        try {
            // Aplicar un retraso de 200 ms antes de la solicitud
            const response = await fetch(`${BASE_URL}/Productos/ObtenerProductos`, {
                method: 'POST',
                mode: "cors", // Asegura que sea una solicitud CORS
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const data = await response.json();

            if (data && data.productos && Array.isArray(data.productos)) {
                container.innerHTML = ''; // Limpiar el contenedor de productos

                // Verificar si hay productos
                if (data.productos.length === 0) {
                    // Mostrar alerta con SweetAlert
                    Swal.fire({
                        icon: 'info',
                        title: 'Sin productos',
                        text: 'No se encontraron productos con los filtros seleccionados',
                        confirmButtonText: 'Aceptar',
                        timer: 3000
                    });
                } else {
                    cambio = JSON.parse(localStorage.getItem('cambio'));
                    if (cambio === true) {
                        // Mostrar tabla
                        const table = createProductTable(data.productos);
                        container.appendChild(table);
                        contarProductosVisibles(data.paginacion); // Agregar la tabla al contenedor
                    } else {
                        data.productos.forEach((producto) => {
                            // Mostrar tarjetas
                            crearProductoCard(producto);
                        });
                    }
                }

                contarProductosVisibles(data.paginacion); // Contar productos visibles si hay productos

                // Actualizar el objeto de paginación en requestBody con los datos recibidos
                requestBody.filtrosProductos.pageNumber = data.paginacion.currentPage;

                // Actualizar el paginador en la UI
                actualizarPaginador(data.paginacion);

                // Disparar el evento personalizado después de la inyección de productos
                const productosInyectadosEvent = new Event('productosInyectados');
                document.dispatchEvent(productosInyectadosEvent);
            } else {
                console.error("Error en los datos recibidos", data);
            }

            setTimeout(() => {
                // Recuperamos el filtro de precio de localStorage
                const order = localStorage.getItem('order');
                if (order) {
                    sortProducts(order); // Aplicar el filtro de ordenamiento
                }
                contarProductosVisibles(data.paginacion); // Contar los productos visibles
            }, 100); // Esperar 100 ms antes de aplicar el filtro de precio
        } catch (error) {
            console.error('Error al obtener productos:', error.message || error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error al obtener productos: ${error.message || error}`,
                confirmButtonText: 'Aceptar',
                timer: 10000
            });
        }
        debugger
        modificarSidebar();
    }

    //Paginador
    function actualizarPaginador(paginacion) {
        const paginationNumbers = document.getElementById('pagination-numbers');
        const prevPageButton = document.getElementById('prev-page');
        const nextPageButton = document.getElementById('next-page');

        paginationNumbers.innerHTML = ''; // Limpiar los números de paginación anteriores
        const totalPages = paginacion.totalPages;
        const currentPage = paginacion.currentPage;

        // Verificación para asegurarse de que `totalPages` y `currentPage` son válidos
        if (totalPages <= 0 || currentPage < 1) {
            prevPageButton.disabled = true;
            nextPageButton.disabled = true;
            const noResultsMessage = document.createElement('span');
            noResultsMessage.textContent = 'No hay productos disponibles.';
            paginationNumbers.appendChild(noResultsMessage);
            return;
        }

        const paginasAgregadas = new Set();

        if (totalPages === 1) {
            crearBotonPagina(1);
            prevPageButton.disabled = true;
            nextPageButton.disabled = true;
            return;
        }
        const mostrarAlrededorActual = 2;
        const mostrarPrimeras = 2;
        const mostrarUltimas = 2;
        function crearBotonPagina(pagina) {
            if (!paginasAgregadas.has(pagina)) {
                const pageNumberButton = document.createElement('button');
                pageNumberButton.className = 'pagination-number';
                pageNumberButton.textContent = pagina;
                if (pagina === currentPage) {
                    pageNumberButton.classList.add('active');
                }
                // Desplazamiento al hacer clic en el número de página
                pageNumberButton.addEventListener('click', async () => {
                    requestBody.filtrosProductos.pageNumber = pagina;
                    await fetchProductos(); // Esperar a que fetchProductos termine
                    setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazar al principio de la página
                    }, 100); // Retardo de 100 ms
                });

                paginationNumbers.appendChild(pageNumberButton);
                paginasAgregadas.add(pagina);
            }
        }
        for (let i = 1; i <= Math.min(mostrarPrimeras, totalPages); i++) {
            crearBotonPagina(i);
        }
        if (currentPage > mostrarPrimeras + mostrarAlrededorActual + 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationNumbers.appendChild(ellipsis);
        }
        const start = Math.max(currentPage - mostrarAlrededorActual, mostrarPrimeras + 1);
        const end = Math.min(currentPage + mostrarAlrededorActual, totalPages - mostrarUltimas);
        for (let i = start; i <= end; i++) {
            crearBotonPagina(i);
        }
        if (end < totalPages - mostrarUltimas) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationNumbers.appendChild(ellipsis);
        }
        for (let i = Math.max(totalPages - mostrarUltimas + 1, end + 1); i <= totalPages; i++) {
            crearBotonPagina(i);
        }
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
        prevPageButton.onclick = async () => {
            if (currentPage > 1) {
                requestBody.filtrosProductos.pageNumber = currentPage - 1;
                fetchProductos();
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
            }
        };
        nextPageButton.onclick = async () => {
            if (currentPage < totalPages) {
                requestBody.filtrosProductos.pageNumber = currentPage + 1;
                fetchProductos();
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
            }
        };
    }
    // Crear productos en modo Tabla
    function createProductTable(producto) {
        const eParam = JSON.parse(localStorage.getItem('sub'));

        const table = document.createElement('table');
        const container = document.querySelector('.container-items');
        table.classList.add('table'); // Añadir clase 'table' de Bootstrap
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.backgroundColor = '#f8f9fa'; // Fondo claro para la tabla

        if (container) {
            container.style.display = 'block';
        }
        const details = [
            { key: 'ficCodig', label: 'Código', field: 'codigo' },
            { key: 'ficDCort', label: 'Descripción Corta', field: 'descC' }, // Esta es la descripción que debe aparecer primero
            { key: 'ficCodBa', label: 'Código de Barras', field: 'codBarra' },
            { key: 'ficRubro', label: eParam.titRubro || 'Rubro', field: 'rubro' },
            { key: 'ficSubRu', label: eParam.titSubRu || 'SubRubro', field: 'subRubro' },
            { key: 'ficSCat1', label: eParam.titSCat1 || 'Marca', field: 'subCat1' }, // Cambiado a subCat1
            { key: 'ficSCat2', label: eParam.titSCat2 || 'SubMarca', field: 'subCat2' }, // Cambiado a subCat2
            { key: 'ficSCat3', label: eParam.titSCat3 || 'SubCategoria3', field: 'subCat3' }, // Cambiado a subCat3
            { key: 'ficSCat4', label: eParam.titSCat4 || 'SubCategoria4', field: 'subCat4' }, // Cambiado a subCat4
            { key: 'ficSCat5', label: eParam.titSCat5 || 'SubCategoria5', field: 'subCat5' }, // Cambiado a subCat5
            { key: 'ficSCat6', label: eParam.titSCat6 || 'SubCategoria6', field: 'subCat6' }, // Cambiado a subCat6
            { key: 'ficPNeto', label: 'Precio Neto', field: 'precioNeto' },
            { key: 'ficPFina', label: 'Precio Final', field: 'precioFinal' }
        ];


        // Crear <thead> con fondo oscuro y texto claro
        const thead = document.createElement('thead');
        thead.classList.add('thead-dark');
        thead.style.backgroundColor = '#343a40'; // Fondo oscuro
        thead.style.color = '#fff'; // Texto blanco

        const headerRow = document.createElement('tr');

        // Columna de Descripción
        const descripcionHeader = document.createElement('th');
        descripcionHeader.textContent = 'Descripcion';
        descripcionHeader.style.border = '1px solid #dee2e6';
        descripcionHeader.style.padding = '10px';
        descripcionHeader.setAttribute('scope', 'col');
        descripcionHeader.style.textAlign = 'center'; // Centrando texto
        headerRow.appendChild(descripcionHeader);
        details.forEach(detail => {
            if (eParam[detail.key] === 1) {
                const header = document.createElement('th');
                header.textContent = detail.label;
                header.style.border = '1px solid #dee2e6';
                header.style.padding = '10px';
                header.setAttribute('scope', 'col');
                header.style.textAlign = 'center'; // Centrando texto
                headerRow.appendChild(header);
            }
        });
        const accionesHeader = document.createElement('th');
        accionesHeader.textContent = 'Acciones';
        accionesHeader.style.border = '1px solid #dee2e6';
        accionesHeader.style.padding = '10px';
        accionesHeader.style.textAlign = 'center'; // Centrando texto
        accionesHeader.setAttribute('scope', 'col');
        headerRow.appendChild(accionesHeader);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        // Crear <tbody> con rayado alternado
        const tbody = document.createElement('tbody');
        producto.forEach((producto, index) => {
            const row = document.createElement('tr');
            row.className = `producto-${producto.codigo}`;

            // Aplicar zebra striping (color alternado en filas)
            if (index % 2 === 0) {
                row.style.backgroundColor = '#f2f2f2'; // Color claro para filas pares
            }
            // Celda de Descripción (ahora al inicio)
            const descripcionCell = document.createElement('td');
            descripcionCell.textContent = producto.descripcion || '';
            descripcionCell.classList.add('descripcion'); // Agregamos la clase 'descripcion'
            descripcionCell.style.border = '1px solid #dee2e6';
            descripcionCell.style.padding = '10px';
            descripcionCell.style.textAlign = 'center'; // Centrando texto
            row.appendChild(descripcionCell);
            details.forEach(detail => {
                if (eParam[detail.key] === 1) {
                    const cell = document.createElement('td');

                    if (detail.key === 'ficPFina') {
                        cell.classList.add('precio');
                    }

                    const value = producto[detail.field] !== null && producto[detail.field] !== undefined ? producto[detail.field] : '';
                    cell.textContent = value;
                    cell.style.border = '1px solid #dee2e6';
                    cell.style.padding = '10px';
                    cell.style.textAlign = 'center'; // Centrando texto
                    row.appendChild(cell);
                }
            });
            const accionesCell = document.createElement('td');
            accionesCell.style.textAlign = 'center'; // Centrando botones
            const buttonAddCart = document.createElement('button')
            buttonAddCart.className = 'fa fa-shopping-cart btn-add-cart';
            buttonAddCart.style.margin = '0 5px'; // Espaciado entre botones
            //accionesCell.appendChild(buttonAddCart); //Se oculta el boton de carrito
            const buttonInfo = document.createElement('button');
            buttonInfo.className = 'fa-solid fa-info';
            buttonInfo.id = `info-btn-${producto.codigo}`;
            buttonInfo.style.margin = '0 5px'; // Espaciado entre botones
            accionesCell.appendChild(buttonInfo);

            buttonInfo.addEventListener('click', function () {
                // Construimos la descripción corta
                const descripcion = producto.descC && producto.descC.trim() !== ''
                    ? producto.descC
                    : 'Este producto no tiene descripción disponible.';

                // Mostramos todo en SweetAlert
                Swal.fire({
                    title: 'Detalles del producto',
                    html: `
                        <p><strong>Descripción:</strong> ${descripcion}</p>
                        <p><strong>Código:</strong> ${producto.codigo || 'No disponible'}</p>
                        <p><strong>Código de Barras:</strong> ${producto.codBarra || 'No disponible'}</p>
                        <p><strong>Precio Neto:</strong> ${producto.precioNeto || 'No disponible'}</p>
                        <p><strong>Precio Final:</strong> ${producto.precioFinal || 'No disponible'}</p>
                    `,
                    icon: descripcion === 'Este producto no tiene descripción disponible.' ? 'warning' : 'info',
                    confirmButtonText: 'Cerrar',
                });
            });

            row.appendChild(accionesCell);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        return table;
    }
    // Crear productos en modo Card
    function crearProductoCard(producto) {
        const $btnExportar = document.querySelector("#btnExportar")
        $btnExportar.style.display = "block";
        const container = document.querySelector('.container-items');
        // Cambia el display de grid a block
        if (container) {
            container.style.display = 'grid';
        }
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        const imagenNoDisponible = 'https://www.italfren.com.ar/images/catalogo/imagen-no-disponible.jpeg';

        img.src = producto.urlImagen.length > 0 ? producto.urlImagen[0] : imagenNoDisponible;
        img.alt = producto.descripcion || 'Imagen del producto';
        figure.appendChild(img);

        // Mostrar imagen grande usando SweetAlert2
        img.onclick = function () {
            const imagenNoDisponible = 'https://www.italfren.com.ar/images/catalogo/imagen-no-disponible.jpeg'; // Imagen por defecto
            const imgCount = producto.urlImagen && producto.urlImagen.length > 0 ? producto.urlImagen.length : 1;
            let currentIndex = producto.urlImagen && producto.urlImagen.length > 0 ? producto.urlImagen.indexOf(img.src) : 0;

            function updateImage(index) {
                // Verificar si existe imagen en la URL y si no usar la imagen por defecto
                const imageUrl = producto.urlImagen && producto.urlImagen.length > 0
                    ? producto.urlImagen[index] || imagenNoDisponible  // Si el índice no existe, usa la imagen por defecto
                    : imagenNoDisponible;

                Swal.fire({
                    imageUrl: imageUrl,
                    imageWidth: 700,
                    imageHeight: 700,
                    imageAlt: 'Imagen del producto',
                    showConfirmButton: false,
                    showCloseButton: true,
                    didOpen: () => {
                        if (imgCount > 1) {
                            // Agregar flechas si hay más de una imagen
                            const container = Swal.getHtmlContainer().querySelector('.swal2-image');

                            if (!container) {
                                Swal.getHtmlContainer().insertAdjacentHTML('beforeend', '<div class="swal2-image"></div>');
                            }

                            const imageContainer = Swal.getHtmlContainer().querySelector('.swal2-image');
                            imageContainer.innerHTML = ''; // Limpiar el contenido antes de agregar las flechas

                            const prevButton = document.createElement('button');
                            prevButton.className = 'swal2-prev-button';
                            prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
                            prevButton.onclick = () => {
                                currentIndex = (currentIndex - 1 + imgCount) % imgCount;
                                updateImage(currentIndex); // Actualizar imagen y mantener modal abierto
                            };

                            const nextButton = document.createElement('button');
                            nextButton.className = 'swal2-next-button';
                            nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
                            nextButton.onclick = () => {
                                currentIndex = (currentIndex + 1) % imgCount;
                                updateImage(currentIndex); // Actualizar imagen y mantener modal abierto
                            };

                            imageContainer.appendChild(prevButton);
                            imageContainer.appendChild(nextButton);
                        }
                    }
                });
            }

            updateImage(currentIndex); // Inicializar la imagen y las flechas
        };
        if (producto.urlImagen.length > 1) {
            const sliderDiv = document.createElement('div');
            sliderDiv.className = 'image-slider';
            const imgCount = producto.urlImagen.length;
            let currentIndex = 0;
            const sliderPrev = document.createElement('button');
            sliderPrev.innerHTML = '<i class="fas fa-chevron-left"></i>';
            sliderPrev.className = 'slider-button';
            sliderPrev.onclick = function () {
                currentIndex = (currentIndex - 1 + imgCount) % imgCount;
                img.src = producto.urlImagen[currentIndex];
            };
            const sliderNext = document.createElement('button');
            sliderNext.innerHTML = '<i class="fas fa-chevron-right"></i>';
            sliderNext.className = 'slider-button';
            sliderNext.onclick = function () {
                currentIndex = (currentIndex + 1) % imgCount;
                img.src = producto.urlImagen[currentIndex];
            };
            sliderDiv.appendChild(sliderPrev);
            sliderDiv.appendChild(sliderNext);
            figure.appendChild(sliderDiv);
        }
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info-product';
        const h2 = document.createElement('h2');
        h2.textContent = producto.descripcion;
        // Ajustar el tamaño de la fuente si la descripción es mayor a 30 caracteres
        if (producto.descripcion.length > 40) {
            h2.style.fontSize = '1.2rem';
        }
        if (producto.descripcion.length > 80) {
            h2.style.fontSize = '0.8rem';
        }
        infoDiv.appendChild(h2);
        const eParam = JSON.parse(localStorage.getItem('sub'));
        const details = [
            { key: 'ficCodig', label: 'Código', value: producto.codigo, icon: 'fa-barcode' },
            { key: 'ficDCort', label: 'Descripción Corta', value: producto.descC, icon: 'fa-file-alt' },
            { key: 'ficCodBa', label: 'Código de Barras', value: producto.codBarra, icon: 'fa-barcode' },
            { key: 'ficRubro', label: eParam.titRubro || 'Rubro', value: producto.rubro, icon: 'fa-list' },
            { key: 'ficSubRu', label: eParam.titSubRu || 'SubRubro', value: producto.subRubro, icon: 'fa-table-list' },
            { key: 'ficSCat1', label: eParam.titSCat1 || 'Marca', value: producto.subCat1, icon: 'fa-copyright' },  // Aquí cambiamos a subCat1
            { key: 'ficSCat2', label: eParam.titSCat2 || 'SubMarca', value: producto.subCat2, icon: 'fa-copyright' }, // Cambiado a subCat2
            { key: 'ficSCat3', label: eParam.titSCat3 || 'SubCategoria3', value: producto.subCat3, icon: 'fa-table-list' }, // Cambiado a subCat3
            { key: 'ficSCat4', label: eParam.titSCat4 || 'SubCategoria4', value: producto.subCat4, icon: 'fa-table-list' }, // Cambiado a subCat4
            { key: 'ficSCat5', label: eParam.titSCat5 || 'SubCategoria5', value: producto.subCat5, icon: 'fa-table-list' }, // Cambiado a subCat5
            { key: 'ficSCat6', label: eParam.titSCat6 || 'SubCategoria6', value: producto.subCat6, icon: 'fa-table-list' }, // Cambiado a subCat6
            { key: 'ficPNeto', label: 'Precio Neto', value: producto.precioNeto + '$ + IVA ', icon: 'fa-dollar-sign' },
            { key: 'ficPFina', label: 'Precio Final', value: producto.precioFinal + '$', icon: 'fa-dollar-sign precio' }
        ];
        details.forEach(detail => {
            if (eParam[detail.key] === 1) { // Verificar que el parámetro esté habilitado (1)
                const p = document.createElement('p');

                // Si el valor es null o undefined, mostrar "No tiene", de lo contrario mostrar el valor real
                const text = detail.value !== null && detail.value !== undefined ? `${detail.value}` : "No tiene";

                p.appendChild(document.createTextNode(text));
                infoDiv.appendChild(p);
            }
        });
        const footerDiv = document.createElement('div');
        footerDiv.className = 'footer-product';
        const buttonAddCart = document.createElement('button');
        buttonAddCart.className = 'fa fa-shopping-cart btn-add-cart';
        //footerDiv.appendChild(buttonAddCart); // ACA SE OCULTA EL BOTON CARRITO
        const buttonInfo = document.createElement('button');
        buttonInfo.className = 'fa-solid fa-info';
        buttonInfo.id = `info-btn-${producto.codigo}`;
        footerDiv.appendChild(buttonInfo);
        infoDiv.appendChild(footerDiv);
        const modal = document.createElement('div');
        modal.id = `infoModal${producto.codigo}`;
        modal.className = 'modal';
        modal.style.display = 'none';
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content1';
        const spanClose = document.createElement('span');
        spanClose.className = 'close';
        spanClose.textContent = '×';
        spanClose.onclick = function () { modal.style.display = 'none'; };
        const pDescription = document.createElement('p');
        pDescription.id = `productDescription-${producto.codigo}`;
        pDescription.textContent = producto.descC || ''; //El producto no tiene descripcion
        modalContent.appendChild(spanClose);
        modalContent.appendChild(pDescription);
        modal.appendChild(modalContent);
        buttonInfo.addEventListener('click', function () {
            // Construimos la descripción corta
            const descripcion = producto.descC && producto.descC.trim() !== ''
                ? producto.descC
                : 'Este producto no tiene descripción disponible.';
            // Mostramos todo en SweetAlert
            Swal.fire({
                title: 'Descripción del producto',
                html: `
                    <p><strong>Descripción:</strong> ${descripcion}</p>
                    <p><strong>Código:</strong> ${producto.codigo || 'No disponible'}</p>
                    <p><strong>Código de Barras:</strong> ${producto.codBarra || 'No disponible'}</p>
                    <p><strong>Precio Neto:</strong> ${producto.precioNeto || 'No disponible'}</p>
                    <p><strong>Precio Final:</strong> ${producto.precioFinal || 'No disponible'}</p>
                `,
                icon: descripcion === 'Este producto no tiene descripción disponible.' ? 'warning' : 'info',
                confirmButtonText: 'Cerrar',
            });
        });
        itemDiv.appendChild(figure);
        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(modal);
        container.appendChild(itemDiv);
        function showModal(modal, description) {
            const descriptionText = modal.querySelector('p');
            descriptionText.textContent = description;
            modal.style.display = 'block';

            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            };
        }

    }
    // Filtrar productos con stock
    const filterSoloConStock = document.getElementById('filter-solo-con-stock');
    const container = document.querySelector('.container-items');

    filterSoloConStock.addEventListener('click', () => {
        container.innerHTML = '';
        requestBody.soloDisponible = !requestBody.soloDisponible; // Cambiar el valor de soloDisponible
        filterSoloConStock.classList.toggle('filter-active');
        requestBody.filtrosProductos.pageNumber = 1; // Reiniciar la paginación

        // Llamar a la API con el nuevo filtro
        fetchProductos(); // No necesita devolver Promise

    });
    // Filtrar productos por precio, código o descripción
    // Recuperar eParam del localStorage
    const sub = JSON.parse(localStorage.getItem('sub')); // Obtenemos el objeto completo
    const eParam = sub || {}; // Aseguramos que eParam esté presente
    // Mostrar filtros según los parámetros de la API
    const showPriceFilters = eParam.ficPFina !== 0; // Mostrar filtros de precio si ficPFina es diferente de 0
    const showCodeFilters = eParam.ficCodig !== 0; // Mostrar filtros de código si ficCodig es diferente de 0
    const showDescriptionFilters = eParam.ficDesc !== 0; // Mostrar filtros de descripción si ficDesc es diferente de 0;
    // Mostrar los selects solo si el filtro está disponible
    document.getElementById('filter-price').parentElement.style.display = showPriceFilters ? 'block' : 'none';
    document.getElementById('filter-code').parentElement.style.display = showCodeFilters ? 'block' : 'none';
    document.getElementById('filter-description').parentElement.style.display = showDescriptionFilters ? 'block' : 'none';
    const filterContainer = document.querySelector('.filter-container');
    filterContainer.style.display = 'none'; // Ocultar el contenedor de filtros inicialmente
    // Evento para mostrar u ocultar los filtros cuando se presiona el botón de filtros
    document.getElementById('filter-button').addEventListener('click', function () {
        // Alternar entre display: none y display: flex
        if (filterContainer.style.display === 'none') {
            filterContainer.style.display = 'none'; // Mostrar los filtros
        } else {
            filterContainer.style.display = 'none'; // Ocultar los filtros y eliminar el espacio que ocupaban
        }
    });
    // Función para ordenar productos
    function sortProducts(order, type = 'price') {
        const container = document.querySelector('.container-items');
        let items;

        if (cambio === false) {
            // Obtener los items de la vista de tarjetas
            items = Array.from(container.querySelectorAll('.item'));
        } else {
            // Obtener los items de la vista de tabla
            items = Array.from(container.querySelectorAll('tbody tr')); // Selecciona las filas de la tabla
        }

        // Obtener precio
        const getPrice = (item) => {
            if (cambio === false) {
                const priceMatch = item.innerText.match(/Precio Final:\s*([\d.,]+)/);
                return priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
            } else {
                const priceCell = item.querySelector('.precio');
                return priceCell ? parseFloat(priceCell.innerText.replace(/,/g, '')) : 0;
            }
        };

        // Obtener código
        const getCode = (item) => {
            if (cambio === false) {
                const codeMatch = item.innerText.match(/Código:\s*(\d+)/);
                return codeMatch ? parseInt(codeMatch[1]) : 0;
            } else {
                const codeCell = item.querySelector('.codigo');
                return codeCell ? parseInt(codeCell.innerText) : 0;
            }
        };

        // Obtener longitud de descripción
        const getDescriptionLength = (item) => {
            if (cambio === false) {
                const h2Element = item.querySelector('h2');
                return h2Element ? h2Element.innerText.length : 0;
            } else {
                const descCell = item.querySelector('.descripcion');
                return descCell ? descCell.innerText.length : 0;
            }
        };

        // Ordenar los productos según el tipo de filtro
        items.sort((a, b) => {
            let valueA, valueB;

            if (type === 'price') {
                valueA = getPrice(a);
                valueB = getPrice(b);
            } else if (type === 'code') {
                valueA = getCode(a);
                valueB = getCode(b);
            } else if (type === 'description') {
                valueA = getDescriptionLength(a);
                valueB = getDescriptionLength(b);
            }

            if (order === 'asc') {
                return valueA - valueB;
            } else if (order === 'desc') {
                return valueB - valueA;
            } else {
                return Math.random() - 0.5; // Orden aleatorio
            }
        });

        // Vista de tabla o tarjetas
        if (cambio === true) {
            const table = container.querySelector('table');
            const tableBody = container.querySelector('tbody');
            tableBody.innerHTML = ''; // Limpiar solo el tbody antes de reinserir las filas ordenadas
            items.forEach(item => tableBody.appendChild(item));
        } else {
            container.innerHTML = ''; // Limpiar contenedor para vista de tarjetas
            items.forEach(item => container.appendChild(item));
        }
    }
    // Eventos para el select de precio
    document.getElementById('filter-price').addEventListener('change', function () {
        const order = this.value === 'price-asc' ? 'asc' : this.value === 'price-desc' ? 'desc' : 'random';
        localStorage.setItem('order', order);
        sortProducts(order, 'price');
    });
    // Eventos para el select de código
    document.getElementById('filter-code').addEventListener('change', function () {
        const order = this.value === 'code-asc' ? 'asc' : this.value === 'code-desc' ? 'desc' : 'random';
        localStorage.setItem('order', order);
        sortProducts(order, 'code');
    });
    // Eventos para el select de descripción
    document.getElementById('filter-description').addEventListener('change', function () {
        const order = this.value === 'description-short' ? 'asc' : 'desc';
        localStorage.setItem('order', order);
        sortProducts(order, 'description');
    });
    // Contador
    function contarProductosVisibles(data) {
        // Obtener el total de productos del objeto data
        const totalCount = data.totalCount;

        // Actualizar el contador de productos
        const productCount = document.getElementById('product-count');
        productCount.textContent = `${totalCount} productos`;
    }
    // Actualizar el textoBuscador cuando el usuario presiona Enter
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            requestBody.textoBuscador = searchInput.value;
            container.innerHTML = ''; // Limpiar los productos actuales
            requestBody.filtrosProductos.pageNumber = 1; // Reiniciar la paginación
            delay(20).then(() => {
                fetchProductos(); // Llamar a la API con el nuevo texto de búsqueda                
            })

        }
    });
    const searchButton = document.getElementById('search-button');

    // Evento para cuando se presiona Enter en el input
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            ejecutarBusqueda();
        }
    });

    // Evento para cuando se hace clic en el botón de la lupa
    searchButton.addEventListener('click', ejecutarBusqueda);

    // Función que realiza la búsqueda
    function ejecutarBusqueda() {
        requestBody.textoBuscador = searchInput.value;
        container.innerHTML = ''; // Limpiar los productos actuales
        requestBody.filtrosProductos.pageNumber = 1; // Reiniciar la paginación
        fetchProductos(); // Llamar a la API con el nuevo texto de búsqueda
    }
    // Invertir el valor de `cambio` para alternar entre tabla y tarjetas
    document.getElementById('grid-button').addEventListener('click', () => {
        // Invertir el valor de `cambio` para alternar entre tabla y tarjetas
        const $btnExportar = document.querySelector("#btnExportar")
        const button = document.getElementById('grid-button');
        if (cambio == true) {
            cambio = false;
            localStorage.setItem('cambio', JSON.stringify(cambio));
            fetchProductos(cambio);
            button.classList.remove('active');
            $btnExportar.style.display = "none";
            // Mantener el filtrado de precios

        }
        else {
            button.classList.add('active');
            cambio = true;
            localStorage.setItem('cambio', JSON.stringify(cambio));
            fetchProductos(cambio);
            $btnExportar.style.display = "block";
            // Mantener el filtrado de precios

        }
    });
    // FUNCION DE EXCEL
    const $btnExportar = document.querySelector("#btnExportar");
    $btnExportar.addEventListener("click", function () {
        fetchProductosParaExportar(); // Llamamos a la función que obtiene los productos desde la API
    });
    function fetchProductosParaExportar() {
        // Configurar el requestBody para obtener todos los productos
        const BASE_URL = window.API_BASE_URL; // Obtiene la URL base global
        const token = localStorage.getItem('token');
        const eParam = JSON.parse(localStorage.getItem('sub'));
        requestBody.filtrosProductos.pageSize = 0;
        requestBody.filtrosProductos.currentPage = 1;
        fetch(`${BASE_URL}/Productos/ObtenerProductos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(data => {
                if (data && data.productos && Array.isArray(data.productos)) {
                    const aoaData = productosToArray(data.productos, eParam); // Convertir productos a formato array de arrays
                } else {
                    console.error("Error en los datos recibidos", data);
                }
            })
            .catch(error => {
                console.error('Error al obtener productos:', error.message || error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Error al obtener productos: ${error.message || error}`,
                    confirmButtonText: 'Aceptar',
                    timer: 10000
                });
            })

            .finally(() => {
                // Restaurar el valor de pageSize a 50 después de la llamada
                requestBody.filtrosProductos.pageSize = 50;
                requestBody.filtrosProductos.currentPage = 1;
            });
    }

    // Función para convertir los productos en un array de arrays
    function productosToArray(productos, eParam) {

        const aoaData = [[]]; // Inicializamos con un array vacío para los encabezados

        // Agregar encabezados dinámicamente según el valor de eParam
        if (eParam.ficDescr) aoaData[0].push("Descripción");
        if (eParam.ficCodig) aoaData[0].push("Código");
        if (eParam.ficCodBa) aoaData[0].push("Código de Barras");
        // Agregar más encabezados según eParam
        if (eParam.ficRubro) aoaData[0].push(eParam.titRubro); // Rubro
        if (eParam.ficSubRu) aoaData[0].push(eParam.titSubRu); // SubRubro
        if (eParam.ficSCat1) aoaData[0].push(eParam.titSCat1); // Marca
        if (eParam.ficSCat2) aoaData[0].push(eParam.titSCat2); // SubMarca
        if (eParam.ficSCat3) aoaData[0].push(eParam.titSCat3); // SubCategoria3
        if (eParam.ficSCat4) aoaData[0].push(eParam.titSCat4); // SubCategoria4
        if (eParam.ficSCat5) aoaData[0].push(eParam.titSCat5); // SubCategoria5
        if (eParam.ficSCat6) aoaData[0].push(eParam.titSCat6); // SubCategoria6
        // Precios
        if (eParam.ficPNeto) aoaData[0].push("Precio Neto");
        if (eParam.ficPFina) aoaData[0].push("Precio Final");
        // Agregar los productos con las propiedades correctas
        productos.forEach(producto => {
            const row = [];
            // Agregar los datos de los productos dinámicamente según eParam
            if (eParam.ficDescr) row.push(producto.descripcion || "");
            if (eParam.ficCodig) row.push(producto.codigo || "");
            if (eParam.ficCodBa) row.push(producto.codBarra || "");
            if (eParam.ficRubro) row.push(producto.rubro || "");
            if (eParam.ficSubRu) row.push(producto.subRubro || "");
            if (eParam.ficSCat1) row.push(producto.subCat1 || "");
            if (eParam.ficSCat2) row.push(producto.subCat2 || "");
            if (eParam.ficSCat3) row.push(producto.subCat3 || "");
            if (eParam.ficSCat4) row.push(producto.subCat4 || "");
            if (eParam.ficSCat5) row.push(producto.subCat5 || "");
            if (eParam.ficSCat6) row.push(producto.subCat6 || "");
            if (eParam.ficPNeto) row.push(producto.precioNeto || "");
            if (eParam.ficPFina) row.push(producto.precioFinal || "");
            // Añadir la fila al conjunto de datos
            if (row.length > 0) {
                aoaData.push(row);
            }
        });

        if (aoaData.length > 1) { // Verifica que haya encabezados y al menos una fila de datos
            generarExcel(aoaData, eParam);
        } else {
            console.error('No hay datos para exportar');
        }
    }
    // Función  para generar el archivo Excel
    function generarExcel(aoaData, eParam) {
        let wb = XLSX.utils.book_new();
        let ws = XLSX.utils.aoa_to_sheet(aoaData);
        // Añadir la hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, "Reporte de Productos");
        // Crear las columnas dinámicamente según las activadas en eParam
        let columnWidths = [
            { wch: 40 },  // Descripción
            { wch: 35 },  // Código
            { wch: 30 }   // Código de Barras
        ];
        if (eParam.ficRubro) columnWidths.push({ wch: 25 }); // Rubro
        if (eParam.ficSubRu) columnWidths.push({ wch: 25 }); // SubRubro
        if (eParam.ficSCat1) columnWidths.push({ wch: 15 }); // Marca
        if (eParam.ficSCat2) columnWidths.push({ wch: 20 }); // SubMarca
        if (eParam.ficSCat3) columnWidths.push({ wch: 15 }); // SubCategoria3
        if (eParam.ficSCat4) columnWidths.push({ wch: 15 }); // SubCategoria4
        if (eParam.ficSCat5) columnWidths.push({ wch: 15 }); // SubCategoria5
        if (eParam.ficSCat6) columnWidths.push({ wch: 15 }); // SubCategoria6
        // Ancho para los precios
        columnWidths.push({ wch: 15 });  // Precio Neto
        columnWidths.push({ wch: 15 });  // Precio Final
        // Asignar los anchos a las columnas
        ws["!cols"] = columnWidths;
        // Generar el archivo Excel
        let wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
        // Convertir a formato binario
        function s2ab(s) {
            let buf = new ArrayBuffer(s.length);
            let view = new Uint8Array(buf);
            for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        // Guardar el archivo usando FileSaver
        saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), "Reporte de Productos.xlsx");

        return
    }
    // Selects Aside
    async function modificarSidebar() {

        const sidebarWrapper = document.querySelector('.sidebar-wrapper .nav');

        if (sidebarWrapper) {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No se encontró el token en el Local Storage.');
                return;
            }
            try {

                await delay(20); // Esperar 2 milisegundos

                const response = await fetch(`${BASE_URL}/Productos/ObtenerProductos`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    mode: "cors",
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    throw new Error('Error en la solicitud a la API.');
                }

                const data = await response.json();
                const eParam = JSON.parse(localStorage.getItem('sub'));
                if (eParam) {
                    const itemsToRemove = sidebarWrapper.querySelectorAll('li');

                    // Iterar sobre los <li> y eliminar solo los que contengan un <select>
                    itemsToRemove.forEach(item => {
                        if (item.querySelector('select')) {
                            item.remove(); // Eliminar el <li> si tiene un <select>
                        }
                    });
                    const elementos = [
                        { titulo: eParam.titRubro, flag: eParam.filRubro, key: 'rubro', opciones: data.filtrosAdic.rubros },
                        { titulo: eParam.titSubRu, flag: eParam.filSubRu, key: 'subRu', opciones: data.filtrosAdic.subRubros },
                        { titulo: eParam.titSCat1, flag: eParam.filSCat1, key: 'sCat1', opciones: data.filtrosAdic.catUser1 },
                        { titulo: eParam.titSCat2, flag: eParam.filSCat2, key: 'sCat2', opciones: data.filtrosAdic.catUser2 },
                        { titulo: eParam.titSCat3, flag: eParam.filSCat3, key: 'sCat3', opciones: data.filtrosAdic.catUser3 },
                        { titulo: eParam.titSCat4, flag: eParam.filSCat4, key: 'sCat4', opciones: data.filtrosAdic.catUser4 },
                        { titulo: eParam.titSCat5, flag: eParam.filSCat5, key: 'sCat5', opciones: data.filtrosAdic.catUser5 },
                        { titulo: eParam.titSCat6, flag: eParam.filSCat6, key: 'sCat6', opciones: data.filtrosAdic.catUser6 },
                    ];

                    elementos.forEach(elemento => {
                        if (elemento.flag === 1) {
                            // Crear nuevo elemento <li> y contenido para sidebarWrapper
                            const item = document.createElement('li');
                            let selectHTML = `<label>${elemento.titulo}</label><select data-key="${elemento.key}">`;

                            elemento.opciones.forEach(opcion => {
                                const selected = requestBody.filtrosProductos[elemento.key] === opcion.descripcion ? 'selected' : '';
                                selectHTML += `<option value="${opcion.descripcion}" ${selected}>${opcion.descripcion}</option>`;
                            });

                            selectHTML += '</select>';
                            item.innerHTML = selectHTML;

                            // Agregar el elemento al sidebarWrapper
                            sidebarWrapper.appendChild(item);

                            // Crear nuevo elemento para navbar-links
                            const navbarItem = document.createElement('li');
                            navbarItem.innerHTML = selectHTML; // Usar el mismo HTML del select
                            navbarItem.classList.add('enlace');

                            // Agregar al contenedor navbar-links
                            const navbarLinks = document.getElementById('navbar-links');
                            if (navbarLinks) {
                                navbarLinks.appendChild(navbarItem);
                            }

                            // Agregar listeners de cambio a ambos selects (sidebar y navbar)
                            addChangeListener(item.querySelector('select'));
                            addChangeListener(navbarItem.querySelector('select'));
                        }
                    });
                }

                const closeBtn = document.getElementById('close-navigation');
                const navigation = document.getElementById('navigation');
                const navbarLinks = document.getElementById('navbar-links');

                if (closeBtn && navigation) {
                    closeBtn.addEventListener('click', () => {
                        navigation.classList.remove('show');
                    });
                }

                // Limpia el menú de la barra de navegación para evitar duplicados
                while (navbarLinks.firstChild) {
                    navbarLinks.removeChild(navbarLinks.firstChild);
                }

                // Copia los elementos del menú lateral al menú de hamburguesa y registra listeners
                const sidebarMenuItems = document.querySelectorAll('.sidebar-wrapper .nav li');
                sidebarMenuItems.forEach(item => {
                    const clonedItem = item.cloneNode(true);
                    clonedItem.classList.add('enlace'); // Asegura que cada ítem clonado tenga la clase 'enlace'
                    addChangeListener(clonedItem.querySelector('select'));
                    navbarLinks.appendChild(clonedItem);
                });

                updateSidebarActiveLink(window.location.hash);
            } catch (error) {
                console.error('Error al obtener los datos de la API:', error);
            }
        }
    }

    // Función para añadir el evento de cambio en los selects
    function addChangeListener(selectElement) {

        if (selectElement) {
            selectElement.addEventListener('change', (event) => {
                const selectedValue = event.target.value.trim();
                const filtroKey = event.target.getAttribute('data-key');
                if (selectedValue === 'TODOS') {
                    requestBody.filtrosProductos[filtroKey] = "";
                } else {
                    requestBody.filtrosProductos[filtroKey] = selectedValue;
                }
                fetchProductos();
            });
        }
    }

    function updateSidebarActiveLink(path) {
        const navItems = document.querySelectorAll('.sidebar-wrapper .nav li, #navbar-links li');
        navItems.forEach(item => {
            const anchor = item.querySelector('a');
            if (anchor && anchor.getAttribute('href') === path) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    // Inicializar carga de productos
    fetchProductos();
    // Boton Up
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    window.addEventListener("scroll", () => {
        // Mostrar el botón cuando el usuario haga scroll hacia abajo
        if (window.scrollY > 200) {
            scrollToTopBtn.classList.add("show");
        } else {
            scrollToTopBtn.classList.remove("show");
        }
    });

    scrollToTopBtn.addEventListener("click", () => {
        // Animación suave para volver al principio de la página
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // Función para introducir un retraso
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})();

