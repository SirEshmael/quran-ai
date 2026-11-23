const API = "https://api.alquran.cloud/v1";

const surahSelect = document.getElementById("surahSelect");


// LOAD ALL 114 SURAHS

async function loadSurahList() {

    try {

        const response = await fetch(${API}/surah);

        if (!response.ok) {
            throw new Error("Unable to connect to Quran database.");
        }

        const result = await response.json();

        surahSelect.innerHTML =
            '<option value="">Select a Surah</option>';

        result.data.forEach(surah => {

            const option = document.createElement("option");

            option.value = surah.number;

            option.textContent =
                ${surah.number}. ${surah.englishName} — ${surah.name};

            surahSelect.appendChild(option);

        });

    } catch (error) {

        surahSelect.innerHTML =
            '<option value="">Could not load Surahs</option>';

        console.error(error);

    }

}


// LOAD SELECTED SURAH

async function loadSurah() {

    const surahNumber = surahSelect.value;

    const quranText = document.getElementById("quranText");

    const surahInfo = document.getElementById("surahInfo");

    if (!surahNumber) {

        alert("Please select a Surah first.");

        return;

    }

    quranText.innerHTML =
        '<p class="loading">Loading Qur'an verses...</p>';

    surahInfo.innerHTML = "";

    try {

        const arabicResponse = await fetch(
            ${API}/surah/${surahNumber}/quran-uthmani
        );

        const englishResponse = await fetch(
            ${API}/surah/${surahNumber}/en.sahih
        );

        if (!arabicResponse.ok || !englishResponse.ok) {
            throw new Error("Unable to retrieve Surah.");
        }

        const arabicResult = await arabicResponse.json();

        const englishResult = await englishResponse.json();

        const arabic = arabicResult.data;

        const english = englishResult.data;

        if (
            !arabic.ayahs ||
            !english.ayahs ||
            arabic.ayahs.length !== english.ayahs.length
        ) {
            throw new Error("The returned verse data does not match.");
        }

        surahInfo.innerHTML = `
            <h3>${arabic.name}</h3>
            <p>${arabic.englishName}</p>
            <small>
                ${arabic.numberOfAyahs} Ayahs |
                ${arabic.revelationType}
            </small>
        `;

        quranText.innerHTML = "";

        arabic.ayahs.forEach((ayah, index) => {

            const translation = english.ayahs[index];

            const card = document.createElement("div");

            card.className = "ayah-card";

            const arabicVerse = document.createElement("p");

            arabicVerse.className = "ayah-arabic";

            arabicVerse.textContent =
                ${ayah.text} ۞ ${ayah.numberInSurah};

            const englishVerse = document.createElement("p");

            englishVerse.className = "ayah-translation";

            englishVerse.textContent =
                translation.text;

            card.appendChild(arabicVerse);

            card.appendChild(englishVerse);

            quranText.appendChild(card);

        });

        document.getElementById("quran").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        quranText.innerHTML = `
            <p class="error">
                Unable to load the Surah.
                Please check your internet connection and try again.
            </p>
        `;

        console.error(error);

    }

}


// INITIALISE THE WEBSITE

loadSurahList();


// EXISTING BUTTON FUNCTIONS

function startLearning() {

    document.getElementById("quran").scrollIntoView({
        behavior: "smooth"
    });

}

function exploreQuran() {

    document.getElementById("quran").scrollIntoView({
        behavior: "smooth"
    });

}