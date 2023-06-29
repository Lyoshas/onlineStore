const getAccessToken = async () => {
    const res = await fetch('/api/auth/refresh', {
        method: 'GET',
        credentials: 'include',
    });
    const data: { accessToken: string } = await res.json();

    return data.accessToken;
};

export default getAccessToken;
