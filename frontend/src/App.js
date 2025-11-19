// ============================================================================
// APP.JS - Componente principal de la aplicación
// ============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Componentes de autenticación
import ProtectedRoute from './components/auth/ProtectedRoute';

// Páginas
import LoginPage from './pages/auth/LoginPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersListPage from './pages/usuarios/UsersListPage';
import { UnitsTreePage } from './pages/unidades';
import { RolesListPage } from './pages/roles';
import { LogsViewerPage } from './pages/logs';
import { TasksListPage } from './pages/tareas';
import NotificationListPage from './pages/NotificationListPage';

// Módulo de Taller
import VehiclesListPage from './pages/taller/VehiclesListPage.jsx';
import AppointmentTypesListPage from './pages/taller/AppointmentTypesListPage.jsx';
import AppointmentsListPage from './pages/taller/AppointmentsListPage.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Configuración global de React Hot Toast */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#004E2E',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#C8102E',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rutas protegidas */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/cambiar-password" 
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/usuarios" 
            element={
              <ProtectedRoute>
                <UsersListPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/unidades" 
            element={
              <ProtectedRoute>
                <UnitsTreePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/roles" 
            element={
              <ProtectedRoute>
                <RolesListPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/logs" 
            element={
              <ProtectedRoute>
                <LogsViewerPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tareas" 
            element={
              <ProtectedRoute>
                <TasksListPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tareas/:id" 
            element={
              <ProtectedRoute>
                <TasksListPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/notificaciones" 
            element={
              <ProtectedRoute>
                <NotificationListPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Módulo de Taller */}
          <Route 
            path="/taller" 
            element={<Navigate to="/taller/vehiculos" replace />} 
          />
          
          <Route 
            path="/taller/vehiculos" 
            element={
              <ProtectedRoute>
                <VehiclesListPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/taller/tipos-cita" 
            element={
              <ProtectedRoute>
                <AppointmentTypesListPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/taller/citas" 
            element={
              <ProtectedRoute>
                <AppointmentsListPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta por defecto - redirigir a login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
