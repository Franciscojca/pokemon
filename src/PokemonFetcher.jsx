import React, { useEffect, useState } from 'react';
import './PokemonFetcher.css';

const PokemonFetcher = () => {
  const [pokemones, setPokemones] = useState([]);
  const [mostrar, setMostrar] = useState([]); // 5 aleatorios o filtrados
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Cargar 5 Pokémon aleatorios al inicio
  useEffect(() => {
    const fetchPokemones = async () => {
      setCargando(true);
      setError('');
      try {
        const limit = 151;
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
        const data = await res.json();

        const seleccion = [];
        const usados = new Set();
        while (seleccion.length < 5) {
          const randomIndex = Math.floor(Math.random() * data.results.length);
          if (!usados.has(randomIndex)) {
            usados.add(randomIndex);
            seleccion.push(data.results[randomIndex]);
          }
        }

        const detalles = await Promise.all(
          seleccion.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            const info = await res.json();
            return {
              id: info.id,
              nombre: info.name,
              imagen: info.sprites.front_default,
              tipos: info.types.map(t => t.type.name),
            };
          })
        );

        setPokemones(detalles);
        setMostrar(detalles);
      } catch (err) {
        setError('Error al cargar Pokémon aleatorios');
      } finally {
        setCargando(false);
      }
    };

    fetchPokemones();
  }, []);

  // Buscar por nombre (y tipo si se eligió)
  const buscarPokemon = async () => {
    if (!busqueda && !tipoFiltro) {
      setMostrar(pokemones);
      setError('');
      return;
    }

    setCargando(true);
    setError('');
    try {
      let pokemonEncontrado = [];

      if (busqueda) {
        // Buscar por nombre exacto
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${busqueda.toLowerCase()}`);
        if (!res.ok) throw new Error('Pokémon no encontrado');
        const data = await res.json();

        const tipos = data.types.map(t => t.type.name);

        if (!tipoFiltro || tipos.includes(tipoFiltro)) {
          pokemonEncontrado = [{
            id: data.id,
            nombre: data.name,
            imagen: data.sprites.front_default,
            tipos: tipos,
          }];
        } else {
          throw new Error('El Pokémon no es del tipo seleccionado');
        }
      } else if (tipoFiltro) {
        // Buscar por tipo (lista completa)
        const res = await fetch(`https://pokeapi.co/api/v2/type/${tipoFiltro}`);
        if (!res.ok) throw new Error('Error al buscar por tipo');
        const data = await res.json();

        // Obtener hasta 5 Pokémon del tipo elegido
        const lista = data.pokemon.slice(0, 5);
        const detalles = await Promise.all(
          lista.map(async (p) => {
            const res = await fetch(p.pokemon.url);
            const info = await res.json();
            return {
              id: info.id,
              nombre: info.name,
              imagen: info.sprites.front_default,
              tipos: info.types.map(t => t.type.name),
            };
          })
        );
        pokemonEncontrado = detalles;
      }

      setMostrar(pokemonEncontrado);
    } catch (err) {
      setMostrar([]);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Limpiar filtros y volver a los 5 aleatorios
  const limpiarBusqueda = () => {
    setBusqueda('');
    setTipoFiltro('');
    setError('');
    setMostrar(pokemones);
  };

  return (
    <div className='pokemon-container'>
      <h2>Busca un Pokémon o explora 5 aleatorios</h2>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Ej: pikachu"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: '8px', borderRadius: '5px', marginRight: '10px' }}
        />

        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          style={{ padding: '8px', borderRadius: '5px', marginRight: '10px' }}
        >
          <option value="">Todos los tipos</option>
          <option value="grass">Planta</option>
          <option value="fire">Fuego</option>
          <option value="water">Agua</option>
          <option value="electric">Eléctrico</option>
          <option value="normal">Normal</option>
          <option value="bug">Bicho</option>
          <option value="flying">Volador</option>
          <option value="poison">Veneno</option>
          <option value="ground">Tierra</option>
          <option value="rock">Roca</option>
          <option value="psychic">Psíquico</option>
          <option value="ghost">Fantasma</option>
          <option value="dragon">Dragón</option>
          <option value="dark">Siniestro</option>
          <option value="fairy">Hada</option>
        </select>

        <button onClick={buscarPokemon}> Buscar</button>
        <button onClick={limpiarBusqueda} style={{ marginLeft: '10px' }}>Limpiar</button>
      </div>

      {cargando && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}

      <div className="pokemon-list">
        {mostrar.map(pokemon => (
          <div key={pokemon.id} className="pokemon-card">
            <img src={pokemon.imagen} alt={pokemon.nombre} />
            <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
            <p><strong>Tipos:</strong> {pokemon.tipos.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonFetcher;
