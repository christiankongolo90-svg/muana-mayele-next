'use client';

const steps = [
  { number: 1, title: 'Inscrivez-vous', description: 'Créez votre compte en quelques secondes avec votre numéro de téléphone.' },
  { number: 2, title: 'Attendez le Quiz', description: 'Le quiz est disponible à des horaires précis. Consultez le programme.' },
  { number: 3, title: 'Répondez aux questions', description: '20 questions en 20 minutes. Chaque bonne réponse vaut 50 points.' },
  { number: 4, title: 'Gagnez des points', description: 'Accumulez des points et grimpez dans le classement pour remporter des prix.' },
];

export default function HowItWorks() {
  return (
    <section id="regles" className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-dark text-center mb-12">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map(step => (
            <div key={step.number} className="text-center group">
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4 group-hover:bg-gold group-hover:text-primary-dark transition-colors shadow-lg">
                {step.number}
              </div>
              <h3 className="font-semibold text-dark text-base mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
