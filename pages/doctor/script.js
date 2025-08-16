// Obtener el contenedor donde se mostrarán los personajes
const characterContainer = document.getElementById('character-container');

// URL de la API de Rick and Morty para los personajes
const API_URL = 'https://rickandmortyapi.com/api/character';

// Función asíncrona para consumir la API
const fetchCharacters = async () => {
    try {
        // Realizar la solicitud con fetch()
        const response = await fetch(API_URL);

        //  Manejo de errores de red
        if (!response.ok) {
            throw new Error(`Error en la red: ${response.status}`);
        }

        // Convertir la respuesta a formato JSON
        const data = await response.json();

        // Mostrar resultados en consola
        console.log("Datos de la API:", data.results);

        // Mapear la respuesta y renderizar los personajes
        renderCharacters(data.results);

    } catch (error) {
        // Manejar errores (de red o de la API)
        console.error("Hubo un problema con la operación fetch:", error);
        handleError(error.message);
    }
};

// Función para renderizar los personajes en tarjetas HTML
const renderCharacters = (characters) => {
    characterContainer.innerHTML = '';

    // Mapear cada personaje a una tarjeta HTML
    const characterCards = characters.map(character => {
        return `
            <div class="character-card">
                <img src="${character.image}" alt="Imagen de ${character.name}">
                <h3>${character.name}</h3>
                <p>Especie: ${character.species}</p>
                <p>Estado: ${character.status}</p>
            </div>
        `;
    });

    // Unir las tarjetas y agregarlas al contenedor
    characterContainer.innerHTML = characterCards.join('');
};

// Función para mostrar un mensaje de error en la interfaz de usuario
const handleError = (message) => {
    characterContainer.innerHTML = `
        <div class="error">
            <p>Lo sentimos, no se pudo cargar la información de los personajes.</p>
            <p>Detalles del error: ${message}</p>
        </div>
    `;
};

// Función principal para iniciar el proceso
fetchCharacters();