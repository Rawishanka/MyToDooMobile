import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUpdateUserProfile } from '@/src/shared/hooks/useUserProfileApi';
import { useTheme } from '@/src/shared/theme';
import { AppAlert } from '@/src/shared/components/AppAlert';
import { BlueBackdrop, IconChip, LightHeader } from '@/src/shared/components/custom_components/lightCard';
import AppLoader from '@/src/shared/components/AppLoader';

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

  const trackOff = isDarkMode ? '#475569' : 'rgba(255,255,255,0.3)';

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <BlueBackdrop />
      <LightHeader
        title="Tasker Preferences"
        onBack={onBack}
        right={
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn} activeOpacity={0.7}>
            {saving ? (
              <AppLoader size={22} color="#FFFFFF" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View
          style={[
            styles.infoBanner,
            isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
          ]}
        >
          <IconChip name="information-circle-outline" size={36} />
          <Text style={[styles.infoText, isDarkMode && { color: '#94A3B8' }]}>
            Control how you get notified about new tasks on the platform.
          </Text>
        </View>

        {/* Tasker Section */}
        <Text style={[styles.sectionLabel, isDarkMode && { color: '#94A3B8' }]}>TASK NOTIFICATIONS</Text>

        <View
          style={[
            styles.row,
            isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
          ]}
        >
          <IconChip name="notifications-outline" style={styles.rowIcon} />
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
            trackColor={{ false: trackOff, true: '#ff6b35' }}
            thumbColor="#fff"
          />
        </View>

        <View
          style={[
            styles.row,
            isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
            !notifyNewTask && styles.rowDisabled,
          ]}
        >
          <IconChip name="options-outline" style={styles.rowIcon} />
          <View style={styles.rowContent}>
            <Text style={[styles.rowLabel, isDarkMode && { color: '#F8FAFC' }]}>
              Only notify tasks in my skillset
            </Text>
            <Text style={[styles.rowDesc, isDarkMode && { color: '#94A3B8' }]}>
              Filter notifications to tasks that match your skills only.
            </Text>
          </View>
          <Switch
            value={notifySkillMatch && notifyNewTask}
            onValueChange={(val) => {
              if (notifyNewTask) setNotifySkillMatch(val);
            }}
            disabled={!notifyNewTask}
            trackColor={{ false: trackOff, true: '#ff6b35' }}
            thumbColor="#fff"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <AppLoader color="#fff" size={22} />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003399',
  },
  scroll: { flex: 1 },
  saveBtn: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  saveText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginBottom: 20,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 19,
  },
  sectionLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  rowIcon: { marginRight: 12 },
  rowDisabled: {
    opacity: 0.5,
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 17,
  },
  saveButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 14,
    height: 52,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff6b35',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
