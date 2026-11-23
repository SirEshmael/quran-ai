const API = "https://api.alquran.cloud/v1";

const surahSelect = document.getElementById("surahSelect");

async function loadSurahList() {
    try {
        const response = await fetch(API + "/surah");

        if (!response.ok) {
            throw new Error("Unable to connect.");
        }

        const result = await response.json();

        surahSelect.innerHTML =
            '<option value="">Select a Surah</option>';

        result.data.forEach(surah => {
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

        console.error(error);
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

        if (arabic.ayahs.length !== english.ayahs.length) {
            throw new Error("Verse data does not match.");
        }

        surahInfo.innerHTML =
            "<h3>" + arabic.name + "</h3>" +
            "<p>" + arabic.englishName + "</p>" +
            "<small>" + arabic.numberOfAyahs + " Ayahs</small>";

        quranText.innerHTML = "";

        arabic.ayahs.forEach((ayah, index) => {

            const card = document.createElement("div");
            card.className = "ayah-card";

            const arabicVerse = document.createElement("p");
            arabicVerse.className = "ayah-arabic";

            arabicVerse.textContent =
                ayah.text + " ۞ " + ayah.numberInSurah;

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

        console.error(error);
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


loadSurahList();
