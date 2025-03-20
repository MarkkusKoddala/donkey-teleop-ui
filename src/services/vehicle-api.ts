
import {PUBLIC_CAR_IP} from "$env/static/public";

export interface RecordingResponse {
    recording: boolean;
}

export interface AutonomyResponse {
    autonomy: boolean;
}

const API_BASE_URL: string = `http://${PUBLIC_CAR_IP}:8081`;

export async function getRecording(): Promise<RecordingResponse> {
    const response = await fetch(`${API_BASE_URL}/recording`);
    if (!response.ok) {
        throw new Error('Failed to fetch recording state');
    }
    return response.json();
}

export async function toggleRecording(): Promise<RecordingResponse> {
    const response = await fetch(`${API_BASE_URL}/recording`, {
        method: 'POST'
    });
    if (!response.ok) {
        throw new Error('Failed to toggle recording');
    }
    return response.json();
}

export async function getAutonomy(): Promise<AutonomyResponse> {
    const response = await fetch(`${API_BASE_URL}/autonomy`);
    if (!response.ok) {
        throw new Error('Failed to fetch autonomy state');
    }
    return response.json();
}

export async function setAutonomy(autonomy: boolean): Promise<AutonomyResponse> {
    const response = await fetch(`${API_BASE_URL}/autonomy`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ autonomy })
    });
    if (!response.ok) {
        throw new Error('Failed to set autonomy');
    }
    return response.json();
}

