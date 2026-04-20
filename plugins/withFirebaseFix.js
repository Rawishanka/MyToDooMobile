/**
 * Expo Config Plugin to fix React Native Firebase modular header errors
 * Adds modular_headers for Firebase dependencies inside the target block
 */
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const FIREBASE_MODULAR_HEADERS = `
  # Enable modular headers for Firebase dependencies inside target
  pod 'FirebaseCore', :modular_headers => true
  pod 'FirebaseCoreExtension', :modular_headers => true
  pod 'FirebaseAuth', :modular_headers => true
  pod 'FirebaseAuthInterop', :modular_headers => true
  pod 'FirebaseAppCheckInterop', :modular_headers => true
  pod 'FirebaseCoreInternal', :modular_headers => true
  pod 'FirebaseFirestoreInternal', :modular_headers => true
  pod 'GoogleUtilities', :modular_headers => true
  pod 'RecaptchaInterop', :modular_headers => true
`;

const POST_INSTALL_FIX = `

    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.4'
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        config.build_settings['CLANG_ENABLE_EXPLICIT_MODULES'] = 'NO'
        config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
        config.build_settings['GCC_TREAT_WARNINGS_AS_ERRORS'] = 'NO'

        if target.name.start_with?('RNFB') || target.name.start_with?('Firebase') || target.name.start_with?('Google')
          config.build_settings['CLANG_WARN_NON_MODULAR_INCLUDE_IN_FRAMEWORK_MODULE'] = 'NO'
          config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES'
          config.build_settings['OTHER_CFLAGS'] = '$(inherited) -Wno-error=implicit-int -Wno-implicit-int -Wno-error=strict-prototypes -Wno-strict-prototypes -Wno-error -w'
        end

        if target.name == 'RCT-Folly'
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
          config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES'
        end
      end
    end`;

function withFirebaseFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');

        // Add $RNFirebaseAsStaticFramework if missing
        if (!podfileContent.includes('RNFirebaseAsStaticFramework')) {
          podfileContent = podfileContent.replace(
            'prepare_react_native_project!',
            '# Enable static framework for RNFB pods\n$RNFirebaseAsStaticFramework = true\n\nprepare_react_native_project!'
          );
        }

        // Add Firebase modular headers inside target block
        if (!podfileContent.includes('FirebaseCore') || !podfileContent.includes('modular_headers')) {
          podfileContent = podfileContent.replace(
            'use_expo_modules!',
            'use_expo_modules!\n' + FIREBASE_MODULAR_HEADERS
          );
        }

        // Add post_install build settings fix
        if (!podfileContent.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
          const startIdx = podfileContent.indexOf('react_native_post_install(');
          if (startIdx !== -1) {
            let depth = 0;
            let endIdx = -1;
            for (let i = startIdx; i < podfileContent.length; i++) {
              if (podfileContent[i] === '(') depth++;
              if (podfileContent[i] === ')') { depth--; if (depth === 0) { endIdx = i; break; } }
            }
            if (endIdx !== -1) {
              podfileContent = podfileContent.slice(0, endIdx + 1) + POST_INSTALL_FIX + podfileContent.slice(endIdx + 1);
            }
          }
        }

        fs.writeFileSync(podfilePath, podfileContent);
        console.log('✅ Applied React Native Firebase modular header fix to Podfile');
      }

      return config;
    },
  ]);
}

module.exports = withFirebaseFix;
