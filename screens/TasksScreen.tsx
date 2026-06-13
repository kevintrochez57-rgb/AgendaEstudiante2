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
  title: string;
  date: string;
  priority: string;
  completed: boolean;
}

export default function TasksScreen() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    cargarTareas();
  }, []);

  const guardarTareas = async (nuevasTareas: Tarea[]) => {
    await AsyncStorage.setItem('@tareas', JSON.stringify(nuevasTareas));
    setTareas(nuevasTareas);
  };

  const cargarTareas = async () => {
    const guardadas = await AsyncStorage.getItem('@tareas');
    if (guardadas) setTareas(JSON.parse(guardadas));
  };

  const agregarTarea = () => {
    if (!newTitle.trim()) {
      Alert.alert('Error', 'Escribe un título');
      return;
    }

    const nuevaTarea: Tarea = {
      id: Date.now().toString(),
      title: newTitle,
      date: newDate || new Date().toLocaleDateString(),
      priority: 'Alta',
      completed: false,
    };

    guardarTareas([...tareas, nuevaTarea]);
    setNewTitle('');
    setNewDate('');
    setModalVisible(false);
    Alert.alert('Éxito', 'Tarea agregada');
  };

  const eliminarTarea = (id: string) => {
    guardarTareas(tareas.filter(t => t.id !== id));
  };

  const toggleCompletada = (id: string) => {
    const nuevas = tareas.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    guardarTareas(nuevas);
  };

  const renderTarea = ({ item }: { item: Tarea }) => (
    <View style={[styles.tareaCard, item.completed && styles.completada]}>
      <TouchableOpacity onPress={() => toggleCompletada(item.id)}>
        <Ionicons name={item.completed ? 'checkbox-outline' : 'square-outline'} size={24} color="#007AFF" />
      </TouchableOpacity>
      <View style={styles.tareaContent}>
        <Text style={[styles.tareaTitle, item.completed && styles.tachado]}>{item.title}</Text>
        <Text style={styles.tareaFecha}>📅 {item.date}</Text>
      </View>
      <TouchableOpacity onPress={() => eliminarTarea(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Tareas</Text>
        <Text style={styles.headerSubtitle}>
          {tareas.filter(t => !t.completed).length} pendientes
        </Text>
      </View>

      <FlatList
        data={tareas}
        renderItem={renderTarea}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭 No hay tareas</Text>
            <Text style={styles.emptySubtext}>Toca el botón + para agregar</Text>
          </View>
        }
      />

      {/* BOTÓN FLOTANTE + */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* MODAL PARA AGREGAR */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Tarea</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Título de la tarea"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Fecha (ej: 20/06/2026)"
              value={newDate}
              onChangeText={setNewDate}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={agregarTarea}>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 5 },
  tareaCard: { flexDirection: 'row', backgroundColor: 'white', margin: 10, padding: 15, borderRadius: 10, alignItems: 'center' },
  completada: { backgroundColor: '#e0e0e0' },
  tareaContent: { flex: 1, marginLeft: 10 },
  tareaTitle: { fontSize: 16, fontWeight: '500' },
  tachado: { textDecorationLine: 'line-through', color: '#888' },
  tareaFecha: { fontSize: 12, color: '#888', marginTop: 4 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#007AFF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '90%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelButton: { flex: 1, backgroundColor: '#ccc', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButton: { flex: 1, backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  emptyContainer: { alignItems: 'center', padding: 50 },
  emptyText: { fontSize: 18, color: '#999' },
  emptySubtext: { fontSize: 14, color: '#bbb', marginTop: 10 },
});
