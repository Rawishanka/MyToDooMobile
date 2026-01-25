/**
 * Expo Config Plugin to fix React Native Firebase modular header errors
 * This plugin modifies the Podfile post_install to disable modular header warnings
 */
const { withDangerousMod } = require('@expo/config-plugins');
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
          // Find react_native_post_install and add our fix AFTER it closes with )
          const postInstallFix = `
    
    # Fix for React Native Firebase modular header errors and Folly coroutines
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        
        # Disable Folly coroutines completely - not needed by React Native
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_NO_CONFIG=1'
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_HAVE_CLOCK_GETTIME=1'
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_HAS_COROUTINES=0'
        
        # Treat Folly coroutine include errors as warnings, not errors
        config.build_settings['GCC_TREAT_WARNINGS_AS_ERRORS'] = 'NO'
        
        # Specifically fix RNFB pods
        if target.name.start_with?('RNFB') || target.name.start_with?('Firebase') || target.name.start_with?('Google')
          config.build_settings['CLANG_WARN_NON_MODULAR_INCLUDE_IN_FRAMEWORK_MODULE'] = 'NO'
          config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES'
        end
        
        # Fix for RCT-Folly coroutine errors specifically
        if target.name == 'RCT-Folly'
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
          config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES'
        end
      end
    end`;

          // Match react_native_post_install with all its parameters including the closing )
          // Use multiline and dotall to match across lines
          const reactNativePostInstallRegex = /(react_native_post_install\s*\([^)]*\))/s;
          
          const reactInstallMatch = podfileContent.match(reactNativePostInstallRegex);
          if (reactInstallMatch) {
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
