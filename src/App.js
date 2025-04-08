import React, { useContext } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  IconButton,
  Tooltip,
  Container,
} from '@mui/material';
import { SpotifyContext } from './SpotifyContext';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import MusicTimeline from './components/MusicTimeline';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './app.css';

function App() {
  const {
    token,
    userData,
    loading,
    error,
    login,
    logout
  } = useContext(SpotifyContext);
  const navigate = useNavigate();

  const renderCard = (title, icon, items, renderItem) => (
    <Box className="spotify-card">
      <Box className="spotify-card-header">
        {icon}
        <Typography variant="h6" className="section-title" sx={{ ml: 1, mb: 0 }}>
          {title}
        </Typography>
      </Box>
      <List className="spotify-card-content">
        {items?.map(renderItem)}
      </List>
    </Box>
  );

  const renderTrackItem = (track) => (
    <ListItem key={track.id} className="list-item">
      <ListItemAvatar>
        <Avatar
          src={track.album.images?.[0]?.url}
          alt={track.name}
          variant="rounded"
          className="avatar"
        />
      </ListItemAvatar>
      <ListItemText
        primary={track.name}
        secondary={track.artists.map(a => a.name).join(', ')}
        primaryTypographyProps={{
          sx: { color: 'white', fontWeight: 500 }
        }}
        secondaryTypographyProps={{
          sx: { color: 'rgba(255,255,255,0.7)' }
        }}
      />
      <Tooltip title="Open in Spotify">
        <IconButton
          href={track.external_urls.spotify}
          target="_blank"
          className="icon-button"
        >
          <OpenInNewIcon />
        </IconButton>
      </Tooltip>
    </ListItem>
  );

  const renderArtistItem = (artist) => (
    <ListItem key={artist.id} className="list-item">
      <ListItemAvatar>
        <Avatar
          src={artist.images?.[0]?.url}
          alt={artist.name}
          variant="rounded"
          className="avatar"
        />
      </ListItemAvatar>
      <ListItemText
        primary={artist.name}
        secondary={`${artist.followers.total.toLocaleString()} followers`}
        primaryTypographyProps={{
          sx: { color: 'white', fontWeight: 500 }
        }}
        secondaryTypographyProps={{
          sx: { color: 'rgba(255,255,255,0.7)' }
        }}
      />
      <Tooltip title="Open in Spotify">
        <IconButton
          href={artist.external_urls.spotify}
          target="_blank"
          className="icon-button"
        >
          <OpenInNewIcon />
        </IconButton>
      </Tooltip>
    </ListItem>
  );

  const renderPlaylistItem = (playlist) => (
    <ListItem key={playlist.id} className="list-item">
      <ListItemAvatar>
        <Avatar
          src={playlist.images?.[0]?.url}
          alt={playlist.name}
          variant="rounded"
          className="avatar"
        />
      </ListItemAvatar>
      <ListItemText
        primary={playlist.name}
        secondary={`${playlist.tracks.total} tracks`}
        primaryTypographyProps={{
          sx: { color: 'white', fontWeight: 500 }
        }}
        secondaryTypographyProps={{
          sx: { color: 'rgba(255,255,255,0.7)' }
        }}
      />
      <Tooltip title="Open in Spotify">
        <IconButton
          href={playlist.external_urls.spotify}
          target="_blank"
          className="icon-button"
        >
          <OpenInNewIcon />
        </IconButton>
      </Tooltip>
    </ListItem>
  );

  return (
    <Box className="app-container">
      <Routes>
        <Route path="/" element={
          <Container className="content-wrapper">
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 900,
                background: 'linear-gradient(45deg, #1DB954, #1ed760)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
                mb: 4,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
              MoodFit
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  color: '#ff1744'
                }}
              >
                {error}
              </Alert>
            )}

            {!token ? (
              <Box
                sx={{
                  textAlign: 'center',
                  mt: 8,
                  animation: 'fadeIn 0.5s ease-out'
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={login}
                  disabled={loading}
                  className="spotify-button"
                >
                  {loading ? <CircularProgress size={24} /> : 'Login with Spotify'}
                </Button>
                <Typography
                  variant="body1"
                  sx={{
                    mt: 2,
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '1.1rem'
                  }}
                >
                  Connect to Spotify to view your music profile
                </Typography>
              </Box>
            ) : (
              <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
                {userData && (
                  <Box className="user-profile">
                    <Avatar
                      src={userData.images?.[0]?.url}
                      alt={userData.display_name}
                      className="user-avatar"
                    />
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        mb: 1
                      }}
                    >
                      {userData.display_name}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 2
                      }}
                    >
                      Spotify Premium Member
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={logout}
                      startIcon={<LogoutIcon />}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                        '&:hover': {
                          borderColor: '#1DB954',
                          backgroundColor: 'rgba(29, 185, 84, 0.1)'
                        }
                      }}
                    >
                      Logout
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/timeline')}
                      startIcon={<HistoryIcon />}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                        ml: 2,
                        '&:hover': {
                          borderColor: '#1DB954',
                          backgroundColor: 'rgba(29, 185, 84, 0.1)'
                        }
                      }}
                    >
                      Vremenska Kapsula
                    </Button>
                  </Box>
                )}

                <Grid container spacing={3} className="grid-container">
                  <Grid item xs={12} md={4}>
                    {renderCard(
                      "Your Recent Top Tracks",
                      <MusicNoteIcon sx={{ color: '#1DB954' }} />,
                      userData?.top_tracks,
                      renderTrackItem
                    )}
                  </Grid>
                  <Grid item xs={12} md={3}>
                    {renderCard(
                      "Your Top Artists",
                      <PersonIcon sx={{ color: '#1DB954' }} />,
                      userData?.top_artists,
                      renderArtistItem
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    {renderCard(
                      "Your Playlists",
                      <PlaylistPlayIcon sx={{ color: '#1DB954' }} />,
                      userData?.playlists,
                      renderPlaylistItem
                    )}
                  </Grid>
                </Grid>
              </Box>
            )}
          </Container>
        } />
        <Route path="/timeline" element={<MusicTimeline />} />
      </Routes>
    </Box>
  );
}

export default App;