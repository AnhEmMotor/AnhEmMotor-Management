interface WebSocketOptions {
  url?: string;
  messageHandler: (event: MessageEvent) => void;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  pingInterval?: number;
  reconnectTimeout?: number;
  maxReconnectAttempts?: number;
  connectionTimeout?: number;
}

export default class WebSocketClient {
  private static instance: WebSocketClient | null = null;
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandler: (event: MessageEvent) => void;
  private reconnectInterval: number;
  private heartbeatInterval: number;
  private pingInterval: number;
  private reconnectTimeout: number;
  private maxReconnectAttempts: number;
  private connectionTimeout: number;
  private reconnectAttempts: number = 0;

  private messageQueue: Array<string | Blob | BufferSource> = [];

  private detectionTimer: NodeJS.Timeout | null = null;
  private timeoutTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private connectionTimer: NodeJS.Timeout | null = null;

  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private stopReconnect: boolean = false;
  private isReconnecting: boolean = false;

  private constructor(options: WebSocketOptions) {
    this.url = options.url || (process.env.VUE_APP_LOGIN_WEBSOCKET as string);
    this.messageHandler = options.messageHandler;
    this.reconnectInterval = options.reconnectInterval ?? 20 * 1000;
    this.heartbeatInterval = options.heartbeatInterval ?? 5 * 1000;
    this.pingInterval = options.pingInterval ?? 10 * 1000;
    this.reconnectTimeout = options.reconnectTimeout ?? 30 * 1000;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10;
    this.connectionTimeout = options.connectionTimeout ?? 10 * 1000;
  }

  static getInstance(options: WebSocketOptions): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient(options);
    } else {
      WebSocketClient.instance.messageHandler = options.messageHandler;

      if (options.url && WebSocketClient.instance.url !== options.url) {
        WebSocketClient.instance.url = options.url;
        WebSocketClient.instance.reconnectAttempts = 0;
        WebSocketClient.instance.init();
      }
    }
    return WebSocketClient.instance;
  }

  init(): void {
    this.connect(true);
  }

  private connect(resetReconnectAttempts: boolean = false): void {
    if (this.isConnecting) {
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.flushMessageQueue();
      return;
    }

    try {
      this.isConnecting = true;
      this.stopReconnect = false;
      if (resetReconnectAttempts) {
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        this.clearTimer("reconnectTimer");
      }
      this.ws = new WebSocket(this.url);

      this.clearTimer("connectionTimer");
      this.clearTimer("connectionTimer");
      this.connectionTimer = setTimeout(() => {
        console.log(
          `WebSocket lien tiep sieu gio (${this.connectionTimeout}ms): ${this.url}`,
        );
        this.handleConnectionTimeout();
      }, this.connectionTimeout);
      this.ws.onopen = (event) => this.handleOpen(event);
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onclose = (event) => this.handleClose(event);
      this.ws.onerror = (event) => this.handleError(event);
    } catch (error) {
      this.isConnecting = false;
      this.reconnect();
    }
  }

  private handleConnectionTimeout(): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      this.ws?.close(1000, "Connection timeout");
      this.isConnecting = false;
      this.reconnect();
    }
  }

  close(force?: boolean): void {
    this.clearAllTimers();
    this.stopReconnect = true;
    this.isReconnecting = false;
    this.isConnecting = false;

    if (this.ws) {
      this.ws.close(
        force ? 1001 : 1000,
        force ? "Force closed" : "Normal close",
      );
      this.ws = null;
    }

    this.isConnected = false;
  }

  send(data: string | Blob | BufferSource, immediate: boolean = false): void {
    if (immediate && (!this.ws || this.ws.readyState !== WebSocket.OPEN)) {
      return;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log(
        "WebSocket chưa liên tiếp, tin nhắn đã thêm vào đội chót bằng đợ phát gửi",
      );
      this.messageQueue.push(data);

      if (!this.isConnecting && !this.stopReconnect) {
        this.init();
      }
      return;
    }

    try {
      this.ws.send(data);
    } catch (error) {
      this.messageQueue.push(data);
      this.reconnect();
    }
  }

  private flushMessageQueue(): void {
    if (
      this.messageQueue.length > 0 &&
      this.ws?.readyState === WebSocket.OPEN
    ) {
      console.log(
        `Phat gui doi chot trong cua ${this.messageQueue.length} tin nhan`,
      );
      while (this.messageQueue.length > 0) {
        const data = this.messageQueue.shift();
        if (data) {
          try {
            this.ws?.send(data);
          } catch (error) {
            if (data) this.messageQueue.unshift(data);
            break;
          }
        }
      }
    }
  }

  private handleOpen(event: Event): void {
    this.clearTimer("connectionTimer");
    this.isConnected = true;
    this.isConnecting = false;
    this.isReconnecting = false;
    this.stopReconnect = false;
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.startPing();
    this.flushMessageQueue();
  }

  private handleMessage(event: MessageEvent): void {
    this.resetHeartbeat();
    this.messageHandler(event);
  }

  private handleClose(event: CloseEvent): void {
    console.log(
      `WebSocket dong mo: ma=${event.code}, nguyen nhan=${event.reason}, khoa dong sach=${event.wasClean}`,
    );
    const isNormalClose = event.code === 1000;

    this.isConnected = false;
    this.isConnecting = false;
    this.clearConnectionTimers();
    this.ws = null;

    if (!this.stopReconnect && !isNormalClose) {
      this.reconnect();
    }
  }

  private handleError(event: Event): void {
    console.log(
      "Khi truoc lien tiep trang thai:",
      this.ws?.readyState
        ? this.getReadyStateText(this.ws.readyState)
        : "Chua ban dau dong hoa",
    );

    this.isConnected = false;
    this.isConnecting = false;

    if (!this.stopReconnect) {
      this.reconnect();
    }
  }

  private closeCurrentSocketForReconnect(): void {
    this.clearConnectionTimers();
    this.isConnected = false;
    this.isConnecting = false;

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;

      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close(1001, "Reconnect");
      }

      this.ws = null;
    }
  }

  private getReadyStateText(state: number): string {
    switch (state) {
      case WebSocket.CONNECTING:
        return "CONNECTING (0) - Đangliềntiếp";
      case WebSocket.OPEN:
        return "OPEN (1) - Đãliềntiếp";
      case WebSocket.CLOSING:
        return "CLOSING (2) - Đangđóngđóng";
      case WebSocket.CLOSED:
        return "CLOSED (3) - Đãđóngđóng";
      default:
        return `ChưabáoTrạng thái (${state})`;
    }
  }

  private startHeartbeat(): void {
    this.clearTimer("detectionTimer");
    this.clearTimer("timeoutTimer");

    this.detectionTimer = setTimeout(() => {
      this.isConnected = this.ws?.readyState === WebSocket.OPEN;

      if (!this.isConnected) {
        this.reconnect();

        this.timeoutTimer = setTimeout(() => {
          this.close();
        }, this.reconnectTimeout);
      }
    }, this.heartbeatInterval);
  }

  private resetHeartbeat(): void {
    this.clearTimer("detectionTimer");
    this.clearTimer("timeoutTimer");
    this.startHeartbeat();
  }

  private startPing(): void {
    this.clearTimer("pingTimer");

    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        this.clearTimer("pingTimer");
        this.reconnect();
        return;
      }

      try {
        this.ws.send("ping");
      } catch (error) {
        this.clearTimer("pingTimer");
        this.reconnect();
      }
    }, this.pingInterval);
  }

  private reconnect(): void {
    if (
      this.stopReconnect ||
      this.isConnecting ||
      this.reconnectInterval <= 0
    ) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(
        `Da dat toi da so lan ket noi lai (${this.maxReconnectAttempts}), dung ket noi`,
      );
      this.close(true);
      return;
    }

    this.reconnectAttempts++;
    this.isReconnecting = true;
    this.closeCurrentSocketForReconnect();

    const delay = this.calculateReconnectDelay();
    console.log(
      `Tao ${delay / 1000}s sau thu ket noi lai moi (lan ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    this.clearTimer("reconnectTimer");
    this.reconnectTimer = setTimeout(() => {
      console.log(
        `Thu ket noi lai moi WebSocket (lan ${this.reconnectAttempts})`,
      );
      this.connect(false);
    }, delay);
  }

  private calculateReconnectDelay(): number {
    const jitter = Math.random() * 1000;
    const baseDelay = Math.min(
      this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1),
      this.reconnectInterval * 5,
    );
    return baseDelay + jitter;
  }

  private clearTimer(
    timerName:
      | "detectionTimer"
      | "timeoutTimer"
      | "reconnectTimer"
      | "pingTimer"
      | "connectionTimer",
  ): void {
    if (this[timerName]) {
      clearTimeout(this[timerName] as NodeJS.Timeout);
      this[timerName] = null;
    }
  }

  private clearAllTimers(): void {
    this.clearConnectionTimers();
    this.clearTimer("reconnectTimer");
  }

  private clearConnectionTimers(): void {
    this.clearTimer("detectionTimer");
    this.clearTimer("timeoutTimer");
    this.clearTimer("pingTimer");
    this.clearTimer("connectionTimer");
  }

  get isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  get connectionStatusText(): string {
    if (this.isConnecting) return "Đangliềntiếp";
    if (this.isConnected) return "Đãliềntiếp";
    if (this.isReconnecting && this.reconnectAttempts > 0)
      return `Xóa bộ lọcliềntrong（${this.reconnectAttempts}/${this.maxReconnectAttempts}）`;
    return "Đãđoánmở";
  }

  static destroyInstance(): void {
    if (WebSocketClient.instance) {
      WebSocketClient.instance.close();
      WebSocketClient.instance = null;
    }
  }
}
