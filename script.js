const API = "https://api.alquran.cloud/v1";

const surahSelect = document.getElementById("surahSelect");

// =====================================
// QURAN READER
// =====================================

async function loadSurahList() {
    try {
        const response = await fetch(API + "/surah");

        if (!response.ok) {
            throw new Error("Unable to connect.");
        }

        const result = await response.json();

        surahSelect.innerHTML =
            '<option value="">Select a Surah</option>';

        result.data.forEach(function(surah) {
            const option = document.createElement("option");

            option.value = surah.number;

            option.textContent =
                surah.number + ". " +
                surah.englishName + " — " +
                surah.name;

            surahSelect.appendChild(option);
        });

    } catch (error) {
        surahSelect.innerHTML =
            '<option value="">Could not load Surahs</option>';

        console.error("Surah list error:", error);
    }
}


async function loadSurah() {

    const number = surahSelect.value;

    const quranText = document.getElementById("quranText");
    const surahInfo = document.getElementById("surahInfo");

    if (!number) {
        alert("Please select a Surah.");
        return;
    }

    quranText.textContent = "Loading Qur'an verses...";

    try {

        const arabicResponse = await fetch(
            API + "/surah/" + number + "/quran-uthmani"
        );

        const englishResponse = await fetch(
            API + "/surah/" + number + "/en.sahih"
        );

        if (!arabicResponse.ok || !englishResponse.ok) {
            throw new Error("Unable to retrieve Surah.");
        }

        const arabicData = await arabicResponse.json();
        const englishData = await englishResponse.json();

        const arabic = arabicData.data;
        const english = englishData.data;

        if (
            !arabic || !english ||
            !arabic.ayahs || !english.ayahs ||
            arabic.ayahs.length !== english.ayahs.length
        ) {
            throw new Error("Verse data does not match.");
        }

        surahInfo.innerHTML =
            "<h3>" + arabic.name + "</h3>" +
            "<p>" + arabic.englishName + "</p>" +
            "<small>" + arabic.numberOfAyahs + " Ayahs</small>";

        quranText.innerHTML = "";

        const bismillah =
            "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

        if (number !== "1" && number !== "9") {

            const bismillahElement = document.createElement("p");

            bismillahElement.className =
                "ayah-arabic bismillah";

            bismillahElement.style.textAlign = "center";
            bismillahElement.textContent = bismillah;

            quranText.appendChild(bismillahElement);
        }

        arabic.ayahs.forEach(function(ayah, index) {

            const card = document.createElement("div");
            card.className = "ayah-card";

            const arabicVerse = document.createElement("p");
            arabicVerse.className = "ayah-arabic";

            let verseText = ayah.text;

            if (index === 0 && number !== "1" && number !== "9") {

                const normalizedVerse = verseText
                    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
                    .replace(/[ٱأإآ]/g, "ا")
                    .trim();

                const normalizedBismillah = bismillah
                    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
                    .replace(/[ٱأإآ]/g, "ا")
                    .trim();

                if (normalizedVerse.startsWith(normalizedBismillah)) {
                    verseText = verseText
                        .trim()
                        .split(/\s+/)
                        .slice(4)
                        .join(" ");
                }
            }

            arabicVerse.textContent = verseText;

            const ayahNumber = document.createElement("span");
            ayahNumber.className = "ayah-number";
            ayahNumber.textContent = " ۞ " + ayah.numberInSurah;

            arabicVerse.appendChild(ayahNumber);

            const translation = document.createElement("p");
            translation.className = "ayah-translation";
            translation.textContent = english.ayahs[index].text;

            card.appendChild(arabicVerse);
            card.appendChild(translation);

            quranText.appendChild(card);
        });

        document.getElementById("quran").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        quranText.textContent =
            "Unable to load Surah. Please try again.";

        console.error("Quran error:", error);
    }
}


async function startLearning() {
    document.getElementById("quran").scrollIntoView({
        behavior: "smooth"
    });
}


async function exploreQuran() {
    document.getElementById("quran").scrollIntoView({
        behavior: "smooth"
    });
}


// =====================================
// HIFZ ACADEMY
// =====================================

const hifzSurahSelect =
    document.getElementById("hifzSurah");

const hifzArabic =
    document.getElementById("hifzArabic");

const hifzTranslation =
    document.getElementById("hifzTranslation");

const hifzCounter =
    document.getElementById("hifzCounter");

const hifzStatus =
    document.getElementById("hifzStatus");

const revealBtn =
    document.getElementById("revealBtn");

const memorizedBtn =
    document.getElementById("memorizedBtn");

const audioPlayer =
    document.getElementById("hifzAudio");

let hifzAyahs = [];
let currentHifzAyah = 0;
let isHifzRevealed = true;
let currentHifzSurah = null;


// =====================================
// LOAD HIFZ SURAH LIST
// =====================================

async function loadHifzSurahList() {

    try {

        const response = await fetch(API + "/surah");

        if (!response.ok) {
            throw new Error("Unable to load Surahs.");
        }

        const result = await response.json();

        hifzSurahSelect.innerHTML =
            '<option value="">Select a Surah</option>';

        result.data.forEach(function(surah) {

            const option = document.createElement("option");

            option.value = surah.number;

            option.textContent =
                surah.number + ". " +
                surah.englishName + " — " +
                surah.name;

            hifzSurahSelect.appendChild(option);
        });

    } catch (error) {

        hifzSurahSelect.innerHTML =
            '<option value="">Could not load Surahs</option>';

        console.error("Hifz Surah error:", error);
    }
}


// =====================================
// LOAD SELECTED SURAH FOR HIFZ
// =====================================

async function loadHifzSurah() {

    const number = hifzSurahSelect.value;

    if (!number) {
        return;
    }

    hifzArabic.textContent = "Loading...";
    hifzTranslation.textContent = "Please wait...";
    hifzCounter.textContent = "Loading ayahs...";

    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.removeAttribute("src");
    }

    try {

        const arabicResponse = await fetch(
            API + "/surah/" + number + "/quran-uthmani"
        );

        const englishResponse = await fetch(
            API + "/surah/" + number + "/en.sahih"
        );

        const audioResponse = await fetch(
            API + "/surah/" + number + "/ar.alafasy"
        );

        if (
            !arabicResponse.ok ||
            !englishResponse.ok ||
            !audioResponse.ok
        ) {
            throw new Error("Unable to load selected Surah.");
        }

        const arabicData = await arabicResponse.json();
        const englishData = await englishResponse.json();
        const audioData = await audioResponse.json();

        const arabic = arabicData.data.ayahs;
        const english = englishData.data.ayahs;
        const audio = audioData.data.ayahs;

        if (
            arabic.length !== english.length ||
            arabic.length !== audio.length
        ) {
            throw new Error("Ayah data does not match.");
        }

        currentHifzSurah = number;

        hifzAyahs = arabic.map(function(ayah, index) {

            return {
                arabic: ayah.text,
                translation: english[index].text,
                audio: audio[index].audio,
                number: ayah.numberInSurah
            };

        });

        currentHifzAyah = 0;

        showHifzAyah();

    } catch (error) {

        hifzArabic.textContent = "Unable to load Ayahs.";

        hifzTranslation.textContent =
            "Please try again.";

        hifzCounter.textContent = "Loading failed.";

        console.error("Hifz loading error:", error);
    }
}


// =====================================
// GET SAVED HIFZ PROGRESS
// =====================================

function getHifzProgress() {

    try {

        return JSON.parse(
            localStorage.getItem("quranAIHifzProgress") || "{}"
        );

    } catch (error) {

        return {};
    }
}


// =====================================
// DISPLAY CURRENT AYAH
// =====================================

function showHifzAyah() {

    if (!hifzAyahs.length) {
        return;
    }

    const ayah = hifzAyahs[currentHifzAyah];

    if (audioPlayer) {

        audioPlayer.pause();
        audioPlayer.src = ayah.audio;
        audioPlayer.load();
    }

    hifzArabic.textContent = ayah.arabic;
    hifzTranslation.textContent = ayah.translation;

    isHifzRevealed = true;

    revealBtn.textContent = "Hide Ayah";

    const progress = getHifzProgress();

    const memorized =
        progress[currentHifzSurah] || [];

    hifzCounter.textContent =
        "Ayah " + ayah.number +
        " of " + hifzAyahs.length;

    hifzStatus.textContent =
        memorized.length + " of " +
        hifzAyahs.length +
        " Ayahs memorised";

    memorizedBtn.textContent =
        memorized.includes(ayah.number)
        ? "✓ Memorised"
        : "✓ Mark as Memorised";
}


// =====================================
// HIDE OR REVEAL AYAH
// =====================================

function revealHifzAyah() {

    if (!hifzAyahs.length) {
        alert("Please select a Surah first.");
        return;
    }

    if (isHifzRevealed) {

        hifzArabic.textContent = "••••••••••••••";

        hifzTranslation.textContent =
            "Try to remember this Ayah.";

        revealBtn.textContent = "Reveal Ayah";

        isHifzRevealed = false;

    } else {

        showHifzAyah();
    }
}


// =====================================
// NEXT AYAH
// =====================================

function nextHifzAyah() {

    if (!hifzAyahs.length) {
        alert("Please select a Surah first.");
        return;
    }

    if (currentHifzAyah < hifzAyahs.length - 1) {

        currentHifzAyah++;

        showHifzAyah();

    } else {

        alert("You have reached the last Ayah of this Surah.");
    }
}


// =====================================
// PREVIOUS AYAH
// =====================================

function previousHifzAyah() {

    if (!hifzAyahs.length) {
        alert("Please select a Surah first.");
        return;
    }

    if (currentHifzAyah > 0) {

        currentHifzAyah--;

        showHifzAyah();

    } else {

        alert("This is the first Ayah.");
    }
}


// =====================================
// MARK AYAH AS MEMORISED
// =====================================

function markHifzMemorized() {

    if (!hifzAyahs.length) {
        alert("Please select a Surah first.");
        return;
    }

    const progress = getHifzProgress();

    if (!progress[currentHifzSurah]) {
        progress[currentHifzSurah] = [];
    }

    const ayahNumber =
        hifzAyahs[currentHifzAyah].number;

    const memorized =
        progress[currentHifzSurah];

    const index =
        memorized.indexOf(ayahNumber);

    if (index === -1) {
        memorized.push(ayahNumber);
    } else {
        memorized.splice(index, 1);
    }

    try {

        localStorage.setItem(
            "quranAIHifzProgress",
            JSON.stringify(progress)
        );

    } catch (error) {

        alert("Unable to save progress on this device.");
    }

    showHifzAyah();
}


// =====================================
// REPEAT AUDIO
// =====================================

function repeatHifzAudio() {

    if (!audioPlayer || !audioPlayer.src) {
        alert("Please select a Surah first.");
        return;
    }

    audioPlayer.currentTime = 0;

    audioPlayer.play().catch(function(error) {
        console.error("Audio playback error:", error);
    });
}


// =====================================
// INITIALISE WEBSITE
// =====================================

hifzSurahSelect.addEventListener(
    "change",
    loadHifzSurah
);

loadSurahList();
loadHifzSurahList();
// =====================================
// AI RECITATION PRACTICE
// =====================================

const recitationSurah = document.getElementById("recitationSurah");
const recitationAyah = document.getElementById("recitationAyah");
const recitationArabic = document.getElementById("recitationArabic");
const recitationTranslation = document.getElementById("recitationTranslation");
const recitationTranscript = document.getElementById("recitationTranscript");
const recitationFeedback = document.getElementById("recitationFeedback");
const startRecitationBtn = document.getElementById("startRecitationBtn");
const stopRecitationBtn = document.getElementById("stopRecitationBtn");

let recitationRecognition = null;
let targetArabicAyah = "";
let recognisedText = "";


// Load Surah list
async function loadRecitationSurahList() {
    try {
        const response = await fetch(`${API}/surah`);
        const result = await response.json();

        recitationSurah.innerHTML = "";

        result.data.forEach(surah => {
            const option = document.createElement("option");
            option.value = surah.number;
            option.textContent =
                `${surah.number}. ${surah.englishName} — ${surah.name}`;

            recitationSurah.appendChild(option);
        });

    } catch (error) {
        recitationSurah.innerHTML =
            '<option value="">Unable to load Surahs</option>';
    }
}


// Load selected Ayah
async function loadRecitationAyah() {
    const surahNumber = recitationSurah.value;
    const ayahNumber = Number(recitationAyah.value);

    if (!surahNumber || !ayahNumber || ayahNumber < 1) {
        alert("Please select a Surah and enter a valid Ayah number.");
        return;
    }

    try {
        recitationArabic.textContent = "Loading...";
        recitationTranslation.textContent = "";

        const [arabicResponse, englishResponse] = await Promise.all([
            fetch(`${API}/surah/${surahNumber}/quran-uthmani`),
            fetch(`${API}/surah/${surahNumber}/en.sahih`)
        ]);

        const arabicResult = await arabicResponse.json();
        const englishResult = await englishResponse.json();

        const arabicAyahs = arabicResult.data.ayahs;
        const englishAyahs = englishResult.data.ayahs;

        if (ayahNumber > arabicAyahs.length) {
            alert("This Ayah number does not exist in the selected Surah.");
            return;
        }

        targetArabicAyah = arabicAyahs[ayahNumber - 1].text;

        recitationArabic.textContent = targetArabicAyah;
        recitationTranslation.textContent =
            englishAyahs[ayahNumber - 1].text;

        recitationTranscript.textContent =
            "Your recognised words will appear here.";

        recitationFeedback.textContent =
            "Press Start Recitation when you are ready.";

    } catch (error) {
        recitationArabic.textContent = "Unable to load this Ayah.";
        console.error(error);
    }
}


// Start microphone recognition
function startRecitation() {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        recitationFeedback.textContent =
            "Speech recognition is not supported in this browser. Try Chrome on your Chromebook.";
        return;
    }

    if (!targetArabicAyah) {
        recitationFeedback.textContent =
            "Please load an Ayah before starting.";
        return;
    }

    recitationRecognition = new SpeechRecognition();

    recitationRecognition.lang = "ar-SA";
    recitationRecognition.continuous = true;
    recitationRecognition.interimResults = true;

    recognisedText = "";

    recitationRecognition.onstart = function () {
        startRecitationBtn.disabled = true;
        stopRecitationBtn.disabled = false;

        recitationFeedback.textContent =
            "Listening... Recite the displayed Ayah.";
    };

    recitationRecognition.onresult = function (event) {
        let currentText = "";

        for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript + " ";
        }

        recognisedText = currentText.trim();

        recitationTranscript.textContent =
            recognisedText || "Listening...";
    };

    recitationRecognition.onerror = function (event) {
        recitationFeedback.textContent =
            "Microphone recognition error: " + event.error;
    };

    recitationRecognition.onend = function () {
        startRecitationBtn.disabled = false;
        stopRecitationBtn.disabled = true;

        if (recognisedText) {
            recitationFeedback.textContent =
                "Recitation captured. Compare the recognised words with the displayed Ayah. Speech recognition can make mistakes and does not assess Tajweed.";
        }
    };

    try {
        recitationRecognition.start();
    } catch (error) {
        recitationFeedback.textContent =
            "Could not start the microphone. Please try again.";
    }
}


// Stop microphone
function stopRecitation() {
    if (recitationRecognition) {
        recitationRecognition.stop();
    }
}


// Initialise
loadRecitationSurahList();
