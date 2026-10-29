import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform,
  SafeAreaView, StyleSheet, Text, View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppButton from './components/Appbutton';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import { createProduct, deleteProduct, getProducts, updateProduct } from './hook/productsApi';
import { colors } from './components/Theme';

const PAGE_SIZE = 10;

export default function App() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null); // shows the API response for write operations

  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Server-side pagination state (local products are not counted).
  const skipRef = useRef(0);
  const serverTotalRef = useRef(0);

  const load = useCallback(async ({ reset = false } = {}) => {
    try {
      setError(null);
      const skip = reset ? 0 : skipRef.current;
      const data = await getProducts({ limit: PAGE_SIZE, skip });
      skipRef.current = skip + data.products.length;
      serverTotalRef.current = data.total;
      setTotal(data.total);
      setProducts((prev) => (reset ? data.products : [...prev, ...data.products]));
    } catch (e) {
      setError(e.message || 'Something went wrong');
    }
  }, []);

  useEffect(() => {
    load({ reset: true }).finally(() => setLoading(false));
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setNotice(null);
    try { await load({ reset: true }); } finally { setRefreshing(false); }
  };

  const handleEndReached = async () => {
    if (loading || loadingMore || refreshing || error || skipRef.current >= serverTotalRef.current) return;
    setLoadingMore(true);
    try { await load(); } finally { setLoadingMore(false); }
  };

  const openCreate = () => { setEditing(null); setFormError(null); setFormOpen(true); };
  const openEdit = (p) => { setEditing(p); setFormError(null); setFormOpen(true); };
  const closeForm = () => { if (!submitting) setFormOpen(false); };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        if (editing.isLocal) {
          // Created this session; the server has no record of it, so a PUT would 404.
          setProducts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...payload } : p)));
          setNotice('Updated locally. This product only exists in this session, so no PUT was sent.');
        } else {
          const result = await updateProduct(editing.id, payload);
          setProducts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...payload, ...result } : p)));
          setNotice(`PUT /products/${editing.id} succeeded. The API echoes the update but does not save it, so a refresh restores the original.`);
        }
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => {
          // The API returns the same id every time; give each local product a unique one.
          const nextId = Math.max(0, ...prev.map((p) => Number(p.id) || 0), Number(created.id) || 0) + 1;
          return [{ ...created, id: nextId, isLocal: true }, ...prev];
        });
        setTotal((t) => t + 1);
        setNotice(`POST /products/add succeeded (API returned id ${created.id}). It is not saved on the server, so it is kept locally until you refresh.`);
      }
      setFormOpen(false);
    } catch (e) {
      setFormError(e.message || 'Could not save the product'); // keep the form open
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    setDeletingId(product.id);
    try {
      setError(null);
      if (product.isLocal) {
        setNotice('Removed locally. This product only existed in this session, so no DELETE was sent.');
      } else {
        const result = await deleteProduct(product.id);
        skipRef.current = Math.max(0, skipRef.current - 1);
        serverTotalRef.current = Math.max(0, serverTotalRef.current - 1);
        setNotice(
          `DELETE /products/${product.id} succeeded` +
          (result?.isDeleted ? ` (isDeleted: true, deletedOn: ${result.deletedOn}).` : '.') +
          ' The server does not actually remove it, so a refresh restores it.'
        );
      }
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      setError(e.message || 'Could not delete the product');
    } finally {
      setDeletingId(null);
    }
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Products</Text>
          <Text style={styles.count}>Showing {products.length} of {total}</Text>
        </View>
        <AppButton title="Add product" onPress={openCreate} />
      </View>
      {!!notice && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{notice}</Text>
          <AppButton title="Dismiss" variant="secondary" onPress={() => setNotice(null)} />
        </View>
      )}
      {!!error && (
        <View style={styles.error}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton title="Try again" variant="danger" onPress={() => load({ reset: true })} />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ProductList
          products={products}
          loadingMore={loadingMore}
          refreshing={refreshing}
          deletingId={deletingId}
          onRefresh={handleRefresh}
          onEndReached={handleEndReached}
          onEdit={openEdit}
          onDelete={handleDelete}
          ListHeaderComponent={header}
        />
      )}

      <Modal visible={formOpen} animationType="slide" onRequestClose={closeForm}>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ProductForm
              key={editing ? editing.id : 'new'}
              initial={editing}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              submitting={submitting}
              error={formError}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 16, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink },
  count: { fontSize: 13, color: colors.muted, marginTop: 2 },
  notice: { backgroundColor: colors.accentSoft, borderRadius: 8, padding: 12, gap: 10 },
  noticeText: { color: colors.ink, fontSize: 14 },
  error: { backgroundColor: colors.dangerSoft, borderRadius: 8, padding: 12, gap: 10 },
  errorText: { color: colors.danger, fontSize: 14 },
});