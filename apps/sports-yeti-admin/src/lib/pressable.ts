import type { PressableStateCallbackType } from 'react-native';

/**
 * react-native-web's <Pressable> exposes hovered + focused state in
 * the style/children callback, but the public RN typings do not.
 * This typed cast lets us read those fields without per-call
 * `// @ts-expect-error` noise.
 */
export interface WebPressableState extends PressableStateCallbackType {
  hovered?: boolean;
  focused?: boolean;
}

export function ws(state: PressableStateCallbackType): WebPressableState {
  return state as WebPressableState;
}
