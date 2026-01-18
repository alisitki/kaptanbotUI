
export interface SSEEvent {
    event: string;
    data: string;
    id: string | null;
}

export async function fetchSSE(url: string, options: RequestInit, onEvent: (ev: SSEEvent) => void, onError: (err: any) => void) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`SSE fetch failed: ${response.status} ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last partial line

            let currentEvent: SSEEvent = { event: 'message', data: '', id: null };

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed === '') {
                    // Empty line means end of event block
                    if (currentEvent.data !== '') {
                        onEvent(currentEvent);
                    }
                    currentEvent = { event: 'message', data: '', id: null };
                    continue;
                }

                if (trimmed.startsWith(':')) continue; // Comment

                const colonIndex = trimmed.indexOf(':');
                if (colonIndex === -1) continue;

                const field = trimmed.slice(0, colonIndex);
                const value = trimmed.slice(colonIndex + 1).trim();

                switch (field) {
                    case 'event':
                        currentEvent.event = value;
                        break;
                    case 'data':
                        currentEvent.data += (currentEvent.data === '' ? '' : '\n') + value;
                        break;
                    case 'id':
                        currentEvent.id = value;
                        break;
                }
            }
        }
    } catch (err) {
        onError(err);
    }
}
