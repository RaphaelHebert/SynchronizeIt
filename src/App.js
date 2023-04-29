import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { Home } from "./Pages";
import Gmail from "./Components/Gmail";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gmail" element={<Gmail />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
