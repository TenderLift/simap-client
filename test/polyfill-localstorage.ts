// Node 22+ includes a built-in localStorage that requires --localstorage-file
// to work properly. MSW's CookieStore accesses localStorage at module load
// time, which fails in Vitest's test environment. Provide an in-memory shim.
if (
	globalThis.localStorage === undefined ||
	typeof globalThis.localStorage.getItem !== 'function'
) {
	const store = new Map<string, string>();
	globalThis.localStorage = {
		getItem(key: string) {
			return store.get(key) ?? null;
		},
		setItem(key: string, value: string) {
			store.set(key, String(value));
		},
		removeItem(key: string) {
			store.delete(key);
		},
		clear() {
			store.clear();
		},
		get length() {
			return store.size;
		},
		key(index: number) {
			return [...store.keys()][index] ?? null;
		},
	};
}
