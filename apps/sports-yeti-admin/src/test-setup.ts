import '@testing-library/jest-native/extend-expect';

// Mock axios so importing `services/api` does not eagerly evaluate axios's
// fetch adapter, which crashes under jest-expo's ReadableStream polyfill
// ("Cannot cancel a stream that already has a reader"). Tests render the UI
// tree with mock data and never hit the network, so a thin client suffices.
jest.mock('axios', () => {
  const mockClient = {
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
  class AxiosError extends Error {}
  return {
    __esModule: true,
    default: { create: jest.fn(() => mockClient), isAxiosError: () => false },
    AxiosError,
  };
});
