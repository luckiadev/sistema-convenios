import React, { useState } from 'react';
import { 
  buscarEmpresaPorRut, 
  buscarEmpresaPorNombre,
  buscarPorRutEmpleado,
  buscarPorNombreEmpleado
} from '../services/empresaService';

function SearchForm({ onResultsFound }) {
  const [criteria, setCriteria] = useState('');
  const [searchType, setSearchType] = useState('rut_empresa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!criteria.trim()) {
      setError('Ingrese un criterio de búsqueda');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let results;
      
      switch (searchType) {
        case 'rut_empresa':
          results = await buscarEmpresaPorRut(criteria);
          break;
        case 'nombre_empresa':
          results = await buscarEmpresaPorNombre(criteria);
          break;
        case 'rut_empleado':
          results = await buscarPorRutEmpleado(criteria);
          break;
        case 'nombre_empleado':
          results = await buscarPorNombreEmpleado(criteria);
          break;
        default:
          results = await buscarEmpresaPorRut(criteria);
      }
      
      onResultsFound(results);
    } catch (err) {
      setError(`Error en la búsqueda: ${err.message}`);
      onResultsFound([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-form">
      <h3>Buscar Convenio</h3>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSearch}>
        <div className="search-options">
          <label>
            <input 
              type="radio" 
              name="searchType" 
              value="rut_empresa" 
              checked={searchType === 'rut_empresa'} 
              onChange={() => setSearchType('rut_empresa')} 
            />
            RUT Empresa
          </label>
          <label>
            <input 
              type="radio" 
              name="searchType" 
              value="nombre_empresa" 
              checked={searchType === 'nombre_empresa'} 
              onChange={() => setSearchType('nombre_empresa')} 
            />
            Nombre Empresa
          </label>
          <label>
            <input 
              type="radio" 
              name="searchType" 
              value="rut_empleado" 
              checked={searchType === 'rut_empleado'} 
              onChange={() => setSearchType('rut_empleado')} 
            />
            RUT Empleado
          </label>
          <label>
            <input 
              type="radio" 
              name="searchType" 
              value="nombre_empleado" 
              checked={searchType === 'nombre_empleado'} 
              onChange={() => setSearchType('nombre_empleado')} 
            />
            Nombre Empleado
          </label>
        </div>
        
        <div className="search-input">
          <input
            type="text"
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            placeholder={`Ingrese ${searchType.replace('_', ' ')} a buscar`}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchForm;