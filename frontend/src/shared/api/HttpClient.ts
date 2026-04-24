/// <reference types="vite/client" />
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL  ;

class HttpClient {
    private instance: AxiosInstance;
    private unauthorizedCallback?: () => void;

    constructor() {
        this.instance = axios.create({
            baseURL: BASE_URL,
            withCredentials: true, // Importante para httpOnly cookies
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.initializeInterceptors();
    }

    private initializeInterceptors() {
        // Interceptor de Peticion: Inyectar Bearer Token si existe
        this.instance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Inyectar el ID de la guardería activa para multi-tenancy
                const guarderiaId = localStorage.getItem('guarderiaId');
                if (guarderiaId && config.headers) {
                    config.headers['x-guarderia-id'] = guarderiaId;
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Interceptor de Respuesta: Manejar errores globales
        this.instance.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error.response?.status;
                const data = error.response?.data;

                // 1. Manejar 401 (Unauthorized)
                if (status === 401) {
                    if (this.unauthorizedCallback) {
                        this.unauthorizedCallback();
                    }
                }

                // 2. Extraer y mostrar mensaje amigable
                let messageBody = 'No se pudo completar la operación.';
                
                if (data?.message) {
                    messageBody = Array.isArray(data.message) 
                        ? data.message.join('. ') 
                        : data.message;
                } else if (status) {
                    switch (status) {
                        case 400: messageBody = 'La solicitud no es válida.'; break;
                        case 401: messageBody = 'Sesión expirada o no válida.'; break;
                        case 403: messageBody = 'Acceso denegado.'; break;
                        case 404: messageBody = 'Recurso no encontrado.'; break;
                        case 500: messageBody = 'Error interno del servidor.'; break;
                    }
                }

                // 3. Manejar errores de Tenant (403/404 con mensajes específicos)
                // Si el error menciona guardería o acceso denegado por multi-tenancy
                const isTenantError = (status === 403 || status === 404) && 
                    (messageBody.toLowerCase().includes('guardería') || 
                     messageBody.toLowerCase().includes('tenant'));
                
                if (isTenantError) {
                    console.warn('[HttpClient] Tenant error detected, redirecting to selector...');
                    // Redirigir al selector de guardería (se definirá en rutas)
                    window.location.href = '/select-tenant';
                    return Promise.reject(error);
                }

                // Función para reproducir un 'beep' en el navegador
                try {
                    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                    if (AudioContext) {
                        const ctx = new AudioContext();
                        const oscillator = ctx.createOscillator();
                        const gainNode = ctx.createGain();
                        
                        oscillator.type = 'triangle';
                        oscillator.frequency.setValueAtTime(300, ctx.currentTime); // Tono de error (grave)
                        oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2); // Caída rápida
                        
                        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(ctx.destination);
                        
                        oscillator.start();
                        oscillator.stop(ctx.currentTime + 0.2);
                    }
                } catch (e) {
                    console.error('Audio api no soportada o bloqueada', e);
                }

                // Mostrar Toast único
                toast.error(messageBody, {
                    id: 'global-api-error',
                });

                console.error('[HttpClient Error]', status, data);
                return Promise.reject(error);
            }
        );
    }

    public setUnauthorizedCallback(callback: () => void) {
        this.unauthorizedCallback = callback;
    }

    /**
     * Actualiza la guardería activa en el almacenamiento local y para futuras peticiones
     */
    public setGuarderiaActiva(id: string | number | null) {
        if (id !== null && id !== undefined && id !== '') {
            localStorage.setItem('guarderiaId', id.toString());
        } else {
            localStorage.removeItem('guarderiaId');
        }
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.get(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.post(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.put(url, data, config);
        return response.data;
    }

    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.patch(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.delete(url, config);
        return response.data;
    }
}

export const httpClient = new HttpClient();
