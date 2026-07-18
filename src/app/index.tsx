import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import TutorialScreen from '../components/ui/TutorialScreen';

// ============================================================
// CONFIGURACIÓN DE NOTIFICACIONES
// ============================================================

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    bypassDnd: true,
  });
}

// ============================================================
// INTERFACES
// ============================================================

interface Materia {
  id: string;
  nombre: string;
  profesor: string;
  fechaEntrega: string;
  importancia: 'Alta' | 'Media' | 'Baja';
  descripcion: string;
  completada: boolean;
  notificacionId?: string;
}

interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  materiaId: string;
  fecha: string;
  importante: boolean;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function HomeScreen() {
  // Estados para materias
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [modalMateriaVisible, setModalMateriaVisible] = useState(false);
  const [nuevaMateria, setNuevaMateria] = useState({
    nombre: '',
    profesor: '',
    fechaEntrega: '',
    importancia: 'Media' as 'Alta' | 'Media' | 'Baja',
    descripcion: '',
    completada: false
  });

  // Estados para notas
  const [notas, setNotas] = useState<Nota[]>([]);
  const [modalNotaVisible, setModalNotaVisible] = useState(false);
  const [nuevaNota, setNuevaNota] = useState({
    titulo: '',
    contenido: '',
    materiaId: '',
    importante: false
  });

  // Estado para el menú flotante
  const [menuVisible, setMenuVisible] = useState(false);
  const [vistaActual, setVistaActual] = useState<'materias' | 'notas'>('materias');
  const [ordenPor, setOrdenPor] = useState<'fecha' | 'importancia'>('fecha');

  // Estado para el tutorial
  const [tutorialVisible, setTutorialVisible] = useState(false);

  // ============================================================
  // EFECTOS
  // ============================================================

  useEffect(() => {
    solicitarPermisosNotificacion();
    cargarMaterias();
    cargarNotas();
    verificarPrimeraVez();

    const subscriptionReceived = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    const subscriptionResponse = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación respondida:', response);
    });

    return () => {
      subscriptionReceived.remove();
      subscriptionResponse.remove();
    };
  }, []);

  // ============================================================
  // FUNCIONES DEL TUTORIAL
  // ============================================================

  const verificarPrimeraVez = async () => {
    try {
      const tutorialVisto = await AsyncStorage.getItem('@tutorialVisto');
      if (!tutorialVisto) {
        setTutorialVisible(true);
      }
    } catch (error) {
      console.log('Error al verificar tutorial:', error);
    }
  };

  const cerrarTutorial = async () => {
    await AsyncStorage.setItem('@tutorialVisto', 'true');
    setTutorialVisible(false);
  };

  // ============================================================
  // FUNCIONES DE NOTIFICACIONES
  // ============================================================

  const solicitarPermisosNotificacion = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'No podrás recibir recordatorios');
    }
  };

  const programarNotificacion = async (nombre: string, fechaEntrega: string) => {
    try {
      const partes = fechaEntrega.split('/');
      if (partes.length === 3) {
        const fechaNotificacion = new Date(
          parseInt(partes[2]),
          parseInt(partes[1]) - 1,
          parseInt(partes[0]) - 1,
          9, 0, 0
        );

        if (fechaNotificacion > new Date()) {
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Recordatorio de tarea',
              body: `"${nombre}" se entrega mañana ${fechaEntrega}`,
              sound: true,
            },
            trigger: {
              date: fechaNotificacion,
              type: 'date',
            } as any,
          });
          return notificationId;
        }
      }
    } catch (error) {
      console.log('Error al programar notificación:', error);
    }
    return null;
  };

  // ============================================================
  // FUNCIONES PARA MATERIAS
  // ============================================================

  const cargarMaterias = async () => {
    try {
      const guardadas = await AsyncStorage.getItem('@materias');
      if (guardadas) setMaterias(JSON.parse(guardadas));
    } catch (error) {}
  };

  const guardarMaterias = async (nuevas: Materia[]) => {
    await AsyncStorage.setItem('@materias', JSON.stringify(nuevas));
    setMaterias(nuevas);
  };

  const agregarMateria = async () => {
    if (!nuevaMateria.nombre.trim()) {
      Alert.alert('Error', 'El nombre de la materia es obligatorio');
      return;
    }
    if (!nuevaMateria.fechaEntrega.trim()) {
      Alert.alert('Error', 'La fecha de entrega es obligatoria');
      return;
    }

    const materia: Materia = {
      id: Date.now().toString(),
      ...nuevaMateria,
    };

    const notificationId = await programarNotificacion(materia.nombre, materia.fechaEntrega);
    if (notificationId) {
      materia.notificacionId = notificationId;
    }

    guardarMaterias([...materias, materia]);
    setNuevaMateria({
      nombre: '',
      profesor: '',
      fechaEntrega: '',
      importancia: 'Media',
      descripcion: '',
      completada: false
    });
    setModalMateriaVisible(false);
    setMenuVisible(false);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Éxito', notificationId ? 'Materia agregada con recordatorio' : 'Materia agregada');
  };

  const eliminarMateria = async (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar esta materia?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const materia = materias.find(m => m.id === id);
          if (materia?.notificacionId) {
            await Notifications.cancelScheduledNotificationAsync(materia.notificacionId);
          }
          guardarMaterias(materias.filter(m => m.id !== id));
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    ]);
  };

  const toggleMateriaCompletada = async (id: string) => {
    const nuevas = materias.map(m =>
      m.id === id ? { ...m, completada: !m.completada } : m
    );
    guardarMaterias(nuevas);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // ============================================================
  // FUNCIONES PARA NOTAS
  // ============================================================

  const cargarNotas = async () => {
    try {
      const guardadas = await AsyncStorage.getItem('@notas');
      if (guardadas) setNotas(JSON.parse(guardadas));
    } catch (error) {}
  };

  const guardarNotas = async (nuevas: Nota[]) => {
    await AsyncStorage.setItem('@notas', JSON.stringify(nuevas));
    setNotas(nuevas);
  };

  const agregarNota = async () => {
    if (!nuevaNota.titulo.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    const nota: Nota = {
      id: Date.now().toString(),
      titulo: nuevaNota.titulo,
      contenido: nuevaNota.contenido,
      materiaId: nuevaNota.materiaId,
      fecha: new Date().toLocaleDateString(),
      importante: nuevaNota.importante,
    };

    guardarNotas([...notas, nota]);
    setNuevaNota({ titulo: '', contenido: '', materiaId: '', importante: false });
    setModalNotaVisible(false);
    setMenuVisible(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Éxito', 'Nota agregada');
  };

  const eliminarNota = async (id: string) => {
    guardarNotas(notas.filter(n => n.id !== id));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const toggleImportante = async (id: string) => {
    const nuevas = notas.map(n =>
      n.id === id ? { ...n, importante: !n.importante } : n
    );
    guardarNotas(nuevas);
  };

  // ============================================================
  // COMPARTIR TAREAS
  // ============================================================

  const compartirTareas = async () => {
    const materiasPendientes = materias.filter(m => !m.completada);

    if (materiasPendientes.length === 0) {
      Alert.alert('No hay tareas', 'No hay tareas pendientes para compartir');
      return;
    }

    let mensaje = 'MIS TAREAS PENDIENTES\n\n';
    mensaje += `${new Date().toLocaleDateString()}\n`;
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
      if (isAvailable) {
        await Sharing.shareAsync(mensaje);
      } else {
        Alert.alert('Error', 'No se puede compartir en este dispositivo');
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir las tareas');
    }
  };

  // ============================================================
  // ORDENAR MATERIAS
  // ============================================================

  const getMateriasOrdenadas = () => {
    let ordenadas = [...materias];

    if (ordenPor === 'fecha') {
      ordenadas.sort((a, b) => {
        const fechaA = a.fechaEntrega.split('/').reverse().join('');
        const fechaB = b.fechaEntrega.split('/').reverse().join('');
        return fechaA.localeCompare(fechaB);
      });
    } else {
      const prioridad = { 'Alta': 0, 'Media': 1, 'Baja': 2 };
      ordenadas.sort((a, b) => prioridad[a.importancia] - prioridad[b.importancia]);
    }

    return ordenadas;
  };

  const getNombreMateria = (id: string) => {
    const materia = materias.find(m => m.id === id);
    return materia ? materia.nombre : 'Sin materia';
  };

  const getImportanciaColor = (importancia: string) => {
    switch (importancia) {
      case 'Alta': return '#ff4444';
      case 'Media': return '#ffbb33';
      case 'Baja': return '#00C851';
      default: return '#aaa';
    }
  };

  const getImportanciaTexto = (importancia: string) => {
    switch (importancia) {
      case 'Alta': return 'Urgente';
      case 'Media': return 'Importante';
      case 'Baja': return 'Normal';
      default: return '';
    }
  };

  // ============================================================
  // RENDERIZAR MATERIA
  // ============================================================

  const renderMateria = ({ item }: { item: Materia }) => (
    <View style={[styles.materiaCard, item.completada && styles.materiaCompletada]}>
      <TouchableOpacity onPress={() => toggleMateriaCompletada(item.id)} style={styles.checkbox}>
        <Ionicons name={item.completada ? 'checkbox-outline' : 'square-outline'} size={24} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.materiaInfo}>
        <Text style={[styles.materiaNombre, item.completada && styles.textoCompletado]}>{item.nombre}</Text>
        {item.profesor ? <Text style={styles.materiaDetalle}>Profesor: {item.profesor}</Text> : null}
        <Text style={styles.materiaDetalle}>Entrega: {item.fechaEntrega}</Text>
        {item.descripcion ? <Text style={styles.materiaDetalle}>Descripcion: {item.descripcion}</Text> : null}
        <View style={[styles.importanciaBadge, { backgroundColor: getImportanciaColor(item.importancia) }]}>
          <Text style={styles.importanciaTexto}>{getImportanciaTexto(item.importancia)}</Text>
        </View>
        {item.notificacionId && (
          <Text style={styles.notificacionTexto}>Recordatorio programado</Text>
        )}
      </View>

      <TouchableOpacity onPress={() => eliminarMateria(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={22} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  // ============================================================
  // RENDERIZAR NOTA
  // ============================================================

  const renderNota = ({ item }: { item: Nota }) => (
    <View style={[styles.notaCard, item.importante && styles.notaImportante]}>
      <View style={styles.notaHeader}>
        <TouchableOpacity onPress={() => toggleImportante(item.id)}>
          <Ionicons
            name={item.importante ? 'star' : 'star-outline'}
            size={22}
            color={item.importante ? '#FF9800' : '#ccc'}
          />
        </TouchableOpacity>
        <View style={styles.notaMateriaTag}>
          <Text style={styles.notaMateria}>Materia: {getNombreMateria(item.materiaId)}</Text>
        </View>
        <TouchableOpacity onPress={() => eliminarNota(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.notaTitulo}>{item.titulo}</Text>
      <Text style={styles.notaContenido}>{item.contenido}</Text>
      <Text style={styles.notaFecha}>{item.fecha}</Text>
    </View>
  );

  // ============================================================
  // CONTADORES
  // ============================================================

  const tareasPendientes = materias.filter(m => !m.completada);
  const tareasUrgentes = materias.filter(m => !m.completada && m.importancia === 'Alta');
  const materiasOrdenadas = getMateriasOrdenadas();

  // ============================================================
  // INTERFAZ DE USUARIO (UI)
  // ============================================================

  return (
    <View style={styles.container}>
      {/* ===== TUTORIAL ===== */}
      <TutorialScreen visible={tutorialVisible} onClose={cerrarTutorial} />

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>¡Hola, Estudiante!</Text>
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
            {tareasUrgentes.length} urgentes
          </Text>
        )}
      </View>

      {/* ===== ORDENAR ===== */}
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

      {/* ===== SELECTOR DE VISTA ===== */}
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

      {/* ===== LISTA ===== */}
      {vistaActual === 'materias' ? (
        <FlatList
          data={materiasOrdenadas}
          renderItem={renderMateria}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listaContainer}
          ListEmptyComponent={
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
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>No hay notas</Text>
              <Text style={styles.emptySubtext}>Toca el botón + para agregar</Text>
            </View>
          }
        />
      )}

      {/* ===== MENÚ FLOTANTE ===== */}
      {menuVisible && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />
      )}

      <View style={styles.fabContainer}>
        {menuVisible && (
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

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <Ionicons name={menuVisible ? "close" : "add"} size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* ===== MODAL AGREGAR MATERIA (SIN EMOJIS) ===== */}
      <Modal visible={modalMateriaVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Nueva Materia</Text>

            <Text style={styles.label}>Nombre de la materia *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Matemáticas, Historia, Programación..."
              placeholderTextColor="#999"
              value={nuevaMateria.nombre}
              onChangeText={(text) => setNuevaMateria({ ...nuevaMateria, nombre: text })}
            />

            <Text style={styles.label}>Profesor (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Juan Pérez, María Gómez..."
              placeholderTextColor="#999"
              value={nuevaMateria.profesor}
              onChangeText={(text) => setNuevaMateria({ ...nuevaMateria, profesor: text })}
            />

            <Text style={styles.label}>Fecha de entrega *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 20/07/2026"
              placeholderTextColor="#999"
              value={nuevaMateria.fechaEntrega}
              onChangeText={(text) => setNuevaMateria({ ...nuevaMateria, fechaEntrega: text })}
            />
            <Text style={styles.notaInfo}>Recibirás recordatorio 1 día antes a las 9:00 AM</Text>

            <Text style={styles.label}>Nivel de importancia</Text>
            <View style={styles.importanciaContainer}>
              <TouchableOpacity
                style={[styles.importanciaButton, nuevaMateria.importancia === 'Alta' && styles.importanciaAlta]}
                onPress={() => setNuevaMateria({ ...nuevaMateria, importancia: 'Alta' })}
              >
                <Text style={styles.importanciaButtonText}>🔥 Alta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.importanciaButton, nuevaMateria.importancia === 'Media' && styles.importanciaMedia]}
                onPress={() => setNuevaMateria({ ...nuevaMateria, importancia: 'Media' })}
              >
                <Text style={styles.importanciaButtonText}>⚠️ Media</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.importanciaButton, nuevaMateria.importancia === 'Baja' && styles.importanciaBaja]}
                onPress={() => setNuevaMateria({ ...nuevaMateria, importancia: 'Baja' })}
              >
                <Text style={styles.importanciaButtonText}>📌 Baja</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ej: Examen parcial, proyecto final..."
              placeholderTextColor="#999"
              value={nuevaMateria.descripcion}
              onChangeText={(text) => setNuevaMateria({ ...nuevaMateria, descripcion: text })}
              multiline
              numberOfLines={3}
            />

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

      {/* ===== MODAL AGREGAR NOTA (SIN EMOJIS) ===== */}
      <Modal visible={modalNotaVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Nueva Nota</Text>

            <Text style={styles.label}>Título de la nota *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Repasar fórmulas..."
              placeholderTextColor="#999"
              value={nuevaNota.titulo}
              onChangeText={(text) => setNuevaNota({ ...nuevaNota, titulo: text })}
            />

            <Text style={styles.label}>Materia relacionada (opcional)</Text>
            <View style={styles.materiasContainer}>
              <TouchableOpacity
                style={[styles.materiaOption, nuevaNota.materiaId === '' && styles.materiaOptionSelected]}
                onPress={() => setNuevaNota({ ...nuevaNota, materiaId: '' })}
              >
                <Text style={styles.materiaOptionText}>Sin materia</Text>
              </TouchableOpacity>
              {materias.map(materia => (
                <TouchableOpacity
                  key={materia.id}
                  style={[styles.materiaOption, nuevaNota.materiaId === materia.id && styles.materiaOptionSelected]}
                  onPress={() => setNuevaNota({ ...nuevaNota, materiaId: materia.id })}
                >
                  <Text style={styles.materiaOptionText}>{materia.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Contenido de la nota</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escribe aquí tu nota..."
              placeholderTextColor="#999"
              value={nuevaNota.contenido}
              onChangeText={(text) => setNuevaNota({ ...nuevaNota, contenido: text })}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={styles.importanteButton}
              onPress={() => setNuevaNota({ ...nuevaNota, importante: !nuevaNota.importante })}
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
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 50, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  shareButton: { padding: 8 },
  date: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 5 },
  pendingCount: { fontSize: 16, color: 'white', marginTop: 10, fontWeight: '500' },
  urgentCount: { fontSize: 14, color: '#ffbb33', marginTop: 5 },

  sortContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: 'white', marginTop: 10, marginHorizontal: 15, borderRadius: 10, gap: 10 },
  sortLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  sortButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e0e0e0', gap: 5 },
  sortButtonActive: { backgroundColor: '#007AFF' },
  sortButtonText: { fontSize: 12, color: '#333' },
  sortButtonTextActive: { color: 'white' },

  selectorContainer: { flexDirection: 'row', margin: 15, backgroundColor: '#e0e0e0', borderRadius: 10, padding: 4 },
  selectorButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, gap: 8 },
  selectorActive: { backgroundColor: '#007AFF' },
  selectorText: { fontSize: 14, fontWeight: '500', color: '#333' },
  selectorTextActive: { color: 'white' },

  listaContainer: { padding: 15 },

  materiaCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 10, alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  materiaCompletada: { backgroundColor: '#e0e0e0', opacity: 0.7 },
  checkbox: { marginRight: 12, marginTop: 2 },
  materiaInfo: { flex: 1 },
  materiaNombre: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  textoCompletado: { textDecorationLine: 'line-through', color: '#888' },
  materiaDetalle: { fontSize: 13, color: '#666', marginTop: 2 },
  importanciaBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginTop: 6 },
  importanciaTexto: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  notificacionTexto: { fontSize: 11, color: '#007AFF', marginTop: 4, fontWeight: '500' },

  notaCard: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  notaImportante: { backgroundColor: '#FFF8E1', borderLeftWidth: 4, borderLeftColor: '#FF9800' },
  notaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  notaMateriaTag: { flex: 1, marginLeft: 10 },
  notaMateria: { fontSize: 12, color: '#666' },
  notaTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  notaContenido: { fontSize: 14, color: '#444', marginBottom: 8 },
  notaFecha: { fontSize: 11, color: '#999', marginTop: 5 },

  deleteButton: { padding: 8 },

  fabContainer: { position: 'absolute', bottom: 20, right: 20, alignItems: 'flex-end' },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  menuOptions: { marginBottom: 15, alignItems: 'flex-end' },
  menuOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 10, width: 180, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  menuOptionMateria: { backgroundColor: '#4CAF50' },
  menuOptionNota: { backgroundColor: '#2196F3' },
  menuOptionText: { color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 10 },
  fab: { backgroundColor: '#007AFF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
  notaInfo: { fontSize: 12, color: '#007AFF', marginBottom: 15, fontStyle: 'italic' },

  importanciaContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  importanciaButton: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#e0e0e0', alignItems: 'center' },
  importanciaAlta: { backgroundColor: '#ff4444' },
  importanciaMedia: { backgroundColor: '#ffbb33' },
  importanciaBaja: { backgroundColor: '#00C851' },
  importanciaButtonText: { fontWeight: 'bold', color: 'white' },

  materiasContainer: { marginBottom: 15, maxHeight: 150 },
  materiaOption: { padding: 12, borderRadius: 8, marginBottom: 5, backgroundColor: '#f0f0f0' },
  materiaOptionSelected: { backgroundColor: '#007AFF20', borderWidth: 1, borderColor: '#007AFF' },
  materiaOptionText: { fontSize: 14, fontWeight: '500' },

  importanteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 15 },
  importanteText: { fontSize: 14, color: '#666' },
  importanteTextActive: { color: '#FF9800', fontWeight: 'bold' },

  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelButton: { flex: 1, backgroundColor: '#ccc', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButton: { flex: 1, backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 50 },
  emptyText: { fontSize: 18, color: '#999', marginTop: 10 },
  emptySubtext: { fontSize: 14, color: '#bbb', marginTop: 5 },
});
