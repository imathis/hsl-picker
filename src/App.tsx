import React from "react";
import "./App.css";

import { Picker } from "./components/Picker";

function App() {
  return (
    <form onSubmit={() => null}>
      <Picker />
    </form>
  );
}

export default App;
