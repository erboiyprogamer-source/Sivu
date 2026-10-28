/* Pizzeria Albertin ruokalista (lähde: ravintolan digitaalinen ruokalista, ruokalistat.mariapori.fi).
   Hinnat euroina. Pizzoilla kaksi kokoa: normaali ja perhe. */
window.ALBERT_MENU = [
  {
    id: "pizzat", name: "Pizzat",
    note: "Kaikkiin pizzoihin sisältyy tomaattikastike, juusto, oregano sekä pyydettäessä valkosipuli",
    sizes: ["Normaali", "Perhe"],
    items: [
      { name: "Kinkkupizza", desc: "kinkku", prices: [10.5, 26] },
      { name: "Jauhelihapizza", desc: "jauheliha", prices: [11.5, 28] },
      { name: "Margherita", desc: "tomaatti", prices: [10.5, 26] },
      { name: "Opera", desc: "kinkku, tonnikala", prices: [12, 29] },
      { name: "Tropicana", desc: "kinkku, ananas", prices: [12, 29] },
      { name: "Fransescana", desc: "kinkku, herkkusieni", prices: [12, 29] },
      { name: "Pepperoni", desc: "pepperonimakkara, tonnikala", prices: [12, 30] },
      { name: "Kanapizza", desc: "kana, ananas", prices: [12, 29] },
      { name: "Frutti di Mare", desc: "tonnikala, katkarapu, simpukka", prices: [12.5, 30] },
      { name: "Special Opera", desc: "kinkku, tonnikala, salami", prices: [12.5, 30] },
      { name: "Burgerpizza", desc: "jauheliha, cheddarjuusto, hampurilaiskastike, tuoresalaatti", prices: [12.9, 30] },
      { name: "Hawaiji", desc: "kinkku, ananas, aurajuusto", prices: [12.5, 30], badge: "Talon aurapizza" },
      { name: "Alla Pollo", desc: "kana, ananas, aurajuusto", prices: [12.5, 30] },
      { name: "Quatro Stagioni", desc: "kinkku, tonnikala, herkkusieni, katkarapu", prices: [13, 32] },
      { name: "O Sole Mio", desc: "salami, ananas, katkarapu, aurajuusto", prices: [13, 32] },
      { name: "Vegetariana", desc: "herkkusieni, paprika, oliivi, ananas", prices: [13, 32] },
      { name: "Mexicana", desc: "kinkku, sipuli, paprika, chili, salami", prices: [13.5, 33] },
      { name: "Fantasia", desc: "neljä täytettä valintasi mukaan", prices: [13.3, 33], badge: "Kokoa itse" },
      { name: "Albert Kebabpizza", desc: "tuplakebabliha, fetajuusto, salami, jalapeno, oliivi", prices: [14.3, 34], badge: "Talon nimikko" },
      { name: "Marmaris", desc: "tonnikala, katkarapu, ananas, aurajuusto", prices: [13, 32] },
      { name: "Alla Belize", desc: "salami, kinkku, herkkusieni, kananmuna", prices: [13, 32] },
      { name: "Olida", desc: "kinkku, katkarapu, tonnikala, ananas", prices: [13, 32] },
      { name: "Al Capone", desc: "kinkku, salami, pekoni, paprika, kananmuna", prices: [14, 34] },
      { name: "Julia", desc: "kinkku, ananas, jauheliha, aurajuusto", prices: [13, 32] },
      { name: "Fin Power", desc: "kinkku, jauheliha, salami, kebabliha", prices: [13.3, 33] },
      { name: "Alajärvipizza", desc: "kinkku, ananas, tuplakebabliha", prices: [13.3, 33], badge: "Paikallinen klassikko" },
      { name: "Calzone", desc: "(sisäänleivottu) jauheliha, kinkku, aurajuusto, sipuli, pekoni, tomaatti", prices: [13.5, 33] },
      { name: "Dillinger", desc: "salami, kinkku, jauheliha, sipuli", prices: [13, 33] },
      { name: "Revontuli", desc: "savuporo, kebabliha, ananas, aurajuusto", prices: [13.3, 33] },
      { name: "Frida", desc: "savuporo, salami, ananas, aurajuusto", prices: [13.3, 33] },
      { name: "Amore", desc: "savuporo, kinkku, salami, kebabliha", prices: [13.3, 33] },
      { name: "Istanbul", desc: "kebabliha, ananas, aurajuusto, dressing", prices: [13, 32] },
      { name: "Nefel", desc: "kebabliha, tomaatti-fetajuusto, sipuli, mozzarella", prices: [13, 32] },
      { name: "Erikoispizza", desc: "kebabliha, ranskalaisia, salaatti, tomaatti, talonkastike", prices: [13.3, 33], badge: "Suosituin" },
    ]
  },
  {
    id: "kebabit", name: "Kebabit",
    note: "",
    sizes: ["Normaali"],
    items: [
      { name: "Pitakebab", desc: "pitaleipä, kebabliha, salaatti, kurkku, tomaatti, sipuli, jalapeno, kastike", prices: [11.5] },
      { name: "Kebabsalaatti", desc: "kebabliha, salaatti, kurkku, tomaatti, sipuli, jalapeno, kastike", prices: [13.3] },
      { name: "Iskender kebab", desc: "pitaleipäpalat, kebabliha, jogurtti, salaatti, kurkku, tomaatti, sipuli, jalapeno, kastike", prices: [13.3] },
      { name: "Kebab riisi", desc: "riisi, kebabliha, salaatti, kurkku, tomaatti, sipuli, jalapeno, kastike", prices: [13.3] },
      { name: "Kebab ranskalaiset", desc: "ranskalaiset, kebabliha, salaatti, kurkku, tomaatti, sipuli, jalapeno, kastike", prices: [13.3] },
      { name: "Kebab lohkoperunat", desc: "lohkoperunat, kebabliha, salaatti, kurkku, tomaatti, sipuli, jalapeno, kastike", prices: [13.3] },
      { name: "Kebab kermaperunat", desc: "kermaperuna, kebabliha, salaatti, kurkku, tomaatti, sipuli, jalapeno, kastike", prices: [13.8] },
      { name: "Kebab valkosipuli-kermaperunat", desc: "valkosipuli-kermaperuna, kebabliha, salaatti, kurkku, tomaatti, sipuli, jalapeno, kastike", prices: [13.5] },
      { name: "Kebab juusto-kermaperunat", desc: "kebabliha, salaatti, kurkku, tomaatti, sipuli, jalapeno, kastike, juustokermaperunat (tavallinen juusto tai aurajuusto)", prices: [14] },
      { name: "Albert Special Kebab", desc: "riisi, lohkoperunat, kebabliha, salaatti, sipuli, kurkku, tomaatti, jalapeno, kastike", prices: [13.5] },
      { name: "Kebab Calzone", desc: "(sisäänleivottu) tuplakebabliha, juusto, aurajuusto, fetajuusto, sipuli, jalapeno - pyydettäessä kebabkastike", prices: [14.6] },
    ]
  },
  {
    id: "rullat", name: "Rullat",
    note: "",
    sizes: ["Normaali"],
    items: [
      { name: "Kana-annos", desc: "riisillä tai ranskalaisilla, currykastike, salaatti, sipuli, kurkku, tomaatti, jalapeno", prices: [13.8], badge: "Erikoisuus" },
      { name: "Rullakebab", desc: "uunituore leipä, kebabliha, salaatti, kurkku, sipuli, tomaatti, kastike", prices: [13.3], badge: "Suosikki" },
      { name: "Rullakebab juustolla", desc: "(tavallinen juusto tai aurajuusto) uunituore leipä, kebabliha, salaatti, kurkku, sipuli, tomaatti, kastike", prices: [13.8] },
      { name: "Kanarulla", desc: "uunituore leipä, pariloitu kana, ananas, aurajuusto, currymajoneesi, salaatti, suolakurkku, sipuli, kastike", prices: [13.9] },
      { name: "Kasvisrulla", desc: "uunituore leipä, paprika, ananas, fetajuusto, sipuli, jalapeno, kastike", prices: [13] },
      { name: "Albert Special Rulla", desc: "uunituore leipä, kebabliha, pariloitu kana, aurajuusto, salaatti, kurkku, sipuli, tomaatti, kastike", prices: [14.5] },
    ]
  },
  {
    id: "salaatit", name: "Salaatit",
    note: "",
    sizes: ["Normaali"],
    items: [
      { name: "Fetasalaatti", desc: "fetajuusto, tomaatti, kurkku, oliivi, ananas, paprika, salaattikastike", prices: [11] },
      { name: "Katkarapusalaatti", desc: "katkarapu, tomaatti, kurkku, sipuli, oliivi, ananas, paprika, salaattikastike", prices: [11] },
      { name: "Tonnikalasalaatti", desc: "tonnikala, tomaatti, kurkku, ananas, paprika, salaattikastike", prices: [11] },
      { name: "Kanasalaatti", desc: "kana, tomaatti, kurkku, oliivi, ananas, sipuli, salaattikastike", prices: [11] },
    ]
  },
  {
    id: "grilli", name: "Grilliannokset",
    note: "",
    sizes: ["Normaali"],
    items: [
      { name: "Sitä sun tätä", desc: "ranskalaiset, makkara, nakit, lihapullat, pekoni, kananmuna, salaatti", prices: [14.8] },
      { name: "Työmiehen lounas", desc: "pihvi (100g), kananmuna, 2 makkaraa, ranskalaiset", prices: [13] },
      { name: "Alajärviläinen", desc: "pihvi (100g), cheddarjuusto, ananas, kananmuna, ranskalaiset", prices: [12] },
      { name: "Albert Special", desc: "pihvi (100g), cheddarjuusto, ananas, kananmuna, pekoni, makkara", prices: [14] },
      { name: "Grilliannos", desc: "pihvi (100g), kananmuna, makkara, perunat", prices: [12] },
      { name: "Tuhtiannos", desc: "pihvi (100g), cheddarjuusto, kananmuna, ananas, lihapullat, makkara, perunat", prices: [14] },
      { name: "Nakit ranskalaisilla", desc: "nakit, ranskalaiset, salaatti", prices: [9.5] },
      { name: "Makkararanskalaiset", desc: "makkara, ranskalaiset, salaatti", prices: [9.5] },
    ]
  },
  {
    id: "juomat", name: "Juomat",
    note: "",
    sizes: ["Normaali"],
    items: [
      { name: "Limppari 0,3 l", desc: "", prices: [3.2] },
      { name: "Limppari 0,5 l", desc: "", prices: [4.6] },
      { name: "Limppari 1,5 l", desc: "", prices: [6.5] },
      { name: "Maito 0,5 l", desc: "", prices: [1] },
      { name: "Maito 1 l", desc: "", prices: [2] },
    ]
  }
];
