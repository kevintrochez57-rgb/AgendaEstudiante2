import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Tarea {
  id: string;
  nombre: string;
  materia: string;
  fecha: string;
  prioridad: 'Baja' | 'Media' | 'Alta';
  completada: boolean;
}

const TAREAS_KEY = '@tareas_app';

type Filtro = 'todas' | 'pendientes' | 'completadas';

export default function TareasScreen() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [materia, setMateria] = useState('');
  const [fecha, setFecha] = useState('');
  const [prioridad, setPrioridad] = useState<'Baja' | 'Media' | 'Alta'>('Media');

  useEffect(() => {
    cargarTareas();
  }, []);

  useEffect(() => {
    guardarTareas();
  }, [tareas]);

  const cargarTareas = async () => {
    try {
      const guardadas = await AsyncStorage.getItem(TAREAS_KEY);
      if (guardadas) {
        setTareas(JSON.parse(guardadas));
      } else {
        const tareasEjemplo: Tarea[] = [
          {
            id: '1',
            nombre: 'Parcial de Cálculo',
            materia: 'Matemáticas',
            fecha: '2026-06-10',
            prioridad: 'Alta',
            completada: false,
          },
          {
            id: '2',
            nombre: 'Proyecto POO',
            materia: 'Programación',
            fecha: '2026-06-15',
            prioridad: 'Alta',
            completada: false,
          },
          {
            id: '3',
            nombre: 'Lectura Capítulo 5',
            materia: 'Historia',
            fecha: '2026-06-05',
            prioridad: 'Media',
            completada: false,
          },
        ];
        setTareas(tareasEjemplo);
      }
    } catch (error) {
      console.error('Error cargando:', error);
    }
  };

  const guardarTareas = async () => {
    try {
      await AsyncStorage.setItem(TAREAS_KEY, JSON.stringify(tareas));
    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  const abrirModalAgregar = () => {
    setEditandoId(null);
    setNombre('');
    setMateria('');
    setFecha('');
    setPrioridad('Media');
    setModalVisible(true);
  };

  const abrirModalEditar = (tarea: Tarea) => {
    setEditandoId(tarea.id);
    setNombre(tarea.nombre);
    setMateria(tarea.materia);
    setFecha(tarea.fecha);
    setPrioridad(tarea.prioridad);
    setModalVisible(true);
  };

  const guardarTarea = () => {
    if (!nombre.trim() || !materia.trim() || !fecha.trim()) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    if (editandoId) {
      const tareasActualizadas = tareas.map(tarea =>
        tarea.id === editandoId
          ? { ...tarea, nombre, materia, fecha, prioridad }
          : tarea
      );
      setTareas(tareasActualizadas);
      Alert.alert('Éxito', 'Tarea actualizada');
    } else {
      const nuevaTarea: Tarea = {
        id: Date.now().toString(),
        nombre,
        materia,
        fecha,
        prioridad,
        completada: false,
      };
      setTareas([...tareas, nuevaTarea]);
      Alert.alert('Éxito', 'Tarea agregada');
    }

    setModalVisible(false);
  };

  const toggleCompletada = (id: string) => {
    const tareasActualizadas = tareas.map(tarea =>
      tarea.id === id
        ? { ...tarea, completada: !tarea.completada }
        : tarea
    );
    setTareas(tareasActualizadas);
  };

  const eliminarTarea = (id: string) => {
    Alert.alert(
      'Eliminar tarea',
      '¿Estás seguro de que quieres eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const tareasFiltradas = tareas.filter(tarea => tarea.id !== id);
            setTareas(tareasFiltradas);
            Alert.alert('Éxito', 'Tarea eliminada');
          },
        },
      ]
    );
  };

  const tareasFiltradas = () => {
    if (filtro === 'pendientes') return tareas.filter(t => !t.completada);
    if (filtro === 'completadas') return tareas.filter(t => t.completada);
    return tareas;
  };

  const getColorPrioridad = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta': return '#ff4444';
      case 'Media': return '#ffa500';
      default: return '#4caf50';
    }
  };

  const renderTarea = ({ item }: { item: Tarea }) => (
    <View style={[styles.tarjeta, item.completada && styles.tarjetaCompletada]}>
      <TouchableOpacity style={styles.checkbox} onPress={() => toggleCompletada(item.id)}>
        <Ionicons
          name={item.completada ? 'checkbox' : 'square-outline'}
          size={24}
          color={item.completada ? '#5c4dbf' : '#ccc'}
        />
      </TouchableOpacity>

      <View style={styles.infoTarea}>
        <Text style={[styles.nombreTarea, item.completada && styles.tareaCompletada]}>
          {item.nombre}
        </Text>
        <Text style={styles.materiaTarea}>{item.materia}</Text>
        <Text style={styles.fechaTarea}>📅 {item.fecha}</Text>
      </View>

      <View style={styles.acciones}>
        <View style={[styles.badgePrioridad, { backgroundColor: getColorPrioridad(item.prioridad) }]}>
          <Text style={styles.textoBadge}>{item.prioridad}</Text>
        </View>
        <TouchableOpacity onPress={() => abrirModalEditar(item)} style={styles.botonEditar}>
          <Ionicons name="pencil-outline" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => eliminarTarea(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>📋 Mis Tareas</Text>
        <Text style={styles.subtitulo}>
          {tareas.filter(t => !t.completada).length} pendientes · {tareas.filter(t => t.completada).length} completadas
        </Text>
      </View>

      <View style={styles.filtros}>
        <TouchableOpacity
          style={[styles.filtroBoton, filtro === 'todas' && styles.filtroActivo]}
          onPress={() => setFiltro('todas')}
        >
          <Text style={[styles.filtroTexto, filtro === 'todas' && styles.filtroTextoActivo]}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBoton, filtro === 'pendientes' && styles.filtroActivo]}
          onPress={() => setFiltro('pendientes')}
        >
          <Text style={[styles.filtroTexto, filtro === 'pendientes' && styles.filtroTextoActivo]}>Pendientes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBoton, filtro === 'completadas' && styles.filtroActivo]}
          onPress={() => setFiltro('completadas')}
        >
          <Text style={[styles.filtroTexto, filtro === 'completadas' && styles.filtroTextoActivo]}>Completadas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tareasFiltradas()}
        keyExtractor={(item) => item.id}
        renderItem={renderTarea}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Ionicons name="checkmark-done-circle" size={60} color="#ccc" />
            <Text style={styles.textoVacio}>No hay tareas</Text>
            <Text style={styles.textoVacioSecundario}>¡Agrega tu primera tarea!</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.botonFlotante} onPress={abrirModalAgregar}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>{editandoId ? 'Editar Tarea' : 'Nueva Tarea'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre de la tarea"
              value={nombre}
              onChangeText={setNombre}
            />

            <TextInput
              style={styles.input}
              placeholder="Materia"
              value={materia}
              onChangeText={setMateria}
            />

            <TextInput
              style={styles.input}
              placeholder="Fecha (YYYY-MM-DD)"
              value={fecha}
              onChangeText={setFecha}
            />

            <Text style={styles.labelPrioridad}>Prioridad:</Text>
            <View style={styles.prioridadContainer}>
              {(['Baja', 'Media', 'Alta'] as const).map((nivel) => (
                <TouchableOpacity
                  key={nivel}
                  style={[styles.botonPrioridad, prioridad === nivel && styles.prioridadSeleccionada]}
                  onPress={() => setPrioridad(nivel)}
                >
                  <Text style={[styles.textoPrioridad, prioridad === nivel && styles.textoPrioridadSeleccionada]}>
                    {nivel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBotones}>
              <TouchableOpacity style={styles.botonCancelar} onPress={() => setModalVisible(false)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonGuardar} onPress={guardarTarea}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{editandoId ? 'Actualizar' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#5c4dbf',
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitulo: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 5,
  },
  filtros: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtroBoton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filtroActivo: {
    backgroundColor: '#5c4dbf',
  },
  filtroTexto: {
    fontSize: 14,
    color: '#666',
  },
  filtroTextoActivo: {
    color: 'white',
    fontWeight: 'bold',
  },
  lista: {
    padding: 15,
  },
  tarjeta: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tarjetaCompletada: {
    backgroundColor: '#f9f9f9',
    opacity: 0.7,
  },
  checkbox: {
    marginRight: 15,
  },
  infoTarea: {
    flex: 1,
  },
  nombreTarea: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tareaCompletada: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  materiaTarea: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  fechaTarea: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  acciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgePrioridad: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  textoBadge: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  botonEditar: {
    padding: 5,
  },
  botonFlotante: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#5c4dbf',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  vacio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  textoVacio: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
  },
  textoVacioSecundario: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5c4dbf',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  labelPrioridad: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  prioridadContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  botonPrioridad: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  prioridadSeleccionada: {
    borderColor: 'transparent',
    backgroundColor: '#5c4dbf',
  },
  textoPrioridad: {
    fontSize: 14,
    color: '#666',
  },
  textoPrioridadSeleccionada: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  botonGuardar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#5c4dbf',
    alignItems: 'center',
  },
});
