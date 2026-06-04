import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Definición de tipos
interface Task {
  id: string;
  title: string;
  date: string;
  priority: 'Alta' | 'Media' | 'Baja';
  completed: boolean;
}

interface QuickNote {
  id: string;
  text: string;
}

export default function HomeScreen() {
  // Estado para las tareas
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Parcial de Cálculo',
      date: '2026-06-09',
      priority: 'Alta',
      completed: false,
    },
    {
      id: '2',
      title: 'Proyecto POO',
      date: '2026-06-14',
      priority: 'Media',
      completed: false,
    },
    {
      id: '3',
      title: 'Lectura Cap. 5',
      date: '2026-06-04',
      priority: 'Media',
      completed: false,
    },
  ]);

  // Estado para la nota rápida
  const [quickNote, setQuickNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<QuickNote[]>([
    { id: '1', text: 'Llevar calculadora al parcial de cálculo' },
    { id: '2', text: 'Revisar apuntes de Mate' },
  ]);

  // Estado para el próximo examen
  const [nextExam] = useState({
    title: 'Examen Final - Estadística',
    date: '2026-06-15',
    location: 'Salón 204',
  });

  // Obtener fecha actual formateada
  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    };
    return date.toLocaleDateString('es-ES', options);
  };

  // Formatear fecha de tarea
  const formatTaskDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    };
    return date.toLocaleDateString('es-ES', options);
  };

  // Obtener texto de prioridad/urgencia
  const getPriorityText = (priority: string, dateString: string) => {
    const today = new Date();
    const taskDate = new Date(dateString);
    const daysDiff = Math.ceil(
      (taskDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );

    if (priority === 'Alta') return 'Urgente';
    if (priority === 'Media' && daysDiff <= 7) return 'Esta semana';
    return 'Próximamente';
  };

  // Obtener color según urgencia
  const getPriorityColor = (priority: string, dateString: string) => {
    const text = getPriorityText(priority, dateString);
    switch (text) {
      case 'Urgente':
        return '#FF3B30';
      case 'Esta semana':
        return '#FF9500';
      default:
        return '#34C759';
    }
  };

  // Calcular días hasta el examen
  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const examDate = new Date(dateString);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return diffDays;
  };

  // Agregar nota rápida
  const addQuickNote = () => {
    if (quickNote.trim()) {
      setSavedNotes([
        { id: Date.now().toString(), text: quickNote },
        ...savedNotes,
      ]);
      setQuickNote('');
      Alert.alert('Éxito', 'Nota agregada correctamente');
    } else {
      Alert.alert('Error', 'Escribe una nota antes de guardar');
    }
  };

  // Eliminar nota
  const deleteNote = (id: string) => {
    Alert.alert(
      'Eliminar Nota',
      '¿Estás seguro de que quieres eliminar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: () => {
            setSavedNotes(savedNotes.filter((note) => note.id !== id));
            Alert.alert('Éxito', 'Nota eliminada');
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Marcar tarea como completada
  const toggleTaskCompleted = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Navegar a pantalla de materiales
  const goToMaterials = () => {
    router.push('/(tabs)/materials');
  };

  // Navegar a pantalla de tareas
  const goToTasks = () => {
    router.push('/(tabs)/tareas');
  };

  // Contar tareas pendientes
  const pendingTasksCount = tasks.filter((task) => !task.completed).length;
  const pendingTasks = tasks.filter((task) => !task.completed);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER - Saludo y fecha */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, Estudiante!</Text>
          <Text style={styles.date}>{getCurrentDate()}</Text>
          <Text style={styles.pendingBadge}>
            {pendingTasksCount} tareas pendientes
          </Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={goToMaterials}>
          <Ionicons name="person-circle-outline" size={50} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* TAREAS PENDIENTES */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tareas Pendientes</Text>
          <TouchableOpacity onPress={goToTasks}>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {pendingTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle" size={60} color="#34C759" />
            <Text style={styles.emptyStateText}>
              ¡No hay tareas pendientes!
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Disfruta tu día 😊
            </Text>
          </View>
        ) : (
          pendingTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => toggleTaskCompleted(task.id)}
              activeOpacity={0.7}
            >
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDate}>
                  {formatTaskDate(task.date)}
                </Text>
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor: getPriorityColor(
                      task.priority,
                      task.date
                    ),
                  },
                ]}
              >
                <Text style={styles.priorityText}>
                  {getPriorityText(task.priority, task.date)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* NOTA RÁPIDA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nota Rápida</Text>
        <View style={styles.quickNoteContainer}>
          <TextInput
            style={styles.quickNoteInput}
            placeholder="Escribe una nota rápida..."
            placeholderTextColor="#999"
            value={quickNote}
            onChangeText={setQuickNote}
            multiline
          />
          <TouchableOpacity style={styles.saveNoteButton} onPress={addQuickNote}>
            <Ionicons name="save-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Lista de notas guardadas */}
        {savedNotes.map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <Text style={styles.noteText}>{note.text}</Text>
            <TouchableOpacity onPress={() => deleteNote(note.id)}>
              <Ionicons name="close-circle" size={22} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* PRÓXIMO EXAMEN */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximo Examen</Text>
        <View style={styles.examCard}>
          <View style={styles.examHeader}>
            <Ionicons name="alert-circle" size={28} color="#FF3B30" />
            <Text style={styles.examTitle}>{nextExam.title}</Text>
          </View>
          <View style={styles.examDetails}>
            <View style={styles.examDetail}>
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Text style={styles.examDetailText}>
                {formatTaskDate(nextExam.date)}
              </Text>
            </View>
            <View style={styles.examDetail}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.examDetailText}>{nextExam.location}</Text>
            </View>
          </View>
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownNumber}>
              {getDaysUntil(nextExam.date)}
            </Text>
            <Text style={styles.countdownLabel}>
              {getDaysUntil(nextExam.date) === 1 ? 'día' : 'días'}
            </Text>
          </View>
        </View>
      </View>

      {/* Botones de navegación rápida */}
      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.navButton} onPress={goToMaterials}>
          <Ionicons name="folder-open-outline" size={30} color="#007AFF" />
          <Text style={styles.navButtonText}>Materiales</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={goToTasks}>
          <Ionicons name="checkbox-outline" size={30} color="#007AFF" />
          <Text style={styles.navButtonText}>Tareas</Text>
        </TouchableOpacity>
      </View>

      {/* Espacio al final */}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  pendingBadge: {
    fontSize: 13,
    color: '#007AFF',
    marginTop: 8,
    fontWeight: '500',
  },
  profileButton: {
    padding: 5,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 13,
    color: '#666',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  emptyStateSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  quickNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  quickNoteInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    maxHeight: 80,
  },
  saveNoteButton: {
    padding: 8,
  },
  noteCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    marginRight: 10,
  },
  examCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  examHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 12,
    flex: 1,
  },
  examDetails: {
    marginBottom: 20,
  },
  examDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  examDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  countdownNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  countdownLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  bottomSpace: {
    height: 30,
  },
});
