(function() {
    const searchInput = document.getElementById('search-input');
    const productsList = document.querySelectorAll('.item');
    const filterButton = document.getElementById('filter-button');
    const filterOptions = document.getElementById('filter-options');
    let filterOptionsVisible = false;

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        productsList.forEach(product => {
            const title = product.querySelector('.info-product h2').textContent.toLowerCase();
            if (title.includes(searchTerm)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    });


    //Boton de filtros
    // Mostrar/ocultar opciones de filtro con transición
    //filterButton.addEventListener('click', (event) => {
    //    event.preventDefault(); // Previene el comportamiento predeterminado del botón
    //    filterOptionsVisible = !filterOptionsVisible;
    //    if (filterOptionsVisible) {
    //        filterOptions.classList.remove('hidden');
    //        filterOptions.classList.add('visible');
    //    } else {
    //        filterOptions.classList.remove('visible');
    //        filterOptions.classList.add('hidden');
     //   }
    //});

})();
