import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUpdateUserProfile } from '@/src/shared/hooks/useUserProfileApi';
import { useTheme } from '@/src/shared/theme';
import { AppAlert } from '@/src/shared/components/AppAlert';
import { RFValue } from '@/src/shared/utils/responsive';

export default function NotificationPreferences({ onBack, userData }) {
  const { isDarkMode } = useTheme();
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
      AppAlert.alert('Saved', 'Tasker preferences updated successfully.');
      onBack();
    } catch (error) {
      AppAlert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 16 },
          isDarkMode && { backgroundColor: '#0F172A', borderBottomColor: '#334155' },
        ]}
      >
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? '#38BDF8' : '#0052A2'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
          Tasker Preferences
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
          {saving ? (
            <ActivityIndicator size="small" color={isDarkMode ? '#38BDF8' : '#0052A2'} />
          ) : (
            <Text style={[styles.saveText, isDarkMode && { color: '#38BDF8' }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View
        style={[
          styles.infoBanner,
          isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={isDarkMode ? '#38BDF8' : '#0052A2'}
        />
        <Text style={[styles.infoText, isDarkMode && { color: '#94A3B8' }]}>
          Control how you get notified about new tasks on the platform.
        </Text>
      </View>

      {/* Tasker Section */}
      <View
        style={[
          styles.section,
          isDarkMode && { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
        ]}
      >
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#94A3B8' }]}>
          TASK NOTIFICATIONS
        </Text>

        {/* Register as Tasker toggle */}
        <View style={[styles.row, isDarkMode && { borderTopColor: '#334155' }]}>
          <View style={styles.rowContent}>
            <Text style={[styles.rowLabel, isDarkMode && { color: '#F8FAFC' }]}>
              Register as a Tasker
            </Text>
            <Text style={[styles.rowDesc, isDarkMode && { color: '#94A3B8' }]}>
              Get notified when new tasks are posted on the platform.
            </Text>
          </View>
          <Switch
            value={notifyNewTask}
            onValueChange={(val) => {
              setNotifyNewTask(val);
              if (!val) setNotifySkillMatch(false);
            }}
            trackColor={{ false: isDarkMode ? '#475569' : '#ccc', true: '#0052A2' }}
            thumbColor="#fff"
          />
        </View>

        {/* Skillset only toggle */}
        <View
          style={[
            styles.row,
            isDarkMode && { borderTopColor: '#334155' },
            !notifyNewTask && styles.rowDisabled,
          ]}
        >
          <View style={styles.rowContent}>
            <Text
              style={[
                styles.rowLabel,
                isDarkMode && { color: '#F8FAFC' },
                !notifyNewTask && styles.labelDisabled,
              ]}
            >
              Only notify tasks in my skillset
            </Text>
            <Text
              style={[
                styles.rowDesc,
                isDarkMode && { color: '#94A3B8' },
                !notifyNewTask && styles.labelDisabled,
              ]}
            >
              Filter notifications to tasks that match your skills only.
            </Text>
          </View>
          <Switch
            value={notifySkillMatch && notifyNewTask}
            onValueChange={(val) => {
              if (notifyNewTask) setNotifySkillMatch(val);
            }}
            disabled={!notifyNewTask}
            trackColor={{ false: isDarkMode ? '#475569' : '#ccc', true: '#0052A2' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.85}
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
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#003366',
    flex: 1,
    textAlign: 'center',
  },
  saveBtn: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  saveText: {
    fontSize: RFValue(15),
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
    fontSize: RFValue(13),
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
    fontSize: RFValue(12),
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
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: RFValue(12),
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
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: RFValue(15),
    fontWeight: '700',
  },
});
