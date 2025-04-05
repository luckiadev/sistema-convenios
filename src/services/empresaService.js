import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  writeBatch, 
  doc,
  deleteDoc
} from 'firebase/firestore';
import * as XLSX from 'xlsx';

// Normaliza el texto: minúsculas y elimina espacios extras
const normalizeText = (text) => {
  if (!text) return '';
  return text.toString().toLowerCase().trim().replace(/\s+/g, ' ');
};

// Normaliza el RUT: elimina puntos y asegura formato consistente
const normalizeRut = (rut) => {
  if (!rut) return '';
  return rut.toString().replace(/\./g, '').trim();
};

// Obtener todas las empresas
export const getAllEmpresas = async () => {
  try {
    const empresasRef = collection(db, 'convenios_empresas');
    const snapshot = await getDocs(empresasRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener datos:", error);
    throw error;
  }
};

// Buscar empresas por RUT Empresa
export const buscarEmpresaPorRut = async (rut) => {
  try {
    const normalizedRut = normalizeRut(rut);
    const empresasRef = collection(db, 'convenios_empresas');
    const q = query(empresasRef, where("rut_empresa", "==", normalizedRut));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al buscar empresa:", error);
    throw error;
  }
};

// Buscar por RUT Empleado
export const buscarPorRutEmpleado = async (rut) => {
  try {
    const normalizedRut = normalizeRut(rut);
    const empresasRef = collection(db, 'convenios_empresas');
    const q = query(empresasRef, where("rut_empleado", "==", normalizedRut));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al buscar empleado:", error);
    throw error;
  }
};

// Buscar empresas por nombre (parcial)
export const buscarEmpresaPorNombre = async (nombre) => {
  try {
    const normalizedNombre = normalizeText(nombre);
    
    // Obtenemos todas las empresas
    const empresas = await getAllEmpresas();
    
    // Filtramos por nombre (búsqueda parcial)
    return empresas.filter(empresa => {
      const empresaNombre = normalizeText(empresa.nombre_empresa);
      return empresaNombre.includes(normalizedNombre);
    });
  } catch (error) {
    console.error("Error al buscar empresa por nombre:", error);
    throw error;
  }
};

// Buscar por nombre de empleado (parcial)
export const buscarPorNombreEmpleado = async (nombre) => {
  try {
    const normalizedNombre = normalizeText(nombre);
    
    // Obtenemos todas las empresas
    const empresas = await getAllEmpresas();
    
    // Filtramos por nombre de empleado (búsqueda parcial)
    return empresas.filter(empresa => {
      const empleadoNombre = normalizeText(empresa.nombre_empleado || '');
      return empleadoNombre.includes(normalizedNombre);
    });
  } catch (error) {
    console.error("Error al buscar por nombre de empleado:", error);
    throw error;
  }
};

// Procesa un archivo Excel y REEMPLAZA todos los datos en Firestore
export const procesarArchivoExcel = async (data) => {
  try {
    // Leer el archivo desde el ArrayBuffer proporcionado
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      throw new Error("El archivo está vacío o no contiene datos válidos");
    }
    
    // Verificar la existencia de las columnas requeridas
    const primeraFila = jsonData[0];
    
    // Comprobar si las columnas existen (puede estar en diferentes formatos)
    const rutEmpresaKey = Object.keys(primeraFila).find(key => 
      key.toLowerCase().includes('rut empresa') || key.toLowerCase() === 'rut_empresa'
    );
    
    const nombreEmpresaKey = Object.keys(primeraFila).find(key => 
      key.toLowerCase().includes('nombre empresa') || key.toLowerCase() === 'nombre_empresa'
    );
    
    const tipoKey = Object.keys(primeraFila).find(key => 
      key.toLowerCase().includes('tipo') || key.toLowerCase() === 'tipo_de_convenio'
    );
    
    const rutEmpleadoKey = Object.keys(primeraFila).find(key => 
      key.toLowerCase().includes('rut empleado') || key.toLowerCase() === 'rut_empleado'
    );
    
    const nombreEmpleadoKey = Object.keys(primeraFila).find(key => 
      key.toLowerCase().includes('nombre empleado') || key.toLowerCase() === 'nombre_empleado'
    );
    
    if (!rutEmpresaKey || !nombreEmpresaKey || !tipoKey) {
      throw new Error("El archivo no tiene las columnas requeridas. Debe contener campos para RUT Empresa, Nombre Empresa y Tipo de Convenio.");
    }
    
    // 1. ELIMINAR TODOS LOS REGISTROS ACTUALES
    const empresasRef = collection(db, 'convenios_empresas');
    const snapshot = await getDocs(empresasRef);
    
    // Crear un batch para eliminar todos los registros existentes
    const batchDelete = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batchDelete.delete(doc.ref);
    });
    
    // Ejecutar el batch de eliminación
    await batchDelete.commit();
    console.log(`Eliminados ${snapshot.docs.length} registros existentes`);
    
    // 2. CARGAR LOS NUEVOS DATOS
    // Crear un nuevo batch para agregar los nuevos registros
    const batchAdd = writeBatch(db);
    let contador = 0;
    
    // Procesar los datos
    for (const row of jsonData) {
      const rutEmpresa = normalizeRut(row[rutEmpresaKey]);
      
      // Validar que los datos empresariales no estén vacíos
      if (!rutEmpresa || !row[nombreEmpresaKey]) {
        console.warn("Fila ignorada por datos incompletos:", row);
        continue;
      }
      
      const empresaData = {
        rut_empresa: rutEmpresa,
        nombre_empresa: normalizeText(row[nombreEmpresaKey]),
        tipo_de_convenio: normalizeText(row[tipoKey] || ''),
        // Agregar campos de empleado solo si existen en el Excel
        ...(rutEmpleadoKey && row[rutEmpleadoKey] ? { 
          rut_empleado: normalizeRut(row[rutEmpleadoKey]) 
        } : {}),
        ...(nombreEmpleadoKey && row[nombreEmpleadoKey] ? { 
          nombre_empleado: normalizeText(row[nombreEmpleadoKey]) 
        } : {})
      };
      
      // Agregar a la base de datos
      const docRef = doc(collection(db, 'convenios_empresas'));
      batchAdd.set(docRef, empresaData);
      contador++;
      
      // Firebase tiene un límite de 500 operaciones por batch
      if (contador % 450 === 0) {
        await batchAdd.commit();
        console.log(`Procesados ${contador} registros`);
        // Crear un nuevo batch para continuar
        batchAdd = writeBatch(db);
      }
    }
    
    // Ejecutar el último batch si quedan operaciones pendientes
    if (contador % 450 !== 0) {
      await batchAdd.commit();
    }
    
    console.log(`Agregados ${contador} nuevos registros`);
    
    return {
      success: true,
      count: contador,
      replaced: snapshot.docs.length
    };
  } catch (error) {
    console.error("Error al procesar archivo:", error);
    throw error;
  }
};