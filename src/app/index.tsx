// ============================================================
// 1. IMPORTACIONES - Librerías necesarias para la app
// ============================================================

import { Ionicons } from '@expo/vector-icons';
// ✅ Iconos bonitos para la app (estrella, basurero, check, etc.)

import AsyncStorage from '@react-native-async-storage/async-storage';
// ✅ Guarda datos en el celular (como una base de datos local)

import { useEffect, useState } from 'react';
// ✅ useState = guarda información en la pantalla
// ✅ useEffect = ejecuta código cuando la pantalla se abre

import {
  Alert, // ✅ Ventana emergente (para agregar materias)
  FlatList, // ✅ Muestra mensajes de alerta (ej: "Error", "Éxito")
  Modal, // ✅ Contenedor (como un div en HTML)
  ScrollView, // ✅ Lista eficiente para mostrar materias
  StyleSheet, // ✅ Estilos (colores, tamaños, bordes)
  Text, // ✅ Mostrar texto
  TextInput, // ✅ Campos para escribir
  TouchableOpacity, // ✅ Botones con efecto táctil
  View, // ✅ Contenedor (como un div en HTML)
} from 'react-native';

import * as Sharing from 'expo-sharing';
// ✅ Permite compartir texto por WhatsApp, Drive, etc.

import * as Haptics from 'expo-haptics';
// ✅ Hace vibrar el celular al tocar botones

// ============================================================
// 2. DEFINICIÓN DE TIPOS (TypeScript)
// ============================================================

interface Materia {
  // ✅ Define cómo es una "Materia"
  id: string;              // Identificador único
  nombre: string;          // Nombre de la materia
  profesor: string;        // Nombre del profesor
  fechaEntrega: string;    // Fecha de entrega (ej: "20/06/2026")
  importancia: 'Alta' | 'Media' | 'Baja'; // Nivel de importancia
  descripcion: string;     // Descripción de la tarea
  completada: boolean;     // ¿Ya se completó? (true/false)
}

interface Nota {
  // ✅ Define cómo es una "Nota"
  id: string;
  titulo: string;
  contenido: string;
  materiaId: string;       // A qué materia pertenece
  fecha: string;
  importante: boolean;
}

// ============================================================
// 3. COMPONENTE PRINCIPAL - HomeScreen
// ============================================================

export default function HomeScreen() {
  // ============================================================
  // 3.1 ESTADOS - Guardan la información en la pantalla
  // ============================================================

  const [materias, setMaterias] = useState<Materia[]>([]);
  // ✅ Lista de materias. Empieza vacía [].

  const [modalMateriaVisible, setModalMateriaVisible] = useState(false);
  // ✅ Controla si el modal (ventana emergente) está visible.
  //    false = oculto, true = visible.

  const [nuevaMateria, setNuevaMateria] = useState({
    // ✅ Guarda lo que el usuario escribe en el formulario
    nombre: '',
    profesor: '',
    fechaEntrega: '',
    importancia: 'Media' as 'Alta' | 'Media' | 'Baja',
    descripcion: '',
    completada: false
  });

  const [notas, setNotas] = useState<Nota[]>([]);
  // ✅ Lista de notas

  const [modalNotaVisible, setModalNotaVisible] = useState(false);
  // ✅ Controla ventana de agregar nota

  const [nuevaNota, setNuevaNota] = useState({
    titulo: '',
    contenido: '',
    materiaId: '',
    importante: false
  });

  const [menuVisible, setMenuVisible] = useState(false);
  // ✅ Controla el menú flotante (Agregar Materia / Agregar Nota)

  const [vistaActual, setVistaActual] = useState<'materias' | 'notas'>('materias');
  // ✅ ¿Qué lista se muestra? "materias" o "notas"

  const [ordenPor, setOrdenPor] = useState<'fecha' | 'importancia'>('fecha');
  // ✅ ¿Cómo se ordenan las materias? "fecha" o "importancia"

  // ============================================================
  // 3.2 useEffect - Se ejecuta al abrir la pantalla
  // ============================================================

  useEffect(() => {
    // ✅ Cuando la pantalla se abre, carga las materias y notas guardadas
    cargarMaterias();
    cargarNotas();
  }, []); // El [] significa "ejecuta solo una vez"

  // ============================================================
  // 3.3 FUNCIONES PARA MATERIAS
  // ============================================================

  const cargarMaterias = async () => {
    // ✅ Trae las materias guardadas en el celular
    try {
      const guardadas = await AsyncStorage.getItem('@materias');
      // Busca en el almacenamiento local la clave "@materias"
      if (guardadas) setMaterias(JSON.parse(guardadas));
      // Si existen, las convierte de texto a objeto y las guarda
    } catch (error) {}
  };

  const guardarMaterias = async (nuevas: Materia[]) => {
    // ✅ Guarda la lista de materias en el celular
    await AsyncStorage.setItem('@materias', JSON.stringify(nuevas));
    // Convierte a texto y lo guarda con la clave "@materias"
    setMaterias(nuevas); // Actualiza la pantalla
  };

  const agregarMateria = async () => {
    // ✅ Agrega una nueva materia
    if (!nuevaMateria.nombre.trim()) {
      // Si el nombre está vacío, muestra error
      Alert.alert('Error', 'El nombre de la materia es obligatorio');
      return;
    }
    if (!nuevaMateria.fechaEntrega.trim()) {
      // Si la fecha está vacía, muestra error
      Alert.alert('Error', 'La fecha de entrega es obligatoria');
      return;
    }

    const materia: Materia = {
      // ✅ Crea el objeto materia con los datos del formulario
      id: Date.now().toString(), // ID único basado en la hora actual
      ...nuevaMateria,           // Copia todos los campos del formulario
    };

    guardarMaterias([...materias, materia]);
    // ✅ Guarda la nueva materia junto con las existentes

    // ✅ Limpia el formulario
    setNuevaMateria({
      nombre: '',
      profesor: '',
      fechaEntrega: '',
      importancia: 'Media',
      descripcion: '',
      completada: false
    });
    setModalMateriaVisible(false); // Cierra el modal
    setMenuVisible(false);         // Cierra el menú flotante

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // ✅ Hace vibrar el celular (feedback táctil)

    Alert.alert('Exito', 'Materia agregada');
    // ✅ Muestra mensaje de éxito
  };

  const eliminarMateria = async (id: string) => {
    // ✅ Elimina una materia
    Alert.alert('Eliminar', 'Eliminar esta materia?', [
      // ✅ Muestra confirmación antes de eliminar
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Eliminar', 
        style: 'destructive',
        onPress: async () => {
          guardarMaterias(materias.filter(m => m.id !== id));
          // ✅ Filtra la lista, dejando solo las que NO tienen ese id
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          // ✅ Vibración media
        }
      }
    ]);
  };

  const toggleMateriaCompletada = async (id: string) => {
    // ✅ Marca/Desmarca una materia como completada
    const nuevas = materias.map(m =>
      // ✅ Recorre todas las materias
      m.id === id ? { ...m, completada: !m.completada } : m
      // Si coincide el id, cambia el estado "completada" (true ↔ false)
    );
    guardarMaterias(nuevas);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // ✅ Vibración ligera
  };

  // ============================================================
  // 3.4 FUNCIONES PARA NOTAS
  // ============================================================

  const cargarNotas = async () => {
    // ✅ Carga las notas guardadas
    try {
      const guardadas = await AsyncStorage.getItem('@notas');
      if (guardadas) setNotas(JSON.parse(guardadas));
    } catch (error) {}
  };

  const guardarNotas = async (nuevas: Nota[]) => {
    // ✅ Guarda las notas
    await AsyncStorage.setItem('@notas', JSON.stringify(nuevas));
    setNotas(nuevas);
  };

  const agregarNota = async () => {
    // ✅ Agrega una nueva nota
    if (!nuevaNota.titulo.trim()) {
      Alert.alert('Error', 'El titulo es obligatorio');
      return;
    }

    const nota: Nota = {
      id: Date.now().toString(),
      titulo: nuevaNota.titulo,
      contenido: nuevaNota.contenido,
      materiaId: nuevaNota.materiaId,
      fecha: new Date().toLocaleDateString(), // ✅ Fecha actual
      importante: nuevaNota.importante,
    };

    guardarNotas([...notas, nota]);
    // ✅ Limpia el formulario
    setNuevaNota({ titulo: '', contenido: '', materiaId: '', importante: false });
    setModalNotaVisible(false);
    setMenuVisible(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Exito', 'Nota agregada');
  };

  const eliminarNota = async (id: string) => {
    // ✅ Elimina una nota
    guardarNotas(notas.filter(n => n.id !== id));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const toggleImportante = async (id: string) => {
    // ✅ Marca/Desmarca una nota como importante
    const nuevas = notas.map(n =>
      n.id === id ? { ...n, importante: !n.importante } : n
    );
    guardarNotas(nuevas);
  };

  // ============================================================
  // 3.5 COMPARTIR TAREAS (por WhatsApp)
  // ============================================================

  const compartirTareas = async () => {
    // ✅ Comparte la lista de tareas pendientes
    const materiasPendientes = materias.filter(m => !m.completada);
    // ✅ Filtra solo las NO completadas

    if (materiasPendientes.length === 0) {
      Alert.alert('No hay tareas', 'No hay tareas pendientes para compartir');
      return;
    }

    // ✅ Construye el mensaje de texto
    let mensaje = 'MIS TAREAS PENDIENTES\n\n';
    mensaje += `Fecha: ${new Date().toLocaleDateString()}\n`;
    mensaje += `----------------------------------------\n\n`;

    materiasPendientes.forEach((materia, index) => {
      const textoImportancia = materia.importancia === 'Alta' ? 'URGENTE' : materia.importancia === 'Media' ? 'IMPORTANTE' : 'NORMAL';
      mensaje += `${index + 1}. ${textoImportancia} - ${materia.nombre}\n`;
      mensaje += `   Entrega: ${materia.fechaEntrega}\n`;
      if (materia.descripcion) {
        mensaje += `   Descripcion: ${materia.descripcion}\n`;
      }
      mensaje += `\n`;
    });

    mensaje += `----------------------------------------\n`;
    mensaje += `Total: ${materiasPendientes.length} tareas pendientes\n`;
    mensaje += `Enviado desde Agenda Estudiantil`;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      // ✅ Verifica si el celular permite compartir
      if (isAvailable) {
        await Sharing.shareAsync(mensaje);
        // ✅ Abre el menú para compartir (WhatsApp, Drive, etc.)
      } else {
        Alert.alert('Error', 'No se puede compartir en este dispositivo');
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir las tareas');
    }
  };

  // ============================================================
  // 3.6 ORDENAR MATERIAS
  // ============================================================

  const getMateriasOrdenadas = () => {
    // ✅ Devuelve la lista de materias ordenadas
    let ordenadas = [...materias];

    if (ordenPor === 'fecha') {
      // ✅ Ordena por fecha (de la más cercana a la más lejana)
      ordenadas.sort((a, b) => {
        const fechaA = a.fechaEntrega.split('/').reverse().join('');
        // ✅ Convierte "20/06/2026" → "20260620" para comparar
        const fechaB = b.fechaEntrega.split('/').reverse().join('');
        return fechaA.localeCompare(fechaB);
      });
    } else {
      // ✅ Ordena por importancia: Alta → Media → Baja
      const prioridad = { 'Alta': 0, 'Media': 1, 'Baja': 2 };
      ordenadas.sort((a, b) => prioridad[a.importancia] - prioridad[b.importancia]);
    }

    return ordenadas;
  };

  // ============================================================
  // 3.7 FUNCIONES DE UTILIDAD (Helpers)
  // ============================================================

  const getNombreMateria = (id: string) => {
    // ✅ Busca el nombre de una materia por su ID
    const materia = materias.find(m => m.id === id);
    return materia ? materia.nombre : 'Sin materia';
  };

  const getImportanciaColor = (importancia: string) => {
    // ✅ Devuelve un color según la importancia
    switch (importancia) {
      case 'Alta': return '#ff4444';   // Rojo
      case 'Media': return '#ffbb33';  // Amarillo
      case 'Baja': return '#00C851';   // Verde
      default: return '#aaa';
    }
  };

  const getImportanciaTexto = (importancia: string) => {
    // ✅ Devuelve un texto según la importancia
    switch (importancia) {
      case 'Alta': return 'Urgente';
      case 'Media': return 'Importante';
      case 'Baja': return 'Normal';
      default: return '';
    }
  };

  // ============================================================
  // 3.8 RENDERIZAR (Dibujar en pantalla)
  // ============================================================

  const renderMateria = ({ item }: { item: Materia }) => (
    // ✅ Dibuja cada materia como una tarjeta
    <View style={[styles.materiaCard, item.completada && styles.materiaCompletada]}>
      {/* Checkbox para marcar como completada */}
      <TouchableOpacity onPress={() => toggleMateriaCompletada(item.id)} style={styles.checkbox}>
        <Ionicons name={item.completada ? 'checkbox-outline' : 'square-outline'} size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* Información de la materia */}
      <View style={styles.materiaInfo}>
        <Text style={[styles.materiaNombre, item.completada && styles.textoCompletado]}>{item.nombre}</Text>
        {item.profesor ? <Text style={styles.materiaDetalle}>👨‍🏫 {item.profesor}</Text> : null}
        <Text style={styles.materiaDetalle}>📅 Entrega: {item.fechaEntrega}</Text>
        {item.descripcion ? <Text style={styles.materiaDetalle}>📝 {item.descripcion}</Text> : null}
        <View style={[styles.importanciaBadge, { backgroundColor: getImportanciaColor(item.importancia) }]}>
          <Text style={styles.importanciaTexto}>{getImportanciaTexto(item.importancia)}</Text>
        </View>
      </View>

      {/* Botón eliminar */}
      <TouchableOpacity onPress={() => eliminarMateria(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={22} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  const renderNota = ({ item }: { item: Nota }) => (
    // ✅ Dibuja cada nota como una tarjeta
    <View style={[styles.notaCard, item.importante && styles.notaImportante]}>
      <View style={styles.notaHeader}>
        {/* Botón para marcar como importante */}
        <TouchableOpacity onPress={() => toggleImportante(item.id)}>
          <Ionicons 
            name={item.importante ? 'star' : 'star-outline'} 
            size={22} 
            color={item.importante ? '#FF9800' : '#ccc'} 
          />
        </TouchableOpacity>
        <View style={styles.notaMateriaTag}>
          <Text style={styles.notaMateria}>📚 {getNombreMateria(item.materiaId)}</Text>
        </View>
        {/* Botón eliminar */}
        <TouchableOpacity onPress={() => eliminarNota(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.notaTitulo}>{item.titulo}</Text>
      <Text style={styles.notaContenido}>{item.contenido}</Text>
      <Text style={styles.notaFecha}>📅 {item.fecha}</Text>
    </View>
  );

  // ============================================================
  // 3.9 CONTADORES
  // ============================================================

  const tareasPendientes = materias.filter(m => !m.completada);
  // ✅ Cuenta las materias NO completadas

  const tareasUrgentes = materias.filter(m => !m.completada && m.importancia === 'Alta');
  // ✅ Cuenta las materias urgentes (Alta importancia y NO completadas)

  const materiasOrdenadas = getMateriasOrdenadas();
  // ✅ Lista de materias ordenadas según la opción seleccionada

  // ============================================================
  // 3.10 INTERFAZ DE USUARIO (UI - Lo que se ve en la pantalla)
  // ============================================================

  return (
    <View style={styles.container}>
      {/* ============================================================
           HEADER - Parte superior (saludo, fecha, contadores)
      ============================================================ */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>¡Hola, Estudiante!</Text>
          {/* Botón para compartir tareas */}
          <TouchableOpacity onPress={compartirTareas} style={styles.shareButton}>
            <Ionicons name="share-social" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
        <Text style={styles.pendingCount}>
          {tareasPendientes.length} tareas pendientes
        </Text>
        {tareasUrgentes.length > 0 && (
          <Text style={styles.urgentCount}>
            🔥 {tareasUrgentes.length} urgentes
          </Text>
        )}
      </View>

      {/* ============================================================
           ORDENAR - Botones para cambiar el orden
      ============================================================ */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <TouchableOpacity 
          style={[styles.sortButton, ordenPor === 'fecha' && styles.sortButtonActive]}
          onPress={() => setOrdenPor('fecha')}
        >
          <Ionicons name="calendar" size={16} color={ordenPor === 'fecha' ? 'white' : '#333'} />
          <Text style={[styles.sortButtonText, ordenPor === 'fecha' && styles.sortButtonTextActive]}>Fecha</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortButton, ordenPor === 'importancia' && styles.sortButtonActive]}
          onPress={() => setOrdenPor('importancia')}
        >
          <Ionicons name="flame" size={16} color={ordenPor === 'importancia' ? 'white' : '#333'} />
          <Text style={[styles.sortButtonText, ordenPor === 'importancia' && styles.sortButtonTextActive]}>Importancia</Text>
        </TouchableOpacity>
      </View>

      {/* ============================================================
           SELECTOR DE VISTA - Cambiar entre Materias y Notas
      ============================================================ */}
      <View style={styles.selectorContainer}>
        <TouchableOpacity 
          style={[styles.selectorButton, vistaActual === 'materias' && styles.selectorActive]}
          onPress={() => setVistaActual('materias')}
        >
          <Ionicons name="book" size={20} color={vistaActual === 'materias' ? 'white' : '#333'} />
          <Text style={[styles.selectorText, vistaActual === 'materias' && styles.selectorTextActive]}>Materias</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.selectorButton, vistaActual === 'notas' && styles.selectorActive]}
          onPress={() => setVistaActual('notas')}
        >
          <Ionicons name="document-text" size={20} color={vistaActual === 'notas' ? 'white' : '#333'} />
          <Text style={[styles.selectorText, vistaActual === 'notas' && styles.selectorTextActive]}>Notas</Text>
        </TouchableOpacity>
      </View>

      {/* ============================================================
           LISTA DE MATERIAS O NOTAS (según vistaActual)
      ============================================================ */}
      {vistaActual === 'materias' ? (
        <FlatList
          data={materiasOrdenadas}
          renderItem={renderMateria}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listaContainer}
          ListEmptyComponent={
            // ✅ Componente que se muestra cuando NO hay materias
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>No hay materias</Text>
              <Text style={styles.emptySubtext}>Toca el botón + para agregar</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={notas}
          renderItem={renderNota}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listaContainer}
          ListEmptyComponent={
            // ✅ Componente que se muestra cuando NO hay notas
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>No hay notas</Text>
              <Text style={styles.emptySubtext}>Toca el botón + para agregar</Text>
            </View>
          }
        />
      )}

      {/* ============================================================
           MENÚ FLOTANTE Y BOTÓN +
      ============================================================ */}
      {menuVisible && (
        // ✅ Overlay oscuro que cierra el menú al tocarlo
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        />
      )}

      <View style={styles.fabContainer}>
        {menuVisible && (
          // ✅ Opciones del menú (Agregar Materia / Agregar Nota)
          <View style={styles.menuOptions}>
            <TouchableOpacity 
              style={[styles.menuOption, styles.menuOptionMateria]}
              onPress={() => {
                setMenuVisible(false);
                setModalMateriaVisible(true);
              }}
            >
              <Ionicons name="book" size={24} color="white" />
              <Text style={styles.menuOptionText}>Agregar Materia</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuOption, styles.menuOptionNota]}
              onPress={() => {
                setMenuVisible(false);
                setModalNotaVisible(true);
              }}
            >
              <Ionicons name="document-text" size={24} color="white" />
              <Text style={styles.menuOptionText}>Agregar Nota</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ✅ Botón flotante + (abre/cierra el menú) */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <Ionicons name={menuVisible ? "close" : "add"} size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* ============================================================
           MODAL PARA AGREGAR MATERIA (Ventana emergente)
      ============================================================ */}
      <Modal visible={modalMateriaVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>📚 Nueva Materia</Text>

            {/* 📌 Campo: Nombre de la materia */}
            <Text style={styles.label}>📌 Nombre de la materia *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Matemáticas, Historia, Programación..."
              placeholderTextColor="#999"
              value={nuevaMateria.nombre}
              onChangeText={(text) => setNuevaMateria({...nuevaMateria, nombre: text})}
            />

            {/* 👨‍🏫 Campo: Profesor */}
            <Text style={styles.label}>👨‍🏫 Profesor (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Juan Pérez, María Gómez..."
              placeholderTextColor="#999"
              value={nuevaMateria.profesor}
              onChangeText={(text) => setNuevaMateria({...nuevaMateria, profesor: text})}
            />

            {/* 📅 Campo: Fecha de entrega */}
            <Text style={styles.label}>📅 Fecha de entrega *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 20/06/2026"
              placeholderTextColor="#999"
              value={nuevaMateria.fechaEntrega}
              onChangeText={(text) => setNuevaMateria({...nuevaMateria, fechaEntrega: text})}
            />

            {/* ⚠️ Campo: Nivel de importancia */}
            <Text style={styles.label}>⚠️ Nivel de importancia</Text>
            <View style={styles.importanciaContainer}>
              <TouchableOpacity 
                style={[styles.importanciaButton, nuevaMateria.importancia === 'Alta' && styles.importanciaAlta]}
                onPress={() => setNuevaMateria({...nuevaMateria, importancia: 'Alta'})}
              >
                <Text style={styles.importanciaButtonText}>🔥 Alta</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.importanciaButton, nuevaMateria.importancia === 'Media' && styles.importanciaMedia]}
                onPress={() => setNuevaMateria({...nuevaMateria, importancia: 'Media'})}
              >
                <Text style={styles.importanciaButtonText}>⚠️ Media</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.importanciaButton, nuevaMateria.importancia === 'Baja' && styles.importanciaBaja]}
                onPress={() => setNuevaMateria({...nuevaMateria, importancia: 'Baja'})}
              >
                <Text style={styles.importanciaButtonText}>📌 Baja</Text>
              </TouchableOpacity>
            </View>

            {/* 📝 Campo: Descripción */}
            <Text style={styles.label}>📝 Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ej: Examen parcial, proyecto final..."
              placeholderTextColor="#999"
              value={nuevaMateria.descripcion}
              onChangeText={(text) => setNuevaMateria({...nuevaMateria, descripcion: text})}
              multiline
              numberOfLines={3}
            />

            {/* ✅ Botones del modal */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalMateriaVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={agregarMateria}>
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ============================================================
           MODAL PARA AGREGAR NOTA (Ventana emergente)
      ============================================================ */}
      <Modal visible={modalNotaVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>📝 Nueva Nota</Text>

            <Text style={styles.label}>📌 Título de la nota *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Repasar fórmulas, Leer capítulo 5..."
              placeholderTextColor="#999"
              value={nuevaNota.titulo}
              onChangeText={(text) => setNuevaNota({...nuevaNota, titulo: text})}
            />

            <Text style={styles.label}>📚 Materia relacionada (opcional)</Text>
            <View style={styles.materiasContainer}>
              <TouchableOpacity
                style={[styles.materiaOption, nuevaNota.materiaId === '' && styles.materiaOptionSelected]}
                onPress={() => setNuevaNota({...nuevaNota, materiaId: ''})}
              >
                <Text style={styles.materiaOptionText}>Sin materia</Text>
              </TouchableOpacity>
              {materias.map(materia => (
                <TouchableOpacity
                  key={materia.id}
                  style={[styles.materiaOption, nuevaNota.materiaId === materia.id && styles.materiaOptionSelected]}
                  onPress={() => setNuevaNota({...nuevaNota, materiaId: materia.id})}
                >
                  <Text style={styles.materiaOptionText}>{materia.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>📝 Contenido de la nota</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escribe aquí tu nota..."
              placeholderTextColor="#999"
              value={nuevaNota.contenido}
              onChangeText={(text) => setNuevaNota({...nuevaNota, contenido: text})}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity 
              style={styles.importanteButton}
              onPress={() => setNuevaNota({...nuevaNota, importante: !nuevaNota.importante})}
            >
              <Ionicons name={nuevaNota.importante ? 'star' : 'star-outline'} size={24} color={nuevaNota.importante ? '#FF9800' : '#999'} />
              <Text style={[styles.importanteText, nuevaNota.importante && styles.importanteTextActive]}>
                Marcar como nota importante
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalNotaVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={agregarNota}>
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================
// 4. ESTILOS (CSS de la app)
// ============================================================

const styles = StyleSheet.create({
  // ✅ Contenedor principal
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  // ✅ HEADER - Barra superior azul
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 50, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  shareButton: { padding: 8 },
  date: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 5 },
  pendingCount: { fontSize: 16, color: 'white', marginTop: 10, fontWeight: '500' },
  urgentCount: { fontSize: 14, color: '#ffbb33', marginTop: 5 },

  // ✅ ORDENAR - Botones de orden
  sortContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: 'white', marginTop: 10, marginHorizontal: 15, borderRadius: 10, gap: 10 },
  sortLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  sortButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e0e0e0', gap: 5 },
  sortButtonActive: { backgroundColor: '#007AFF' },
  sortButtonText: { fontSize: 12, color: '#333' },
  sortButtonTextActive: { color: 'white' },

  // ✅ SELECTOR DE VISTA - Botones Materias / Notas
  selectorContainer: { flexDirection: 'row', margin: 15, backgroundColor: '#e0e0e0', borderRadius: 10, padding: 4 },
  selectorButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, gap: 8 },
  selectorActive: { backgroundColor: '#007AFF' },
  selectorText: { fontSize: 14, fontWeight: '500', color: '#333' },
  selectorTextActive: { color: 'white' },

  // ✅ LISTA
  listaContainer: { padding: 15 },

  // ✅ TARJETA DE MATERIA
  materiaCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 10, alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  materiaCompletada: { backgroundColor: '#e0e0e0', opacity: 0.7 },
  checkbox: { marginRight: 12, marginTop: 2 },
  materiaInfo: { flex: 1 },
  materiaNombre: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  textoCompletado: { textDecorationLine: 'line-through', color: '#888' },
  materiaDetalle: { fontSize: 13, color: '#666', marginTop: 2 },
  importanciaBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginTop: 6 },
  importanciaTexto: { color: 'white', fontSize: 11, fontWeight: 'bold' },

  // ✅ TARJETA DE NOTA
  notaCard: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  notaImportante: { backgroundColor: '#FFF8E1', borderLeftWidth: 4, borderLeftColor: '#FF9800' },
  notaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  notaMateriaTag: { flex: 1, marginLeft: 10 },
  notaMateria: { fontSize: 12, color: '#666' },
  notaTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  notaContenido: { fontSize: 14, color: '#444', marginBottom: 8 },
  notaFecha: { fontSize: 11, color: '#999', marginTop: 5 },

  // ✅ BOTÓN ELIMINAR
  deleteButton: { padding: 8 },

  // ✅ MENÚ FLOTANTE Y BOTÓN +
  fabContainer: { position: 'absolute', bottom: 20, right: 20, alignItems: 'flex-end' },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  menuOptions: { marginBottom: 15, alignItems: 'flex-end' },
  menuOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 10, width: 180, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  menuOptionMateria: { backgroundColor: '#4CAF50' },
  menuOptionNota: { backgroundColor: '#2196F3' },
  menuOptionText: { color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 10 },
  fab: { backgroundColor: '#007AFF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },

  // ✅ MODALES (Ventanas emergentes)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },

  // ✅ CAMPOS DE TEXTO
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },

  // ✅ IMPORTANCIA (botones Alta/Media/Baja)
  importanciaContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  importanciaButton: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#e0e0e0', alignItems: 'center' },
  importanciaAlta: { backgroundColor: '#ff4444' },
  importanciaMedia: { backgroundColor: '#ffbb33' },
  importanciaBaja: { backgroundColor: '#00C851' },
  importanciaButtonText: { fontWeight: 'bold', color: 'white' },

  // ✅ MATERIAS EN EL MODAL DE NOTA
  materiasContainer: { marginBottom: 15, maxHeight: 150 },
  materiaOption: { padding: 12, borderRadius: 8, marginBottom: 5, backgroundColor: '#f0f0f0' },
  materiaOptionSelected: { backgroundColor: '#007AFF20', borderWidth: 1, borderColor: '#007AFF' },
  materiaOptionText: { fontSize: 14, fontWeight: '500' },

  // ✅ BOTÓN "MARCAR COMO IMPORTANTE"
  importanteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 15 },
  importanteText: { fontSize: 14, color: '#666' },
  importanteTextActive: { color: '#FF9800', fontWeight: 'bold' },

  // ✅ BOTONES DEL MODAL (Cancelar / Guardar)
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelButton: { flex: 1, backgroundColor: '#ccc', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButton: { flex: 1, backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // ✅ PANTALLA VACÍA (cuando no hay materias o notas)
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 50 },
  emptyText: { fontSize: 18, color: '#999', marginTop: 10 },
  emptySubtext: { fontSize: 14, color: '#bbb', marginTop: 5 },
});
