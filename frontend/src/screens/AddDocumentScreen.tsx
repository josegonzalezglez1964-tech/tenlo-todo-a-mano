import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createDocument } from '../api/client';

type Props = {
  onSaved: () => void;
  onCancel: () => void;
};

export default function AddDocumentScreen({ onSaved, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [date, setDate] = useState('');
  const [total, setTotal] = useState('');
  const [taxes, setTaxes] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos para adjuntar la factura.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title && !merchantName) {
      Alert.alert('Falta información', 'Añade al menos un título o un comercio.');
      return;
    }
    setSaving(true);
    try {
      await createDocument({
        title,
        merchant_name: merchantName,
        date,
        total,
        taxes,
        currency,
        payment_method: paymentMethod,
        category,
        imageUri,
      });
      onSaved();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la factura. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Nueva factura</Text>

      <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoBoxText}>Toca para elegir una foto</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Título (ej. Compra supermercado)"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Comercio"
        value={merchantName}
        onChangeText={setMerchantName}
      />
      <TextInput
        style={styles.input}
        placeholder="Fecha (AAAA-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Total"
          keyboardType="decimal-pad"
          value={total}
          onChangeText={setTotal}
        />
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Impuestos"
          keyboardType="decimal-pad"
          value={taxes}
          onChangeText={setTaxes}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Moneda"
          value={currency}
          onChangeText={setCurrency}
        />
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Método de pago"
          value={paymentMethod}
          onChangeText={setPaymentMethod}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Categoría"
        value={category}
        onChangeText={setCategory}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Guardar factura</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={saving}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 20,
  },
  photoBox: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  photoBoxText: {
    color: '#999',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 14,
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 15,
  },
});