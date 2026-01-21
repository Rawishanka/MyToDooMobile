/**
 * Expo Config Plugin to fix React Native Firebase modular header errors
 * This plugin modifies the Podfile post_install to disable modular header warnings
 */
const { withDangerousMod, withPlugins } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withFirebaseFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      
      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');
        
        // Check if the fix is already applied
        if (!podfileContent.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
          // Find the post_install block and add our fix
          const postInstallFix = `
    # Fix for React Native Firebase modular header errors
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        
        # Specifically fix RNFB pods
        if target.name.start_with?('RNFB') || target.name.start_with?('Firebase') || target.name.start_with?('Google')
          build_config.build_settings['CLANG_WARN_NON_MODULAR_INCLUDE_IN_FRAMEWORK_MODULE'] = 'NO'
          build_config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES'
        end
      end
    end`;

          // Insert the fix before the last 'end' of post_install block
          // Find the react_native_post_install call and add our fix after it
          const reactNativePostInstallRegex = /(react_native_post_install\s*\([^)]+\))/;
          
          if (reactInstallMatch = podfileContent.match(reactNativePostInstallRegex)) {
            podfileContent = podfileContent.replace(
              reactNativePostInstallRegex,
              `$1${postInstallFix}`
            );
            
            fs.writeFileSync(podfilePath, podfileContent);
            console.log('✅ Applied React Native Firebase modular header fix to Podfile');
          }
        } else {
          console.log('ℹ️ React Native Firebase fix already applied to Podfile');
        }
      }
      
      return config;
    },
  ]);
}

module.exports = withFirebaseFix;
