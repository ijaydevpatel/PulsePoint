const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('pulsepo!int_token') : null;

export const apiClient = {

  async get(endpoint: string): Promise<any> {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API Network Get Fault');
    return data;
  },

  async post(endpoint: string, body: any): Promise<any> {
    const token = getToken();
    const isFormData = body instanceof FormData;

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: isFormData ? body : JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API Network Post Fault');
    return data;
  },

  async put(endpoint: string, body: any): Promise<any> {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API Network Put Fault');
    return data;
  },

  async delete(endpoint: string): Promise<any> {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API Network Delete Fault');
    return data;
  },
  async stream(endpoint: string, body: any, onChunk: (text: string) => void): Promise<void> {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error('Stream request failed');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.slice(6).trim();
          if (content === '[DONE]') break;
          try {
            const parsed = JSON.parse(content);
            if (parsed.chunk) onChunk(parsed.chunk);
          } catch (e) {}
        }
      }
    }
  }
};
