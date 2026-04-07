import '@testing-library/jest-dom';

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

if (!window.ResizeObserver) {
  window.ResizeObserver = ResizeObserverMock;
}

