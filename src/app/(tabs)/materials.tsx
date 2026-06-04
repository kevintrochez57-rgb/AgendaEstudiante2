import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Definición de tipos
interface Materia {
  id: string;
  nombre: string;
  color: string;
  horario: string;
  profesor: string;
  aulas: string;
}

interface Tarea {
  id: string;
  nombre: string;
  materia: string;
  fecha: string;
  prioridad: 'Baja' | 'Media' | 'Alta';
  completada: boolean;
}

const MATERIAS_KEY = '@agenda_materias';
const TAREAS_KEY = '@agenda_tareas';

// Colores predefinidos para materias
const COLORES = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F5B7B1', '#A9DFBF', '#F9E79F', '#D7BDE2', '#AED6F1'
];

export default function MateriasScreen() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nuevaMateria, setNuevaMateria] = useState({
    nombre: '',
    color: COLORES[0],
    horario: '',
    profesor: '',
    aulas: '',
  });

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const materiasGuardadas = await AsyncStorage.getItem(MATERIAS_KEY);
      const tareasGuardadas = await AsyncStorage.getItem(TAREAS_KEY);
      
      if (materiasGuardadas) {
        setMaterias(JSON.parse(materiasGuardadas));
      } else {
        // Datos de ejemplo
        const materiasEjemplo: Materia[] = [
          {
            id: '1',
            nombre: 'Cálculo',
            color: COLORES[0],
            horario: 'Lunes y Miércoles 8:00-10:00',
            profesor: 'Dr. García',
            aulas: 'Salón 101',
          },
          {
            id: '2',
            nombre: 'Programación',
            color: COLORES[1],
            horario: 'Martes y Jueves 10:00-12:00',
            profesor: 'Ing. Rodríguez',
            aulas: 'Laboratorio 3',
          },
          {
            id: '3',
            nombre: 'Estadística',
            color: COLORES[2],
            horario: 'Viernes 14:00-16:00',
            profesor: 'Dra. Martínez',
            aulas: 'Salón 204',
          },
        ];
        setMaterias(materiasEjemplo);
        await AsyncStorage.setItem(MATERIAS_KEY, JSON.stringify(materiasEjemplo));
      }
      
      if (tareasGuardadas) {
        setTareas(JSON.parse(tareasGuardadas));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarMaterias = async (nuevasMaterias: Materia[]) => {
    try {
      await AsyncStorage.setItem(MATERIAS_KEY, JSON.stringify(nuevasMaterias));
    } catch (error) {
      console.error('Error al guardar materias:', error);
    }
  };

  // Agregar o editar materia
  const guardarMateria = () => {
    if (!nuevaMateria.nombre.trim()) {
      Alert.alert('Error', 'El nombre de la materia es requerido');
      return;
    }

    if (editandoId) {
      // Editar materia existente
      const materiasActualizadas = materias.map(materia =>
        materia.id === editandoId
          ? { ...nuevaMateria, id: editandoId }
          : materia
      );
      setMaterias(materiasActualizadas);
      guardarMaterias(materiasActualizadas);
      Alert.alert('Éxito', 'Materia actualizada ✅');
    } else {
      // Agregar nueva materia
      const nueva: Materia = {
        id: Date.now().toString(),
        ...nuevaMateria,
      };
      const nuevasMaterias = [...materias, nueva];
      setMaterias(nuevasMaterias);
      guardarMaterias(nuevasMaterias);
      Alert.alert('Éxito', 'Materia agregada ✅');
    }

    cerrarModal();
  };

  // Eliminar materia
  const eliminarMateria = (id: string, nombre: string) => {
    // Verificar si hay tareas con esta materia
    const tareasConMateria = tareas.filter(t => t.materia === nombre);
    
    Alert.alert(
      'Eliminar Materia',
      tareasConMateria.length > 0
        ? `La materia "${nombre}" tiene ${tareasConMateria.length} tarea(s). ¿Eliminar de todos modos?`
        : `¿Eliminar la materia "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            const nuevasMaterias = materias.filter(m => m.id !== id);
            setMaterias(nuevasMaterias);
            await guardarMaterias(nuevasMaterias);
            Alert.alert('Éxito', 'Materia eliminada 🗑️');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const abrirModalEditar = (materia: Materia) => {
    setEditandoId(materia.id);
    setNuevaMateria({
      nombre: materia.nombre,
      color: materia.color,
      horario: materia.horario,
      profesor: materia.profesor,
      aulas: materia.aulas,
    });
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditandoId(null);
    setNuevaMateria({
      nombre: '',
      color: COLORES[0],
      horario: '',
      profesor: '',
      aulas: '',
    });
  };

  // Contar tareas por materia
  const contarTareasPorMateria = (nombreMateria: string) => {
    return tareas.filter(t => t.materia === nombreMateria && !t.completada).length;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando materias... 📚</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Materias</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de materias */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {materias.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={70} color="#ccc" />
            <Text style={styles.emptyStateText}>No hay materias</Text>
            <Text style={styles.emptyStateSubtext}>
              Presiona "Agregar" para crear tu primera materia
            </Text>
          </View>
        ) : (
          materias.map((materia) => (
            <TouchableOpacity
              key={materia.id}
              style={[styles.materiaCard, { borderLeftColor: materia.color }]}
              onPress={() => abrirModalEditar(materia)}
              activeOpacity={0.7}
            >
              <View style={styles.materiaHeader}>
                <View style={[styles.colorCircle, { backgroundColor: materia.color }]} />
                <Text style={styles.materiaNombre}>{materia.nombre}</Text>
                {contarTareasPorMateria(materia.nombre) > 0 && (
                  <View style={styles.pendienteBadge}>
                    <Text style={styles.pendienteText}>
                      {contarTareasPorMateria(materia.nombre)}
                    </Text>
                  </View>
                )}
              </View>
              
              {materia.horario ? (
                <Text style={styles.materiaInfo}>
                  <Ionicons name="time-outline" size={14} color="#666" /> {materia.horario}
                </Text>
              ) : null}
              
              {materia.profesor ? (
                <Text style={styles.materiaInfo}>
                  <Ionicons name="person-outline" size={14} color="#666" /> {materia.profesor}
                </Text>
              ) : null}
              
              {materia.aulas ? (
                <Text style={styles.materiaInfo}>
                  <Ionicons name="location-outline" size={14} color="#666" /> {materia.aulas}
                </Text>
              ) : null}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => eliminarMateria(materia.id, materia.nombre)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* MODAL PARA AGREGAR/EDITAR MATERIA */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editandoId ? '✏️ Editar Materia' : '📚 Nueva Materia'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre de la materia *"
              placeholderTextColor="#999"
              value={nuevaMateria.nombre}
              onChangeText={(text) => setNuevaMateria({ ...nuevaMateria, nombre: text })}
            />

            <Text style={styles.label}>Color:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coloresScroll}>
              {COLORES.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    nuevaMateria.color === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setNuevaMateria({ ...nuevaMateria, color })}
                />
              ))}
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="Horario (ej: Lun 8-10, Mié 8-10)"
              placeholderTextColor="#999"
              value={nuevaMateria.horario}
              onChangeText={(text) => setNuevaMateria({ ...nuevaMateria, horario: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Profesor/a"
              placeholderTextColor="#999"
              value={nuevaMateria.profesor}
              onChangeText={(text) => setNuevaMateria({ ...nuevaMateria, profesor: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Aula / Salón"
              placeholderTextColor="#999"
              value={nuevaMateria.aulas}
              onChangeText={(text) => setNuevaMateria({ ...nuevaMateria, aulas: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cerrarModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={guardarMateria}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
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
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 18,
    color: '#007AFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  list: {
    flex: 1,
    padding: 16,
  },
  materiaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  materiaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  materiaNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  pendienteBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pendienteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  materiaInfo: {
    fontSize: 13,
    color: '#666',
    marginTop: 5,
  },
  deleteButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  emptyStateSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  coloresScroll: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#000',
    borderWidth: 3,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
});
