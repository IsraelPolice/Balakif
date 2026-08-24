import React from 'react'
import ReactDOM from 'react-dom/client'
import Elections from './components/elections/Elections'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Elections onBack={() => { window.location.href = 'https://israelpolice.github.io/Balakif/pages/main.html' }} />
  </React.StrictMode>,
)
