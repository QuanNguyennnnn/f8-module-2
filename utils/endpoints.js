const endpoints = {
    authRegister: '/auth/register',
    authLogin: '/auth/login',
    logout: '/auth/logout',
    userMe: '/users/me',
    artists: '/artists',
    playlists: '/playlists',
    tracks: '/tracks',
    artistsById:   (id) => `/artists/${id}`,
    artistTopTracks:(id) => `/artists/${id}/tracks/popular`,
    playlistsById: (id) => `/playlists/${id}`,
    playlistFollow: (id) => `/playlists/${id}/follow`,
    playlistUnfollow: (id) => `/playlists/${id}/follow`,
    artistFollow: (id) => `/artists/${id}/follow`,
    artistUnfollow: (id) => `/artists/${id}/follow`,
    artistFollowStatus: (id) => `/artists/${id}/followers/contains`,
    playlistCreate: '/playlists',
    playlistUpdate: (id) => `/playlists/${id}`,
    myPlaylists: '/playlists/me',
    uploadAvatar: '/upload/avatar',
    playlistDelete: (id) => `/playlists/${id}`,
}

export default endpoints;   