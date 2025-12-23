'use server';

import { cookies } from 'next/headers';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function setAuthCookie(token: string) {
    console.log('Setting auth cookie...');
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });
    console.log('Auth cookie set successfully');
    return { success: true };
}

export async function loginAction(formData: any) {
    console.log('Starting loginAction...');
    try {
        const response = await axios.post(`${BACKEND_URL}/auth/login`, formData);
        const { access_token, user } = response.data;

        if (access_token) {
            const cookieStore = await cookies();
            cookieStore.set('token', access_token, {
                httpOnly: true, // Secure! Browser can't read this now.
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });
            return { success: true, user };
        }
        return { success: false, error: 'Login failed' };
    } catch (error: any) {
        console.error('Login error:', error.response?.data?.message || error.message);
        return {
            success: false,
            error: error.response?.data?.message || 'Invalid credentials'
        };
    }
}

export async function signupAction(formData: any) {
    console.log('Starting signupAction...');
    try {
        const response = await axios.post(`${BACKEND_URL}/auth/signup`, formData);
        const { access_token, user } = response.data;

        if (access_token) {
            const cookieStore = await cookies();
            cookieStore.set('token', access_token, {
                httpOnly: true, // Secure!
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });
            return { success: true, user };
        }
        return { success: false, error: 'Signup failed' };
    } catch (error: any) {
        console.error('Signup error:', error.response?.data?.message || error.message);
        return {
            success: false,
            error: error.response?.data?.message || 'Registration failed'
        };
    }
}

export async function logoutAction() {
    console.log('Logging out from Server Action...');
    const cookieStore = await cookies();
    cookieStore.delete('token');
    return { success: true };
}

export async function getProfile() {
    console.log('Fetching profile from Server Action...');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        console.log('No token found in cookies. Available cookies:', cookieStore.getAll().map(c => c.name));
        return null;
    }

    try {
        const response = await axios.get(`${BACKEND_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Profile fetched successfully');
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch profile in Server Action', error.response?.status || error.message);
        return null;
    }
}
