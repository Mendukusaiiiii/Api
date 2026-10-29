import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from './Theme';

const SOLID = ['primary', 'dangerSolid'];

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) {
  const isDisabled = disabled || loading;
  const spinnerColor = SOLID.includes(variant)
    ? '#fff'
    : variant === 'danger'
    ? colors.danger
    : colors.accent;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: { fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.5 },

  primary: { backgroundColor: colors.accent, borderColor: colors.accent },
  primaryLabel: { color: '#fff' },

  secondary: { backgroundColor: 'transparent', borderColor: colors.border },
  secondaryLabel: { color: colors.ink },

  danger: { backgroundColor: 'transparent', borderColor: colors.danger },
  dangerLabel: { color: colors.danger },

  dangerSolid: { backgroundColor: colors.danger, borderColor: colors.danger },
  dangerSolidLabel: { color: '#fff' },
});