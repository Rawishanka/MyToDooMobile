package com.nowanya.mytodoomobile;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.graphics.Color;
import android.os.Build;

/**
 * Notification Channel Creator for Android 8.0+
 * Required for FCM notifications to display properly
 */
public class NotificationChannelHelper {
    
    private static final String DEFAULT_CHANNEL_ID = "default_channel_id";
    private static final String DEFAULT_CHANNEL_NAME = "MyToDoo Notifications";
    private static final String DEFAULT_CHANNEL_DESCRIPTION = "Notifications for messages, offers, and task updates";

    public static void createNotificationChannels(Context context) {
        // Only needed for Android 8.0 (API 26) and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = 
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

            // Default channel for all notifications
            NotificationChannel defaultChannel = new NotificationChannel(
                DEFAULT_CHANNEL_ID,
                DEFAULT_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            );
            
            defaultChannel.setDescription(DEFAULT_CHANNEL_DESCRIPTION);
            defaultChannel.enableLights(true);
            defaultChannel.setLightColor(Color.BLUE);
            defaultChannel.enableVibration(true);
            defaultChannel.setVibrationPattern(new long[]{0, 500, 200, 500});
            defaultChannel.setShowBadge(true);

            // Create the channel
            notificationManager.createNotificationChannel(defaultChannel);

            // High priority channel for important notifications
            NotificationChannel highPriorityChannel = new NotificationChannel(
                "high_priority",
                "High Priority",
                NotificationManager.IMPORTANCE_HIGH
            );
            highPriorityChannel.setDescription("Important notifications that need immediate attention");
            highPriorityChannel.enableLights(true);
            highPriorityChannel.setLightColor(Color.RED);
            highPriorityChannel.enableVibration(true);
            highPriorityChannel.setShowBadge(true);
            
            notificationManager.createNotificationChannel(highPriorityChannel);
        }
    }
}
