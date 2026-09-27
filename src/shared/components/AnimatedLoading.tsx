import AppLoader from './AppLoader';

interface AnimatedLoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: any;
}

const SIZE_PX: Record<'small' | 'medium' | 'large', number> = {
  small: 26,
  medium: 34,
  large: 44,
};

/** Same brand three-dot animation as AppLoader, kept under this name for existing call sites. */
export default function AnimatedLoading({
  size = 'medium',
  color = '#004aad',
  style,
}: AnimatedLoadingProps) {
  return <AppLoader size={SIZE_PX[size]} color={color} style={style} />;
}
