
import PokemonFetcher from './PokemonFetcher'
import './App.css' // Asegúrate de importar el CSS si no lo estás haciendo

function App() {
  return (
    <>
      <h1 className="titulo-principal">¡conoce a tus pokemon!</h1>
      <PokemonFetcher />
    </>
  );
}

export default App;
