import React from 'react'
import { createRoot }       from 'react-dom/client'
import { Provider }         from 'react-redux'
import { BrowserRouter }    from 'react-router-dom'
import App                  from './App'
import store                from './store'
import './index.css'
import { Toaster } from 'sonner';

const container = document.getElementById('root')!
const root      = createRoot(container)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster />
    </Provider>
  </React.StrictMode>
)
