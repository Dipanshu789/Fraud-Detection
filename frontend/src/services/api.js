import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const apiService = {
    predict: async (data) => {
        const response = await api.post('/predict/predict', data);
        return response.data;
    },
    batchPredict: async (transactions) => {
        const response = await api.post('/predict/predict/batch', { transactions });
        return response.data;
    },
    explain: async (transactionId) => {
        const response = await api.post('/explain/explain', { transaction_id: transactionId });
        return response.data;
    },
    getHealth: async () => {
        const response = await api.get('/health/health');
        return response.data;
    },
    getHistory: async () => {
        const response = await api.get('/predict/predict/history');
        return response.data;
    },
};
