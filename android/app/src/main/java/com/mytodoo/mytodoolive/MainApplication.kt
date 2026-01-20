package com.mytodoo.mytodoolive

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.res.Configuration
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactNativeHost

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
      this,
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
            }

          override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      }
  )

  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    
    // Create high-priority notification channel for immediate delivery
    createNotificationChannels()
    
    DefaultNewArchitectureEntryPoint.releaseLevel = try {
      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
    } catch (e: IllegalArgumentException) {
      ReleaseLevel.STABLE
    }
    loadReactNative(this)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  private fun createNotificationChannels() {
    // Notification channels are required for Android 8.0 (API 26) and above
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      
      // High priority channel for messages, offers, and real-time updates
      val highPriorityChannel = NotificationChannel(
        "high_priority_channel",
        "Messages & Updates",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Notifications for messages, offers, and important updates"
        enableLights(true)
        enableVibration(true)
        setShowBadge(true)
        lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
        
        // Set custom sound for immediate attention
        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val audioAttributes = AudioAttributes.Builder()
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .setUsage(AudioAttributes.USAGE_NOTIFICATION_COMMUNICATION_INSTANT)
          .build()
        setSound(soundUri, audioAttributes)
      }
      
      // Default channel for general notifications
      val defaultChannel = NotificationChannel(
        "default",
        "General Notifications",
        NotificationManager.IMPORTANCE_DEFAULT
      ).apply {
        description = "General app notifications"
        enableLights(true)
        enableVibration(true)
        setShowBadge(true)
      }
      
      // Register channels
      notificationManager.createNotificationChannel(highPriorityChannel)
      notificationManager.createNotificationChannel(defaultChannel)
    }
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
