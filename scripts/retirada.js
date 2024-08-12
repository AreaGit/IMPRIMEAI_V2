let map;

// Function to initialize the map
function initMap() {
    map = new Microsoft.Maps.Map('#map', {
        center: new Microsoft.Maps.Location(-23.55052, -46.633308), // São Paulo, BR
        zoom: 12
    });
}

// Function to add a marker to the map
function addMarker(location, title) {
    const marker = new Microsoft.Maps.Pushpin(location, { title: title });
    map.entities.push(marker);
}

// Function to load and display the printing shops on the page and map
async function carregarGraficas() {
    try {
        // Fetch user data
        const responseUsuario = await fetch('/perfil/dados');
        if (!responseUsuario.ok) {
            throw new Error('Error fetching user data');
        }

        const data = await responseUsuario.json();

        const usuario = {
            nomeCliente: data.userCad,
            rua: data.endereçoCad,
            numeroRua: data.numCad,
            complemento: data.compCad,
            cep: data.cepCad,
            estado: data.estadoCad,
            cidade: data.cidadeCad,
            bairro: data.bairroCad,
            email: data.emailCad,
            telefone: data.telefoneCad
        };

        // Convert user data to query string parameters
        const queryParams = new URLSearchParams(usuario).toString();

        // Construct the URL for the /graficas route with user data as query parameters
        const urlGraficas = `/graficas?${queryParams}`;

        // Make a GET request to the /graficas route
        const responseGraficas = await fetch(urlGraficas);
        if (!responseGraficas.ok) {
            throw new Error('Error fetching printing shops');
        }

        // Extract JSON data from the response
        const graficas = await responseGraficas.json();
        console.log(graficas);

        // Clear current content of the printing shops list
        const listaGraficas = document.getElementById('lista-graficas');
        listaGraficas.innerHTML = '';

        // Iterate over the printing shops data and create elements to display on the page and add markers to the map
        graficas.forEach(async (grafica) => {
            const nome = document.createElement('p');
            nome.textContent = grafica.userCad;

            const endereco = document.createElement('p');
            endereco.textContent = grafica.enderecoCad;

            const graficaDiv = document.createElement('div');
            graficaDiv.className = "caixa";
            graficaDiv.appendChild(nome);
            graficaDiv.appendChild(endereco);

            listaGraficas.appendChild(graficaDiv);

            // Get coordinates for the current printing shop
            const graficaCoordinates = await getCoordinatesFromAddress({
                endereco: grafica.enderecoCad,
                cep: grafica.cepCad,
                cidade: grafica.cidadeCad,
                estado: grafica.estadoCad,
            });

            if (graficaCoordinates.latitude && graficaCoordinates.longitude) {
                const location = new Microsoft.Maps.Location(graficaCoordinates.latitude, graficaCoordinates.longitude);
                // Add a marker for each printing shop
                addMarker(location, grafica.userCad);
            }

            graficaDiv.addEventListener('click', () => {
                alert("Clicked");
            });
        });
    } catch (error) {
        console.error('Error loading printing shops:', error);
    }
}

// Function to get coordinates from address using Bing Maps API
async function getCoordinatesFromAddress(address) {
    const response = await fetch(`http://dev.virtualearth.net/REST/v1/Locations?locality=${address.cidade}&adminDistrict=${address.estado}&postalCode=${address.cep}&addressLine=${address.rua}&key=YOUR_BING_MAPS_API_KEY`);
    const data = await response.json();
    if (data.resourceSets.length > 0 && data.resourceSets[0].resources.length > 0) {
        const location = data.resourceSets[0].resources[0].point.coordinates;
        return { latitude: location[0], longitude: location[1] };
    } else {
        return { latitude: null, longitude: null };
    }
}

// Call the function to load the printing shops when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    carregarGraficas();
});