/* Version autonome (sans Claude) : la collection est enregistrée sur ce téléphone uniquement.
   Remplace la base de données de Claude par le stockage du navigateur, avec la même façon de l'utiliser. */
(function () {
  if (window.claude) return;
  var P = "mc:";
  var abonnes = new Set();
  function lire(chemin) { try { var v = localStorage.getItem(P + chemin); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function parent(chemin) { return chemin.slice(0, chemin.lastIndexOf("/")); }
  function instantDoc(chemin) {
    var d = lire(chemin);
    return { id: chemin.split("/").pop(), exists: d != null, data: function () { return d; }, metadata: { fromCache: false } };
  }
  function docsDe(collection) {
    var pre = P + collection + "/", out = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(pre) === 0) {
        var reste = k.slice(pre.length);
        if (reste.indexOf("/") < 0) {
          (function (id, d) { out.push({ id: id, exists: true, data: function () { return d; } }); })(reste, JSON.parse(localStorage.getItem(k)));
        }
      }
    }
    return out;
  }
  function instantCollection(collection) {
    var docs = docsDe(collection);
    return { docs: docs, size: docs.length, empty: !docs.length, metadata: { fromCache: false },
             forEach: function (f) { docs.forEach(f); } };
  }
  function prevenir(chemin) {
    setTimeout(function () {
      abonnes.forEach(function (a) {
        try {
          if (a.type === "doc" && a.chemin === chemin) a.cb(instantDoc(chemin));
          if (a.type === "col" && a.chemin === parent(chemin)) a.cb(instantCollection(a.chemin));
        } catch (e) { console.error(e); }
      });
    }, 0);
  }
  function ecrire(chemin, valeur) {
    try {
      if (valeur == null) localStorage.removeItem(P + chemin);
      else localStorage.setItem(P + chemin, JSON.stringify(valeur));
    } catch (e) { throw { code: "quota", msg: "Le téléphone n'a plus de place pour enregistrer la collection." }; }
    prevenir(chemin);
  }
  var db = {
    doc: function (chemin) {
      return {
        get: function () { return Promise.resolve(instantDoc(chemin)); },
        set: function (v, o) {
          ecrire(chemin, o && o.merge ? Object.assign({}, lire(chemin) || {}, v) : v); return Promise.resolve();
        },
        update: function (v) { ecrire(chemin, Object.assign({}, lire(chemin) || {}, v)); return Promise.resolve(); },
        delete: function () { ecrire(chemin, null); return Promise.resolve(); },
        onSnapshot: function (cb) {
          var a = { type: "doc", chemin: chemin, cb: cb }; abonnes.add(a);
          setTimeout(function () { cb(instantDoc(chemin)); }, 0);
          return function () { abonnes.delete(a); };
        }
      };
    },
    collection: function (chemin) {
      return {
        get: function () { return Promise.resolve(instantCollection(chemin)); },
        onSnapshot: function (cb) {
          var a = { type: "col", chemin: chemin, cb: cb }; abonnes.add(a);
          setTimeout(function () { cb(instantCollection(chemin)); }, 0);
          return function () { abonnes.delete(a); };
        },
        doc: function (id) { return db.doc(chemin + "/" + (id || Math.random().toString(36).slice(2, 12))); }
      };
    }
  };
  window.claude = { autonome: true, use: function (nom) { return Promise.resolve(nom === "db" ? db : null); } };
  /* Pour que l'appli s'installe sur l'écran d'accueil et marche sans réseau */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
