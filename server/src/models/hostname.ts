// "example.com/" => "example.com"
// "example.com" => "example.com"
export const normalizeHostname = (hostname: string) => {
    return hostname.endsWith('/') ? hostname.slice(0, -1) : hostname;
};
