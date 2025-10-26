import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

interface KeyboardInfo {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

// Hook to track keyboard visibility and height
export function useKeyboard(): KeyboardInfo {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      'keyboardDidShow',
      (e: KeyboardEvent) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return { isKeyboardVisible, keyboardHeight };
}

export default useKeyboard;
