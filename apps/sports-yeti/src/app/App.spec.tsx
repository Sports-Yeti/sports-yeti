import * as React from 'react';
import { render } from '@testing-library/react-native';

import App from './App';

test('renders login title', () => {
  const { getByText } = render(<App />);
  expect(getByText('Sports Yeti')).toBeTruthy();
});
