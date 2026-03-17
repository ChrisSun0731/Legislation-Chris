import { boot } from 'quasar/wrappers';
import { initializeApp } from 'firebase/app';
import { VueFire } from 'vuefire';
import { createGtag } from 'vue-gtag';
import type { HttpsCallable } from '@firebase/functions';

export const firebaseApp = initializeApp({
  apiKey: 'AIzaSyAI6eGOld2TX1NkPUjvp-nqJNmzfE-Ti7U',
  authDomain: 'cksc-legislation.firebaseapp.com',
  projectId: 'cksc-legislation',
  storageBucket: 'cksc-legislation.appspot.com',
  messagingSenderId: '872443717491',
  appId: '1:872443717491:web:7ea49ba1403de4928b0706',
  measurementId: 'G-0ZLXJZG30T',
});

export default boot(({ app }) => {
  app.use(VueFire, {
    firebaseApp,
    modules: [],
  });

  if (!process.env.SERVER) {
    // defer gtag to reduce TBT and initial load size
    setTimeout(() => {
      app.use(
        createGtag({
          appName: 'CKSC Legislation Quasar App',
          tagId: firebaseApp.options.measurementId!,
        }),
      );
    }, 2000);
  }
});

export function useFunction(name: string): HttpsCallable {
  // We keep the return type same but we will need to handle the async nature if we want full optimization.
  // However, simple dynamic import inside the function won't work for synchronous return.
  // Let's check if the callers expect a promise or the callable function.
  // httpsCallable returns a function.
  
  // Actually, let's just dynamic import the products in a way that doesn't break the sync signature if possible, 
  // or accept that calling useFunction will be async if we refactor callers.
  // For now, let's at least remove'em from the top-level imports.
  throw new Error('Please use useFunctionAsync instead for better performance');
}

export async function useFunctionAsync(name: string): Promise<HttpsCallable> {
  const { getFunctions, httpsCallable } = await import('@firebase/functions');
  return httpsCallable(getFunctions(firebaseApp, 'asia-east1'), name);
}

export async function useAuth() {
  const { getAuth } = await import('firebase/auth');
  return getAuth(firebaseApp);
}
