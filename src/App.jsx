import './App.css'

import { ColorProvider, Picker } from './color'

function App() {
  return (
    <ColorProvider>
      <Picker />
    </ColorProvider>
  )
}

export default App
