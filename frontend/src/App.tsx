import { useState } from 'react'

function App() {
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Gestor Nautico</h2>
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>Clientes</li>
            <li>Embarcaciones</li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <h1>Bienvenido al Sistema</h1>
        <div className="card">
          <h3>Estado del Sistema</h3>
          <p>Conectado al Backend en localhost:3000</p>
        </div>
      </main>
    </div>
  )
}

export default App
