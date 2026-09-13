import { BRAND_BLUE, BRAND_GREEN, BRAND_ORANGE } from '@/src/shared/theme/brandColors';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type AppAlertType = 'success' | 'error' | 'warning' | 'info';

export type AppAlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type AppAlertPayload = {
  title: string;
  message?: string;
  type?: AppAlertType;
  buttons?: AppAlertButton[];
  autoCloseMs?: number;
};

type Listener = (payload: AppAlertPayload | null) => void;

const bus: { listeners: Set<Listener>; queued: AppAlertPayload | null } =
  (globalThis as any).__MYTODOO_ALERT__ ||
  ((globalThis as any).__MYTODOO_ALERT__ = { listeners: new Set(), queued: null });

function inferType(title: string, explicit?: AppAlertType): AppAlertType {
  if (explicit) return explicit;
  const t = title.toLowerCase();
  if (/(fail|error|blocked|denied|invalid|missing|required|unable)/.test(t)) return 'error';
  if (/(submitted|posted|success|complete|reopened|sent|updated|verified|saved)/.test(t)) {
    return 'success';
  }
  if (/(wait|already|limit|permission)/.test(t)) return 'warning';
  return 'info';
}

export function appAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
  options?: { type?: AppAlertType; autoCloseMs?: number },
) {
  const payload: AppAlertPayload = {
    title,
    message,
    type: inferType(title, options?.type),
    buttons: buttons?.length ? buttons : [{ text: 'OK' }],
    autoCloseMs: options?.autoCloseMs,
  };
  if (bus.listeners.size === 0) {
    bus.queued = payload;
    return;
  }
  bus.queued = null;
  bus.listeners.forEach((fn) => fn(payload));
}

export const AppAlert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AppAlertButton[],
    _options?: unknown,
  ) => appAlert(title, message, buttons),
};

Alert.alert = ((title: string, message?: string, buttons?: any[]) => {
  AppAlert.alert(title, message, buttons);
}) as typeof Alert.alert;

export function AppAlertHost() {
  const [payload, setPayload] = useState<AppAlertPayload | null>(null);

  useEffect(() => {
    const listener: Listener = setPayload;
    bus.listeners.add(listener);
    if (bus.queued) {
      setPayload(bus.queued);
      bus.queued = null;
    }
    return () => {
      bus.listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!payload?.autoCloseMs) return;
    const id = setTimeout(() => {
      payload.buttons?.[0]?.onPress?.();
      setPayload(null);
    }, payload.autoCloseMs);
    return () => clearTimeout(id);
  }, [payload]);

  if (!payload) return null;

  const type = payload.type || 'info';
  const accent =
    type === 'success' ? BRAND_GREEN : type === 'error' ? '#DC2626' : type === 'warning' ? BRAND_ORANGE : BRAND_BLUE;
  const icon = type === 'success' ? '✓' : type === 'error' ? '!' : type === 'warning' ? '!' : 'i';

  const close = (btn?: AppAlertButton) => {
    setPayload(null);
    btn?.onPress?.();
  };

  const hideOk = payload.autoCloseMs && payload.buttons?.length === 1;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => close()}>
      <Pressable style={styles.overlay} onPress={() => {}}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: accent }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
          <Text style={styles.title}>{payload.title}</Text>
          {payload.message ? <Text style={styles.message}>{payload.message}</Text> : null}
          {!hideOk ? (
            <View style={styles.actions}>
              {(payload.buttons || [{ text: 'OK' }]).map((btn, i) => {
                const isCancel = btn.style === 'cancel';
                const isDestructive = btn.style === 'destructive';
                const isPrimary =
                  !isCancel && (i === (payload.buttons?.length || 1) - 1 || btn.style === 'default');
                return (
                  <TouchableOpacity
                    key={`${btn.text}-${i}`}
                    style={[
                      styles.button,
                      isPrimary && !isDestructive && { backgroundColor: type === 'success' ? BRAND_GREEN : BRAND_ORANGE },
                      isCancel && styles.buttonGhost,
                      isDestructive && styles.buttonDanger,
                    ]}
                    onPress={() => close(btn)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        isCancel && styles.buttonGhostText,
                        (isPrimary || isDestructive) && styles.buttonPrimaryText,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.autoHint}>This message closes automatically</Text>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 27, 42, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0,
  },
  title: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0,
    marginBottom: 8,
  },
  message: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: 0,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 16,
    width: '100%',
  },
  button: {
    minWidth: 120,
    flexGrow: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonGhost: {
    backgroundColor: '#F1F5F9',
  },
  buttonDanger: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND_BLUE,
    letterSpacing: 0,
  },
  buttonGhostText: {
    color: '#475569',
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
  },
  autoHint: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    paddingBottom: 6,
    letterSpacing: 0,
  },
});
