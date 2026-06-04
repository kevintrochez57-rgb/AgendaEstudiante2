import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Tarea {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: 'Alta' | 'Media' | 'Baja';
  material: string;
  completed: boolean;
}

export default function TasksScreen() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estado para nueva tarea
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newPriority, setNewPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [newMaterial, setNewMaterial] = useState('');

  // Cargar tareas al iniciar
  useEffect(() => {
    cargarTareas();
  }, []);

  // Guardar tareas en AsyncStorage
  const guardarTareas = async (tareasActualizadas: Tarea[]) => {
    try {
      await AsyncStorage.setItem('@tareas', JSON.stringify(tareasActualizadas));
      setTareas(tareasActualizadas);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar las tareas');
    }
  };

  // Cargar tareas desde AsyncStorage
  const cargarTareas = async () => {
    try {
      const tareasGuardadas = await AsyncStorage.getItem('@tareas');
      if (tareasGuardadas) {
        setTareas(JSON.parse(tareasGuardadas));
      }
    } catch (error) {
      console.log('Error al cargar tareas:', error);
    }
  };

  // Agregar nueva tarea
  const agregarTarea = () => {
    if (!newTitle.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    const nuevaTarea: Tarea = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDescription,
      date: newDate || new Date().toLocaleDateString(),
      priority: newPriority,
      material: newMaterial || 'General',
      completed: false,
    };

    const nuevasTareas = [...tareas, nuevaTarea];
    guardarTareas(nuevasTareas);
    
    // Limpiar formulario
    setNewTitle('');
    setNewDescription('');
    setNewDate('');
    setNewPriority('Media');
    setNewMaterial('');
    setModalVisible(false);
    
    Alert.alert('Éxito', 'Tarea agregada correctamente');
  };

  // Eliminar tarea
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
            const nuevasTareas = tareas.filter(tarea => tarea.id !== id);
            guardarTareas(nuevasTareas);
          },
        },
      ]
    );
  };

  // Marcar como completada
  const toggleCompletada = (id: string) => {
    const nuevasTareas = tareas.map(tarea =>
      tarea.id === id ? { ...tarea, completed: !tarea.completed } : tarea
    );
    guardarTareas(nuevasTareas);
  };

  // Obtener color según prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return '#ff4444';
      case 'Media': return '#ffbb33';
      case 'Baja': return '#00C851';
      default: return '#aaa';
    }
  };

  // Renderizar cada tarea
  const renderTarea = ({ item }: { item: Tarea }) => (
    <View style={[styles.tareaCard, item.completed && styles.tareaCompletada]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleCompletada(item.id)}
      >
        <Ionicons
          name={item.completed ? 'checkbox-outline' : 'square-outline'}
          size={24}
          color="#007AFF"
        />
      </TouchableOpacity>
      
      <View style={styles.tareaContent}>
        <Text style={[styles.tareaTitle, item.completed && styles.textoCompletado]}>
          {item.title}
        </Text>
        <Text style={styles.tareaDescription}>{item.description}</Text>
        <View style={styles.tareaDetalles}>
          <Text style={styles.tareaFecha}>📅 {item.date}</Text>
          <Text style={styles.tareaMateria}>📚 {item.material}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => eliminarTarea(item.id)}
      >
        <Ionicons name="trash-outline" size={22} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Tareas</Text>
        <Text style={styles.headerSubtitle}>
          {tareas.filter(t => !t.completed).length} pendientes | {tareas.length} total
        </Text>
      </View>

      {/* Lista de tareas */}
      <FlatList
        data={tareas}
        renderItem={renderTarea}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listaContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No hay tareas</Text>
            <Text style={styles.emptySubtext}>Presiona el botón + para agregar</Text>
          </View>
        }
      />

      {/* Botón flotante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal para agregar tarea */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Tarea</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Título *"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción"
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Fecha (DD/MM/AAAA)"
              value={newDate}
              onChangeText={setNewDate}
            />
            
            <Text style={styles.label}>Prioridad:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newPriority}
                onValueChange={(itemValue: string) => setNewPriority(itemValue as 'Alta' | 'Media' | 'Baja')}
              >
                <Picker.Item label="🔴 Alta" value="Alta" />
                <Picker.Item label="🟡 Media" value="Media" />
                <Picker.Item label="🟢 Baja" value="Baja" />
              </Picker>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Materia"
              value={newMaterial}
              onChangeText={setNewMaterial}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={agregarTarea}
              >
                <Text style={styles.buttonText}>Guardar</Text>
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
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  listaContainer: {
    padding: 15,
  },
  tareaCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tareaCompletada: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  checkbox: {
    marginRight: 12,
  },
  tareaContent: {
    flex: 1,
  },
  tareaTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  textoCompletado: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  tareaDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  tareaDetalles: {
    flexDirection: 'row',
    gap: 15,
  },
  tareaFecha: {
    fontSize: 12,
    color: '#888',
  },
  tareaMateria: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
  },
});
