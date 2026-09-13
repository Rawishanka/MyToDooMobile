import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUpdateUserProfile } from '@/src/shared/hooks/useUserProfileApi';

export default function NotificationPreferences({ onBack, userData }) {
  const insets = useSafeAreaInsets();
  const updateProfile = useUpdateUserProfile();

  const [notifyNewTask, setNotifyNewTask] = useState(
    userData?.notifyNewTask ?? false
  );
  const [notifySkillMatch, setNotifySkillMatch] = useState(
    userData?.notifySkillMatch ?? false
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile.mutateAsync({
        notifyNewTask,
        notifySkillMatch,
      });
      Alert.alert('Saved', 'Tasker preferences updated successfully.');
      onBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 16 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasker Preferences</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
          {saving ? (
            <ActivityIndicator size="small" color="#0052A2" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={18} color="#0052A2" />
        <Text style={styles.infoText}>
          Control how you get notified about new tasks on the platform.
        </Text>
      </View>

      {/* Tasker Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TASK NOTIFICATIONS</Text>

        {/* Register as Tasker toggle */}
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Register as a Tasker</Text>
            <Text style={styles.rowDesc}>Get notified when new tasks are posted on the platform.</Text>
          </View>
          <Switch
            value={notifyNewTask}
            onValueChange={(val) => {
              setNotifyNewTask(val);
              if (!val) setNotifySkillMatch(false);
            }}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
            thumbColor="#fff"
          />
        </View>

        {/* Skillset only toggle */}
        <View style={[styles.row, !notifyNewTask && styles.rowDisabled]}>
          <View style={styles.rowContent}>
            <Text style={[styles.rowLabel, !notifyNewTask && styles.labelDisabled]}>
              Only notify tasks in my skillset
            </Text>
            <Text style={[styles.rowDesc, !notifyNewTask && styles.labelDisabled]}>
              Filter notifications to tasks that match your skills only.
            </Text>
          </View>
          <Switch
            value={notifySkillMatch && notifyNewTask}
            onValueChange={(val) => { if (notifyNewTask) setNotifySkillMatch(val); }}
            disabled={!notifyNewTask}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#003366',
    flex: 1,
    textAlign: 'center',
  },
  saveBtn: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  saveText: {
    fontSize: 16,
    color: '#0052A2',
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF4FF',
    margin: 16,
    padding: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#D0E4FF',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0052A2',
    lineHeight: 18,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  rowDisabled: {
    opacity: 0.45,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
  },
  labelDisabled: {
    color: '#aaa',
  },
  saveButton: {
    backgroundColor: '#0052A2',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
