# MoodFit - Spotify Music Analysis Tool

[English](#english) | [Српски](#српски)

## English

### Overview

MoodFit is a web application that provides personalized music insights by analyzing your Spotify listening habits. It offers features like timeline analysis of your music taste, top tracks, artists, and playlists visualization.

### Features

- Spotify account integration
- Music timeline analysis
- Top tracks visualization
- Artist statistics
- Playlist management
- Responsive design

### Technical Stack

- Frontend: React.js, Material-UI
- Backend: Flask (Python)
- Database: MySQL
- Authentication: Spotify OAuth 2.0

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/moodfit.git
cd moodfit
```

2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
```

3. Set up the frontend

```bash
cd ../frontend
npm install
```

4. Configure Spotify API

- Create a Spotify Developer account
- Create a new application
- Add `http://localhost:3000/callback` as a redirect URI
- Copy credentials to `.env` file

5. Start the application

```bash
# Start backend (from backend directory)
python app.py

# Start frontend (from frontend directory)
npm start
```

### Environment Variables

Create `.env` file based on `.env.example` and fill in your credentials:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- Database credentials
- Flask secret key

## Српски

### Преглед

MoodFit је веб апликација која пружа персонализоване музичке увиде анализирајући ваше Spotify навике слушања. Нуди функције попут временске анализе вашег музичког укуса, приказа топ песама, извођача и плејлиста.

### Функционалности

- Интеграција са Spotify налогом
- Анализа музичке временске линије
- Визуелизација топ песама
- Статистика извођача
- Управљање плејлистама
- Респонзиван дизајн

### Технички стек

- Frontend: React.js, Material-UI
- Backend: Flask (Python)
- База података: MySQL
- Аутентификација: Spotify OAuth 2.0

### Инсталација

1. Клонирајте репозиторијум

```bash
git clone https://github.com/yourusername/moodfit.git
cd moodfit
```

2. Подесите backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Измените .env са вашим креденцијалима
```

3. Подесите frontend

```bash
cd ../frontend
npm install
```

4. Конфигуришите Spotify API

- Креирајте Spotify Developer налог
- Креирајте нову апликацију
- Додајте `http://localhost:3000/callback` као redirect URI
- Копирајте креденцијале у `.env` фајл

5. Покрените апликацију

```bash
# Покрените backend (из backend директоријума)
python app.py

# Покрените frontend (из frontend директоријума)
npm start
```

### Променљиве окружења

Креирајте `.env` фајл на основу `.env.example` и попуните ваше креденцијале:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- Креденцијали за базу података
- Flask тајни кључ
