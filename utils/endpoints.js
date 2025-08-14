const endpoints = {
    authRegister: '/auth/register',
    authLogin: '/auth/login',
    logout: '/auth/logout',
    userMe: '/users/me',
    artists: '/artists',
    playlists: '/playlists',
    artistsById:   (id) => `/artists/${id}`,
    artistTopTracks:(id) => `/artists/${id}/top-tracks`,
    playlistsById: (id) => `/playlists/${id}`,
}

export default endpoints;   