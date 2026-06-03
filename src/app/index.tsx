// Importamos las herramientas que vamos a usar
// React y useState nos permiten manejar la información de la pantalla
// Los demás son componentes visuales como botones, textos e inputs
import { useState } from 'react';
import {
  Alert,
  FlatList, StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';

// Definimos qué datos tiene una tarea para que TypeScript no arroje errores
interface Tarea {
  id: string;
  nombre: string;
  materia: string;
  completada: boolean;
}

// Esta es la pantalla principal de tareas
export default function TasksScreen() {

  // tareas = lista donde se guardan todas las tareas
  // setTareas = función para actualizar esa lista
  const [tareas, setTareas] = useState<Tarea[]>([]);

  // nombre = lo que escribe el estudiante en el campo de nombre
  const [nombre, setNombre] = useState('');

  // materia = lo que escribe el estudiante en el campo de materia
  const [materia, setMateria] = useState('');

  // Esta función se ejecuta cuando el estudiante toca "Agregar Tarea"
  const agregarTarea = () => {

    // Si algún campo está vacío muestra un mensaje de error
    if (nombre === '' || materia === '') {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Crea una tarea nueva con id único, nombre, materia y estado
    const nuevaTarea: Tarea = {
      id: Date.now().toString(), // id único basado en la hora
      nombre: nombre,
      materia: materia,
      completada: false, // por defecto la tarea no está completada
    };

    // Agrega la nueva tarea a la lista existente
    setTareas([...tareas, nuevaTarea]);

    // Limpia los campos después de agregar
    setNombre('');
    setMateria('');
  };

  // Esta función marca una tarea como completada o pendiente
  const completarTarea = (id: string) => {
    setTareas(tareas.map(tarea =>
      // Busca la tarea por id y cambia su estado
      tarea.id === id ? { ...tarea, completada: !tarea.completada } : tarea
    ));
  };

  // Esta función elimina una tarea de la lista
  const eliminarTarea = (id: string) => {
    // Filtra y quita la tarea que tenga ese id
    setTareas(tareas.filter(tarea => tarea.id !== id));
  };

  // Aquí empieza lo visual, lo que el estudiante ve en pantalla
  return (
    <View style={styles.container}>

      {/* Título de la pantalla */}
      <Text style={styles.titulo}>Mis Tareas</Text>

      {/* Campo para escribir el nombre de la tarea */}
      <TextInput
        style={styles.input}
        placeholder="Nombre de la tarea"
        value={nombre}
        onChangeText={setNombre}
      />

      {/* Campo para escribir la materia */}
      <TextInput
        style={styles.input}
        placeholder="Materia"
        value={materia}
        onChangeText={setMateria}
      />

      {/* Botón para agregar la tarea */}
      <TouchableOpacity style={styles.boton} onPress={agregarTarea}>
        <Text style={styles.botonTexto}>Agregar Tarea</Text>
      </TouchableOpacity>

      {/* Lista que muestra todas las tareas guardadas */}
      <FlatList
        data={tareas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          
          /* Cada tarea se muestra como una tarjeta */
          <View style={styles.tarea}>
            <View style={styles.tareaInfo}>

              {/* Nombre de la tarea, si está completada aparece tachado */}
              <Text style={[styles.tareaNombre,
                item.completada && styles.tareaCompletada]}>
                {item.nombre}
              </Text>

              {/* Nombre de la materia */}
              <Text style={styles.tareaMateria}>{item.materia}</Text>
            </View>

            {/* Botón para marcar como completada o pendiente */}
            <TouchableOpacity onPress={() => completarTarea(item.id)}>
              <Text style={styles.check}>
                {item.completada ? '✅' : '⬜'}
              </Text>
            </TouchableOpacity>

            {/* Botón para eliminar la tarea */}
            <TouchableOpacity onPress={() => eliminarTarea(item.id)}>
              <Text style={styles.eliminar}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

// Aquí definimos los estilos visuales de cada elemento
const styles = StyleSheet.create({

  // Fondo general de la pantalla (con espacio arriba para que no tape la barra de estado)
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', paddingTop: 60 },

  // Estilo del título
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#4f46e5' },

  // Estilo de los campos de texto
  input: { backgroundColor: 'white', padding: 12, borderRadius: 8,
    marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },

  // Estilo del botón agregar
  boton: { backgroundColor: '#4f46e5', padding: 14, borderRadius: 8,
    alignItems: 'center', marginBottom: 20 },

  // Estilo del texto del botón
  botonTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Estilo de cada tarjeta de tarea
  tarea: { backgroundColor: 'white', padding: 14, borderRadius: 8,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd' },

  // Contenedor del texto de la tarea
  tareaInfo: { flex: 1 },

  // Texto del nombre de la tarea
  tareaNombre: { fontSize: 16, fontWeight: '500' },

  // Estilo cuando la tarea está completada (texto tachado)
  tareaCompletada: { textDecorationLine: 'line-through', color: '#999' },

  // Texto de la materia
  tareaMateria: { fontSize: 13, color: '#666', marginTop: 2 },

  // Botón de completar
  check: { fontSize: 22, marginRight: 10 },

  // Botón de eliminar
  eliminar: { fontSize: 22 },
});

