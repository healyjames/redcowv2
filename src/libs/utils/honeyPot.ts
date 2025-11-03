export function checkHoneypot(body: any) {
    return Boolean(body?.company);
}
