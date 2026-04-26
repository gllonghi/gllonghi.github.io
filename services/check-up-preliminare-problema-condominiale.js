// File creato per la mini app "Inquadramento del problema condominiale".
// Cambia qui l'indirizzo email destinatario della richiesta.
const CONDO_CHECKUP_CONFIG = {
  recipientEmail: 'info@longhiarchitettura.com',
  subject: 'Richiesta check-up preliminare problema condominiale'
};

const CONDO_CHECKUP_VALIDATION_MESSAGES = {
  problema_principale: 'Seleziona il problema principale.',
  descrizione_problema: 'Descrivi brevemente il problema.',
  ambito_problema: 'Indica quale ambito riguarda il problema.',
  peggioramento: 'Indica se il problema sta peggiorando.',
  rischi: 'Indica se ci sono rischi per persone o cose.',
  localita: 'Inserisci comune o localita.',
  obiettivo: 'Seleziona l’esito desiderato.',
  ruolo: 'Indica il tuo ruolo.',
  nome_cognome: 'Inserisci nome e cognome.',
  email: 'Inserisci il tuo indirizzo email.',
  telefono: 'Inserisci il tuo numero di telefono.',
  privacy: 'Devi autorizzare il trattamento dei dati per proseguire.'
};

const CONDO_FRAMING_BY_PROBLEM = {
  'Infiltrazioni': 'È probabile che serva distinguere la provenienza dell’acqua, l’estensione del danno e il rapporto tra proprietà privata e parti comuni.',
  'Tetto / copertura': 'È probabile che serva verificare impermeabilizzazione, dettagli di raccolta delle acque e stato generale della copertura.',
  'Facciata degradata': 'È probabile che serva valutare sicurezza, rischio di distacchi ed estensione del degrado sulle superfici comuni.',
  'Balconi': 'È probabile che serva distinguere difetti localizzati, responsabilità manutentive e presenza di un tema più esteso.',
  'Crepe / fessurazioni': 'È probabile che serva distinguere cavillature superficiali da movimenti che richiedono approfondimenti specifici.',
  'Umidità': 'È probabile che serva distinguere condensa, infiltrazione o umidità di risalita per impostare il percorso corretto.',
  'Parti comuni da riordinare': 'È probabile che serva chiarire priorità, stato manutentivo diffuso e criteri di intervento condivisi.',
  'Dubbio tecnico o normativo': 'È probabile che serva inquadrare il tema prima di definire i passaggi tecnici, amministrativi o assembleari.',
  'Altro': 'È probabile che serva una prima lettura tecnica per definire natura del problema, perimetro e percorso più corretto.'
};

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('condo-checkup-form');
  const steps = Array.from(document.querySelectorAll('.budget-step'));
  const progressFill = document.getElementById('condo-progress-fill');
  const progressBar = document.querySelector('.budget-app__progress-track[role="progressbar"]');
  const currentStepText = document.getElementById('condo-current-step');
  const progressItems = Array.from(document.querySelectorAll('.budget-app__progress-steps li'));
  if(!form || !steps.length || !progressFill || !progressBar || !currentStepText) return;

  let currentStepIndex = 0;

  function syncFieldValidationMessage(field){
    field.setCustomValidity('');

    if(field.validity.valueMissing){
      field.setCustomValidity(CONDO_CHECKUP_VALIDATION_MESSAGES[field.name] || 'Compila questo campo.');
      return;
    }

    if(field.validity.typeMismatch && field.type === 'email'){
      field.setCustomValidity('Inserisci un indirizzo email valido.');
    }
  }

  function getFieldsForStep(step){
    return Array.from(step.querySelectorAll('input, select, textarea')).filter(field => field.type !== 'hidden');
  }

  function validateStep(step){
    const fields = getFieldsForStep(step);
    fields.forEach(syncFieldValidationMessage);
    const invalidField = fields.find(field => !field.checkValidity());
    if(invalidField){
      invalidField.reportValidity();
      invalidField.focus();
      return false;
    }
    return true;
  }

  function updateProgress(){
    const stepNumber = currentStepIndex + 1;
    const percentage = (stepNumber / steps.length) * 100;

    currentStepText.textContent = String(stepNumber);
    progressFill.style.width = percentage + '%';
    progressBar.setAttribute('aria-valuenow', String(stepNumber));

    progressItems.forEach((item, index)=>{
      item.classList.toggle('is-active', index === currentStepIndex);
      item.classList.toggle('is-complete', index < currentStepIndex);
    });
  }

  function showStep(nextIndex){
    steps.forEach((step, index)=>{
      const isActive = index === nextIndex;
      step.classList.toggle('is-active', isActive);
      step.hidden = !isActive;
    });

    currentStepIndex = nextIndex;
    updateProgress();
  }

  function valueOf(name){
    const field = form.elements[name];
    if(!field) return '';
    if(field.type === 'checkbox'){
      return field.checked ? 'Sì' : 'No';
    }
    return field.value.trim();
  }

  function displayValue(name){
    return valueOf(name) || 'Non indicato';
  }

  function getFormData(){
    return {
      problemaPrincipale: displayValue('problema_principale'),
      descrizioneProblema: displayValue('descrizione_problema'),
      durataProblema: displayValue('durata_problema'),
      ambitoProblema: displayValue('ambito_problema'),
      peggioramento: displayValue('peggioramento'),
      rischi: displayValue('rischi'),
      danniVisibili: displayValue('danni_visibili'),
      interventiPregressi: displayValue('interventi_pregressi'),
      tipologiaEdificio: displayValue('tipologia_edificio'),
      localita: displayValue('localita'),
      numeroUnita: displayValue('numero_unita'),
      difficoltaDecisionali: displayValue('difficolta_decisionali'),
      obiettivo: displayValue('obiettivo'),
      documentazione: displayValue('documentazione'),
      noteAggiuntive: displayValue('note_aggiuntive'),
      ruolo: displayValue('ruolo'),
      nomeCognome: displayValue('nome_cognome'),
      email: displayValue('email'),
      telefono: displayValue('telefono'),
      privacy: valueOf('privacy') === 'Sì'
    };
  }

  function classifyUrgency(data){
    const scopeWide = data.ambitoProblema === 'Più unità' || data.ambitoProblema === 'Parti comuni';
    const damagePresent = data.danniVisibili === 'Sì, lievi' || data.danniVisibili === 'Sì, evidenti';
    const durationExtended = data.durataProblema === 'Da alcuni mesi' || data.durataProblema === 'Da molto tempo';
    const uncertainCount = [
      data.durataProblema,
      data.ambitoProblema,
      data.peggioramento,
      data.rischi,
      data.danniVisibili
    ].filter(value => value === 'Non so' || value === 'Non è chiaro' || value === 'Non indicato').length;

    if(data.rischi === 'Sì'){
      return 'Priorità alta';
    }

    if(data.peggioramento === 'Sì, rapidamente'){
      if(damagePresent || scopeWide){
        return 'Priorità alta';
      }
      return 'Approfondimento consigliato';
    }

    if(durationExtended && scopeWide){
      return 'Approfondimento consigliato';
    }

    if(uncertainCount >= 2){
      return 'Approfondimento consigliato';
    }

    if(
      data.rischi === 'No' &&
      data.peggioramento === 'No' &&
      (data.danniVisibili === 'No' || data.danniVisibili === 'Sì, lievi' || data.danniVisibili === 'Non indicato') &&
      data.ambitoProblema === 'Una sola unità'
    ){
      return 'Monitoraggio';
    }

    return 'Approfondimento consigliato';
  }

  function getFraming(data){
    return CONDO_FRAMING_BY_PROBLEM[data.problemaPrincipale] || CONDO_FRAMING_BY_PROBLEM.Altro;
  }

  function getRecommendedNextStep(urgency, data){
    if(urgency === 'Monitoraggio'){
      if(data.obiettivo === 'Organizzare un sopralluogo'){
        return 'Sopralluogo tecnico preliminare';
      }
      if(data.obiettivo === 'Preparare una relazione preliminare'){
        return 'Relazione tecnica preliminare';
      }
      if(data.obiettivo === 'Impostare il percorso tecnico'){
        return 'Impostazione del percorso di intervento';
      }
      return 'Monitoraggio e raccolta elementi';
    }

    if(urgency === 'Approfondimento consigliato'){
      if(data.interventiPregressi === 'Sì' || data.obiettivo === 'Preparare una relazione preliminare'){
        return 'Relazione tecnica preliminare';
      }
      if(data.obiettivo === 'Impostare il percorso tecnico'){
        return 'Impostazione del percorso di intervento';
      }
      return 'Sopralluogo tecnico preliminare';
    }

    if(data.obiettivo === 'Impostare il percorso tecnico' || data.interventiPregressi === 'Sì' || data.difficoltaDecisionali === 'Sì'){
      return 'Impostazione del percorso di intervento';
    }
    return 'Relazione tecnica preliminare';
  }

  function buildSummaryCopy(urgency, framing, data){
    const openingByUrgency = {
      'Monitoraggio': 'Dalle informazioni inserite emerge una situazione che, allo stato attuale, sembra poter essere monitorata con ordine senza essere trattata come marginale.',
      'Approfondimento consigliato': 'Dalle informazioni raccolte emerge una criticità che merita un approfondimento tecnico preliminare per essere inquadrata correttamente.',
      'Priorità alta': 'Dalle informazioni raccolte emerge una criticità che richiede attenzione rapida e un inquadramento tecnico tempestivo.'
    };

    const additions = [];
    if(data.interventiPregressi === 'Sì'){
      additions.push('Sono già presenti tentativi di intervento non risolutivi.');
    }
    if(data.difficoltaDecisionali === 'Sì'){
      additions.push('Un chiarimento tecnico iniziale può aiutare anche a ordinare il percorso decisionale condominiale.');
    }

    return [openingByUrgency[urgency], framing, ...additions].join(' ');
  }

  function buildSummary(data){
    const urgency = classifyUrgency(data);
    const framing = getFraming(data);
    const nextStep = getRecommendedNextStep(urgency, data);

    return {
      urgency,
      framing,
      nextStep,
      summaryCopy: buildSummaryCopy(urgency, framing, data)
    };
  }

  // Aggiorna questo blocco se in futuro vuoi cambiare etichette o formato dell'email.
  function buildEmailBody(data){
    return [
      'Buongiorno,',
      '',
      'desidero richiedere un primo inquadramento tecnico preliminare per un problema condominiale.',
      '',
      'TIPO DI PROBLEMA',
      '- Problema principale: ' + data.problemaPrincipale,
      '- Descrizione: ' + data.descrizioneProblema,
      '- Durata: ' + data.durataProblema,
      '',
      'ESTENSIONE E URGENZA',
      '- Ambito: ' + data.ambitoProblema,
      '- Peggioramento: ' + data.peggioramento,
      '- Rischi: ' + data.rischi,
      '- Danni visibili: ' + data.danniVisibili,
      '',
      'STORIA E CONTESTO',
      '- Interventi già tentati: ' + data.interventiPregressi,
      '- Tipologia edificio: ' + data.tipologiaEdificio,
      '- Località: ' + data.localita,
      '- Numero unità: ' + data.numeroUnita,
      '- Difficoltà decisionali / assembleari: ' + data.difficoltaDecisionali,
      '',
      'ESITO DESIDERATO',
      '- Obiettivo: ' + data.obiettivo,
      '- Foto o documentazione: ' + data.documentazione,
      '- Note: ' + data.noteAggiuntive,
      '',
      'CONTATTO',
      '- Ruolo: ' + data.ruolo,
      '- Nome: ' + data.nomeCognome,
      '- Email: ' + data.email,
      '- Telefono: ' + data.telefono,
      '- Privacy e contatto: Autorizzo il trattamento dei dati inviati per essere ricontattato in merito alla richiesta.',
      '',
      'Grazie.'
    ].join('\n');
  }

  form.addEventListener('click', (event)=>{
    const actionButton = event.target.closest('[data-action]');
    if(!actionButton) return;

    if(actionButton.dataset.action === 'next'){
      if(!validateStep(steps[currentStepIndex])) return;
      showStep(Math.min(currentStepIndex + 1, steps.length - 1));
    }

    if(actionButton.dataset.action === 'prev'){
      showStep(Math.max(currentStepIndex - 1, 0));
    }
  });

  form.addEventListener('keydown', (event)=>{
    if(event.key !== 'Enter' || event.target.tagName === 'TEXTAREA') return;
    if(currentStepIndex >= steps.length - 1) return;

    event.preventDefault();
    if(!validateStep(steps[currentStepIndex])) return;
    showStep(Math.min(currentStepIndex + 1, steps.length - 1));
  });

  form.addEventListener('submit', (event)=>{
    event.preventDefault();
    if(!validateStep(steps[currentStepIndex])) return;

    const formData = getFormData();
    const body = buildEmailBody(formData);
    const mailto = 'mailto:' + CONDO_CHECKUP_CONFIG.recipientEmail
      + '?subject=' + encodeURIComponent(CONDO_CHECKUP_CONFIG.subject)
      + '&body=' + encodeURIComponent(body);

    window.location.href = mailto;
  });

  form.querySelectorAll('input, select, textarea').forEach(field=>{
    const eventName = field.tagName === 'SELECT' || field.type === 'checkbox' ? 'change' : 'input';
    field.addEventListener(eventName, ()=> syncFieldValidationMessage(field));
  });

  updateProgress();
});
