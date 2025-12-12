// src/polyfills.ts

// Kiểm tra và gán biến global
if (typeof window !== "undefined") {
  // Polyfill cho global (yêu cầu bởi sockjs-client)
  if (!(window as any).global) {
    (window as any).global = window;
  }

  // Polyfill cho process (nếu cần thiết cho một số thư viện khác)
  if (!(window as any).process) {
    (window as any).process = { env: {} };
  }
}

export {};
