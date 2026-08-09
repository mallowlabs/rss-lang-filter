import { eld } from './index';

describe('eld.detect', () => {
  const samples: [string, string][] = [
    [
      'ja',
      '今日は天気がとても良いので散歩に行きました。近所の公園には桜が咲いていて、多くの人が写真を撮っていました。',
    ],
    [
      'en',
      'The quick brown fox jumps over the lazy dog while the sun sets behind the distant mountains.',
    ],
    [
      'ko',
      '오늘 날씨가 정말 좋아서 공원에 산책하러 갔어요. 사람들이 많이 나와 있었습니다.',
    ],
    ['zh', '今天天气非常好，所以我去公园散步了。很多人都在那里享受阳光。'],
    [
      'fr',
      'Le renard brun rapide saute par-dessus le chien paresseux pendant que le soleil se couche.',
    ],
    [
      'de',
      'Der schnelle braune Fuchs springt über den faulen Hund, während die Sonne hinter den Bergen untergeht.',
    ],
    [
      'es',
      'El rápido zorro marrón salta sobre el perro perezoso mientras el sol se pone detrás de las montañas.',
    ],
    [
      'ru',
      'Быстрая рыжая лиса прыгает через ленивую собаку, пока солнце садится за далекими горами.',
    ],
    [
      'ar',
      'الثعلب البني السريع يقفز فوق الكلب الكسول بينما تغرب الشمس خلف الجبال البعيدة.',
    ],
    [
      'th',
      'สุนัขจิ้งจอกสีน้ำตาลที่ว่องไวกระโดดข้ามสุนัขขี้เกียจในขณะที่พระอาทิตย์ตกอยู่หลังภูเขาที่อยู่ไกลออกไป',
    ],
    [
      'pt',
      'A rápida raposa marrom pula sobre o cão preguiçoso enquanto o sol se põe atrás das montanhas distantes.',
    ],
    [
      'it',
      'La veloce volpe marrone salta sopra il cane pigro mentre il sole tramonta dietro le montagne lontane.',
    ],
    [
      'hi',
      'तेज़ भूरी लोमड़ी आलसी कुत्ते के ऊपर कूदती है जबकि सूरज दूर के पहाड़ों के पीछे डूब रहा है।',
    ],
    [
      'vi',
      'Con cáo nâu nhanh nhẹn nhảy qua con chó lười biếng trong khi mặt trời lặn sau những ngọn núi xa xôi.',
    ],
    [
      'tr',
      'Hızlı kahverengi tilki, güneş uzak dağların arkasına batarken tembel köpeğin üzerinden atlar.',
    ],
  ];

  it.each(samples)('detects %s', (expected, text) => {
    expect(eld.detect(text).language).toBe(expected);
  });

  it('returns an empty language for non-string input', () => {
    // @ts-expect-error exercising the runtime guard with an invalid input type
    expect(eld.detect(null).language).toBe('');
  });

  it('returns an empty language for empty text', () => {
    expect(eld.detect('').language).toBe('');
  });
});
