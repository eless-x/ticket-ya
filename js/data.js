'use strict';

const IMG = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

const MOODS = {
  euforia: 'Euforia y fiesta',
  cultura: 'Cultura y relax',
  adrenalina: 'Adrenalina',
  aprender: 'Aprender algo nuevo'
};

const TAGS = {
  concierto: 'Concierto',
  teatro: 'Teatro',
  festival: 'Festival',
  gastronomia: 'Gastronomía',
  deporte: 'Deporte/Esports',
  taller: 'Taller'
};

const EVENTS = [
  { id: 1,  title: 'Festival Lima Vive Rock 2026', venue: 'Estadio Nacional, Lima',            district: 'Lima',        date: '2026-12-12', time: '7:00 PM',  price: 120, sold: 84, match: 98, mood: 'euforia',    tags: ['concierto', 'festival'], img: '1459749411175-04bf5292ceea' },
  { id: 2,  title: 'Noche de Indie y Electro',     venue: 'Costa 21, San Miguel',               district: 'San Miguel',  date: '2026-11-22', time: '8:00 PM',  price: 75,  sold: 88, match: 96, mood: 'euforia',    tags: ['concierto'],             img: '1501281668745-f7f57925c3b4' },
  { id: 3,  title: 'El Fantasma de la Comedia',    venue: 'Teatro Marsano, Miraflores',         district: 'Miraflores',  date: '2026-11-28', time: '7:30 PM',  price: 45,  sold: 62, match: 92, mood: 'cultura',    tags: ['teatro'],                img: '1507676184212-d03ab07a01bf' },
  { id: 4,  title: 'Final Nacional Esports Lima',  venue: 'Coliseo Dibós, San Borja',           district: 'San Borja',   date: '2026-12-14', time: '3:00 PM',  price: 55,  sold: 79, match: 95, mood: 'adrenalina', tags: ['deporte'],               img: '1542751371-adc38448a05e' },
  { id: 5,  title: 'Festival Sabores y Arte',      venue: 'Parque de la Exposición, Lima',      district: 'Lima',        date: '2026-12-05', time: '11:00 AM', price: 35,  sold: 91, match: 94, mood: 'aprender',   tags: ['festival', 'gastronomia'], img: '1555939594-58d7cb561ad1' },
  { id: 6,  title: 'Noche de Cumbia Sinfónica',    venue: 'Gran Teatro Nacional, San Borja',    district: 'San Borja',   date: '2026-11-20', time: '8:00 PM',  price: 90,  sold: 70, match: 90, mood: 'cultura',    tags: ['concierto', 'teatro'],   img: '1470229722913-7c0e2dbbafd3' },
  { id: 7,  title: 'Electro Beach Party',          venue: 'Playa Agua Dulce, Chorrillos',       district: 'Chorrillos',  date: '2026-11-29', time: '4:00 PM',  price: 85,  sold: 76, match: 93, mood: 'euforia',    tags: ['concierto', 'festival'], img: '1574391884720-bbc3740c59d1' },
  { id: 8,  title: 'Stand Up Lima Night',          venue: 'Teatro Peruano Japonés, Jesús María', district: 'Jesús María', date: '2026-12-03', time: '9:00 PM',  price: 40,  sold: 55, match: 88, mood: 'cultura',    tags: ['teatro'],                img: '1503095396549-807759245b35' },
  { id: 9,  title: 'Carrera Trail Night Lima',     venue: 'Costa Verde, Barranco',              district: 'Barranco',    date: '2026-12-06', time: '6:00 PM',  price: 50,  sold: 48, match: 89, mood: 'adrenalina', tags: ['deporte'],               img: '1476480862126-209bfaa8edc8' },
  { id: 10, title: 'Taller de Fotografía Urbana',  venue: 'Centro Cultural PUCP, San Miguel',   district: 'San Miguel',  date: '2026-11-21', time: '10:00 AM', price: 30,  sold: 66, match: 87, mood: 'aprender',   tags: ['taller'],                img: '1452587925148-ce544e77e70d' },
  { id: 11, title: 'Noche de Jazz en el Parque',   venue: 'Parque Kennedy, Miraflores',         district: 'Miraflores',  date: '2026-11-26', time: '7:00 PM',  price: 60,  sold: 58, match: 91, mood: 'cultura',    tags: ['concierto'],             img: '1511192336575-5a79af67a629' },
  { id: 12, title: 'Feria del Libro y Café',       venue: 'Campo de Marte, Jesús María',        district: 'Jesús María', date: '2026-11-27', time: '10:00 AM', price: 20,  sold: 52, match: 85, mood: 'aprender',   tags: ['festival', 'taller'],    img: '1481627834876-b7833e8f5570' },
  { id: 13, title: 'Reggaetón Fest Lima',          venue: 'Explanada Costa 21, San Miguel',     district: 'San Miguel',  date: '2026-12-19', time: '6:00 PM',  price: 110, sold: 93, match: 94, mood: 'euforia',    tags: ['concierto', 'festival'], img: '1429962714451-bb934ecdc4ec' },
  { id: 14, title: 'Ballet: El Cascanueces',       venue: 'Teatro Municipal de Lima',           district: 'Lima',        date: '2026-12-18', time: '7:00 PM',  price: 95,  sold: 61, match: 90, mood: 'cultura',    tags: ['teatro'],                img: '1518834107812-67b0b7c58434' },
  { id: 15, title: 'Rally Offroad Experience',     venue: 'Autódromo La Chutana, Cieneguilla',  district: 'Cieneguilla', date: '2026-12-20', time: '10:00 AM', price: 70,  sold: 67, match: 91, mood: 'adrenalina', tags: ['deporte'],               img: '1558981806-ec527fa8eccd' },
  { id: 16, title: 'Cata de Cacao y Café Peruano', venue: 'Casa Cultural, Barranco',            district: 'Barranco',    date: '2026-12-04', time: '4:00 PM',  price: 38,  sold: 73, match: 88, mood: 'aprender',   tags: ['gastronomia', 'taller'], img: '1447933601403-0c6688de566e' }
].sort((a, b) => a.date.localeCompare(b.date));

const HERO_IDS = [1, 2, 3, 4, 5];

const ZONES = {
  vip:     { name: 'VIP frontal',   mult: 1.6, energy: 'Energía 100%', dist: '8 metros',  scale: 1.18, mid: '#4C0519', top: '#E11D48', desc: 'Ubicación preferencial a pocos metros de los artistas. Máxima inmersión acústica y visual.' },
  general: { name: 'Campo general', mult: 1,   energy: 'Energía 85%',  dist: '25 metros', scale: 0.88, mid: '#1E1B4B', top: '#4F46E5', desc: 'Equilibrio entre sonido envolvente y espacio para saltar y disfrutar con tu grupo.' },
  tribuna: { name: 'Tribuna alta',  mult: 0.7, energy: 'Energía 70%',  dist: '45 metros', scale: 0.62, mid: '#2E1065', top: '#7C3AED', desc: 'Vista panorámica del escenario y del juego de luces, con asiento numerado.' }
};

const RESALE_DEFAULT = [
  { id: 'r1', eventId: 1,  user: '@camila_lima',  zone: 'Campo general', price: 120 },
  { id: 'r2', eventId: 2,  user: '@diego_rock99', zone: 'VIP',           price: 120 },
  { id: 'r3', eventId: 13, user: '@mariana.q',    zone: 'Campo general', price: 110 },
  { id: 'r4', eventId: 6,  user: '@sofia_notes',  zone: 'Tribuna alta',  price: 63  }
];

const MEET_GREET = [
  { id: 'mg1', artist: 'Aurora Vega',       role: 'Vocalista indie',         eventId: 2,  category: 'Música',    slots: 12, price: 85,  img: '1494790108377-be9c29b29330', perks: ['Foto grupal', 'Pase anticipado', 'Póster firmado'] },
  { id: 'mg2', artist: 'Los Hermanos Ríos', role: 'Cumbia sinfónica',        eventId: 6,  category: 'Música',    slots: 8,  price: 110, img: '1511671782779-c97d3d27a1d4', perks: ['Soundcheck', 'Meet breve', 'Merch exclusivo'] },
  { id: 'mg3', artist: 'Valeria Montes',    role: 'Actriz protagonista',     eventId: 3,  category: 'Teatro',    slots: 10, price: 60,  img: '1487412720507-e7ab37603c6f', perks: ['Foto en escenario', 'Firma de programa', 'Asiento preferencial'] },
  { id: 'mg4', artist: 'Team Nexus',        role: 'Campeones esports',       eventId: 4,  category: 'Deporte',   slots: 15, price: 70,  img: '1534423861386-85a16f5d13fd', perks: ['Foto con equipo', 'Acceso backstage', 'Sticker pack'] },
  { id: 'mg5', artist: 'DJ Kantu',          role: 'Headliner electro',       eventId: 7,  category: 'Música',    slots: 6,  price: 95,  img: '1507003211169-0a1dd7228f2d', perks: ['Acceso a cabina', 'Foto con artista', 'Pulsera VIP'] },
  { id: 'mg6', artist: 'Lucía Barranco',    role: 'Creadora gastronómica',    eventId: 16, category: 'Influencer',slots: 9,  price: 55,  img: '1524504388940-b1c1722653e1', perks: ['Degustación guiada', 'Receta exclusiva', 'Foto con Lucía'] }
];

const FAQS = [
  { q: '¿Cómo funciona la vista previa del asiento?', a: 'En cada evento, pulsa "Elegir asiento". Puedes alternar entre VIP, Campo y Tribuna para ver distancia al escenario, energía y precio antes de confirmar la compra.' },
  { q: '¿Puedo revender mi entrada si no puedo asistir?', a: 'Sí. En la sección Fan-to-Fan puedes publicar tu entrada al precio original de boletería. Al venderse, TicketYa anula el QR anterior y emite uno nuevo a nombre del comprador.' },
  { q: '¿Cómo funciona Armar parche?', a: 'Eliges un evento y el número de personas (2 a 10). El sistema calcula el costo por persona con 10% de descuento y genera un enlace para que cada integrante pague su parte.' },
  { q: '¿Los Meet & Greet tienen cupos limitados?', a: 'Sí. Cada experiencia muestra cupos disponibles en tiempo real. Al solicitar tu pase, recibes confirmación por correo y el cupo queda reservado a tu nombre.' },
  { q: '¿Qué hago si no recibí mi QR?', a: 'Revisa tu carpeta de spam y confirma el correo usado en la compra. Si aún no aparece, escríbenos desde la pestaña de Soporte con tu nombre y evento; respondemos en menos de 24 horas hábiles.' }
];