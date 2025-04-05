import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import SearchForm from '../components/SearchForm';
import FileUploader from '../components/FileUploader';

function Home() {
  const { user, logout } = useAuth();
  const [results, setResults] = useState([]);
  const [showUploader, setShowUploader] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleResultsFound = (data) => {
    setResults(data);
  };

  return (
    <div className="home-container">
      <header className="app-header">
        <div className="logo-container">
          <h1>Sistema de Consulta de Convenios</h1>
        </div>
        <div className="user-info">
          <span>Usuario: {user.email}</span>
          <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
        </div>
      </header>

      <main>
        <div className="main-actions">
          <button 
            onClick={() => setShowUploader(!showUploader)} 
            className="toggle-uploader-btn"
          >
            {showUploader ? 'Ocultar Carga' : 'Mostrar Carga de Datos'}
          </button>
        </div>

        {showUploader && (
          <section className="upload-section">
            <FileUploader />
          </section>
        )}

        <section className="search-section">
          <SearchForm onResultsFound={handleResultsFound} />
        </section>

        <section className="results-section">
          <h3>Resultados ({results.length})</h3>
          {results.length > 0 ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th>RUT Empresa</th>
                  <th>Empresa</th>
                  <th>Tipo de Convenio</th>
                  <th>RUT Empleado</th>
                  <th>Empleado</th>
                </tr>
              </thead>
              <tbody>
                {results.map((empresa) => (
                  <tr key={empresa.id}>
                    <td>{empresa.rut_empresa}</td>
                    <td>{empresa.nombre_empresa}</td>
                    <td>{empresa.tipo_de_convenio}</td>
                    <td>{empresa.rut_empleado || '-'}</td>
                    <td>{empresa.nombre_empleado || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-results">No se encontraron resultados</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;