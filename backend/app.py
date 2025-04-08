from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import pymysql
from dotenv import load_dotenv
import os
import logging
from functools import wraps
import time

# Inicijalizacija varijabli okruženja
load_dotenv()

# Konfigurisanje logovanja
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "tajni_kljuc_za_razvoj")

# Poboljšana CORS konfiguracija
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept", "Refresh-Token"],
        "supports_credentials": True,
        "expose_headers": ["Authorization"]
    }
})

@app.route("/")
def home():
    return jsonify({"message": "MoodFit API je aktivan"})

# Ruta za proveru dostupnosti servera
@app.route("/ping")
def ping():
    return jsonify({"status": "ok", "message": "Server je dostupan"})

# Spotify konfiguracija
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:3000/callback"

logger.info(f"Initializing Spotify OAuth with client ID: {SPOTIFY_CLIENT_ID[:5]}... and redirect URI: {REDIRECT_URI}")

sp_oauth = SpotifyOAuth(
    client_id=SPOTIFY_CLIENT_ID,
    client_secret=SPOTIFY_CLIENT_SECRET,
    redirect_uri=REDIRECT_URI,
    scope="user-top-read user-read-private user-read-email playlist-read-private playlist-read-collaborative user-read-playback-state"
)

# Database Configuration
def get_db_connection():
    try:
        return pymysql.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "spotify_moodfit"),
            cursorclass=pymysql.cursors.DictCursor
        )
    except pymysql.Error as e:
        logger.error(f"Database connection failed: {e}")
        raise

# Dekorator za autentikaciju
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Nedostaje autorizacioni token'}), 401
            
        try:
            token = auth_header
            
            if not token:
                return jsonify({'error': 'Nedostaje autorizacioni token'}), 401
            
            try:
                sp = spotipy.Spotify(auth=token)
                sp.current_user()
            except Exception as e:
                return jsonify({'error': 'Nevažeći token'}), 401
                
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token'}), 401
            
    return decorated

@app.route("/login")
def login():
    try:
        logger.info("Login attempt started")
        if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
            logger.error("Spotify credentials are missing")
            return jsonify({"error": "Spotify kredencijali nisu postavljeni"}), 500
            
        logger.info(f"Using client ID: {SPOTIFY_CLIENT_ID[:5]}... and redirect URI: {REDIRECT_URI}")
        auth_url = sp_oauth.get_authorize_url()
        logger.info(f"Generated auth URL: {auth_url}")
        return jsonify({"auth_url": auth_url})
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({"error": f"Prijava nije uspela: {str(e)}"}), 500

@app.route("/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing authorization code"}), 400
    
    try:
        token_info = sp_oauth.get_access_token(code)
        if not token_info:
            return jsonify({"error": "Failed to get access token"}), 500

        sp = spotipy.Spotify(auth=token_info['access_token'])
        user_data = sp.current_user()

        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO users (spotify_id, display_name, email, access_token, refresh_token, expires_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                access_token = VALUES(access_token),
                refresh_token = VALUES(refresh_token),
                expires_at = VALUES(expires_at)
            """, (
                user_data['id'],
                user_data.get('display_name'),
                user_data.get('email'),
                token_info['access_token'],
                token_info.get('refresh_token', ''),
                int(time.time()) + token_info['expires_in']
            ))
            conn.commit()
        conn.close()

        return jsonify({
            "access_token": token_info['access_token'],
            "expires_in": token_info['expires_in'],
            "refresh_token": token_info.get('refresh_token', '')
        })
    except Exception as e:
        logger.error(f"Token exchange error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/user/profile")
@token_required
def get_user_profile():
    try:
        token = request.headers.get("Authorization")
        sp = spotipy.Spotify(auth=token)
        user_data = sp.current_user()
        return jsonify(user_data)
    except Exception as e:
        logger.error(f"Profile error: {e}")
        return jsonify({"error": "Nije uspelo dohvatanje korisničkog profila"}), 500

@app.route("/api/user/top-tracks")
@token_required
def get_top_tracks():
    try:
        token = request.headers.get("Authorization")
        sp = spotipy.Spotify(auth=token)
        top_tracks = sp.current_user_top_tracks(limit=10, time_range="short_term")
        return jsonify(top_tracks)
    except Exception as e:
        logger.error(f"Top tracks error: {e}")
        return jsonify({"error": "Nije uspelo dohvatanje top pesama"}), 500

@app.route("/api/user/top-artists")
@token_required
def get_top_artists():
    try:
        token = request.headers.get("Authorization")
        sp = spotipy.Spotify(auth=token)
        top_artists = sp.current_user_top_artists(limit=10, time_range="short_term")
        return jsonify(top_artists)
    except Exception as e:
        logger.error(f"Top artists error: {e}")
        return jsonify({"error": "Nije uspelo dohvatanje top izvođača"}), 500

@app.route("/api/user/playlists")
@token_required
def get_user_playlists():
    try:
        token = request.headers.get("Authorization")
        sp = spotipy.Spotify(auth=token)
        playlists = sp.current_user_playlists(limit=10)
        return jsonify(playlists)
    except Exception as e:
        logger.error(f"Playlists error: {e}")
        return jsonify({"error": "Nije uspelo dohvatanje plejlisti"}), 500

@app.route('/api/music-timeline', methods=['GET'])
@token_required
def get_music_timeline():
    try:
        token = request.headers.get("Authorization")
        if not token:
            logger.error("No token provided")
            return jsonify({"error": "Token nije prosleđen"}), 401

        sp = spotipy.Spotify(auth=token)
        
        try:
            sp.current_user()
        except Exception as e:
            logger.error(f"Invalid Spotify token: {e}")
            return jsonify({"error": "Nevažeći token"}), 401

        time_ranges = {
            'short_term': 'Poslednji mesec',
            'medium_term': 'Poslednjih 6 meseci',
            'long_term': 'Sve vreme'
        }
        
        timeline_data = {}
        
        for time_range, label in time_ranges.items():
            try:
                # Dohvatamo samo 10 pesama umesto 20
                tracks = sp.current_user_top_tracks(limit=10, time_range=time_range)
                if not tracks or 'items' not in tracks:
                    logger.error(f"No tracks returned for {time_range}")
                    continue

                track_ids = [track['id'] for track in tracks['items']]
                
                # Dohvatamo audio karakteristike za svaku pesmu pojedinačno
                audio_features = []
                for track_id in track_ids:
                    try:
                        feature = sp.audio_features(track_id)
                        if feature and feature[0]:
                            audio_features.append(feature[0])
                    except Exception as e:
                        logger.error(f"Error fetching features for track {track_id}: {e}")
                        continue
                
                # Računamo prosečne vrednosti
                avg_features = {
                    'valence': 0,
                    'energy': 0,
                    'danceability': 0
                }
                
                feature_count = len(audio_features)
                if feature_count > 0:
                    for feature in audio_features:
                        avg_features['valence'] += feature['valence']
                        avg_features['energy'] += feature['energy']
                        avg_features['danceability'] += feature['danceability']
                    
                    # Računamo proseke
                    for key in avg_features:
                        avg_features[key] = avg_features[key] / feature_count
                
                # Dodajemo i top žanrove
                genres = {}
                for track in tracks['items'][:5]:  # Uzimamo samo prvih 5 pesama za žanrove
                    for artist in track['artists']:
                        try:
                            artist_info = sp.artist(artist['id'])
                            for genre in artist_info['genres']:
                                genres[genre] = genres.get(genre, 0) + 1
                        except Exception as e:
                            logger.error(f"Error fetching artist info: {e}")
                            continue
                
                # Uzimamo top 5 žanrova
                top_genres = sorted(genres.items(), key=lambda x: x[1], reverse=True)[:5]
                
                timeline_data[time_range] = {
                    'label': label,
                    'features': avg_features,
                    'top_genres': top_genres,
                    'tracks': [{
                        'name': track['name'],
                        'artists': [artist['name'] for artist in track['artists']],
                        'image': track['album']['images'][0]['url'] if track['album']['images'] else None
                    } for track in tracks['items'][:5]]
                }
            
            except Exception as e:
                logger.error(f"Error processing {time_range}: {e}")
                continue
        
        if not timeline_data:
            return jsonify({"error": "Nije moguće dohvatiti podatke ni za jedan vremenski period"}), 500
            
        return jsonify(timeline_data)
        
    except Exception as e:
        logger.error(f"Timeline error: {str(e)}")
        return jsonify({"error": f"Greška pri dohvatanju vremenske linije: {str(e)}"}), 500

# Inicijalizacija baze podataka
def initialize_db():
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 FROM users LIMIT 1")
            logger.info("Database connection successful and users table exists")
        conn.close()
        return True
    except pymysql.Error as e:
        logger.error(f"Database initialization error: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting MoodFit API")
    logger.info(f"Spotify Client ID configured: {'Yes' if SPOTIFY_CLIENT_ID else 'No'}")
    logger.info(f"Spotify Client Secret configured: {'Yes' if SPOTIFY_CLIENT_SECRET else 'No'}")
    logger.info(f"Redirect URI: {REDIRECT_URI}")
    
    db_status = initialize_db()
    logger.info(f"Database connection: {'OK' if db_status else 'Failed'}")
    
    app.run(debug=True, host="0.0.0.0", port=5000)