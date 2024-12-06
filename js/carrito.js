(function () {
    const btnCart = document.querySelector('.container-cart-icon');
    const containerCartProducts = document.querySelector('.container-cart-products');
    if (btnCart && containerCartProducts) {
        btnCart.addEventListener('click', () => {
            containerCartProducts.classList.toggle('hidden-cart');
        });
    } else {
        console.error('Elementos del carrito no encontrados en el DOM');
    }
    const rowProduct = document.querySelector('.row-product');
    const productsList = document.querySelector('.container-items');
    let allProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];
    const valorTotal = document.querySelector('.total-pagar');
    const countProducts = document.querySelector('#contador-productos');
    const cartEmpty = document.querySelector('.cart-empty');
    const cartTotal = document.querySelector('.cart-total');
    const imagenNoDisponible = 'https://www.italfren.com.ar/images/catalogo/imagen-no-disponible.jpeg';
    const saveCart = () => {
        localStorage.setItem('cartProducts', JSON.stringify(allProducts));
    };
    productsList.addEventListener('click', e => {
        let cambio = JSON.parse(localStorage.getItem('cambio'));
        // Verificar el valor de "cambio"
        if (cambio) {
            if (cambio) {
                // Si cambio es true, se ejecuta esta lógica para la tabla
                if (e.target.classList.contains('btn-add-cart')) {
                    const productRow = e.target.closest('tr'); // Identificar la fila del producto en la tabla
                    // Seleccionamos el td que contiene el precio final en la tabla
                    const priceContainer = productRow.querySelector('td.precio');
                    if (!priceContainer) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: "Este producto no tiene precio",
                            confirmButtonText: 'OK'
                        });
                        return;
                    }
                    // Extraer y formatear el precio
                    const priceText = priceContainer.textContent.trim();
                    const price = parseFloat(priceText.replace(/\s/g, '').replace(/[^0-9.,]+/g, '').replace(',', '.'));
                    // Obtener la URL de la imagen del producto o usar la imagen por defecto
                    const imageElement = productRow.querySelector('img');
                    const imageUrl = imageElement ? imageElement.src : 'https://www.italfren.com.ar/images/catalogo/imagen-no-disponible.jpeg';
                    // Extraer el código del producto desde el tercer <td> (el que contiene el código "ABC")
                    const productCodeContainer = productRow.querySelector('td:nth-child(2)');
                    const productCode = productCodeContainer ? productCodeContainer.textContent.trim() : '';
                    // Crear el objeto de información del producto con el código
                    const infoProduct = {
                        productCode: productCode, // Añadir código único
                        quantity: 1,
                        title: productRow.querySelector('.descripcion').textContent.trim(), // Ahora sí encontrará la descripción
                        price: price,
                        imageUrl: imageUrl
                    };
                    if (isNaN(infoProduct.price)) {
                        console.error("El precio no se pudo convertir correctamente.");
                        return;
                    }
                    // Verifica si el producto ya está en el carrito usando el código de producto
                    const exists = allProducts.some(product => product.productCode === infoProduct.productCode);
                    if (exists) {
                        // Aumenta la cantidad del producto existente si ya está en el carrito
                        allProducts = allProducts.map(product => {
                            if (product.productCode === infoProduct.productCode) {
                                product.quantity++;
                            }
                            return product;
                        });
                    } else {
                        // Añade el nuevo producto si no existe
                        allProducts.push(infoProduct);
                    }
                    saveCart();
                    showHTML();
                }
            }
            return;
        }
        if (e.target.classList.contains('btn-add-cart')) {
            const product = e.target.closest('.item');
            // Seleccionamos el p que contiene el precio final
            const priceContainer = product.querySelector('p .precio');
            if (!priceContainer) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Este producto no tiene precio",
                    confirmButtonText: 'OK'
                });
                return;
            }
            // Accedemos al texto dentro del p contenedor del precio final
            const priceText = priceContainer.parentElement.textContent.trim();
            // Extraemos el precio utilizando una expresión regular que busca números en el texto
            const price = parseFloat(priceText.replace('Precio Final: ', '').replace(/\s/g, '').replace(/[^0-9.,]+/g, '').replace(',', '.'));
            // Obtener la URL de la imagen del producto o usar la imagen por defecto
            const imageElement = product.querySelector('img');
            const imageUrl = imageElement ? imageElement.src : imagenNoDisponible;
            // Extraer el código del producto del párrafo que contiene "Código:"
            const codeParagraph = Array.from(product.querySelectorAll('p'))
                .find(p => p.textContent.includes('Código:'));
            const productCode = codeParagraph ? codeParagraph.textContent.replace('Código:', '').trim() : '';
            // Crear el objeto de información del producto
            const infoProduct = {
                productCode: productCode, // Añadir código único
                quantity: 1,
                title: product.querySelector('h2').textContent.trim(),
                price: price,
                imageUrl: imageUrl // Añadir la URL de la imagen al objeto del producto
            };
            if (isNaN(infoProduct.price)) {
                console.error("El precio no se pudo convertir correctamente.");
                return;
            }
            // Verifica si el producto ya está en el carrito basado en el código de producto
            const exists = allProducts.some(product => product.productCode === infoProduct.productCode);
            if (exists) {
                // Aumenta la cantidad del producto existente
                allProducts = allProducts.map(product => {
                    if (product.productCode === infoProduct.productCode) {
                        product.quantity++;
                    }
                    return product;
                });
            } else {
                // Añade el nuevo producto
                allProducts.push(infoProduct);
            }
            saveCart();
            showHTML();
        }
    });
    rowProduct.addEventListener('click', e => {
        // Si cambio es false, se ejecuta todo el código
        if (e.target.classList.contains('icon-close')) {
            const productElement = e.target.closest('.cart-product');
            const title = productElement.querySelector('.codigo-producto-carrito').textContent;
            allProducts = allProducts.filter(product => product.title !== title);
            saveCart();
            showHTML();
        }
    });
    const showHTML = () => {
        // Mostrar u ocultar el carrito según si hay productos
        if (!allProducts.length) {
            cartEmpty.classList.remove('hidden');
            rowProduct.classList.add('hidden');
            cartTotal.classList.add('hidden');
        } else {
            cartEmpty.classList.add('hidden');
            rowProduct.classList.remove('hidden');
            cartTotal.classList.remove('hidden');
        }

        rowProduct.innerHTML = '';

        let total = 0;
        let totalOfProducts = 0;

        // Generar el HTML de los productos en el carrito
        allProducts.forEach(product => {
            const containerProduct = document.createElement('div');
            containerProduct.classList.add('cart-product');

            containerProduct.innerHTML = `
                <div class="card mb-3">
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${product.imageUrl}" alt="${product.title}" class="img-fluid rounded-start product-image">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="card-title titulo-producto-carrito">${product.title}</h5>
                                    <p class="card-text">
                                        <small class="text-muted">Código: 
                                            <span class="codigo-producto-carrito">${product.productCode}</span>
                                        </small>
                                    </p>
                                    <p class="card-text d-flex align-items-center">
                                        <small class="text-muted">Cantidad: 
                                            <button type="button" class="btn btn-outline-secondary btn-decrease">-</button>
                                            <span class="cantidad-producto-carrito mx-2">${product.quantity}</span>
                                            <button type="button" class="btn btn-outline-secondary btn-increase">+</button>
                                        </small>
                                    </p>
                                    <p class="card-text precio-producto-carrito">$${product.price}</p>
                                </div>
                                <button type="button" class="btn btn-danger icon-close">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-close" width="24" height="24">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            rowProduct.append(containerProduct);

            total += product.quantity * product.price;
            totalOfProducts += product.quantity;
        });

        valorTotal.innerText = `$${total.toFixed(2)}`;
        countProducts.innerText = totalOfProducts;
    };

    // Delegar el evento en el contenedor principal de productos del carrito
    rowProduct.addEventListener('click', e => {
        if (e.target.classList.contains('btn-decrease')) {
            const productElement = e.target.closest('.cart-product');
            const productCode = productElement.querySelector('.codigo-producto-carrito').textContent;

            allProducts = allProducts.map(product => {
                if (product.productCode === productCode && product.quantity > 1) {
                    product.quantity--;
                }
                return product;
            });

            saveCart();
            showHTML();
        }

        if (e.target.classList.contains('btn-increase')) {
            const productElement = e.target.closest('.cart-product');
            const productCode = productElement.querySelector('.codigo-producto-carrito').textContent;

            allProducts = allProducts.map(product => {
                if (product.productCode === productCode) {
                    product.quantity++;
                }
                return product;
            });

            saveCart();
            showHTML();
        }

        if (e.target.classList.contains('icon-close')) {
            const productElement = e.target.closest('.cart-product');
            const productCode = productElement.querySelector('.codigo-producto-carrito').textContent;

            allProducts = allProducts.filter(product => product.productCode !== productCode);

            saveCart();
            showHTML();
        }
    });

    showHTML(); // Mostrar los productos al cargar la página si "cambio" es false
})();