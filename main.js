const OPENAI_API_KEY = prompt('Indtast din OpenAI API-nøgle:');

// Kategorier og deres underemner
const categoryTopics = {
    dom: ['HTML/CSS', 'Udvælgelse af elementer', 'Indsættelse af elementer', 'Event listeners', 'Ændring af elementer'],
    visualization: ['Canvas', 'SVG', 'Animationer'],
    functions: ['Argumenter og parametre', 'Returneringsværdier', 'Callback-funktioner'],
    asynchronicity: ['Promises', 'Async/Await', 'setTimeout', 'Event loop'],
    api: ['Fetch', 'Asynkron kode', 'JSON', 'DOM-manipulation'],
};

// Generel funktion til at kalde OpenAI API
async function callOpenAI(prompt) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            throw new Error('Fejl ved OpenAI API-anmodning.');
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Fejl:', error);
        return 'Der opstod en fejl ved kommunikation med OpenAI API. Kontroller din API-nøgle og internetforbindelse.';
    }
}

// Generer opgave
async function generateExamTask() {
    const category = document.getElementById('category').value;

    if (!category) {
        alert('Vælg en kategori først!');
        return;
    }

    const topics = categoryTopics[category]?.join(', ') || '';
    const prompt = `
        Generér en simpel og begyndervenlig opgave i kategorien "${category}". 
        Fokusér på disse underemner: ${topics}.
        Beskriv opgaven kort, giv trin-for-trin-instruktioner, og vis et simpelt eksempel på en løsning i JavaScript.
        Opgaven kan løses på mindre end 10 minutter og er passende for en 1. semester IT-arkitektur-studerende.
    `;

    const taskOutput = document.getElementById('taskOutput');
    taskOutput.textContent = 'Genererer opgave...';
    taskOutput.classList.add('loading');

    const taskContent = await callOpenAI(prompt);
    taskOutput.textContent = taskContent;
    taskOutput.classList.remove('loading');
}

// Hent feedbacken på løsning
async function getFeedback() {
    const task = document.getElementById('taskOutput').textContent.trim();
    const userSolution = document.getElementById('codeInput').value.trim();
    const feedbackOutput = document.getElementById('feedbackOutput');

    if (!task || task === 'Klik på "Generer opgave" for at begynde.') {
        feedbackOutput.textContent = 'Generer en opgave først!';
        return;
    }

    if (!userSolution) {
        feedbackOutput.textContent = 'Skriv en løsning først!';
        return;
    }

    const prompt = `
        Giv feedback på denne opgave og løsning:
        Opgave: ${task}
        Løsning: ${userSolution}
        
        Feedback skal være kort og konstruktiv, og give forslag til forbedringer eller påpege fejl i løsningen. 
        Husk at svare på dansk.
    `;

    feedbackOutput.textContent = 'Henter feedback...';
    feedbackOutput.classList.add('loading');

    const feedbackContent = await callOpenAI(prompt);
    feedbackOutput.textContent = feedbackContent;
    feedbackOutput.classList.remove('loading');
}

// Nulstiller opgave og feedback
function resetTask() {
    document.getElementById('taskOutput').textContent = 'Klik på "Generer opgave" for at begynde.';
    document.getElementById('feedbackOutput').textContent = 'Feedback vil blive vist her.';
    document.getElementById('codeInput').value = '';
}

// Event listeners
document.getElementById('generateTask').addEventListener('click', generateExamTask);
document.getElementById('resetTask').addEventListener('click', resetTask);
document.getElementById('submitSolution').addEventListener('click', getFeedback);