import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Home } from "./Pages";
import Gmail from "./Components/Gmail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gmail" element={<Gmail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
