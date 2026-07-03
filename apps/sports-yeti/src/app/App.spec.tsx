import * as React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import App from './App';

test('renders the signed-out Welcome screen', async () => {
  const { getAllByText, queryByText } = render(<App />);
  // Auth store resolves (no stored token) → AuthNavigator → WelcomeScreen.
  // Generous timeout: fonts + async storage both resolve before first paint.
  await waitFor(
    () => {
      expect(getAllByText('SportsYeti').length).toBeGreaterThan(0);
    },
    { timeout: 5000 },
  );
  // The error boundary must not have tripped during boot.
  expect(queryByText('Oops! Something went wrong')).toBeNull();
});
