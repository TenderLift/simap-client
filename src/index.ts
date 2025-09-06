export {client} from './generated/client.gen';
export * from './generated/sdk.gen';
export type * from './generated/types.gen';
export type * as Types from './generated/types.gen';

export type Auth = {token?: string};
export const withAuth =
	(auth: Auth) =>
	(init: RequestInit = {}) => ({
		...init,
		headers: {
			...init.headers,
			...(auth.token ? {Authorization: `Bearer ${auth.token}`} : {}),
		},
	});

export class HttpError extends Error {
	constructor(
		public status: number,
		public body: unknown,
	) {
		super(`HTTP ${status}`);
	}
}
export async function ensureOk<T>(res: {response: Response; data: T}) {
	if (!res.response.ok) throw new HttpError(res.response.status, res.data);
	return res.data;
}
