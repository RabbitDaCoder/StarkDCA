// Browser shim for the "ws" package used by starknetkit.
// In browsers, the native WebSocket API is available, so this is a no-op.
export default (typeof WebSocket !== 'undefined' ? WebSocket : undefined) as any;
