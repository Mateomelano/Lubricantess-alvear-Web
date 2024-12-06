(function () {
  const token = localStorage.getItem('token');
  const BASE_URL = window.API_BASE_URL;
  const idUsuario = localStorage.getItem('idUsuario');

  // Cuerpo de la petición
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
      "pageNumber": 1,
      "pageSize": 8 // Mostramos 8 productos destacados
    }
  };

  // Función para cargar los productos destacados
  async function cargarProductosDestacados() {
    try {
      const response = await fetch(`${BASE_URL}/Productos/ObtenerProductos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();

      // Verificar que la respuesta contenga productos
      if (data && data.productos && Array.isArray(data.productos)) {
        const productosContainer = document.getElementById('productosDestacados');
        productosContainer.innerHTML = ''; // Limpiar contenido previo

        if (data.productos.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin productos',
            text: 'No se encontraron productos con los filtros seleccionados',
            confirmButtonText: 'Aceptar',
            timer: 3000
          });
        } else {
          data.productos.forEach((producto) => {
            // Llama a una función para crear la tarjeta del producto
            crearProductoCard(producto);
          });
        }
      } else {
        console.error('La respuesta de la API no contiene productos válidos:', data);
      }
    } catch (error) {
      console.error('Hubo un error al cargar los productos:', error);
    }
  }

  // Función para crear la tarjeta de cada producto
  function crearProductoCard(producto) {

    // Usar la imagen del producto o una por defecto
    const imagen = producto.urlImagen.length > 0
      ? producto.urlImagen[0]
      : 'https://www.italfren.com.ar/images/catalogo/imagen-no-disponible.jpeg';

    // Comprobar si la descripción corta está disponible
    const descripcion = producto.descC && producto.descC.trim() !== ''
      ? producto.descC
      : 'Este producto no tiene descripción disponible.';

    // Crear la tarjeta del producto
    const productoHTML = `
        <div class="col-md-3 producto">
            <img src="${imagen}" alt="${producto.descripcion}">
            <h3>${producto.descripcion}</h3>
            <p>Precio: $${producto.precioFinal}</p>
            <button class="btn-info" 
                data-descripcion="${producto.descripcion}" 
                data-codigo="${producto.codigo}" 
                data-descC="${descripcion}" 
                data-codBarra="${producto.codBarra}" 
                data-precioNeto="${producto.precioNeto}" 
                data-precioFinal="${producto.precioFinal}" 
                data-rubro="${producto.rubro}" 
                data-subRubro="${producto.subRubro}">
                Info
            </button>
        </div>
    `;

    // Agregar el producto al contenedor
    const productosContainer = document.getElementById('productosDestacados');
    productosContainer.innerHTML += productoHTML;

    // Delegar el evento click en el contenedor
    productosContainer.addEventListener('click', function (e) {
      if (e.target && e.target.classList.contains('btn-info')) {
        const button = e.target;

        // Obtener todos los datos del producto desde los atributos data-*
        const descripcionProducto = button.getAttribute('data-descripcion');
        const codigo = button.getAttribute('data-codigo') || 'No disponible';
        const descC = button.getAttribute('data-descC') || 'No disponible';
        const codBarra = button.getAttribute('data-codBarra') || 'No disponible';
        const precioNeto = button.getAttribute('data-precioNeto') || 'No disponible';
        const precioFinal = button.getAttribute('data-precioFinal') || 'No disponible';
        const rubro = button.getAttribute('data-rubro') || 'No disponible';
        const subRubro = button.getAttribute('data-subRubro') || 'No disponible';

        // Mostrar los datos en SweetAlert
        Swal.fire({
          title: 'Información del Producto',
          html: `
                    <p><strong>Descripción:</strong> ${descripcionProducto}</p>
                    <p><strong>Código:</strong> ${codigo}</p>
                    <p><strong>Descripción Corta:</strong> ${descC}</p>
                    <p><strong>Código de Barras:</strong> ${codBarra}</p>
                    <p><strong>Precio Neto:</strong> $${precioNeto}</p>
                    <p><strong>Precio Final:</strong> $${precioFinal}</p>
                    <p><strong>Rubro:</strong> ${rubro}</p>
                    <p><strong>Subrubro:</strong> ${subRubro}</p>
                `,
          icon: 'info',
          confirmButtonText: 'Cerrar',
        });
      }
    });
  }

  // Delegación de eventos para detectar clics en el botón "Info"
  document.getElementById('productosDestacados').addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('btn-info')) {
      // Obtenemos los datos del producto desde los atributos del botón
      const descripcion = e.target.getAttribute('data-desc') || 'No hay descripción disponible';
      const codigo = e.target.getAttribute('dataCodBarra') || 'No disponible';
      const codBarra = e.target.getAttribute('data-codBarra') || 'No disponible';
      const precioNeto = e.target.getAttribute('data-precioNeto') || 'No disponible';
      const precioFinal = e.target.getAttribute('data-precioFinal') || 'No disponible';

      // Mostramos la información en SweetAlert
      Swal.fire({
        title: 'Descripción del producto',
        html: `
              <p><strong>Descripción:</strong> ${descripcion}</p>
              <p><strong>Código:</strong> ${codigo}</p>
              <p><strong>Código de Barras:</strong> ${codBarra}</p>
              <p><strong>Precio Neto:</strong> ${precioNeto}</p>
              <p><strong>Precio Final:</strong> ${precioFinal}</p>
          `,
        icon: descripcion === 'No hay descripción disponible' ? 'warning' : 'info',
        confirmButtonText: 'Aceptar'
      });
    }
  });
  // Llamar a la función para cargar productos
  cargarProductosDestacados();
  // Función para cargar las imágenes del slider
  async function cargarImagenesSlider() {
    try {
      const response = await fetch(`${BASE_URL}/Productos/ObtenerBannerInfo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener las imágenes');
      }

      const data = await response.json();

      const carouselInner = document.getElementById('carouselInner');
      const carouselIndicators = document.getElementById('carouselIndicators');
      const preloader = document.getElementById('preloader');
      const carouselContent = document.getElementById('carouselContent');

      carouselInner.innerHTML = '';
      carouselIndicators.innerHTML = '';

      let imagesLoaded = 0;  // Contador para rastrear cuántas imágenes han cargado

      // Mostrar el preloader mientras se cargan las imágenes
      preloader.style.display = 'block';

      // Recorrer las imágenes y agregarlas al slider
      data.forEach((imagen, index) => {
        const isActive = index === 0 ? 'active' : '';

        // Crear el elemento de imagen
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (isActive) {
          carouselItem.classList.add('active');
        }

        // Añadir imagen con clases de Bootstrap
        const imgElement = document.createElement('img');
        imgElement.src = imagen;
        imgElement.classList.add('d-block', 'w-100');
        imgElement.alt = `Imagen ${index + 1}`;

        // Añadir evento 'load' a la imagen
        imgElement.onload = () => {
          imagesLoaded++;

          // Comprobamos si todas las imágenes han sido cargadas
          if (imagesLoaded === data.length) {
            // Ocultar el preloader
            preloader.style.display = 'none';

            // Mostrar el carrusel
            carouselContent.style.display = 'block';

            // Iniciar el carrusel una vez que todas las imágenes se han cargado
            setTimeout(() => {
              $('#imageSlider').carousel(); // Iniciar el deslizamiento del carrusel
            }, 100); // Agrega un pequeño retraso si es necesario
          }
        };

        imgElement.onerror = () => {
          console.error(`Error al cargar la imagen ${index + 1}`);
        };

        // Añadir imagen al item
        carouselItem.appendChild(imgElement);

        // Crear el indicador
        const indicator = document.createElement('li');
        indicator.setAttribute('data-target', '#imageSlider');
        indicator.setAttribute('data-slide-to', index);
        if (isActive) {
          indicator.classList.add('active');
        }

        // Agregar al DOM
        carouselInner.appendChild(carouselItem);
        carouselIndicators.appendChild(indicator);
      });

    } catch (error) {
      console.error('Hubo un error:', error);
    }
  }
  // Cargar las imágenes al cargar la página
  cargarImagenesSlider();

})();
