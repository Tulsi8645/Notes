'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, logoutAction } from '@/lib/actions';

interface User {
    _id: string;
    email: string;
    username: string;
    profileImage?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User) => void;
    logout: () => void;
    syncProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const syncProfile = useCallback(async () => {
        console.log('[AuthContext] Fetching live profile...');
        try {
            const profile = await getProfile();
            if (profile) {
                console.log('[AuthContext] Sync success');
                setUser(profile);
                localStorage.setItem('user', JSON.stringify(profile));
            } else {
                console.log('[AuthContext] Session invalid, clearing state');
                await logoutAction(); // This clears the HttpOnly cookie!
                setUser(null);
                localStorage.removeItem('user');
            }
        } catch (err) {
            console.error('[AuthContext] Sync error', err);
            await logoutAction();
            setUser(null);
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);



    useEffect(() => {
        const initializeAuth = async () => {
            console.log('[AuthContext] Initializing...');
            // Initial load from storage for "Quick Reveal"
            const storedUser = localStorage.getItem('user');
            if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
                try {
                    console.log('[AuthContext] Found stored user, quick reveal');
                    setUser(JSON.parse(storedUser));
                    // We can set loading false here if we want immediate reveal
                    // but syncProfile will set it false anyway.
                } catch (e) {
                    localStorage.removeItem('user');
                }
            }

            console.log('[AuthContext] Starting syncProfile...');
            await syncProfile();
            console.log('[AuthContext] Initialization complete');
        };

        initializeAuth();
    }, [syncProfile]);


    const login = useCallback((userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        router.push('/');
        router.refresh();
    }, [router]);

    const logout = useCallback(async () => {
        await logoutAction();
        setUser(null);
        localStorage.removeItem('user');
        router.push('/login');
        router.refresh();
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, syncProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


