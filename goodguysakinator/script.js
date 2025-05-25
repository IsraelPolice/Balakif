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
let answers = []; // מערך לשמירת התשובות שניתנו

function startGame() {
  console.log('startGame called');
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  document.getElementById('guess').classList.add('hidden');
  document.getElementById('reset').classList.add('hidden');
  document.getElementById('error').classList.add('hidden');
  initGame();
}

function initGame() {
  console.log('initGame called');
  document.getElementById('question').textContent = 'טוען את המשחק...';
  
  fetch('characters.json')
    .then(response => {
      if (!response.ok) throw new Error('לא ניתן לטעון את קובץ הדמויות.');
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('קובץ הדמויות ריק או לא תקין.');
      }
      characters = data;
      remainingCharacters = [...characters];
      askedQuestions = [];
      answers = [];
      currentQuestion = null;
      console.log('Characters loaded:', remainingCharacters.length);
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
  console.log('selectNextQuestion called, remaining characters:', remainingCharacters.length, 'asked questions:', askedQuestions.length);
  
  if (remainingCharacters.length === 0) {
    console.log('No remaining characters');
    showGuess('לא הצלחתי לזהות את הדמות! אין דמויות מתאימות.', 0);
    return;
  }

  // בדוק אם אפשר לנחש: לפחות 10 שאלות, ציון התאמה ≥ 80%, או 20 שאלות
  const bestGuess = getBestGuess();
  if ((askedQuestions.length >= 10 && bestGuess.score >= 80) || askedQuestions.length >= 20 || (remainingCharacters.length === 1 && bestGuess.score === 100)) {
    console.log('Reached condition for guess:', remainingCharacters.length, 'characters,', askedQuestions.length, 'questions, score:', bestGuess.score);
    showGuess(bestGuess.name, bestGuess.score);
    return;
  }

  const unaskedQuestions = questions.filter(q => !askedQuestions.includes(q.id));
  console.log('Unasked questions:', unaskedQuestions.length);
  
  if (unaskedQuestions.length === 0) {
    console.log('No more questions');
    showGuess(bestGuess.name, bestGuess.score);
    return;
  }

  let bestQuestion = null;

  // שאלה ראשונה: בחירה אקראית לחלוטין
  if (askedQuestions.length === 0) {
    bestQuestion = unaskedQuestions[Math.floor(Math.random() * unaskedQuestions.length)];
    console.log('Random first question:', bestQuestion.text);
  } else {
    // שאלות נוספות: בחר אקראית מבין 5 השאלות עם הסקור הנמוך ביותר
    const questionScores = unaskedQuestions.map(question => {
      const trueCount = remainingCharacters.filter(c => c[question.id] === true).length;
      const falseCount = remainingCharacters.length - trueCount;
      const score = Math.abs(trueCount - falseCount);
      // הוסף משקל לשאלות שמסננות יותר דמויות
      const impact = Math.min(trueCount, falseCount) / remainingCharacters.length;
      return { question, score, impact };
    });

    // מיין לפי סקור, ואם הסקור שווה, לפי אימפקט
    questionScores.sort((a, b) => a.score - b.score || b.impact - a.impact);
    
    // בחר אקראית מבין 5 השאלות המובילות
    const topQuestions = questionScores.slice(0, Math.min(5, questionScores.length));
    bestQuestion = topQuestions[Math.floor(Math.random() * topQuestions.length)].question;
    console.log('Selected question:', bestQuestion.text, 'from top', topQuestions.length);
  }

  currentQuestion = bestQuestion;
  if (bestQuestion) {
    console.log('Displaying question:', bestQuestion.text);
    document.getElementById('question').textContent = bestQuestion.text;
    document.getElementById('game').classList.remove('hidden');
    document.getElementById('guess').classList.add('hidden');
    document.getElementById('reset').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
  } else {
    console.log('No suitable question found');
    showGuess('שגיאה: לא נמצאה שאלה מתאימה.', 0);
  }
}

function getBestGuess() {
  console.log('getBestGuess called, remaining characters:', remainingCharacters.length);
  if (remainingCharacters.length === 0) {
    return { name: 'לא הצלחתי לזהות את הדמות! אין דמויות מתאימות.', score: 0 };
  }

  let bestCharacter = null;
  let bestScore = -1;

  remainingCharacters.forEach(character => {
    let score = 0;
    let totalValidAnswers = 0;
    answers.forEach(answer => {
      if (character[answer.questionId] !== undefined) {
        totalValidAnswers++;
        if (character[answer.questionId] === answer.response) {
          score++;
        }
      }
    });
    // נרמל את הציון לאחוזים, רק אם יש תשובות תקפות
    const normalizedScore = totalValidAnswers > 0 ? (score / totalValidAnswers) * 100 : 0;
    console.log(`Character: ${character.name}, Match score: ${normalizedScore.toFixed(2)}%, Matches: ${score}/${totalValidAnswers}`);
    if (normalizedScore > bestScore) {
      bestScore = normalizedScore;
      bestCharacter = character;
    }
  });

  return { name: bestCharacter.name, score: bestScore };
}

function answer(response) {
  console.log('answer called with response:', response, 'current question:', currentQuestion?.text);
  if (!currentQuestion) {
    console.error('No current question');
    document.getElementById('error').textContent = 'שגיאה: אין שאלה נוכחית. אנא טען מחדש את הדף.';
    document.getElementById('error').classList.remove('hidden');
    return;
  }

  answers.push({ questionId: currentQuestion.id, response });
  askedQuestions.push(currentQuestion.id);
  const prevCount = remainingCharacters.length;
  remainingCharacters = remainingCharacters.filter(c => c[currentQuestion.id] === response);
  console.log(`After answering ${currentQuestion.text} with ${response}: ${prevCount} -> ${remainingCharacters.length} characters`);
  selectNextQuestion();
}

function showGuess(guess, score) {
  console.log('showGuess called with guess:', guess, 'score:', score);
  let message = `הניחוש שלי: ${guess} (${askedQuestions.length} שאלות, בטחון: ${score.toFixed(2)}%)`;
  if (score < 80) {
    message += '\nאני לא לגמרי בטוח, אבל זה הניחוש הכי טוב שלי!';
  }
  console.log('Updating guess div with text:', message);
  document.getElementById('question').textContent = '';
  document.getElementById('game').classList.add('hidden');
  document.getElementById('guess').textContent = message;
  document.getElementById('guess').classList.remove('hidden');
  document.getElementById('reset').classList.remove('hidden');
  document.getElementById('error').classList.add('hidden');
  document.getElementById('intro').classList.add('hidden');
  console.log('Guess div visibility:', document.getElementById('guess').classList.contains('hidden') ? 'hidden' : 'visible');
  console.log('Intro div visibility:', document.getElementById('intro').classList.contains('hidden') ? 'hidden' : 'visible');
  console.log('Game div visibility:', document.getElementById('game').classList.contains('hidden') ? 'hidden' : 'visible');
}

function resetGame() {
  console.log('resetGame called');
  remainingCharacters = [];
  askedQuestions = [];
  answers = [];
  currentQuestion = null;
  document.getElementById('intro').classList.remove('hidden');
  document.getElementById('game').classList.add('hidden');
  document.getElementById('guess').classList.add('hidden');
  document.getElementById('reset').classList.add('hidden');
  document.getElementById('error').textContent = '';
  document.getElementById('error').classList.add('hidden');
  console.log('After reset - Intro div visibility:', document.getElementById('intro').classList.contains('hidden') ? 'hidden' : 'visible');
}
