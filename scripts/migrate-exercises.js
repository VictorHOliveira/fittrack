const fs = require('fs');
const path = require('path');
const https = require('https');

const TRANSLATED_URL =
  'https://raw.githubusercontent.com/joao-gugel/exercicios-bd-ptbr/main/exercises/exercises-ptbr-full-translation.json';
const ORIGINAL_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

const MUSCLE_MAP = {
  peito: { icone: 'body', cor: '#e91e63' },
  costas: { icone: 'resize', cor: '#2196f3' },
  dorsais: { icone: 'resize', cor: '#2196f3' },
  'meio-das-costas': { icone: 'resize', cor: '#2196f3' },
  'inferior-das-costas': { icone: 'fitness', cor: '#795548' },
  quadriceps: { icone: 'walk', cor: '#4caf50' },
  isquiotibiais: { icone: 'footsteps', cor: '#8bc34a' },
  panturrilhas: { icone: 'barbell', cor: '#689f38' },
  ombros: { icone: 'man', cor: '#ff9800' },
  biceps: { icone: 'flash', cor: '#f44336' },
  triceps: { icone: 'hand-left', cor: '#e91e63' },
  abdominais: { icone: 'fitness', cor: '#9c27b0' },
  gluteos: { icone: 'body', cor: '#e040fb' },
  adutores: { icone: 'walk', cor: '#4caf50' },
  abdutores: { icone: 'walk', cor: '#4caf50' },
  antebracos: { icone: 'hand-right', cor: '#607d8b' },
  trapezio: { icone: 'resize', cor: '#2196f3' },
};

const EQUIPMENT_MAP = {
  'peso-do-corpo': 'Peso do Corpo',
  barra: 'Barra',
  halteres: 'Halteres',
  maquina: 'M\u00e1quina',
  kettlebell: 'Kettlebell',
  cabo: 'Cabo',
  faixas: 'Faixas El\u00e1sticas',
  'bola-medicinal': 'Bola Medicinal',
  'bola-de-exercicio': 'Bola de Exerc\u00edcio',
  'rolo-de-espuma': 'Rolo de Espuma',
  outros: 'Outros',
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getMuscleInfo(primaryMuscles) {
  const muscle = primaryMuscles?.[0] || '';
  const mapped = MUSCLE_MAP[muscle];
  if (mapped) return { musculo: capitalize(muscle), ...mapped };

  for (const [key, val] of Object.entries(MUSCLE_MAP)) {
    if (muscle.includes(key)) return { musculo: capitalize(muscle), ...val };
  }

  return { musculo: capitalize(muscle) || 'Outro', icone: 'body', cor: '#607d8b' };
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getEquipment(equipment) {
  if (!equipment) return undefined;
  return EQUIPMENT_MAP[equipment] || capitalize(equipment.replace(/-/g, ' '));
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse JSON from ' + url + ': ' + e.message));
          }
        });
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('Fetching translated exercises...');
  const translated = await fetchJSON(TRANSLATED_URL);
  console.log('  Got ' + translated.length + ' exercises (translated)');

  console.log('Fetching original exercises (for image paths)...');
  const original = await fetchJSON(ORIGINAL_URL);
  console.log('  Got ' + original.length + ' exercises (original)');

  const originalMap = new Map(original.map((e) => [e.id, e]));

  const seen = new Set();
  const exercises = [];

  for (const t of translated) {
    const orig = originalMap.get(t.id);
    const imageUrl = orig?.images?.[0] || t.images?.[0] || null;

    const fullUrl = imageUrl
      ? 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/' + imageUrl
      : null;

    let id = slugify(t.name);
    if (!id) id = slugify(t.id.replace(/_/g, ' '));
    if (seen.has(id)) {
      id = id + '-' + exercises.length;
    }
    seen.add(id);

    const { musculo, icone, cor } = getMuscleInfo(t.primaryMuscles);

    const descricao = t.instructions?.length ? t.instructions.join(' ') : '';

    exercises.push({
      id,
      nome: t.name,
      musculo,
      icone,
      corGrupo: cor,
      descricao,
      equipamento: getEquipment(t.equipment),
      imageUrl: fullUrl,
    });
  }

  exercises.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const outPath = path.join(__dirname, '..', 'src', 'modules', 'exercises', 'data', 'exercicios.json');
  fs.writeFileSync(outPath, JSON.stringify(exercises, null, 2), 'utf8');
  console.log('\nWrote ' + exercises.length + ' exercises to ' + outPath);

  const outPath2 = path.join(__dirname, '..', 'src', 'data', 'exercicios.json');
  fs.writeFileSync(outPath2, JSON.stringify(exercises, null, 2), 'utf8');
  console.log('Wrote ' + exercises.length + ' exercises to ' + outPath2);

  const muscles = [...new Set(exercises.map((e) => e.musculo))].sort();
  console.log('\nMuscle groups (' + muscles.length + '): ' + muscles.join(', '));

  const stats = {
    total: exercises.length,
    withImage: exercises.filter((e) => e.imageUrl).length,
    withoutImage: exercises.filter((e) => !e.imageUrl).length,
  };
  console.log('\nStats:', JSON.stringify(stats, null, 2));
}

main().catch(console.error);
