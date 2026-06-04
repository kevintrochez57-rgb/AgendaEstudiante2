import { Ionicons } from '@expo/vector-icons'; // // SIRVE PARA: Traer los iconos nativos de la papelera y los checkboxes.
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// ---------------------------------------------------------------------------------------------------------
// REGLA DE DATOS (INTERFACE) -> // SIRVE PARA: Definir la estructura exacta y obligatoria que debe tener cada tarea (id, nombre, materia, etc.).
// ---------------------------------------------------------------------------------------------------------
interface Tarea {
  id: string;
  nombre: string;
  materia: string;
  fecha: string;
  prioridad: 'Baja' | 'Media' | 'Alta';
  completada: boolean;
}

export default function Layout() {
  // ---------------------------------------------------------------------------------------------------------
  // ESTADOS (MEMORIAS) -> // SIRVE PARA: Guardar en la memoria lo que el usuario digita en las casillas del formulario.
  // ---------------------------------------------------------------------------------------------------------
  const [nombre, setNombre] = useState(''); // // SIRVE PARA: Guardar el nombre de la tarea.
  const [materia, setMateria] = useState(''); // // SIRVE PARA: Guardar la asignatura.
  const [fecha, setFecha] = useState(''); // // SIRVE PARA: Guardar la fecha límite.
  const [prioridad, setPrioridad] = useState<'Baja' | 'Media' | 'Alta'>('Media'); // // SIRVE PARA: Guardar la urgencia (Baja, Media o Alta).

  // ---------------------------------------------------------------------------------------------------------
  // LISTA DE TAREAS -> // SIRVE PARA: Almacenar el grupo completo de tareas creadas (Inicia con la de Matemáticas).
  // ---------------------------------------------------------------------------------------------------------
  const [tareas, setTareas] = useState<Tarea[]>([
    {
      id: '1',
      nombre: 'Ecuaciones lineales',
      materia: 'Matemáticas',
      fecha: '2026-06-10',
      prioridad: 'Alta',
      completada: false,
    }
  ]);

  // ---------------------------------------------------------------------------------------------------------
  // FUNCIÓN AGREGAR TAREA -> // SIRVE PARA: Validar que no haya campos vacíos, armar el paquete e insertarlo en la lista.
  // ---------------------------------------------------------------------------------------------------------
  const handleAgregarTarea = () => {
    // // SIRVE PARA: Verificar si faltan datos obligatorios y frenar el proceso con una alerta en el celular.
    if (!nombre.trim() || !materia.trim() || !fecha.trim()) {
      Alert.alert('Campos vacíos', 'Por favor, escribe el nombre, materia y fecha de la tarea.');
      return;
    }

    // // SIRVE PARA: Empaquetar los datos ingresados y asignarle un ID único usando el reloj del sistema.
    const nuevaTarea: Tarea = {
      id: Date.now().toString(),
      nombre: nombre,
      materia: materia,
      fecha: fecha,
      prioridad: prioridad,
      completada: false // // SIRVE PARA: Que toda tarea comience sin estar hecha (false).
    };

    // // SIRVE PARA: Añadir la nueva tarea al final de la lista conservando las anteriores.
    setTareas([...tareas, nuevaTarea]);

    // // SIRVE PARA: Limpiar por completo las cajitas de la pantalla después de guardar.
    setNombre('');
    setMateria('');
    setFecha('');
    setPrioridad('Media');
  };

  // ---------------------------------------------------------------------------------------------------------
  // FUNCIÓN ELIMINAR TAREA -> // SIRVE PARA: Sacar de la lista permanentemente la tarea en la que se toque la basura.
  // ---------------------------------------------------------------------------------------------------------
  const handleEliminarTarea = (id: string) => {
    // // SIRVE PARA: Crear un grupo nuevo excluyendo el ID que se quiere eliminar.
    const listaFiltrada = tareas.filter(tarea => tarea.id !== id);
    setTareas(listaFiltrada);
  };

  // ---------------------------------------------------------------------------------------------------------
  // FUNCIÓN COMPLETAR -> // SIRVE PARA: Tachar o destachar la tarea al tocar el cuadro blanco.
  // ---------------------------------------------------------------------------------------------------------
  const toggleCompletada = (id: string) => {
    // // SIRVE PARA: Recorrer la lista, buscar el ID presionado e invertir su estado (de completado a pendiente o viceversa).
    const listaActualizada = tareas.map(tarea => {
      if (tarea.id === id) {
        return { ...tarea, completada: !tarea.completada };
      }
      return tarea;
    });
    setTareas(listaActualizada);
  };

  // ---------------------------------------------------------------------------------------------------------
  // DISEÑO VISUAL (RENDER) -> // SIRVE PARA: Construir y organizar todo lo que se ve en el celular de forma estética.
  // ---------------------------------------------------------------------------------------------------------
  return (
    <View style={styles.mainContainer}>
      
      {/* HEADER -> // SIRVE PARA: Mostrar el título principal "Mis Tareas" y el botón azul de ajustes. */}
      <View style={styles.header}>
        <Text style={styles.tituloHeader}>Mis Tareas</Text>
        <TouchableOpacity style={styles.botonAjustes}>
          <Ionicons name="settings" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* CONTAINER FORMULARIO -> // SIRVE PARA: Envolver los campos de texto e inputs de la app. */}
      <View style={styles.formularioContainer}>
        
        {/* INPUT NOMBRE -> // SIRVE PARA: La casilla de escritura del nombre del pendiente escolar. */}
        <TextInput 
          style={styles.input} 
          placeholder="Nombre de la tarea"
          placeholderTextColor="#aaa"
          value={nombre}
          onChangeText={setNombre} 
        />
        
        {/* INPUT MATERIA -> // SIRVE PARA: La casilla de escritura de la materia. */}
        <TextInput 
          style={styles.input} 
          placeholder="Materia"
          placeholderTextColor="#aaa"
          value={materia}
          onChangeText={setMateria} 
        />
        
        {/* INPUT FECHA -> // SIRVE PARA: La casilla de escritura para la fecha límite. */}
        <TextInput 
          style={styles.input} 
          placeholder="Fecha límite (Ej: 15 Jun)"
          placeholderTextColor="#aaa"
          value={fecha}
          onChangeText={setFecha} 
        />

        {/* SELECTOR PRIORIDADES -> // SIRVE PARA: Pintar los 3 botones horizontales de urgencia. */}
        <View style={styles.contenedorPrioridades}>
          {(['Baja', 'Media', 'Alta'] as const).map((nivel) => (
            <TouchableOpacity 
              key={nivel} 
              // // SIRVE PARA: Pintar de morado oscuro solo el botón que fue seleccionado.
              style={[
                styles.botonPrioridad, 
                prioridad === nivel && styles.prioridadSeleccionada
              ]}
              onPress={() => setPrioridad(nivel)} 
            >
              <Text style={[
                styles.textoPrioridad, 
                prioridad === nivel && styles.textoPrioridadSeleccionada
              ]}>
                {nivel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BOTÓN AGREGAR -> // SIRVE PARA: Crear el botón morado que guarda la información al ser presionado. */}
        <TouchableOpacity style={styles.botonAgregar} onPress={handleAgregarTarea}>
          <Text style={styles.textoBotonAgregar}>Agregar Tarea</Text>
        </TouchableOpacity>
      </View>

      {/* FLATLIST -> // SIRVE PARA: Generar las tarjetas de la lista automáticamente según el número de tareas. */}
      <FlatList
        data={tareas} 
        keyExtractor={(item) => item.id} 
        contentContainerStyle={styles.listaContainer}
        renderItem={({ item }) => (
          
          // TARJETA DE TAREA -> // SIRVE PARA: El diseño de cada bloque blanco que contiene los datos de la tarea.
          <View style={styles.tarjetaTarea}>
            <View style={styles.infoTarea}>
              <View style={styles.filaTitulo}>
                {/* TEXTO DINÁMICO -> // SIRVE PARA: Trazar una línea horizontal sobre el texto si la tarea ya se completó. */}
                <Text style={[styles.nombreTarea, item.completada && styles.tareaTachada]}>
                  {item.nombre}
                </Text>
                
                {/* BADGE PRIORIDAD -> // SIRVE PARA: Ponerle un color de fondo diferente (rojo, amarillo o azul) según el peligro. */}
                <View style={[
                  styles.badgePrioridad, 
                  item.prioridad === 'Alta' ? { backgroundColor: '#ffdddd' } : 
                  item.prioridad === 'Media' ? { backgroundColor: '#fff3cd' } : { backgroundColor: '#d1ecf1' }
                ]}>
                  <Text style={[
                    styles.textoBadge,
                    item.prioridad === 'Alta' ? { color: '#dc3545' } : 
                    item.prioridad === 'Media' ? { color: '#856404' } : { color: '#0c5460' }
                  ]}>
                    {item.prioridad}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.materiaTarea}>{item.materia}</Text>
              {item.fecha ? <Text style={styles.fechaTarea}>📅 {item.fecha}</Text> : null}
            </View>

            {/* BOTONES ACCIONES -> // SIRVE PARA: Mostrar el checkbox de listo y la papelera de eliminación a la derecha. */}
            <View style={styles.acciones}>
              <TouchableOpacity onPress={() => toggleCompletada(item.id)} style={styles.checkbox}>
                <Ionicons 
                  name={item.completada ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={item.completada ? "#5c4dbf" : "#ccc"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleEliminarTarea(item.id)}>
                <Ionicons name="trash-outline" size={22} color="#888" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// -------------------------------------------------------------------------
// HOJA DE ESTILOS -> // SIRVE PARA: Definir tamaños, colores de fondo, márgenes y tipos de fuentes (CSS).
// -------------------------------------------------------------------------
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tituloHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5c4dbf',
  },
  botonAjustes: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formularioContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  contenedorPrioridades: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  botonPrioridad: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  prioridadSeleccionada: {
    backgroundColor: '#5c4dbf',
    borderColor: '#5c4dbf',
  },
  textoPrioridad: {
    color: '#666',
    fontWeight: '600',
  },
  textoPrioridadSeleccionada: {
    color: '#fff',
  },
  botonAgregar: {
    backgroundColor: '#5c4dbf',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonAgregar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listaContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tarjetaTarea: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  infoTarea: {
    flex: 1,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nombreTarea: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  tareaTachada: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  badgePrioridad: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  textoBadge: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  materiaTarea: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  fechaTarea: {
    fontSize: 12,
    color: '#9ca3af',
  },
  acciones: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 15,
  },
});
