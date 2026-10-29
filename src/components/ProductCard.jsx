import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from './Appbutton';
import { colors } from './Theme';

function Row({ label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{String(value)}</Text>
    </View>
  );
}

export default function ProductCard({ product, deleting = false, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const p = product;
  const d = p.dimensions;

  const confirmDelete = () =>
    Alert.alert('Delete product', `Delete "${p.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(p) },
    ]);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        {!!p.thumbnail && <Image source={{ uri: p.thumbnail }} style={styles.thumb} />}
        <View style={styles.topText}>
          <Text style={styles.title}>{p.title}</Text>
          <Text style={styles.sub}>{[p.brand, p.category].filter(Boolean).join(' • ')}</Text>
          <Text style={styles.price}>${Number(p.price ?? 0).toFixed(2)}</Text>
          {p.rating != null && <Text style={styles.rating}>★ {p.rating}</Text>}
        </View>
      </View>

      {!!p.description && <Text style={styles.desc}>{p.description}</Text>}

      {!!p.tags?.length && (
        <View style={styles.tags}>
          {p.tags.map((t) => (
            <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
          ))}
        </View>
      )}

      {expanded && (
        <View style={styles.details}>
          <Row label="ID" value={p.id} />
          <Row label="Discount" value={p.discountPercentage != null ? `${p.discountPercentage}%` : null} />
          <Row label="Stock" value={p.stock} />
          <Row label="Availability" value={p.availabilityStatus} />
          <Row label="SKU" value={p.sku} />
          <Row label="Weight" value={p.weight} />
          <Row label="Dimensions" value={d ? `${d.width} × ${d.height} × ${d.depth}` : null} />
          <Row label="Min. order" value={p.minimumOrderQuantity} />
          <Row label="Warranty" value={p.warrantyInformation} />
          <Row label="Shipping" value={p.shippingInformation} />
          <Row label="Returns" value={p.returnPolicy} />

          {!!p.images?.length && (
            <>
              <Text style={styles.section}>Images ({p.images.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.images}>
                {p.images.map((uri, i) => (
                  <Image key={`${uri}-${i}`} source={{ uri }} style={styles.image} />
                ))}
              </ScrollView>
            </>
          )}

          {!!p.reviews?.length && (
            <>
              <Text style={styles.section}>Reviews ({p.reviews.length})</Text>
              {p.reviews.map((r, i) => (
                <View key={i} style={styles.review}>
                  <Text style={styles.reviewHead}>★ {r.rating} · {r.reviewerName}</Text>
                  <Text style={styles.reviewMeta}>{r.reviewerEmail} · {new Date(r.date).toLocaleDateString()}</Text>
                  <Text style={styles.reviewText}>{r.comment}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      <AppButton
        title={expanded ? 'Hide details' : 'Show all details'}
        variant="secondary"
        onPress={() => setExpanded((v) => !v)}
      />
      <View style={styles.actions}>
        <AppButton title="Edit" variant="secondary" onPress={() => onEdit(p)} style={styles.flex} />
        <AppButton title="Delete" variant="danger" loading={deleting} onPress={confirmDelete} style={styles.flex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 12 },
  top: { flexDirection: 'row', gap: 12 },
  thumb: { width: 88, height: 88, borderRadius: 8, backgroundColor: colors.accentSoft },
  topText: { flex: 1, gap: 2 },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 13, color: colors.muted },
  price: { fontSize: 18, fontWeight: '800', color: colors.accent, marginTop: 4 },
  rating: { fontSize: 13, color: colors.star, fontWeight: '600' },
  desc: { fontSize: 14, color: colors.ink, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: colors.accentSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, color: colors.accent },
  details: { gap: 6, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { fontSize: 13, color: colors.muted },
  rowValue: { fontSize: 13, color: colors.ink, flexShrink: 1, textAlign: 'right' },
  section: { fontSize: 14, fontWeight: '700', color: colors.ink, marginTop: 8 },
  images: { gap: 8 },
  image: { width: 110, height: 110, borderRadius: 8, backgroundColor: colors.accentSoft },
  review: { backgroundColor: colors.bg, borderRadius: 8, padding: 10, gap: 2 },
  reviewHead: { fontSize: 13, fontWeight: '600', color: colors.ink },
  reviewMeta: { fontSize: 12, color: colors.muted },
  reviewText: { fontSize: 13, color: colors.ink, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
});