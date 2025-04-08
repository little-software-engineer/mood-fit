import React, { useState, useEffect, useContext } from 'react';
import { SpotifyContext } from '../SpotifyContext';
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const MusicTimeline = () => {
    const navigate = useNavigate();
    const { token } = useContext(SpotifyContext);
    const [timelineData, setTimelineData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTimelineData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/music-timeline', {
                    headers: {
                        'Authorization': token
                    }
                });

                if (!response.ok) {
                    throw new Error('Greška pri dohvatanju podataka');
                }

                const data = await response.json();
                setTimelineData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTimelineData();
    }, [token]);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!timelineData) return null;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                        '&:hover': {
                            borderColor: '#1DB954',
                            backgroundColor: 'rgba(29, 185, 84, 0.1)'
                        }
                    }}
                >
                    Nazad
                </Button>
                <Typography variant="h4" sx={{
                    flex: 1,
                    color: 'white',
                    textAlign: 'center'
                }}>
                    Tvoja Muzička Vremenska Kapsula
                </Typography>
            </Box>

            {Object.entries(timelineData).map(([period, data]) => (
                <Paper key={period} sx={{ p: 3, mb: 3, bgcolor: 'rgba(0,0,0,0.3)' }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                        {data.label}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
                            Top žanrovi:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {data.top_genres.map(([genre, count], index) => (
                                <Chip
                                    key={index}
                                    label={genre}
                                    sx={{
                                        bgcolor: '#1DB954',
                                        color: 'white'
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                        Top pesme:
                    </Typography>
                    <Grid container spacing={2}>
                        {data.tracks.map((track, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card sx={{
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                                    }
                                }}>
                                    {track.image && (
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            image={track.image}
                                            alt={track.name}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                    )}
                                    <CardContent>
                                        <Typography variant="body1" sx={{
                                            color: 'white',
                                            fontWeight: 500,
                                            mb: 0.5
                                        }}>
                                            {track.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: 'rgba(255,255,255,0.7)'
                                        }}>
                                            {track.artists.join(', ')}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            ))}
        </Box>
    );
};

export default MusicTimeline; 