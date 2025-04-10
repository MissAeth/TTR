// Configuration de l'API YouTube
const YOUTUBE_API_KEY = 'VOTRE_API_KEY'; // Vous devrez obtenir une clé API depuis Google Cloud Console
const PLAYLISTS = [
    {id: 'ID_PLAYLIST_1', title: 'Les Chroniques de Kandorya'},
    {id: 'ID_PLAYLIST_2', title: "L'Appel de Cthulhu"},
    // ... autres playlists
];

// Fonction pour obtenir les dernières mises à jour des playlists
async function getLatestPlaylistVideos() {
    try {
        const playlistData = await Promise.all(PLAYLISTS.map(async playlist => {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlist.id}&maxResults=1&key=${YOUTUBE_API_KEY}&order=date`
            );
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                return {
                    id: playlist.id,
                    title: playlist.title,
                    lastUpdateDate: new Date(data.items[0].snippet.publishedAt),
                    videoId: data.items[0].snippet.resourceId.videoId
                };
            }
            return null;
        }));

        return playlistData.filter(item => item !== null);
    } catch (error) {
        console.error('Erreur lors de la récupération des données YouTube:', error);
        return [];
    }
}

// Fonction pour mettre à jour l'interface utilisateur
function updateVideoCards(playlistData) {
    const videoCards = document.querySelectorAll('.video-card');
    
    playlistData.forEach((playlist, index) => {
        if (index < videoCards.length) {
            const card = videoCards[index];
            const thumbnail = card.querySelector('.video-thumbnail');
            
            // Mise à jour de l'iframe avec la dernière vidéo
            const iframe = thumbnail.querySelector('iframe');
            iframe.src = `https://www.youtube.com/embed/${playlist.videoId}?controls=0&showinfo=0&rel=0`;
            
            // Mise à jour du titre et du lien
            card.querySelector('h3').textContent = playlist.title;
            card.querySelector('.cta-button').href = `https://www.youtube.com/playlist?list=${playlist.id}`;
            
            // Ajouter le badge NEW si c'est la vidéo la plus récente
            if (index === 0) {
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                
                if (playlist.lastUpdateDate > threeMonthsAgo) {
                    const newBadge = document.createElement('div');
                    newBadge.className = 'new-badge';
                    newBadge.textContent = 'NEW';
                    thumbnail.appendChild(newBadge);
                }
            }
        }
    });
}

// Fonction d'initialisation
async function initializeVideoGallery() {
    const playlistData = await getLatestPlaylistVideos();
    updateVideoCards(playlistData);
    
    // Mettre à jour toutes les 6 heures
    setInterval(async () => {
        const updatedData = await getLatestPlaylistVideos();
        updateVideoCards(updatedData);
    }, 6 * 60 * 60 * 1000);
}

// Lancer l'initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initializeVideoGallery); 