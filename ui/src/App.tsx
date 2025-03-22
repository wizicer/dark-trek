import { StarMap } from './components/StarMap'
import { WalletProvider } from './providers/WalletProvider'
import './App.css'

function App() {
  return (
    <WalletProvider>
      <div className="w-screen h-screen">
        <StarMap />
      </div>
    </WalletProvider>
  )
}

export default App
