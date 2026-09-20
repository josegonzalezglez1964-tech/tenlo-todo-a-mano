import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { api, updateDocument } from '../api/client';

const FIELDS = [
  { key: 'title', label: 'Título' },
  { key: 'merchant_name', label: 'Comercio' },
  { key: 'category', label: 'Categoría' },
  { key: 'date', label: 'Fecha (AAAA-MM-DD)' },
  { key: 'total', label: 'Total', numeric: true },
  { key: 'taxes', label: 'Impuestos', numeric: true },
  { key: 'currency', label: 'Moneda' },
  { key: 'payment_method', label: 'Método de pago' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'verified', label: 'Verificado' },
  { value: 'favorite', label: 'Favorito' },
];

export default function EditDocumentScreen({
  id,
  onSaved,
  onCancel,
}: {
  id: number;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({
    title: '',
    merchant_name: '',
    date: '',
    total: '',
    taxes: '',
    currency: '',
    payment_method: '',
    category: '',
    status: 'pending',
  });

  const setField = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get(`/api/documents/${id}/`);
        const d = response.data;
        setForm({
          title: d.title ?? '',
          merchant_name: d.merchant_name ?? '',
          date: d.date ?? '',
          total: d.total ?? '',
          taxes: d.taxes ?? '',
          currency: d.currency ?? '',
          payment_method: d.payment_method ?? '',
          category: d.category ?? '',
          status: d.status ?? 'pending',
        });
      } catch (e) {
        setError('No se pudo cargar la factura.');
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateDocument(id, form as any);
      onSaved();
      return;
    } catch (e: any) {
      const data = e?.response?.data;
      setError(data ? JSON.stringify(data) : 'No se pudo guardar los cambios.');
    }
    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.back}>‹ Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar factura</Text>
        <View style={{ width: 70 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2c3e50" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {FIELDS.map((f) => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                value={form[f.key]}
                onChangeText={(v) => setField(f.key, v)}
                keyboardType={f.numeric ? 'decimal-pad' : 'default'}
                autoCorrect={false}
              />
            </View>
          ))}

          <Text style={styles.label}>Estado</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, form.status === opt.value && styles.chipActive]}
                onPress={() => setField('status', opt.value)}
              >
                <Text style={[styles.chipText, form.status === opt.value && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveText}>{saving ? 'Guardando…' : 'Guardar cambios'}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  back: { fontSize: 16, color: '#2c3e50', width: 70 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#2c3e50' },
  content: { padding: 16, paddingBottom: 48 },
  field: { marginBottom: 14 },
  label: { color: '#7f8c8d', fontSize: 14, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  statusRow: { flexDirection: 'row', marginBottom: 20 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#2c3e50', borderColor: '#2c3e50' },
  chipText: { fontSize: 14, color: '#2c3e50' },
  chipTextActive: { color: '#fff' },
  error: { color: '#c0392b', marginBottom: 12, fontSize: 14 },
  saveButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
