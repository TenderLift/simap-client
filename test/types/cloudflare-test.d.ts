declare module 'cloudflare:test' {
	export type FetchMockInterceptor = {
		reply(statusCode: number, body?: string, init?: ResponseInit): void;
		replyWithError(error: Error): void;
	};

	export type FetchMock = {
		activate(): void;
		disableNetConnect(): void;
		assertNoPendingInterceptors(): void;
		get(origin: string): {
			intercept(options: {
				path: string;
				headers?: Record<string, string>;
			}): FetchMockInterceptor;
		};
	};

	export const fetchMock: FetchMock;
}
