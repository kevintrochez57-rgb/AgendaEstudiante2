import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TutorialScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function TutorialScreen({ visible, onClose }: TutorialScreenProps) {
  const [pagina, setPagina] = useState(0);

  const paginas = [
    {
      titulo: '¡Bienvenido a Agenda Estudiantil!',
      icono: 'school-outline',
      descripcion: 'Organiza tus materias, tareas y notas en un solo lugar.',
      color: '#007AFF',
    },
    {
      titulo: 'Agregar Materias',
      icono: 'book-outline',
      descripcion: 'Toca el botón + y selecciona "Agregar Materia".\n\nCompleta: Nombre, fecha de entrega y nivel de importancia.\n\n¡Recibirás recordatorios 1 día antes!',
      color: '#4CAF50',
    },
    {
      titulo: 'Agregar Notas',
      icono: 'document-text-outline',
      descripcion: 'Toca el botón + y selecciona "Agregar Nota".\n\nEscribe notas importantes y asígnalas a una materia.',
      color: '#2196F3',
    },
    {
      titulo: 'Niveles de Importancia',
      icono: 'flame-outline',
      descripcion: 'Cada materia tiene un nivel de importancia:\n\nAlta = Urgente\nMedia = Importante\nBaja = Normal\n\nOrdena tus tareas por fecha o importancia.',
      color: '#FF9800',
    },
    {
      titulo: 'Compartir Tareas',
      icono: 'share-social-outline',
      descripcion: 'Toca el botón en la parte superior para compartir tu lista de tareas pendientes con amigos o compañeros.',
      color: '#9C27B0',
    },
    {
      titulo: 'Recordatorios Automáticos',
      icono: 'notifications-outline',
      descripcion: 'La app te enviará una notificación 1 día antes de cada fecha de entrega.\n\n¡Nunca más olvides una tarea!',
      color: '#F44336',
    },
  ];

  const siguiente = () => {
    if (pagina < paginas.length - 1) {
      setPagina(pagina + 1);
    } else {
      onClose();
    }
  };

  const anterior = () => {
    if (pagina > 0) {
      setPagina(pagina - 1);
    }
  };

  const saltar = () => {
    onClose();
  };

  const currentPage = paginas[pagina];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: currentPage.color }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={saltar} style={styles.skipButton}>
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name={currentPage.icono as any} size={80} color="white" />
          </View>
          <Text style={styles.titulo}>{currentPage.titulo}</Text>
          <Text style={styles.descripcion}>{currentPage.descripcion}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.indicadores}>
            {paginas.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.punto,
                  index === pagina ? styles.puntoActivo : styles.puntoInactivo,
                ]}
              />
            ))}
          </View>

          <View style={styles.botones}>
            {pagina > 0 && (
              <TouchableOpacity onPress={anterior} style={styles.botonAnterior}>
                <Text style={styles.textoBoton}>Atrás</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={siguiente}
              style={[
                styles.botonSiguiente,
                pagina === paginas.length - 1 && styles.botonFinal,
              ]}
            >
              <Text style={styles.textoBotonSiguiente}>
                {pagina === paginas.length - 1 ? 'Comenzar' : 'Siguiente'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', padding: 20, paddingTop: 50 },
  skipButton: { padding: 10 },
  skipText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  iconContainer: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 15 },
  descripcion: { fontSize: 16, color: 'rgba(255,255,255,0.95)', textAlign: 'center', lineHeight: 26 },
  footer: { padding: 30, paddingBottom: 50 },
  indicadores: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25 },
  punto: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 5 },
  puntoActivo: { backgroundColor: 'white', width: 25 },
  puntoInactivo: { backgroundColor: 'rgba(255,255,255,0.5)' },
  botones: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  botonAnterior: { padding: 15 },
  textoBoton: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },
  botonSiguiente: { backgroundColor: 'white', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30, flex: 1, alignItems: 'center', marginLeft: 20 },
  botonFinal: { backgroundColor: '#FFD700', flex: 1, marginLeft: 0 },
  textoBotonSiguiente: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});
