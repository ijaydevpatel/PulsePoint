const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type TokenProvider = () => Promise<string | null>;
let tokenProvider: TokenProvider | null = null;

/**
 * Safely parse JSON — if the backend returns HTML (CORS error, 502, 404 page),
 * throw a descriptive error instead of crashing with "Unexpected token '<'".
 */
async function safeJson(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text().catch(() => 'No response body');
    let friendlyMessage = 'The Neural Core is currently out of sync.';
    
    if (response.status === 404) {
      friendlyMessage = 'The requested feature is not active. Please restart the backend (node server.js) to synchronize this portal.';
    } else if (response.status === 500) {
      friendlyMessage = 'The Neural Core encountered a processing fault. Please check your connection and try again.';
    }

    const err: any = new Error(friendlyMessage);
    err.status = response.status;
    err.technicalPreview = text.slice(0, 120); // Keep technical info hidden in the error object
    throw err;
  }
  return response.json();
}

export const apiClient = {
  /**
   * Inject a dynamic token provider (e.g. from Clerk)
   */
  setTokenProvider(provider: TokenProvider) {
    tokenProvider = provider;
  },

  async getHeaders(): Promise<Record<string, string>> {
    let token = null;
    if (tokenProvider) {
      token = await tokenProvider();
    } else if (typeof window !== 'undefined') {
      token = sessionStorage.getItem('pulsepo!int_token');
    }

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  },

  async get(endpoint: string): Promise<any> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
      headers
    });
    const data = await safeJson(response);
    if (!response.ok) {
      const err: any = new Error(data.message || 'API Network Get Fault');
      err.status = response.status;
      throw err;
    }
    return data;
  },

  async post(endpoint: string, body: any): Promise<any> {
    const isFormData = body instanceof FormData;
    const headers = await this.getHeaders();
    
    // FormData handles its own boundary headers
    if (isFormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: isFormData ? body : JSON.stringify(body)
    });

    const data = await safeJson(response);
    if (!response.ok) {
      const err: any = new Error(data.message || 'API Network Post Fault');
      err.status = response.status;
      throw err;
    }
    return data;
  },

  async put(endpoint: string, body: any): Promise<any> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers,
      body: JSON.stringify(body)
    });
    const data = await safeJson(response);
    if (!response.ok) {
      const err: any = new Error(data.message || 'API Network Put Fault');
      err.status = response.status;
      throw err;
    }
    return data;
  },

  async delete(endpoint: string): Promise<any> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers
    });
    const data = await safeJson(response);
    if (!response.ok) {
      const err: any = new Error(data.message || 'API Network Delete Fault');
      err.status = response.status;
      throw err;
    }
    return data;
  },

  async stream(endpoint: string, body: any, onChunk: (text: string) => void): Promise<void> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers,
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
