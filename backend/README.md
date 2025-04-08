# MoodFit Backend

Backend za MoodFit aplikaciju koja koristi Spotify API za analizu muzičkog raspoloženja i preporuke vežbi.

## Podešavanje

1. Kreirajte Spotify Developer nalog na [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Kreirajte novu aplikaciju da biste dobili Client ID i Client Secret
3. Dodajte sledeći callback URL u podešavanjima aplikacije:

   - `http://localhost:3000/callback`

4. Kopirajte `.env.example` fajl u `.env` i popunite ga svojim kredencijalima:

   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   FLASK_SECRET_KEY=generate_a_secure_random_key_here
   ```

5. Instalirajte potrebne pakete:
   ```
   pip install -r requirements.txt
   ```

## Pokretanje

Pokrenite aplikaciju komandom:

```
python app.py
```

Server će biti dostupan na `http://localhost:5000`

## API Endpointi

- `GET /login` - Generiše URL za Spotify autentikaciju
- `GET /api/user/profile` - Dohvata profil korisnika (zahteva autentikaciju)
- `GET /api/user/top-tracks` - Dohvata top pesme korisnika (zahteva autentikaciju)
- `GET /api/analyze-mood` - Analizira muzičko raspoloženje korisnika (zahteva autentikaciju)

## Napomene

Uverite se da je frontend aplikacija pokrenuta na `http://localhost:3000` da bi Cross-Origin Requests funkcionisali ispravno.
