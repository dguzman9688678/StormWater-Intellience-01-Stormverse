import { Suspense } from "react";
import StormVerse from "./components/StormVerse";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/cyberpunk.css";
import "@fontsource/inter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="stormverse-app">
        <Suspense fallback={
          <div className="loading-screen">
            <div className="cyber-loader">
              <div className="loader-text">INITIALIZING STORMVERSE</div>
              <div className="loader-bar">
                <div className="loader-progress"></div>
              </div>
            </div>
          </div>
        }>
          <StormVerse />
        </Suspense>
      </div>
    </QueryClientProvider>
  );
}

export default App;
