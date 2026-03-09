// Muted light map style matching Omio's minimal aesthetic
export const mutedMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f0f0f0' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7b8d' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }, { weight: 3 }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#d4e4ed' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#e0e0e0' }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#c0cdd6' }, { weight: 1 }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8e9baa' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5c6b7a' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }],
  },
];
