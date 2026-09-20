import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { api, logout } from '../api/client';

type Document = {
  id: number;
  title: string;
  merchant_name: string;
  date: string | null;
  total: string | null;
  currency: string;
  status: string;
};

type Props = {
  onLogout: () => void;
  onAddPress: () => void;
  onSelect: (id: number) => void;
  refreshKey: number;
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  verified: 'Verificado',
  favorite: 'Favorito',
};

const ORDER_OPTIONS = [
  { value: '', label: 'Recientes' },
  { value: '-total', label: 'Más caras' },
  { value: 'total', label: 'Más baratas' },
  { value: '-date', label: 'Por fecha' },
];

export default function DocumentsScreen({ onLogout, onAddPress, onSelect, refreshKey }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [ordering, setOrdering] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const fetchDocuments = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (ordering) params.ordering = ordering;
      const response = await api.get('/api/documents/', { params });
      const results = response.data.results ?? response.data;
      setDocuments(results);
    } catch (error) {
      console.log('Error al cargar documentos', error);
    }
  }, [search, category, ordering]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      await fetchDocuments();
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchDocuments, refreshKey]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/api/documents/categories/');
      setCategories(response.data);
      setCategory((current) =>
        current && !response.data.includes(current) ? '' : current
      );
    } catch (error) {
      console.log('Error al cargar categorías', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, refreshKey]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDocuments(), fetchCategories()]);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis facturas</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título, comercio o categoría"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {['', ...categories].map((name) => (
            <TouchableOpacity
              key={name || 'todas'}
              style={[styles.chip, category === name && styles.chipActive]}
              onPress={() => setCategory(name)}
            >
              <Text style={[styles.chipText, category === name && styles.chipTextActive]}>
                {name || 'Todas'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {ORDER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value || 'recientes'}
              style={[styles.chip, ordering === opt.value && styles.chipActive]}
              onPress={() => setOrdering(opt.value)}
            >
              <Text style={[styles.chipText, ordering === opt.value && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={documents.length === 0 && styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Todavía no tienes facturas registradas.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onSelect(item.id)}>
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle}>
                {item.title || item.merchant_name || 'Sin título'}
              </Text>
              <Text style={styles.cardTotal}>
                {item.total ? `${item.total} ${item.currency || ''}` : '—'}
              </Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardSubtitle}>{item.date || 'Sin fecha'}</Text>
              <Text style={styles.cardStatus}>
                {STATUS_LABELS[item.status] || item.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={onAddPress}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#2c3e50',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  logoutText: {
    color: '#ecf0f1',
    fontSize: 14,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#95a5a6',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  cardTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#27ae60',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  cardStatus: {
    fontSize: 13,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  filters: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  chipRow: {
    flexGrow: 0,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#2c3e50',
    borderColor: '#2c3e50',
  },
  chipText: {
    fontSize: 13,
    color: '#2c3e50',
  },
  chipTextActive: {
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 30,
  },
});