import type { PageContent } from './types';

export const CURRENT_EDITOR_VERSION = 2;

export const defaultPageContent: PageContent = {
  version: CURRENT_EDITOR_VERSION,
  sections: [
    {
      id: 'sec-hero',
      label: 'Hero',
      styles: {
        backgroundImage: 'linear-gradient(160deg, #002d75 0%, #003893 30%, #001f52 70%, #000d2b 100%)',
        paddingTop: '120px',
        paddingBottom: '80px',
        minHeight: '92vh',
      },
      children: [
        {
          id: 'hero-badge', type: 'paragraph',
          content: { text: 'Quiz interactif en direct' },
          styles: { fontSize: '12px', color: '#FFB800', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' },
        },
        {
          id: 'hero-h1', type: 'heading',
          content: { text: 'Testez vos connaissances. Affrontez la communauté.', level: 1 },
          styles: { fontSize: '54px', color: '#ffffff', fontWeight: '800', lineHeight: '1.08', marginBottom: '16px', letterSpacing: '-0.01em' },
          responsive: { tablet: { fontSize: '40px' }, mobile: { fontSize: '32px' } },
        },
        {
          id: 'hero-desc', type: 'paragraph',
          content: { text: 'Participez au quiz en direct, répondez rapidement et grimpez au classement national. Des récompenses attendent les meilleurs.' },
          styles: { fontSize: '18px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', maxWidth: '440px', marginBottom: '32px' },
        },
        {
          id: 'hero-cta', type: 'button',
          content: { text: 'Jouer au Quiz', href: '/quiz' },
          styles: { backgroundColor: '#FFB800', color: '#002d75', fontSize: '15px', fontWeight: '700', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '9999px' },
        },
        {
          id: 'hero-cta2', type: 'button',
          content: { text: 'Comment ça marche', href: '#comment-ca-marche' },
          styles: { backgroundColor: 'transparent', color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '9999px', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.15)', borderStyle: 'solid', marginLeft: '12px' },
        },
        {
          id: 'hero-img', type: 'image',
          content: { src: '/person_hero.png', alt: 'Participant au quiz Muana Mayele' },
          styles: { width: '420px', maxWidth: '85vw', marginTop: '48px', marginLeft: 'auto', marginRight: 'auto' },
          responsive: { mobile: { width: '300px' } },
        },
      ],
    },
    {
      id: 'sec-stats',
      label: 'Statistiques',
      styles: {
        backgroundColor: '#001a47',
        paddingTop: '32px',
        paddingBottom: '32px',
      },
      children: [
        {
          id: 'stats-info', type: 'paragraph',
          content: { text: 'Questions disponibles · Joueurs inscrits · Sessions organisées · 50 $ Récompenses par session' },
          styles: { fontSize: '14px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', letterSpacing: '0.02em' },
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
          styles: { fontSize: '12px', color: 'rgba(255,184,0,0.7)', fontWeight: '600', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' },
        },
        {
          id: 'insc-title', type: 'heading',
          content: { text: 'Inscrivez-vous et jouez', level: 2 },
          styles: { fontSize: '36px', color: '#ffffff', fontWeight: '700', textAlign: 'center', marginBottom: '12px' },
          responsive: { mobile: { fontSize: '24px' } },
        },
        {
          id: 'insc-desc', type: 'paragraph',
          content: { text: 'Créez votre compte en quelques secondes et commencez à jouer au quiz en direct.' },
          styles: { fontSize: '16px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '48px', lineHeight: '1.6' },
        },
      ],
    },
    {
      id: 'sec-comment',
      label: 'Comment ça marche',
      styles: {
        backgroundImage: 'linear-gradient(180deg, #001440 0%, #001a47 100%)',
        paddingTop: '80px',
        paddingBottom: '80px',
      },
      children: [
        {
          id: 'how-label', type: 'paragraph',
          content: { text: 'Étapes simples' },
          styles: { fontSize: '12px', color: 'rgba(255,184,0,0.7)', fontWeight: '600', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' },
        },
        {
          id: 'how-title', type: 'heading',
          content: { text: 'Comment ça marche', level: 2 },
          styles: { fontSize: '36px', color: '#ffffff', fontWeight: '700', textAlign: 'center', marginBottom: '16px' },
        },
        {
          id: 'how-desc', type: 'paragraph',
          content: { text: 'Quatre étapes simples pour participer au quiz et gagner des points.' },
          styles: { fontSize: '16px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '48px' },
        },
        {
          id: 'how-s1', type: 'paragraph',
          content: { text: '1. Créez votre compte — Inscrivez-vous gratuitement en quelques secondes avec votre numéro de téléphone.' },
          styles: { fontSize: '16px', color: '#FFB800', fontWeight: '600', textAlign: 'center', marginBottom: '20px' },
        },
        {
          id: 'how-s2', type: 'paragraph',
          content: { text: '2. Rejoignez le quiz en direct — Connectez-vous au moment de la session et préparez-vous à jouer.' },
          styles: { fontSize: '16px', color: '#FFB800', fontWeight: '600', textAlign: 'center', marginBottom: '20px' },
        },
        {
          id: 'how-s3', type: 'paragraph',
          content: { text: '3. Répondez rapidement — Chaque bonne réponse rapporte des points. La rapidité compte !' },
          styles: { fontSize: '16px', color: '#FFB800', fontWeight: '600', textAlign: 'center', marginBottom: '20px' },
        },
        {
          id: 'how-s4', type: 'paragraph',
          content: { text: '4. Gagnez des récompenses — Les meilleurs joueurs remportent des prix à chaque session.' },
          styles: { fontSize: '16px', color: '#FFB800', fontWeight: '600', textAlign: 'center', marginBottom: '16px' },
        },
      ],
    },
    {
      id: 'sec-leaderboard',
      label: 'Classement',
      styles: {
        backgroundColor: '#000d2b',
        paddingTop: '80px',
        paddingBottom: '80px',
      },
      children: [
        {
          id: 'lead-label', type: 'paragraph',
          content: { text: 'Classement' },
          styles: { fontSize: '12px', color: 'rgba(255,184,0,0.7)', fontWeight: '600', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' },
        },
        {
          id: 'lead-title', type: 'heading',
          content: { text: 'Classement des meilleurs joueurs', level: 2 },
          styles: { fontSize: '36px', color: '#ffffff', fontWeight: '700', textAlign: 'center', marginBottom: '12px' },
        },
        {
          id: 'lead-desc', type: 'paragraph',
          content: { text: 'Mis à jour en temps réel' },
          styles: { fontSize: '14px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: '48px' },
        },
      ],
    },
    {
      id: 'sec-prizes',
      label: 'Récompenses',
      styles: {
        backgroundImage: 'linear-gradient(180deg, #001440 0%, #001a47 100%)',
        paddingTop: '80px',
        paddingBottom: '80px',
      },
      children: [
        {
          id: 'prizes-label', type: 'paragraph',
          content: { text: 'Récompenses' },
          styles: { fontSize: '12px', color: 'rgba(255,184,0,0.7)', fontWeight: '600', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' },
        },
        {
          id: 'prizes-title', type: 'heading',
          content: { text: 'Des prix à chaque session', level: 2 },
          styles: { fontSize: '36px', color: '#ffffff', fontWeight: '700', textAlign: 'center', marginBottom: '16px' },
        },
        {
          id: 'prizes-desc', type: 'paragraph',
          content: { text: 'Les meilleurs joueurs sont récompensés. Plus vous êtes rapide et précis, plus vous gagnez.' },
          styles: { fontSize: '16px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '48px', lineHeight: '1.6' },
        },
        {
          id: 'prizes-1', type: 'paragraph',
          content: { text: '🥇 1re place — 20 $  ·  🥈 2e place — 15 $  ·  🥉 3e place — 10 $  ·  4e et 5e — 5 $' },
          styles: { fontSize: '18px', color: '#FFB800', fontWeight: '700', textAlign: 'center', marginBottom: '24px' },
        },
        {
          id: 'prizes-note', type: 'paragraph',
          content: { text: 'Les récompenses peuvent varier selon la session. Consultez les règles avant de participer.' },
          styles: { fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' },
        },
      ],
    },
    {
      id: 'sec-benefits',
      label: 'Pourquoi nous rejoindre',
      styles: {
        backgroundImage: 'linear-gradient(180deg, #001a47 0%, #001f52 100%)',
        paddingTop: '80px',
        paddingBottom: '80px',
      },
      children: [
        {
          id: 'benefits-label', type: 'paragraph',
          content: { text: 'Pourquoi nous rejoindre' },
          styles: { fontSize: '12px', color: 'rgba(255,184,0,0.7)', fontWeight: '600', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' },
        },
        {
          id: 'benefits-title', type: 'heading',
          content: { text: "Plus qu'un quiz, une expérience", level: 2 },
          styles: { fontSize: '36px', color: '#ffffff', fontWeight: '700', textAlign: 'center', marginBottom: '16px' },
        },
        {
          id: 'benefits-desc', type: 'paragraph',
          content: { text: 'Rejoignez une communauté de joueurs passionnés et vivez le quiz autrement.' },
          styles: { fontSize: '16px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '48px', lineHeight: '1.6' },
        },
        {
          id: 'ben-1', type: 'paragraph',
          content: { text: 'Testez votre culture générale — Des centaines de questions sur la RDC, la culture et bien plus.' },
          styles: { fontSize: '15px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '16px' },
        },
        {
          id: 'ben-2', type: 'paragraph',
          content: { text: 'Représentez votre ville — Jouez pour votre quartier, votre ville ou votre province.' },
          styles: { fontSize: '15px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '16px' },
        },
        {
          id: 'ben-3', type: 'paragraph',
          content: { text: 'Affrontez toute la RDC — Mesurez-vous à des joueurs de toutes les provinces du pays.' },
          styles: { fontSize: '15px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '16px' },
        },
        {
          id: 'ben-4', type: 'paragraph',
          content: { text: 'Gagnez des récompenses — Des prix distribués aux meilleurs joueurs à chaque session.' },
          styles: { fontSize: '15px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '16px' },
        },
        {
          id: 'ben-5', type: 'paragraph',
          content: { text: 'Apprenez en jouant — Découvrez des faits sur la RDC tout en vous amusant.' },
          styles: { fontSize: '15px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '16px' },
        },
        {
          id: 'ben-6', type: 'paragraph',
          content: { text: 'Grimpez au classement — Suivez votre progression et visez la première place.' },
          styles: { fontSize: '15px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '16px' },
        },
      ],
    },
    {
      id: 'sec-community',
      label: 'Communauté',
      styles: {
        backgroundColor: '#000d2b',
        paddingTop: '80px',
        paddingBottom: '80px',
      },
      children: [
        {
          id: 'comm-label', type: 'paragraph',
          content: { text: 'Communauté' },
          styles: { fontSize: '12px', color: 'rgba(255,184,0,0.7)', fontWeight: '600', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' },
        },
        {
          id: 'comm-title', type: 'heading',
          content: { text: 'Rejoignez la communauté Muana Mayele', level: 2 },
          styles: { fontSize: '30px', color: '#ffffff', fontWeight: '700', textAlign: 'center', marginBottom: '12px' },
        },
        {
          id: 'comm-desc', type: 'paragraph',
          content: { text: 'Suivez les résultats, les annonces et les meilleurs moments du quiz sur nos réseaux.' },
          styles: { fontSize: '16px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '32px', lineHeight: '1.6' },
        },
      ],
    },
    {
      id: 'sec-cta',
      label: 'Appel à l\'action',
      styles: {
        backgroundImage: 'linear-gradient(160deg, #003893 0%, #001f52 100%)',
        paddingTop: '80px',
        paddingBottom: '80px',
      },
      children: [
        {
          id: 'cta-title', type: 'heading',
          content: { text: 'Prêt à prouver ce que vous savez ?', level: 2 },
          styles: { fontSize: '42px', color: '#ffffff', fontWeight: '800', textAlign: 'center', marginBottom: '16px', lineHeight: '1.1' },
          responsive: { mobile: { fontSize: '28px' } },
        },
        {
          id: 'cta-desc', type: 'paragraph',
          content: { text: 'Créez votre compte et participez au prochain quiz en direct. Des récompenses attendent les meilleurs joueurs.' },
          styles: { fontSize: '18px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '32px', lineHeight: '1.6' },
        },
        {
          id: 'cta-btn', type: 'button',
          content: { text: 'Jouer maintenant', href: '#inscription' },
          styles: { backgroundColor: '#FFB800', color: '#002d75', fontSize: '15px', fontWeight: '700', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '9999px', marginLeft: 'auto', marginRight: 'auto' },
        },
        {
          id: 'cta-btn2', type: 'button',
          content: { text: 'Créer un compte', href: '#inscription' },
          styles: { backgroundColor: 'transparent', color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '600', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '28px', paddingRight: '28px', borderRadius: '9999px', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.2)', borderStyle: 'solid', marginLeft: 'auto', marginRight: 'auto', marginTop: '12px' },
        },
      ],
    },
  ],
};
