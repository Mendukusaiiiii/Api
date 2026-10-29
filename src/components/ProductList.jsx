import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import ProductCard from './ProductCard';
import { colors } from './Theme';

export default function ProductList({
  products, loadingMore, refreshing, deletingId,
  onRefresh, onEndReached, onEdit, onDelete, ListHeaderComponent,
}) {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          deleting={deletingId === item.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={<Text style={styles.empty}>No products yet. Tap “Add product” to create one.</Text>}
      ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footer} color={colors.accent} /> : null}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  sep: { height: 12 },
  footer: { marginVertical: 20 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 24 },
});