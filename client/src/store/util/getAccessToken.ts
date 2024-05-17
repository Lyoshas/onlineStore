const getAccessToken = async () => {
    const res = await fetch(
        process.env.NODE_ENV === 'development'
            ? '/api/auth/refresh'
            : 'https://api.onlinestore-potapchuk.click/auth/refresh',
        {
            method: 'GET',
            credentials: 'include',
        }
    );
    const data: { accessToken: string } = await res.json();

    return data.accessToken;
};

export default getAccessToken;
