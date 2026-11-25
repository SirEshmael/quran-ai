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

        if (!arabic || !english ||
            !arabic.ayahs || !english.ayahs ||
            arabic.ayahs.length !== english.ayahs.length) {

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

            ayahNumber.textContent =
                " ۞ " + ayah.numberInSurah;

            arabicVerse.appendChild(ayahNumber);

            const translation = document.createElement("p");

            translation.className = "ayah-translation";

            translation.textContent =
                english.ayahs[index].text;

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


let hifzAyahs = [];
let currentHifzAyah = 0;
let isHifzRevealed = true;
let currentHifzSurah = null;


// Load all Surahs into Hifz dropdown

async function loadHifzSurah() {

    const number = hifzSurahSelect.value;

    if (!number) {
        return;
    }

    hifzArabic.textContent = "Loading...";
    hifzTranslation.textContent = "Please wait...";
    hifzCounter.textContent = "Loading ayahs...";

    const audioPlayer = document.getElementById("hifzAudio");

    audioPlayer.pause();
    audioPlayer.removeAttribute("src");

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
            throw new Error("Unable to load Surah.");
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

        console.error("Hifz loading error:", error);
    }
}

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


// Load selected Surah for memorisation

async function loadHifzSurah() {

    const number = hifzSurahSelect.value;

    if (!number) {
        return;
    }

    hifzArabic.textContent = "Loading...";
    hifzTranslation.textContent = "Please wait...";
    hifzCounter.textContent = "Loading ayahs...";

    try {

        const arabicResponse = await fetch(
            API + "/surah/" + number + "/quran-uthmani"
        );

        const englishResponse = await fetch(
            API + "/surah/" + number + "/en.sahih"
        );

        if (!arabicResponse.ok || !englishResponse.ok) {
            throw new Error("Unable to load selected Surah.");
        }

        const arabicData = await arabicResponse.json();
        const englishData = await englishResponse.json();

        if (
            !arabicData.data ||
            !englishData.data ||
            arabicData.data.ayahs.length !==
            englishData.data.ayahs.length
        ) {
            throw new Error("Ayah data does not match.");
        }

        currentHifzSurah = number;

        hifzAyahs = arabicData.data.ayahs.map(
            function(ayah, index) {

                return {
                    arabic: ayah.text,
                    translation: englishData.data.ayahs[index].text,
                    number: ayah.numberInSurah
                };

            }
        );

        currentHifzAyah = 0;

        showHifzAyah();

    } catch (error) {

        hifzArabic.textContent =
            "Unable to load Ayahs.";

        hifzTranslation.textContent =
            "Please try again.";

        console.error("Hifz loading error:", error);
    }
}


// Get saved memorisation progress

function getHifzProgress() {

    try {

        return JSON.parse(
            localStorage.getItem("quranAIHifzProgress") || "{}"
        );

    } catch (error) {

        return {};
    }
}


// Display current Ayah



// Hide or reveal current Ayah

function revealHifzAyah() {

    if (!hifzAyahs.length) {
        alert("Please select a Surah first.");
        return;
    }

    if (isHifzRevealed) {

        hifzArabic.textCfunction showHifzAyah() {

    if (!hifzAyahs.length) {
        return;
    }

    const ayah = hifzAyahs[currentHifzAyah];

    const audioPlayer =
        document.getElementById("hifzAudio");

    audioPlayer.pause();

    hifzArabic.textContent = ayah.arabic;

    hifzTranslation.textContent = ayah.translation;

    audioPlayer.src = ayah.audio;
    audioPlayer.load();

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
}ontent = "••••••••••••••";

        hifzTranslation.textContent =
            "Try to remember this Ayah.";

        revealBtn.textContent = "Reveal Ayah";

        isHifzRevealed = false;

    } else {

        showHifzAyah();
    }
}


// Go to next Ayah

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


// Go to previous Ayah

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


// Mark current Ayah as memorised

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
// INITIALISE WEBSITE
// =====================================

hifzSurahSelect.addEventListener(
    "change",
    loadHifzSurah
);

loadSurahList();

loadHifzSurahList();
function repeatHifzAudio() {

    const audioPlayer =
        document.getElementById("hifzAudio");

    if (!audioPlayer.src) {
        alert("Please select a Surah first.");
        return;
    }

    audioPlayer.currentTime = 0;

    audioPlayer.play().catch(function(error) {
        console.error("Audio playback error:", error);
    });
}
