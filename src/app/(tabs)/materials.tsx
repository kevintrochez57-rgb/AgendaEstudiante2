// 1. IMPORTS - Importamos todos los componentes necesarios de React Native
import { Ionicons } from '@expo/vector-icons'; // Iconos bonitos
import { useState } from 'react';
import {
  Alert, // Para mostrar alertas
  FlatList, // Botón táctil con efecto de opacidad
  Modal, // Para crear estilos (como CSS pero en JS)
  ScrollView, // Para mostrar texto
  StyleSheet, // Contenedor similar a un div
  Text, // Ventana emergente
  TextInput, // Para hacer scroll vertical
  TouchableOpacity,
  View, // Contenedor similar a un div
} from 'react-native';

// 2. DEFINICIÓN DE TIPOS (TypeScript)
// Definimos cómo se ve un Material
interface Material {
  id: string;      // Identificador único
  title: string;   // Título del material
  description: string; // Descripción
  category: string; // Categoría (ej: "PDF", "Video", "Link")
  completed: boolean; // Si está completado o no
}

// 3. COMPONENTE PRINCIPAL
export default function MaterialsScreen() {
  // 4. ESTADOS (variables que pueden cambiar y afectar la UI)
  
  // Estado para la lista de materiales
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: '1',
      title: 'Fundamentos de React Native',
      description: 'Aprende los conceptos básicos de React Native',
      category: 'Video',
      completed: false,
    },
    {
      id: '2',
      title: 'Guía de TypeScript',
      description: 'Documentación completa de TypeScript',
      category: 'PDF',
      completed: true,
    },
    {
      id: '3',
      title: 'Ejercicios prácticos',
      description: '10 ejercicios para practicar',
      category: 'Ejercicio',
      completed: false,
    },
  ]);

  // Estado para controlar el modal (ventana emergente)
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estado para el filtro de categoría
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  // Estado para el nuevo material (cuando agregamos uno)
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    category: 'PDF',
  });

  // 5. FUNCIONES (la lógica de la app)
  
  // Función para agregar un nuevo material
  const addMaterial = () => {
    // Validamos que el título no esté vacío
    if (!newMaterial.title.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }

    // Creamos el nuevo material
    const material: Material = {
      id: Date.now().toString(), // ID único basado en timestamp
      title: newMaterial.title,
      description: newMaterial.description,
      category: newMaterial.category,
      completed: false,
    };

    // Agregamos el material a la lista
    setMaterials([material, ...materials]);
    
    // Limpiamos el formulario
    setNewMaterial({ title: '', description: '', category: 'PDF' });
    
    // Cerramos el modal
    setModalVisible(false);
    
    // Mostramos mensaje de éxito
    Alert.alert('Éxito', 'Material agregado correctamente');
  };

  // Función para marcar/desmarcar como completado
  const toggleCompleted = (id: string) => {
    setMaterials(
      materials.map((material) =>
        material.id === id
          ? { ...material, completed: !material.completed }
          : material
      )
    );
  };

  // Función para eliminar un material
  const deleteMaterial = (id: string) => {
    Alert.alert(
      'Eliminar Material',
      '¿Estás seguro de que quieres eliminar este material?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: () => {
            setMaterials(materials.filter((material) => material.id !== id));
            Alert.alert('Éxito', 'Material eliminado correctamente');
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Función para filtrar materiales por categoría
  const getFilteredMaterials = () => {
    if (selectedCategory === 'Todos') {
      return materials;
    }
    return materials.filter(
      (material) => material.category === selectedCategory
    );
  };

  // Función para obtener el color según la categoría
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Video':
        return '#FF6B6B';
      case 'PDF':
        return '#4ECDC4';
      case 'Ejercicio':
        return '#45B7D1';
      default:
        return '#96CEB4';
    }
  };

  // Función para obtener el icono según la categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Video':
        return 'play-circle';
      case 'PDF':
        return 'document-text';
      case 'Ejercicio':
        return 'barbell';
      default:
        return 'folder';
    }
  };

  // 6. RENDERIZADO DE LA UI (lo que ve el usuario)
  return (
    <View style={styles.container}>
      {/* HEADER - Título y botón de agregar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Materiales</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* FILTROS POR CATEGORÍA */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {['Todos', 'Video', 'PDF', 'Ejercicio'].map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterChip,
              selectedCategory === category && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === category && styles.filterTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LISTA DE MATERIALES */}
      <FlatList
        data={getFilteredMaterials()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.materialCard,
              item.completed && styles.materialCardCompleted,
            ]}
            onPress={() => toggleCompleted(item.id)}
            onLongPress={() => deleteMaterial(item.id)} // Mantener presionado para eliminar
          >
            {/* Icono de categoría */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getCategoryColor(item.category) },
              ]}
            >
              <Ionicons
                name={getCategoryIcon(item.category)}
                size={30}
                color="white"
              />
            </View>

            {/* Información del material */}
            <View style={styles.materialInfo}>
              <View style={styles.materialHeader}>
                <Text
                  style={[
                    styles.materialTitle,
                    item.completed && styles.materialTitleCompleted,
                  ]}
                >
                  {item.title}
                </Text>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryColor(item.category) },
                  ]}
                >
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.materialDescription,
                  item.completed && styles.materialDescriptionCompleted,
                ]}
              >
                {item.description}
              </Text>
            </View>

            {/* Check de completado */}
            <View style={styles.checkContainer}>
              <Ionicons
                name={item.completed ? 'checkbox' : 'square-outline'}
                size={24}
                color={item.completed ? '#4CAF50' : '#999'}
              />
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />

      {/* MODAL PARA AGREGAR NUEVO MATERIAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Nuevo Material</Text>

            {/* Input para el título */}
            <TextInput
              style={styles.input}
              placeholder="Título del material"
              placeholderTextColor="#999"
              value={newMaterial.title}
              onChangeText={(text) =>
                setNewMaterial({ ...newMaterial, title: text })
              }
            />

            {/* Input para la descripción */}
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={newMaterial.description}
              onChangeText={(text) =>
                setNewMaterial({ ...newMaterial, description: text })
              }
            />

            {/* Selector de categoría */}
            <Text style={styles.label}>Categoría:</Text>
            <View style={styles.categorySelector}>
              {['PDF', 'Video', 'Ejercicio'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    newMaterial.category === cat && styles.categoryOptionActive,
                  ]}
                  onPress={() =>
                    setNewMaterial({ ...newMaterial, category: cat })
                  }
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      newMaterial.category === cat &&
                        styles.categoryOptionTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Botones del modal */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addMaterial}
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

// 7. ESTILOS - Todo el diseño de la app
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa todo el espacio disponible
    backgroundColor: '#F5F5F5', // Color de fondo gris claro
  },
  header: {
    flexDirection: 'row', // Horizontal
    justifyContent: 'space-between', // Espacio entre elementos
    alignItems: 'center', // Centrado vertical
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '600',
  },
  filtersContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  materialCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  materialCardCompleted: {
    backgroundColor: '#F9F9F9',
    opacity: 0.8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  materialInfo: {
    flex: 1,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  materialTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 5,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  materialDescription: {
    fontSize: 14,
    color: '#666',
  },
  materialDescriptionCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  checkContainer: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  categoryOptionActive: {
    backgroundColor: '#007AFF',
  },
  categoryOptionText: {
    color: '#666',
    fontWeight: '600',
  },
  categoryOptionTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
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
