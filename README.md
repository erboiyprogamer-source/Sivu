# Pizzeria Albert – kotisivu

Kotisivu Alajärven **Pizzeria Albertille** (Järvikatu 3, 62900 Alajärvi). Ravintolaa pyörittävät Sanna ja Levent Bulbul. Sivu on staattinen, joten se toimii suoraan GitHub Pagesissa ilman build-vaihetta.

**Osoite julkaisun jälkeen:** https://erboiyprogamer-source.github.io/Sivu/

## Ominaisuudet

- **Avoinna nyt -tieto** – yläpalkki, info-kortti ja karttapopup laskevat Suomen ajan mukaan, onko ravintola auki ja milloin se sulkeutuu tai aukeaa.
- **Koko ruokalista** (68 tuotetta, oikeat hinnat) – kategoriavälilehdet, haku ja suodattimet (kebabliha, kana, aurajuusto, savuporo, merenelävät, tulinen, kasvis). Pizzoissa normaali- ja perhekoon hinnat.
- **Tilauslista** – hintaa klikkaamalla tuote menee listalle. Lista laskee summan, muistaa sisällön selaimessa ja sen voi kopioida. Itse tilaus tehdään soittamalla, ja siihen on suora soittonappi.
- **Fantasia-pizzarakentaja** – valitse neljä täytettä, ja pizza piirtyy ruudulle. Jos yhdistelmä on jo listalla (esim. kinkku + ananas + aurajuusto = Hawaiji), sivu kertoo sen.
- **Interaktiivinen kartta** (Leaflet + OpenStreetMap)
  - oma Albert-karttamerkki ja popup, jossa aukiolotieto
  - karttatyylit: kartta, tumma ja ilmakuva
  - *Kuinka kaukana olen?* – laskee käyttäjän sijainnista etäisyyden ja arvioidut ajat kävellen, pyörällä ja autolla
  - reittiohjeet Google Mapsiin, Apple Karttoihin ja Wazeen
  - lähellä olevat kohteet (Aalto-keskus, kirkko, kirjasto, Nelimarkka-museo) kävelyetäisyyksineen
  - rullazoomi kytkeytyy päälle vasta klikkauksesta, joten sivun vieritys ei jää karttaan jumiin
- Galleria, jossa kuvat aukeavat suuremmiksi, tarina-osio, suosikkikortit ja toimiva mobiilinäkymä.
- Hakukoneille Restaurant-tiedot (JSON-LD) ja jakokuva somea varten (Open Graph).

## Julkaisu GitHub Pagesissa

1. Mergeä PR `main`-haaraan.
2. Avaa repositoriosta **Settings → Pages**.
3. Valitse *Build and deployment* → **Source: Deploy from a branch** ja sen alta **Branch: `main`** ja kansio **`/ (root)`** → **Save**.
4. Sivu on hetken kuluttua osoitteessa https://erboiyprogamer-source.github.io/Sivu/

## Tiedostorakenne

```
index.html              sivun rakenne ja sisältö
favicon.svg             välilehden kuvake
assets/css/style.css    ulkoasu (värit :root-muuttujissa)
assets/js/menu-data.js  ruokalista ja hinnat
assets/js/app.js        toiminnot: aukiolo, menu, tilauslista, Fantasia, kartta
assets/img/             kuvat (WebP) ja jakokuva og-kuva.jpg
```

## Sisällön päivittäminen

- **Hinnat ja tuotteet:** `assets/js/menu-data.js`. Jokaisella tuotteella on `name`, `desc` ja `prices`. Pizzoilla hinnat ovat järjestyksessä `[normaali, perhe]`.
- **Aukioloajat:** `HOURS`-taulukko tiedoston `assets/js/app.js` alussa (maanantai ensin). Päivitä samat ajat myös `index.html`:n alatunnisteeseen ja JSON-LD-tietoihin.
- **Värit:** `assets/css/style.css`, `:root`-lohko (`--yellow`, `--red`, `--ink` …).

## Lähteet ja kuvat

- Ruokalista ja hinnat: ravintolan digitaalinen ruokalista (ruokalistat.mariapori.fi).
- Historia (avattu 1.4.2011, yrittäjät Sanna ja Levent Bulbul): Torstai-lehti 27.3.2021.
- Aukioloajat: ravintolan ovessa näkyvät ajat. Poikkeusaukiolot kannattaa tarkistaa Facebookista.
- Sijainti: OpenStreetMap (Pizzeria Albert, Järvikatu 3 B).
- Julkisivukuva: Pizzeria Albert / Aisapari ry (Outdooractive). Mainoskuva: Pizzeria Albert.
- Ruokakuvat ovat tunnelmakuvia Unsplashista (Unsplash License).
