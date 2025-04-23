import React from "react";
import "./App.css";

import { ColorProvider } from "./context";
import { Picker } from "./components/Picker";

function App() {
  return (
    <ColorProvider>
      <Picker />
    </ColorProvider>
  );
}

export default App;
