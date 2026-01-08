'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type SourceType = 'Home' | 'Real Estate' | 'Crypto' | 'Shares' | 'Bonds' | 'Business';

interface SourceContextType {
    activeSource: SourceType;
    setActiveSource: (source: SourceType) => void;
}

const SourceContext = createContext<SourceContextType | undefined>(undefined);

export function SourceProvider({ children }: { children: ReactNode }) {
    const [activeSource, setActiveSource] = useState<SourceType>('Home');

    return (
        <SourceContext.Provider value={{ activeSource, setActiveSource }}>
            {children}
        </SourceContext.Provider>
    );
}

export function useSource() {
    const context = useContext(SourceContext);
    if (context === undefined) {
        throw new Error('useSource must be used within a SourceProvider');
    }
    return context;
}
