// Provide the missing F14LinkCheck<Mode=1>::check() symbol
// Required by react-native-reanimated but not in prebuilt ReactNativeDependencies

namespace folly {
namespace f14 {
namespace detail {

enum class F14IntrinsicsMode : unsigned char {
  None = 0,
  Simd = 1,
};

template <F14IntrinsicsMode>
struct F14LinkCheck {
  __attribute__((used, visibility("default")))
  static void check() {}
};

// Explicit instantiation
template struct __attribute__((visibility("default"))) F14LinkCheck<F14IntrinsicsMode::Simd>;

} // namespace detail
} // namespace f14
} // namespace folly
