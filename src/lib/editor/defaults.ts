import type { PageContent } from './types';

export const defaultPageContent: PageContent = {
  sections: [
    {
      id: 'sec-hero',
      label: 'Hero',
      styles: {
        backgroundImage: 'linear-gradient(160deg, #002d75 0%, #003893 30%, #001f52 70%, #000d2b 100%)',
        paddingTop: '120px',
        paddingBottom: '80px',
        minHeight: '80vh',
      },
      children: [
        {
          id: 'hero-badge', type: 'paragraph',
          content: { text: 'Quiz interactif en direct' },
          styles: { fontSize: '12px', color: '#FFB800', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' },
        },
        {
          id: 'hero-h1', type: 'heading',
          content: { text: 'Participez au Quiz Live', level: 1 },
          styles: { fontSize: '52px', color: '#ffffff', fontWeight: '800', lineHeight: '1.1', marginBottom: '8px' },
          responsive: { tablet: { fontSize: '40px' }, mobile: { fontSize: '32px' } },
        },
        {
          id: 'hero-h2', type: 'heading',
          content: { text: 'et remportez des points!', level: 2 },
          styles: { fontSize: '30px', color: 'rgba(255,255,255,0.9)', fontWeight: '700', marginBottom: '24px' },
          responsive: { tablet: { fontSize: '24px' }, mobile: { fontSize: '20px' } },
        },
        {
          id: 'hero-desc', type: 'paragraph',
          content: { text: 'Testez vos connaissances sur la RDC et mesurez-vous aux meilleurs joueurs congolais !' },
          styles: { fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', maxWidth: '480px', marginBottom: '32px' },
        },
        {
          id: 'hero-cta', type: 'button',
          content: { text: '\u{1F3AE} Jouer au Quiz', href: '/quiz' },
          styles: { backgroundColor: '#FFB800', color: '#002d75', fontSize: '18px', fontWeight: '700', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '36px', paddingRight: '36px', borderRadius: '9999px' },
        },
        {
          id: 'hero-img', type: 'image',
          content: { src: '/person_hero.png', alt: 'Quiz participant' },
          styles: { width: '440px', maxWidth: '90vw', marginTop: '48px', marginLeft: 'auto', marginRight: 'auto' },
          responsive: { mobile: { width: '300px' } },
        },
      ],
    },
    {
      id: 'sec-inscription',
      label: 'Inscription',
      styles: {
        backgroundImage: 'linear-gradient(180deg, #001f52 0%, #001440 100%)',
        paddingTop: '80px',
        paddingBottom: '80px',
      },
      children: [
        {
          id: 'insc-label', type: 'paragraph',
          content: { text: 'Rejoignez la compétition' },
          styles: { fontSize: '12px', color: 'rgba(255,184,0,0.7)', fontWeight: '600', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' },
        },
        {
          id: 'insc-title', type: 'heading',
          content: { text: 'Inscrivez-vous et jouez', level: 2 },
          styles: { fontSize: '30px', color: '#ffffff', fontWeight: '700', textAlign: 'center', marginBottom: '16px' },
          responsive: { mobile: { fontSize: '24px' } },
        },
        {
          id: 'insc-desc', type: 'paragraph',
          content: { text: 'Créez votre compte en quelques secondes et commencez à jouer au quiz en direct. Des points et des récompenses vous attendent !' },
          styles: { fontSize: '16px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '48px', lineHeight: '1.6' },
        },
      ],
    },
    {
      id: 'sec-comment',
      label: 'Comment ça marche',
      styles: {
        backgroundColor: '#001440',
        paddingTop: '64px',
        paddingBottom: '64px',
      },
      children: [
        {
          id: 'how-title', type: 'heading',
          content: { text: 'Comment ça marche', level: 2 },
          styles: { fontSize: '30px', color: '#ffffff', fontWeight: '700', textAlign: 'center', marginBottom: '16px' },
        },
        {
          id: 'how-desc', type: 'paragraph',
          content: { text: 'Trois étapes simples pour participer au quiz et gagner des points.' },
          styles: { fontSize: '16px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '48px' },
        },
        {
          id: 'how-s1', type: 'paragraph',
          content: { text: '① Inscrivez-vous avec votre numéro de téléphone' },
          styles: { fontSize: '18px', color: '#FFB800', fontWeight: '600', textAlign: 'center', marginBottom: '16px' },
        },
        {
          id: 'how-s2', type: 'paragraph',
          content: { text: '② Attendez l’ouverture de la prochaine session' },
          styles: { fontSize: '18px', color: '#FFB800', fontWeight: '600', textAlign: 'center', marginBottom: '16px' },
        },
        {
          id: 'how-s3', type: 'paragraph',
          content: { text: '③ Répondez aux questions et grimpez au classement !' },
          styles: { fontSize: '18px', color: '#FFB800', fontWeight: '600', textAlign: 'center', marginBottom: '16px' },
        },
      ],
    },
    {
      id: 'sec-leaderboard',
      label: 'Classement',
      styles: {
        backgroundColor: '#000d2b',
        paddingTop: '64px',
        paddingBottom: '64px',
      },
      children: [
        {
          id: 'lead-title', type: 'heading',
          content: { text: 'Classement des meilleurs joueurs', level: 2 },
          styles: { fontSize: '30px', color: '#ffffff', fontWeight: '700', textAlign: 'center', marginBottom: '16px' },
        },
        {
          id: 'lead-desc', type: 'paragraph',
          content: { text: 'Les 10 meilleurs joueurs de Muana Mayele. Jouez pour apparaître dans le classement !' },
          styles: { fontSize: '16px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '48px' },
        },
      ],
    },
    {
      id: 'sec-cta',
      label: 'Appel à l’action',
      styles: {
        backgroundImage: 'linear-gradient(160deg, #003893 0%, #001f52 100%)',
        paddingTop: '80px',
        paddingBottom: '80px',
      },
      children: [
        {
          id: 'cta-title', type: 'heading',
          content: { text: 'Prêt à relever le défi ?', level: 2 },
          styles: { fontSize: '36px', color: '#ffffff', fontWeight: '800', textAlign: 'center', marginBottom: '16px' },
          responsive: { mobile: { fontSize: '28px' } },
        },
        {
          id: 'cta-desc', type: 'paragraph',
          content: { text: 'Rejoignez des centaines de joueurs congolais et montrez vos connaissances !' },
          styles: { fontSize: '18px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '32px' },
        },
        {
          id: 'cta-btn', type: 'button',
          content: { text: 'Commencer maintenant', href: '#inscription' },
          styles: { backgroundColor: '#FFB800', color: '#002d75', fontSize: '18px', fontWeight: '700', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '40px', paddingRight: '40px', borderRadius: '9999px', marginLeft: 'auto', marginRight: 'auto' },
        },
      ],
    },
  ],
};
