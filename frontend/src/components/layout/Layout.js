// ============================================================================
// COMPONENTE LAYOUT - Diseño principal de la aplicación
// ============================================================================

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    
    const closeSidebar = () => {
        setSidebarOpen(false);
    };
    
    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar - Fixed y ocupa 100% del alto */}
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
            
            {/* Contenido principal - Con margen izquierdo para el sidebar en desktop */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
                {/* Header - Sticky */}
                <Header onMenuClick={toggleSidebar} />
                
                {/* Contenido de la página - Con scroll independiente */}
                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
