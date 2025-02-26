/**
 * Système de filtrage des restaurants
 * Permet de filtrer les restaurants selon différents critères (quartier, type, note, prix)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Récupère les éléments du DOM
    const filterContainer = document.getElementById('filter-container');
    const restaurantCards = document.querySelectorAll('.restaurant-card');
    const restaurantCount = document.getElementById('restaurant-count');
    
    // Si le conteneur de filtres n'existe pas, ne fait rien
    if (!filterContainer) return;
    
    // État des filtres (vides par défaut)
    let activeFilters = {
        quartier: [],
        type: [],
        rating: 0,
        price: []
    };
    
    // Initialise les compteurs
    updateResultsCount();
    
    /**
     * Extrait les données uniques pour les filtres
     */
    function extractFilterData() {
        const quartiers = new Set();
        const types = new Set();
        const prices = new Set();
        
        restaurantCards.forEach(card => {
            // Extrait les quartiers
            const quartier = card.dataset.quartier;
            if (quartier) quartiers.add(quartier);
            
            // Extrait les types de cuisine
            const type = card.dataset.type;
            if (type) types.add(type);
            
            // Extrait les prix
            const price = card.dataset.price;
            if (price) prices.add(price);
        });
        
        return {
            quartiers: Array.from(quartiers).sort(),
            types: Array.from(types).sort(),
            prices: Array.from(prices).sort((a, b) => a.length - b.length)
        };
    }
    
    /**
     * Crée l'interface des filtres
     */
    function createFilterUI() {
        const filterData = extractFilterData();
        
        // HTML pour le filtre de quartier
        let quartierFilterHTML = `
            <div class="filter-group">
                <h3>Quartier</h3>
                <div class="filter-options">
        `;
        
        filterData.quartiers.forEach(quartier => {
            const quartierName = formatQuartierName(quartier);
            quartierFilterHTML += `
                <label class="filter-checkbox">
                    <input type="checkbox" data-filter="quartier" value="${quartier}">
                    <span>${quartierName}</span>
                </label>
            `;
        });
        
        quartierFilterHTML += `
                </div>
            </div>
        `;
        
        // HTML pour le filtre de type de cuisine
        let typeFilterHTML = `
            <div class="filter-group">
                <h3>Type de cuisine</h3>
                <div class="filter-options">
        `;
        
        filterData.types.forEach(type => {
            const typeName = formatTypeName(type);
            typeFilterHTML += `
                <label class="filter-checkbox">
                    <input type="checkbox" data-filter="type" value="${type}">
                    <span>${typeName}</span>
                </label>
            `;
        });
        
        typeFilterHTML += `
                </div>
            </div>
        `;
        
        // HTML pour le filtre de note
        const ratingFilterHTML = `
            <div class="filter-group">
                <h3>Note minimale</h3>
                <div class="filter-options rating-filter">
                    <input type="range" data-filter="rating" min="0" max="5" step="0.1" value="0">
                    <div class="rating-value">Toutes notes</div>
                </div>
            </div>
        `;
        
        // HTML pour le filtre de prix
        let priceFilterHTML = `
            <div class="filter-group">
                <h3>Gamme de prix</h3>
                <div class="filter-options">
        `;
        
        filterData.prices.forEach(price => {
            priceFilterHTML += `
                <label class="filter-checkbox">
                    <input type="checkbox" data-filter="price" value="${price}">
                    <span>${price}</span>
                </label>
            `;
        });
        
        priceFilterHTML += `
                </div>
            </div>
        `;
        
        // Bouton pour réinitialiser les filtres
        const resetButtonHTML = `
            <button id="reset-filters" class="reset-button">Réinitialiser les filtres</button>
        `;
        
        // Compteur de résultats
        const counterHTML = `
            <div class="filter-results">
                <span id="restaurant-count">${restaurantCards.length}</span> restaurants affichés
            </div>
        `;
        
        // Assemble tous les filtres
        filterContainer.innerHTML = `
            <div class="filter-title">
                <h2>Filtrer les restaurants</h2>
                <p>Utilisez les filtres ci-dessous pour affiner votre recherche</p>
            </div>
            <div class="filters-wrap">
                ${quartierFilterHTML}
                ${typeFilterHTML}
                ${ratingFilterHTML}
                ${priceFilterHTML}
            </div>
            <div class="filter-footer">
                ${counterHTML}
                ${resetButtonHTML}
            </div>
        `;
        
        // Ajoute les écouteurs d'événements
        addFilterEventListeners();
    }
    
    /**
     * Formate le nom du quartier pour l'affichage
     */
    function formatQuartierName(quartier) {
        // Remplace les tirets par des espaces et capitalise chaque mot
        return quartier.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    /**
     * Formate le nom du type pour l'affichage
     */
    function formatTypeName(type) {
        // Capitalise la première lettre
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
    
    /**
     * Ajoute les écouteurs d'événements pour les filtres
     */
    function addFilterEventListeners() {
        // Filtres de type checkbox (quartier, type, prix)
        const checkboxes = filterContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const filterType = this.dataset.filter;
                const value = this.value;
                
                if (this.checked) {
                    // Ajoute le filtre
                    if (!activeFilters[filterType].includes(value)) {
                        activeFilters[filterType].push(value);
                    }
                } else {
                    // Retire le filtre
                    activeFilters[filterType] = activeFilters[filterType].filter(item => item !== value);
                }
                
                applyFilters();
            });
        });
        
        // Filtre de notation (slider)
        const ratingSlider = filterContainer.querySelector('input[data-filter="rating"]');
        const ratingValue = filterContainer.querySelector('.rating-value');
        
        ratingSlider.addEventListener('input', function() {
            const value = parseFloat(this.value);
            activeFilters.rating = value;
            
            // Met à jour l'affichage de la valeur
            if (value === 0) {
                ratingValue.textContent = "Toutes notes";
            } else {
                ratingValue.textContent = `${value}★ et plus`;
            }
            
            applyFilters();
        });
        
        // Bouton de réinitialisation
        const resetButton = document.getElementById('reset-filters');
        resetButton.addEventListener('click', resetFilters);
    }
    
    /**
     * Applique tous les filtres actifs
     */
    function applyFilters() {
        restaurantCards.forEach(card => {
            // Par défaut, le restaurant est visible
            let isVisible = true;
            
            // Filtre par quartier
            if (activeFilters.quartier.length > 0) {
                const quartier = card.dataset.quartier;
                if (!activeFilters.quartier.includes(quartier)) {
                    isVisible = false;
                }
            }
            
            // Filtre par type de cuisine
            if (isVisible && activeFilters.type.length > 0) {
                const type = card.dataset.type;
                if (!activeFilters.type.includes(type)) {
                    isVisible = false;
                }
            }
            
            // Filtre par note minimale
            if (isVisible && activeFilters.rating > 0) {
                const rating = parseFloat(card.dataset.rating);
                if (rating < activeFilters.rating) {
                    isVisible = false;
                }
            }
            
            // Filtre par prix
            if (isVisible && activeFilters.price.length > 0) {
                const price = card.dataset.price;
                if (!activeFilters.price.includes(price)) {
                    isVisible = false;
                }
            }
            
            // Applique la visibilité
            if (isVisible) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
        
        // Met à jour le compteur de résultats
        updateResultsCount();
    }
    
    /**
     * Réinitialise tous les filtres
     */
    function resetFilters() {
        // Réinitialise l'état des filtres
        activeFilters = {
            quartier: [],
            type: [],
            rating: 0,
            price: []
        };
        
        // Réinitialise les checkboxes
        const checkboxes = filterContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Réinitialise le slider de note
        const ratingSlider = filterContainer.querySelector('input[data-filter="rating"]');
        const ratingValue = filterContainer.querySelector('.rating-value');
        ratingSlider.value = 0;
        ratingValue.textContent = "Toutes notes";
        
        // Réinitialise l'affichage
        restaurantCards.forEach(card => {
            card.classList.remove('hidden');
        });
        
        // Met à jour le compteur
        updateResultsCount();
    }
    
    /**
     * Met à jour le compteur de résultats
     */
    function updateResultsCount() {
        const visibleCount = document.querySelectorAll('.restaurant-card:not(.hidden)').length;
        restaurantCount.textContent = visibleCount;
    }
    
    // Initialise l'interface des filtres
    createFilterUI();
});
