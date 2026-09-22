import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { api } from '../api/client';

export default function CategoryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [categories, setCategories] = useState<string[]>([]);
  const [addingNew, setAddingNew] = useState(false);
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get('/api/documents/categories/');
        setCategories(response.data);
      } catch (error) {
        console.log('Error al cargar categorías', error);
      }
    })();
  }, []);

  const options = value && !categories.includes(value) ? [...categories, value] : categories;

  if (addingNew) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.label}>Categoría</Text>
        <TextInput
          style={styles.input}
          placeholder="Escribe la nueva categoría"
          value={newValue}
          onChangeText={(v) => {
            setNewValue(v);
            onChange(v);
          }}
          autoFocus
        />
        <TouchableOpacity onPress={() => { setAddingNew(false); setNewValue(''); onChange(''); }}>
          <Text style={styles.cancel}>Elegir de la lista</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Categoría</Text>
      <View style={styles.chipRow}>
        {options.map((name) => (
          <TouchableOpacity
            key={name}
            style={[styles.chip, value === name && styles.chipActive]}
            onPress={() => onChange(name)}
          >
            <Text style={[styles.chipText, value === name && styles.chipTextActive]}>{name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.chip} onPress={() => setAddingNew(true)}>
          <Text style={styles.chipText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { color: '#7f8c8d', fontSize: 14, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  chipActive: { backgroundColor: '#2c3e50', borderColor: '#2c3e50' },
  chipText: { fontSize: 14, color: '#2c3e50' },
  chipTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 6,
  },
  cancel: { color: '#2c3e50', fontSize: 13, fontWeight: '600' },
});
