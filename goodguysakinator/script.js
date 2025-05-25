const questions = [
  { id: 'has_long_hair', text: 'האם לדמות שלך יש שיער ארוך?' },
  { id: 'wears_glasses', text: 'האם הדמות שלך מרכיבה משקפיים?' },
  { id: 'colorful_clothes', text: 'האם הדמות שלך לובשת בגדים צבעוניים?' },
  { id: 'has_tattoos', text: 'האם לדמות שלך יש קעקועים?' },
  { id: 'is_tall', text: 'האם הדמות שלך גבוהה מעל 1.80 מטר?' },
  { id: 'smokes', text: 'האם הדמות שלך מעשנת?' },
  { id: 'is_fit', text: 'האם הדמות שלך חטובה?' },
  { id: 'loves_nature', text: 'האם הדמות שלך אוהבת לטייל בטבע?' },
  { id: 'plays_instrument', text: 'האם הדמות שלך מנגנת על כלי נגינה?' },
  { id: 'lives_north', text: 'האם הדמות שלך מתגוררת באזור הצפון?' },
  { id: 'lives_center', text: 'האם הדמות שלך מתגוררת באזור המרכז?' },
  { id: 'license_revoked', text: 'האם נשלל רישיון הנהיגה של הדמות שלך בעבר?' },
  { id: 'drug_investigation', text: 'האם הדמות שלך נחקרה בחשד לשימוש בסמים?' },
  { id: 'no_license', text: 'האם לדמות שלך אין רישיון נהיגה?' },
  { id: 'blue_eyes', text: 'האם לדמות שלך יש עיניים כחולות?' },
  { id: 'studied_savionim', text: 'האם הדמות שלך למדה בסביונים?' },
  { id: 'studied_rishonim', text: 'האם הדמות שלך למדה בראשונים?' },
  { id: 'studied_yb3', text: 'האם הדמות שלך למדה ביב׳ 3?' },
  { id: 'studied_yb4', text: 'האם הדמות שלך למדה ביב׳ 4?' },
  { id: 'is_malicious', text: 'האם הדמות שלך נחשבת מרושעת?' },
  { id: 'served_intelligence', text: 'האם הדמות שלך שירתה במודיעין?' },
  { id: 'served_combat', text: 'האם הדמות שלך שירתה כלוחם בצבא?' },
  { id: 'served_border_police', text: 'האם הדמות שלך שירתה במשמר הגבול?' },
  { id: 'is_officer', text: 'האם הדמות שלך קצין בצבא?' },
  { id: 'not_regular_class', text: 'האם הדמות שלך לא הייתה בכיתה רגילה?' },
  { id: 'has_twin_sister', text: 'האם לדמות שלך יש אחות תאומה?' },
  { id: 'is_parent', text: 'האם הדמות שלך הורה לילדה?' },
  { id: 'lived_eilat', text: 'האם הדמות שלך התגוררה באילת?' },
  { id: 'lifted_nir_dress', text: 'האם הדמות שלך הרימה לניר בן חיים את השמלה במועדון?' },
  { id: 'has_allergies', text: 'האם לדמות שלך יש אלרגיות?' },
  { id: 'fainted_omer', text: 'האם הדמות שלך התעלפה בבית של עומר יוסף?' },
  { id: 'in_punk_rock', text: 'האם הדמות שלך הייתה בהצגה פאנק רוק?' },
  { id: 'kissed_on_stage', text: 'האם הדמות שלך התנשקה על במת אשכול הפיס עם חבר אחר?' },
  { id: 'lives_savionim', text: 'האם הדמות שלך מתגוררת בסביונים?' }
];

let characters = [];
let remainingCharacters = [];
let askedQuestions = [];
let currentQuestion = null;

function startGame() {
  // הסתר את מסך האינטרו והצג את מסך המשחק
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  initGame();
}

function initGame() {
  document.getElementById('question').textContent = 'טוען את המשחק...';
  
  fetch('characters.json')
    .then(response => {
      if (!response.ok) throw new Error('לא ניתן לטעון את קובץ הדמויות. ודא שקובץ characters.json קיים באותה תיקייה.');
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('קובץ הדמויות ריק או לא תקין.');
      }
      characters = data;
      remainingCharacters = [...characters];
      askedQuestions = [];
      currentQuestion = null;
      selectNextQuestion();
    })
    .catch(error => {
      console.error('שגיאה בטעינת המשחק:', error);
      document.getElementById('error').textContent = `שגיאה: ${error.message}`;
      document.getElementById('error').classList.remove('hidden');
      document.getElementById('game').classList.add('hidden');
      document.getElementById('intro').classList.add('hidden');
    });
}

function selectNextQuestion() {
  if (remainingCharacters.length === 0) {
    showGuess('לא הצלחתי לזהות את הדמות! אין דמויות מתאימות.');
    return;
  }
  if (remainingCharacters.length === 1) {
    showGuess(remainingCharacters[0].name);
    return;
  }
  if (askedQuestions.length >= 20) {
    showGuess(getBestGuess());
    return;
  }

  const unaskedQuestions = questions.filter(q => !askedQuestions.includes(q.id));
  if (unaskedQuestions.length === 0) {
    showGuess(getBestGuess());
    return;
  }

  let bestQuestion = null;
  let bestScore = Infinity;

  unaskedQuestions.forEach(question => {
    const trueCount = remainingCharacters.filter(c => c[question.id] === true).length;
    const falseCount = remainingCharacters.length - trueCount;
    const score = Math.abs(trueCount - falseCount);
    if (score < bestScore) {
      bestScore = score;
      bestQuestion = question;
    }
  });

  currentQuestion = bestQuestion;
  if (bestQuestion) {
    document.getElementById('question').textContent = bestQuestion.text;
    document.getElementById('game').classList.remove('hidden');
    document.getElementById('guess').classList.add('hidden');
    document.getElementById('reset').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
  } else {
    showGuess('שגיאה: לא נמצאה שאלה מתאימה.');
  }
}

function getBestGuess() {
  if (remainingCharacters.length === 0) {
    return 'לא הצלחתי לזהות את הדמות! אין דמויות מתאימות.';
  }
  return remainingCharacters[0].name; // מחזיר את הדמות הראשונה כברירת מחדל
}

function answer(response) {
  if (!currentQuestion) {
    document.getElementById('error').textContent = 'שגיאה: אין שאלה נוכחית. אנא טען מחדש את הדף.';
    document.getElementById('error').classList.remove('hidden');
    return;
  }

  askedQuestions.push(currentQuestion.id);
  remainingCharacters = remainingCharacters.filter(c => c[currentQuestion.id] === response);
  selectNextQuestion();
}

function showGuess(guess) {
  document.getElementById('question').textContent = '';
  document.getElementById('game').classList.add('hidden');
  document.getElementById('guess').textContent = `הניחוש שלי: ${guess}`;
  document.getElementById('guess').classList.remove('hidden');
  document.getElementById('reset').classList.remove('hidden');
  document.getElementById('error').classList.add('hidden');
}

function resetGame() {
  remainingCharacters = [];
  askedQuestions = [];
  currentQuestion = null;
  document.getElementById('intro').classList.remove('hidden');
  document.getElementById('game').classList.add('hidden');
  document.getElementById('guess').classList.add('hidden');
  document.getElementById('reset').classList.add('hidden');
  document.getElementById('error').textContent = '';
  document.getElementById('error').classList.add('hidden');
}
