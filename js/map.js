/**
 * Script pour la carte interactive des restaurants
 * Utilise Leaflet.js pour afficher les restaurants sur une carte de Montpellier
 */

document.addEventListener('DOMContentLoaded', function() {
    // Sélectionne le conteneur de la carte
    const mapContainer = document.getElementById('map');
    
    // Si le conteneur n'existe pas, ne fait rien
    if (!mapContainer) return;
    
    // Initialise la carte centrée sur Montpellier
    const map = L.map('map').setView([43.610769, 3.876716], 14);
    
    // Ajoute le fond de carte OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Crée une icône personnalisée pour les marqueurs
    const restaurantIcon = L.icon({
        iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
    });
    
    // Parcours les données des restaurants et ajoute les marqueurs
    restaurantsData.forEach(restaurant => {
        // Crée le contenu du popup
        const popupContent = `
            <div class="map-popup">
                <h3>${restaurant.name} <span class="popup-rating">${restaurant.rating} ★</span></h3>
                <p>${restaurant.address}</p>
                <p class="popup-phone">📞 ${restaurant.phone}</p>
                <div class="popup-description">
                    <p>${restaurant.specialities.join(', ')}</p>
                </div>
                <button class="popup-button" onclick="window.location.href='#restaurant-${restaurant.id}'">Voir détails</button>
            </div>
        `;
        
        // Ajoute le marqueur à la carte avec le popup
        L.marker([restaurant.lat, restaurant.lng], {icon: restaurantIcon})
            .addTo(map)
            .bindPopup(popupContent);
    });
    
    // Fonction pour centrer la carte sur un restaurant spécifique
    window.centerMapOnRestaurant = function(restaurantId) {
        const restaurant = restaurantsData.find(r => r.id === restaurantId);
        if (restaurant) {
            map.setView([restaurant.lat, restaurant.lng], 17);
            
            // Ouvre le popup après un court délai pour laisser le temps à la carte de se centrer
            setTimeout(() => {
                const markers = document.querySelectorAll('.leaflet-marker-icon');
                markers.forEach(marker => {
                    const latLng = marker._leaflet_pos;
                    // Cliquer sur le marqueur qui correspond aux coordonnées du restaurant
                    if (latLng && Math.abs(latLng.lat - restaurant.lat) < 0.0001 && Math.abs(latLng.lng - restaurant.lng) < 0.0001) {
                        marker.click();
                    }
                });
            }, 300);
        }
    };
});
