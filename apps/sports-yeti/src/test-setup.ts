import '@testing-library/jest-native/extend-expect';

// Official Jest mock — the native provider renders nothing in tests
// without it, which blanks the whole app tree.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

// Native modules with no Jest-side implementation. Stripe ships no JS mock,
// so provide a pass-through provider; Sentry.wrap must return the component
// unchanged for App.spec to render.
jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }: { children: unknown }) => children,
  useStripe: () => ({}),
}));

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: (component: unknown) => component,
  reactNavigationIntegration: () => ({ registerNavigationContainer: jest.fn() }),
  mobileReplayIntegration: () => ({}),
  captureException: jest.fn(() => 'mock-event-id'),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
}));

// expo-video's NativeVideoModule is undefined under jest-expo.
jest.mock('expo-video', () => ({
  useVideoPlayer: () => ({
    loop: false,
    muted: true,
    playing: false,
    play: jest.fn(),
    pause: jest.fn(),
  }),
  VideoView: () => null,
}));

// axios's fetch adapter probes ReadableStream support at import time, which
// crashes under expo's virtual streams polyfill in Jest. Stub the client —
// specs render against mocks, never the live API.
jest.mock('axios', () => {
  const instance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  };
  return {
    __esModule: true,
    default: { create: () => instance },
    AxiosError: class AxiosError extends Error {},
  };
});
