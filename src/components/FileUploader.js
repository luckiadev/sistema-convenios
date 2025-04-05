import React, { useState } from 'react';
import { procesarArchivoExcel } from '../services/empresaService';

function FileUploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor seleccione un archivo');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Crear un FileReader para leer el archivo
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target.result;
          const result = await procesarArchivoExcel(data);
          setResult(`Se importaron ${result.count} registros exitosamente. (Se reemplazaron ${result.replaced} registros anteriores)`);
        } catch (err) {
          setError(`Error al procesar el archivo: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error al leer el archivo');
        setLoading(false);
      };
      
      // Leer el archivo como ArrayBuffer
      reader.readAsArrayBuffer(file);
      
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="file-uploader">
      <h3>Cargar Datos desde Excel</h3>
      <div className="upload-container">
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileChange} 
          disabled={loading}
        />
        <button 
          onClick={handleUpload} 
          disabled={!file || loading}
        >
          {loading ? 'Procesando...' : 'Cargar Datos'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {result && <div className="success-message">{result}</div>}
      
      <div className="instructions">
        <p><strong>Instrucciones:</strong></p>
        <p>El archivo Excel debe contener al menos las siguientes columnas:</p>
        <ul>
          <li>Rut_Empresa</li>
          <li>Nombre_Empresa</li>
          <li>Tipo_de_Convenio</li>
        </ul>
        <p>Columnas opcionales (para información de empleados):</p>
        <ul>
          <li>Rut_Empleado</li>
          <li>Nombre_Empleado</li>
        </ul>
        <p className="warning"><strong>¡IMPORTANTE!</strong> Al cargar un nuevo archivo, todos los datos existentes serán reemplazados.</p>
      </div>
    </div>
  );
}

export default FileUploader;