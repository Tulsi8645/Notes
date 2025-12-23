'use server';

import { cookies } from 'next/headers';
import axios from 'axios';
import { revalidatePath } from 'next/cache';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getAuthHeader() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getNotes() {
    try {
        const headers = await getAuthHeader();
        const response = await axios.get(`${BACKEND_URL}/notes`, { headers });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch notes', error);
        return [];
    }
}

export async function createNote(data: { title: string; description: string }) {
    try {
        const headers = await getAuthHeader();
        await axios.post(`${BACKEND_URL}/notes`, data, { headers });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to create note', error);
        return { success: false };
    }
}

export async function updateNote(id: string, data: { title: string; description: string }) {
    try {
        const headers = await getAuthHeader();
        await axios.put(`${BACKEND_URL}/notes/${id}`, data, { headers });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update note', error);
        return { success: false };
    }
}

export async function deleteNote(id: string) {
    try {
        const headers = await getAuthHeader();
        await axios.delete(`${BACKEND_URL}/notes/${id}`, { headers });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete note', error);
        return { success: false };
    }
}
