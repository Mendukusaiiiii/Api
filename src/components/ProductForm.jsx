import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AppButton from './Appbutton';
import { colors } from './Theme';

const FIELDS = [
  { key: 'title', label: 'Title', required: true },
  { key: 'description', label: 'Description', multiline: true },
  { key: 'category', label: 'Category' },
  { key: 'brand', label: 'Brand' },
  { key: 'tags', label: 'Tags (comma separated)', list: true },
  { key: 'price', label: 'Price', number: true, required: true, keyboardType: 'decimal-pad' },
  { key: 'discountPercentage', label: 'Discount %', number: true, keyboardType: 'decimal-pad' },
  { key: 'stock', label: 'Stock', number: true, integer: true, keyboardType: 'number-pad' },
  { key: 'thumbnail', label: 'Thumbnail URL', keyboardType: 'url' },
];

const toInitial = (p) =>
  Object.fromEntries(FIELDS.map((f) => [f.key, p?.[f.key] != null ? (Array.isArray(p[f.key]) ? p[f.key].join(', ') : String(p[f.key])) : '']));

export default function ProductForm({ initial, onSubmit, onCancel, submitting, error }) {
  const [values, setValues] = useState(() => toInitial(initial));
  const [errors, setErrors] = useState({});

  const set = (key, v) => {
    setValues((s) => ({ ...s, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    for (const f of FIELDS) {
      const v = values[f.key].trim();
      if (f.required && !v) next[f.key] = `${f.label} is required`;
      else if (f.number && v) {
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0) next[f.key] = 'Enter a valid number';
        else if (f.integer && !Number.isInteger(n)) next[f.key] = 'Enter a whole number';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const payload = {};
    for (const f of FIELDS) {
      const v = values[f.key].trim();
      if (v === '') continue;
      payload[f.key] = f.number ? Number(v) : f.list ? v.split(',').map((t) => t.trim()).filter(Boolean) : v;
    }
    onSubmit(payload);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{initial ? 'Edit product' : 'Add product'}</Text>
        {FIELDS.map((f) => (
          <View key={f.key} style={styles.field}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              value={values[f.key]}
              onChangeText={(v) => set(f.key, v)}
              editable={!submitting}
              multiline={f.multiline}
              keyboardType={f.keyboardType}
              autoCapitalize={f.keyboardType === 'url' ? 'none' : 'sentences'}
              style={[styles.input, f.multiline && styles.multiline, errors[f.key] && styles.inputError]}
              placeholderTextColor={colors.muted}
            />
            {!!errors[f.key] && <Text style={styles.error}>{errors[f.key]}</Text>}
          </View>
        ))}
        {!!error && <Text style={styles.formError}>{error}</Text>}
      </ScrollView>
      <View style={styles.footer}>
        <AppButton title="Cancel" variant="secondary" onPress={onCancel} disabled={submitting} style={styles.flex} />
        <AppButton title={initial ? 'Save changes' : 'Add product'} onPress={submit} loading={submitting} style={styles.flex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 14 },
  heading: { fontSize: 24, fontWeight: '800', color: colors.ink },
  field: { gap: 4 },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: colors.ink,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  formError: { fontSize: 14, color: colors.danger, backgroundColor: colors.dangerSoft, borderRadius: 8, padding: 12 },
  error: { fontSize: 12, color: colors.danger },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
  flex: { flex: 1 },
});