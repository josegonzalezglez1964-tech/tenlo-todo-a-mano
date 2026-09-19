import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { api } from '../api/client';

type Doc = {
  id: number;
  doc_type: string | null;
  title: string;
  merchant_name: string;
  date: string | null;
  time: string | null;
  total: string | null;
  taxes: string | null;
  currency: string;
  payment_method: string | null;
  category: string | null;
  status: string;
  file: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  verified: 'Verificado',
  favorite: 'Favorito',
};

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function DocumentDetailScreen({
  id,
  onBack,
}: {
  id: number;
  onBack: () => void;
}) {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scan, setScan] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setScanError(null);
    setScan(null);
    try {
      const response = await api.post(`/api/ocr/documents/${id}/scan/`);
      setScan(response.data);
    } catch (error: any) {
      const data = error?.response?.data;
      const detail = data?.detail || (Array.isArray(data) ? data.join(', ') : null);
      setScanError(detail || 'No se pudo escanear la factura.');
    }
    setScanning(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get(`/api/documents/${id}/`);
        setDoc(response.data);
      } catch (error) {
        console.log('Error al cargar detalle', error);
        setFailed(true);
      }
      setLoading(false);
    })();
  }, [id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2c3e50" />
        </View>
      ) : failed || !doc ? (
        <View style={styles.center}>
          <Text style={styles.value}>No se pudo cargar la factura.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {doc.file && !imageFailed ? (
            <Image
              source={{ uri: doc.file }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          ) : null}
          <Text style={styles.title}>
            {doc.title || doc.merchant_name || 'Sin título'}
          </Text>
          <Text style={styles.total}>
            {doc.total ? `${doc.total} ${doc.currency || ''}` : '—'}
          </Text>
          <Row label="Comercio" value={doc.merchant_name} />
          <Row label="Fecha" value={doc.date} />
          <Row label="Hora" value={doc.time} />
          <Row label="Impuestos" value={doc.taxes} />
          <Row label="Método de pago" value={doc.payment_method} />
          <Row label="Categoría" value={doc.category} />
          <Row label="Tipo" value={doc.doc_type} />
          <Row label="Estado" value={STATUS_LABELS[doc.status] || doc.status} />
          <Row label="Creada" value={doc.created_at?.slice(0, 10)} />
          {doc.file ? (
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScan}
              disabled={scanning}
            >
              <Text style={styles.scanButtonText}>
                {scanning ? 'Escaneando…' : 'Escanear texto (OCR)'}
              </Text>
            </TouchableOpacity>
          ) : null}
          {scanError ? <Text style={styles.scanError}>{scanError}</Text> : null}
          {scan ? (
            <View style={styles.scanBox}>
              <Text style={styles.scanTitle}>Sugerencias</Text>
              <Text style={styles.scanLine}>Total: {scan.suggestions?.total ?? '—'}</Text>
              <Text style={styles.scanLine}>Fecha: {scan.suggestions?.date ?? '—'}</Text>
              <Text style={[styles.scanTitle, { marginTop: 12 }]}>Texto detectado</Text>
              <Text style={styles.scanLine}>{scan.raw_text || '(sin texto)'}</Text>
            </View>
          ) : null}
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
  back: { fontSize: 16, color: '#2c3e50', width: 60 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#2c3e50' },
  content: { padding: 16 },
  image: { width: '100%', height: 220, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#2c3e50' },
  total: { fontSize: 28, fontWeight: '800', color: '#27ae60', marginVertical: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  label: { color: '#7f8c8d', fontSize: 15 },
  value: { color: '#2c3e50', fontSize: 15, flexShrink: 1, textAlign: 'right' },
  scanButton: {
    marginTop: 20,
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  scanButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  scanError: { color: '#c0392b', marginTop: 12, fontSize: 15 },
  scanBox: { marginTop: 16, padding: 14, backgroundColor: '#fff', borderRadius: 12 },
  scanTitle: { fontSize: 16, fontWeight: '700', color: '#2c3e50', marginBottom: 6 },
  scanLine: { color: '#2c3e50', fontSize: 15 },
});
