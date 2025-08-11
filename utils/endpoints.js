const endpoints = {
    authRegister: '/auth/register',
    authLogin: '/auth/login',
    logout: '/auth/logout',
    userMe: '/users/me',
    artists: '/artists',
    playlists: '/playlists',
    playlistsById: (id) => `/playlists/${id}`,
    playlistsByTracks: (id) => `/playlists/${id}/tracks`,
}

export default endpoints;