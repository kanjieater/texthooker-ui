import { newLine$ } from './stores/stores';

export class SocketConnection {
	public websocketUrl: string;

	private socket: WebSocket | undefined;
	private socketState$;
	
	constructor(webSocketUrl,socketState$) {
		this.websocketUrl = webSocketUrl;
		this.socketState$ = writableSubject<number>(-1);
		// $websocketUrl$.subscribe((websocketUrl) => (this.websocketUrl = websocketUrl));
	}

	connect() {
		if (this.socket?.readyState < 2) {
			return;
		}

		if (!this.websocketUrl) {
			socketState$.next(3);
			return;
		}

		socketState$.next(0);

		this.socket = new WebSocket(this.websocketUrl);
		this.socket.onopen = this.updateSocketState.bind(this);
		this.socket.onclose = this.updateSocketState.bind(this);
		this.socket.onmessage = this.handleMessage.bind(this);
	}

	disconnect() {
		if (this.socket?.readyState === 1) {
			this.socket.close(1000, 'User Request');
		}
	}

	private updateSocketState() {
		socketState$.next(this.socket.readyState);
	}

	private handleMessage(event: MessageEvent) {
		let line = event.data;

		try {
			line = JSON.parse(event.data)?.sentence || event.data;
		} catch (_) {
			// no-op
		}

		newLine$.next(line);
	}
}
