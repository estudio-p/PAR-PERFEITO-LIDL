import { CardPairDef, GameCard } from '../types';

export const LIDL_NATAL_PAIRS: CardPairDef[] = [
  {
    id: 1,
    pairName: 'Deluxe Trufas & Consoada Gourmet',
    range: 'deluxe',
    rangeName: 'Gama Deluxe',
    featureTitle: 'Deluxe: Trufas & Iguarias Finas',
    benefitTitle: 'Consoada Gourmet de Sonho',
    featureIcon: '🍽️',
    benefitIcon: '✨',
    storyExplanation: 'A sofisticação da gama Deluxe transforma a mesa de Consoada num banquete de alta gastronomia inesquecível.',
  },
  {
    id: 2,
    pairName: 'Deluxe Salmão Fumado & Entradas Nobres',
    range: 'deluxe',
    rangeName: 'Gama Deluxe',
    featureTitle: 'Deluxe: Salmão Fumado & Queijos',
    benefitTitle: 'Tábua de Entradas Requintada',
    featureIcon: '🧀',
    benefitIcon: '🍷',
    storyExplanation: 'Os queijos selecionados e o salmão fumado da gama Deluxe compõem a receção perfeita para brindar em família.',
  },
  {
    id: 3,
    pairName: 'Favorina Stollen & Confeitaria Festiva',
    range: 'favorina',
    rangeName: 'Gama Favorina',
    featureTitle: 'Favorina: Stollen com Maçapão & Panettone',
    benefitTitle: 'O Autêntico Sabor do Natal',
    featureIcon: '🥮',
    benefitIcon: '🕯️',
    storyExplanation: 'A doçura tradicional da gama Favorina espalha o aroma das especiarias e a nostalgia das festas natalícias.',
  },
  {
    id: 4,
    pairName: 'Favorina Chocolates & Magia Doce',
    range: 'favorina',
    rangeName: 'Gama Favorina',
    featureTitle: 'Favorina: Pais Natal & Spekulatius',
    benefitTitle: 'Doces Momentos à Lareira',
    featureIcon: '🍫',
    benefitIcon: '🎁',
    storyExplanation: 'Os chocolates de leite e as bolachas crocantes de canela Favorina encantam os miúdos e adoçam as tardes de Natal.',
  },
  {
    id: 5,
    pairName: 'Brinquedos de Madeira Lidl & Criatividade',
    range: 'madeira',
    rangeName: 'Brinquedos de Madeira',
    featureTitle: 'Comboio e Pistas de Madeira FSC®',
    benefitTitle: 'Imaginação Pura e Sustentável',
    featureIcon: '🚂',
    benefitIcon: '🌟',
    storyExplanation: 'Os célebres brinquedos de madeira Lidl, feitos com materiais certificados, criam memórias felizes entre gerações.',
  },
  {
    id: 6,
    pairName: 'Quebra-Nozes de Natal & O Guardião da Magia',
    range: 'quebranozes',
    rangeName: 'O Quebra-Nozes',
    featureTitle: 'O Soldado Quebra-Nozes Lidl',
    benefitTitle: 'O Guardião da Magia do Natal',
    featureIcon: '💂',
    benefitIcon: '🎄',
    storyExplanation: 'A personagem principal deste Natal no Lidl ganha vida para guardar os presentes e espalhar alegria por toda a casa.',
  },
];

// Alias for backwards compatibility
export const COFFEE_PAIRS = LIDL_NATAL_PAIRS;

/**
 * Generates and shuffles the 12 game cards (6 pairs).
 */
export function generateShuffledCards(): GameCard[] {
  const cards: GameCard[] = [];

  LIDL_NATAL_PAIRS.forEach((pair) => {
    // Feature Card (Gama / Produto)
    cards.push({
      id: `pair_${pair.id}_feature`,
      pairId: pair.id,
      pairName: pair.pairName,
      range: pair.range,
      role: 'feature',
      title: pair.featureTitle,
      icon: pair.featureIcon,
      categoryLabel: pair.rangeName,
      isFlipped: false,
      isMatched: false,
    });

    // Benefit Card (Benefício / Magia)
    cards.push({
      id: `pair_${pair.id}_benefit`,
      pairId: pair.id,
      pairName: pair.pairName,
      range: pair.range,
      role: 'benefit',
      title: pair.benefitTitle,
      icon: pair.benefitIcon,
      categoryLabel: pair.range === 'quebranozes' ? 'Magia de Natal' : 'Experiência',
      isFlipped: false,
      isMatched: false,
    });
  });

  // Fisher-Yates Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}
