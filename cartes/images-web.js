/* Version autonome : les images des cartes et les logos viennent de TCGdex (images officielles, en français
   quand elles existent, sinon en anglais), au lieu des gros fichiers stockés dans Claude. */
(function () {
  if (window.claude && window.claude.autonome !== true) return;
  var SERIE = {
    "Soleil et Lune": "sm", "Épée et Bouclier": "swsh", "XY": "xy", "Kits du dresseur": "tk",
    "Diamant & Perle": "dp", "Méga-Évolution": "me", "Collection McDonald's": "mc", "Écarlate et Violet": "sv",
    "Noir & Blanc": "bw", "EX": "ex", "Neo": "neo", "e-cards": "ecard", "Base": "base",
    "HeartGold SoulSilver": "hgss", "Platine": "pl", "L'appel des Légendes": "hgss", "POP": "pop"
  };
  function base(id) {
    var st = typeof catSet === "function" ? catSet(id) : null;
    var s = st && SERIE[st.bloc];
    return s ? "https://assets.tcgdex.net/fr/" + s + "/" + id : "";
  }
  window.loadPack = function (id) { PKR[id] = { b: null, u: new Map() }; return Promise.resolve(PKR[id]); };
  window.packUrl = function () { return ""; };
  window.cardImg = function (id, c) {
    if (!c || c.o == null || c.o < 0) return "";
    var b = base(id);
    if (!b) return "";
    if (c.en) b = b.replace("/fr/", "/en/");
    return b + "/" + encodeURIComponent(c.n || c.k) + "/low.webp";
  };
  window.logoUrl = function (id) { var b = base(id); return b ? b + "/logo.webp" : ""; };
  /* Image absente en français : on essaie l'anglais, puis on la cache */
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (!img || img.tagName !== "IMG" || img.src.indexOf("assets.tcgdex.net") < 0) return;
    if (img.src.indexOf("/fr/") > 0) img.src = img.src.replace("/fr/", "/en/");
    else img.style.visibility = "hidden";
  }, true);
})();
