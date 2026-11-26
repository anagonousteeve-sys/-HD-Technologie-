(function () {
  var form = document.getElementById('devis-form');
  if (!form) return;

  // Numéro de secours : celui du bouton WhatsApp de l'en-tête
  var NUMERO_SECOURS = '2290166227171';

  function numeroWhatsApp() {
    var carte = document.getElementById('contact-whatsapp');
    var lien = carte && carte.getAttribute('href');
    var m = lien && lien.match(/wa\.me\/(\d+)/);
    return m ? m[1] : NUMERO_SECOURS;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var d = new FormData(form);
    var message =
      'Bonjour HD TECHNOLOGIE, je souhaite un devis.\n\n' +
      'Nom : ' + d.get('nom').trim() + '\n' +
      'Téléphone : ' + d.get('telephone').trim() + '\n' +
      'Service : ' + d.get('service') + '\n' +
      'Ville : ' + d.get('ville') + '\n' +
      'Besoin : ' + d.get('besoin').trim();

    var url = 'https://wa.me/' + numeroWhatsApp() + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank', 'noopener');
  });
})();