// File creato per la mini app "Valutazione dell’operazione immobiliare".
// Cambia qui l'indirizzo email destinatario della richiesta.
const INVESTOR_APP_CONFIG = {
  recipientEmail: 'giulialonghi.architetto@gmail.com',
  subject: 'Richiesta valutazione preliminare potenziale immobile'
};

const INVESTOR_APP_VALIDATION_MESSAGES = {
  tipologia_immobile: 'Seleziona la tipologia di immobile.',
  metratura_indicativa: 'Inserisci la metratura indicativa.',
  localita: 'Inserisci comune o localita.',
  stato_attuale: 'Seleziona lo stato attuale dell’immobile.',
  profilo_richiedente: 'Indica il tuo ruolo.',
  obiettivo_principale: 'Seleziona l’obiettivo principale in questa fase.',
  dubbio_principale: 'Seleziona il dubbio principale.',
  esito_desiderato: 'Seleziona cosa desideri in questa fase.',
  nome_cognome: 'Inserisci nome e cognome.',
  email: 'Inserisci il tuo indirizzo email.',
  telefono: 'Inserisci il tuo numero di telefono.',
  privacy: 'Devi autorizzare il trattamento dei dati per proseguire.'
};

const INVESTOR_FRAMING_BY_TYPE = {
  'Appartamento': 'È probabile che serva capire se l’incremento di valore giustifichi l’intervento e quali opere abbiano l’impatto più efficace.',
  'Casa indipendente': 'È probabile che serva valutare estensione delle opere, involucro, impianti e ordine di grandezza dell’investimento.',
  'Rustico / immobile da recuperare': 'È probabile che serva verificare recuperabilità reale, vincoli ed esposizione ai costi prima di immaginare usi o valorizzazioni.',
  'Fabbricato parzialmente incompleto': 'È probabile che serva chiarire condizioni tecniche, amministrative ed economiche prima di riattivare il progetto.',
  'Immobile a reddito da ripensare': 'È probabile che serva collegare riposizionamento, trasformazione e tenuta economica dell’operazione.',
  'Altro': 'È probabile che serva una prima lettura tecnico-strategica per chiarire potenziale, limiti e priorità dell’immobile.'
};

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('investor-evaluation-form');
  const steps = Array.from(document.querySelectorAll('.budget-step'));
  const progressFill = document.getElementById('investor-progress-fill');
  const progressBar = document.querySelector('.budget-app__progress-track[role="progressbar"]');
  const currentStepText = document.getElementById('investor-current-step');
  const progressItems = Array.from(document.querySelectorAll('.budget-app__progress-steps li'));
  if(!form || !steps.length || !progressFill || !progressBar || !currentStepText) return;

  let currentStepIndex = 0;

  function syncFieldValidationMessage(field){
    field.setCustomValidity('');

    if(field.validity.valueMissing){
      field.setCustomValidity(INVESTOR_APP_VALIDATION_MESSAGES[field.name] || 'Compila questo campo.');
      return;
    }

    if(field.validity.typeMismatch && field.type === 'email'){
      field.setCustomValidity('Inserisci un indirizzo email valido.');
      return;
    }

    if((field.validity.badInput || field.validity.rangeUnderflow) && field.type === 'number'){
      field.setCustomValidity('Inserisci una metratura valida.');
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
      tipologiaImmobile: displayValue('tipologia_immobile'),
      metraturaIndicativa: displayValue('metratura_indicativa'),
      localita: displayValue('localita'),
      statoAttuale: displayValue('stato_attuale'),
      tempoInattivita: displayValue('tempo_inattivita'),
      profiloRichiedente: displayValue('profilo_richiedente'),
      obiettivoPrincipale: displayValue('obiettivo_principale'),
      situazioneAttuale: displayValue('situazione_attuale'),
      proprieta: displayValue('assetto_proprieta'),
      dubbioPrincipale: displayValue('dubbio_principale'),
      vincoli: displayValue('vincoli_contesto'),
      documentazione: displayValue('documentazione_disponibile'),
      budgetOrientativo: displayValue('budget_orientativo'),
      criticita: displayValue('criticita_note'),
      esitoDesiderato: displayValue('esito_desiderato'),
      tempistiche: displayValue('tempistiche'),
      materialeUtile: displayValue('materiale_utile'),
      noteAggiuntive: displayValue('note_aggiuntive'),
      nomeCognome: displayValue('nome_cognome'),
      email: displayValue('email'),
      telefono: displayValue('telefono')
    };
  }

  function classifyProfile(data){
    const complexType = data.tipologiaImmobile === 'Rustico / immobile da recuperare' || data.tipologiaImmobile === 'Fabbricato parzialmente incompleto';
    const complexState = data.statoAttuale === 'Rustico / non finito' || data.statoAttuale === 'In disuso da tempo' || data.statoAttuale === 'Da ristrutturare integralmente';
    const simpleState = data.statoAttuale === 'Abitabile ma datato' || data.statoAttuale === 'Da rinnovare';
    const ownershipComplex = data.proprieta === 'Condivisa tra più persone' || data.proprieta === 'Non so / situazione da chiarire';
    const docsPartial = data.documentazione === 'Solo parte della documentazione';
    const docsWeak = docsPartial || data.documentazione === 'Quasi nulla' || data.documentazione === 'Non so';
    const docsVeryWeak = data.documentazione === 'Quasi nulla' || data.documentazione === 'Non so' || data.documentazione === 'Non indicato';
    const constraintsKnown = data.vincoli === 'Centro storico' || data.vincoli === 'Vincolo paesaggistico' || data.vincoli === 'Immobile rurale / contesto particolare';
    const constraintsUnclear = data.vincoli === 'Non so';
    const criticalModerate = data.criticita === 'Sì, moderate';
    const criticalRelevant = data.criticita === 'Sì, rilevanti';
    const simpleDocs = data.documentazione === 'Planimetrie e documenti principali';
    const simpleOwnership = data.proprieta === 'Di un solo proprietario';
    const simpleConstraints = data.vincoli === 'Nessuno';
    const inheritedOrBlocked = data.profiloRichiedente === 'Erede' || data.situazioneAttuale === 'Immobile appena acquisito / ereditato' || data.situazioneAttuale === 'Immobile fermo da tempo' || data.situazioneAttuale === 'Intervento già pensato ma mai partito' || data.situazioneAttuale === 'Intervento iniziato e poi bloccato';
    const investmentOriented = data.profiloRichiedente === 'Investitore' || data.obiettivoPrincipale === 'Valutare un’operazione di investimento';
    const inactiveLong = data.tempoInattivita === 'Da 1 a 3 anni' || data.tempoInattivita === 'Da più di 3 anni';
    const uncertainCount = [
      data.tempoInattivita,
      data.proprieta,
      data.vincoli,
      data.documentazione,
      data.criticita
    ].filter(value => value === 'Non so' || value === 'Non so / situazione da chiarire' || value === 'Non indicato').length;

    if((complexType || complexState) && (criticalRelevant || docsVeryWeak || constraintsUnclear || ownershipComplex)){
      return 'Recupero complesso';
    }

    if(criticalRelevant && (docsWeak || constraintsKnown || constraintsUnclear || ownershipComplex)){
      return 'Recupero complesso';
    }

    if(ownershipComplex || docsWeak || constraintsKnown || constraintsUnclear || criticalModerate || criticalRelevant || uncertainCount >= 3){
      return 'Caso da verificare con attenzione';
    }

    if(simpleState && simpleDocs && simpleOwnership && simpleConstraints && !criticalModerate && !criticalRelevant){
      return 'Valorizzazione lineare';
    }

    if(inactiveLong || inheritedOrBlocked || investmentOriented || uncertainCount >= 1 || data.statoAttuale === 'In disuso da tempo'){
      return 'Potenziale interessante da approfondire';
    }

    if(simpleState){
      return 'Valorizzazione lineare';
    }

    return 'Potenziale interessante da approfondire';
  }

  function getFraming(data){
    const sentences = [INVESTOR_FRAMING_BY_TYPE[data.tipologiaImmobile] || INVESTOR_FRAMING_BY_TYPE.Altro];

    if(data.obiettivoPrincipale === 'Capire se conviene venderlo così com’è' || data.esitoDesiderato === 'Capire se è meglio non intervenire subito'){
      sentences.push('Il nodo centrale sembra capire il rapporto tra costo di intervento, tempi e convenienza di una vendita nello stato di fatto.');
    } else if(data.profiloRichiedente === 'Investitore' || data.obiettivoPrincipale === 'Valutare un’operazione di investimento'){
      sentences.push('Sarà utile collegare fattibilità tecnica, costo di trasformazione e possibile scenario di valore o uscita.');
    } else {
      const doubtMap = {
        'Costi di recupero': 'Il punto chiave sembra misurare l’ordine di grandezza dei costi rispetto al risultato ottenibile.',
        'Fattibilità tecnica': 'Il punto chiave sembra verificare margini reali di trasformazione e recupero.',
        'Vincoli o pratiche': 'Il punto chiave sembra chiarire vincoli, pratiche e percorso autorizzativo.',
        'Tempi dell’operazione': 'Il punto chiave sembra capire se tempi tecnici e decisionali siano compatibili con l’obiettivo.',
        'Valore finale dell’immobile': 'Il punto chiave sembra misurare il valore finale plausibile dopo l’intervento.',
        'Convenienza complessiva': 'Il punto chiave sembra confrontare impegno economico, tempi e risultato atteso.',
        'Altro': 'Il punto chiave sembra definire quali informazioni servano per leggere correttamente l’operazione.'
      };
      sentences.push(doubtMap[data.dubbioPrincipale] || doubtMap.Altro);
    }

    if(data.profiloRichiedente === 'Erede' || data.proprieta === 'Condivisa tra più persone'){
      sentences.push('Prima di definire una strategia conviene anche ordinare assetto proprietario, documentazione e percorso decisionale.');
    }

    return sentences.join(' ');
  }

  function getRecommendedNextStep(profile, data){
    if(data.obiettivoPrincipale === 'Capire se conviene venderlo così com’è' || data.esitoDesiderato === 'Capire se è meglio non intervenire subito'){
      return 'Valutazione per vendita nello stato di fatto';
    }

    if(profile === 'Recupero complesso'){
      return 'Studio di fattibilità e valorizzazione';
    }

    if(profile === 'Caso da verificare con attenzione'){
      if(data.esitoDesiderato === 'Capire se procedere con un sopralluogo'){
        return 'Sopralluogo preliminare';
      }
      return 'Studio di fattibilità e valorizzazione';
    }

    if(profile === 'Potenziale interessante da approfondire'){
      if(data.esitoDesiderato === 'Capire se serve uno studio di fattibilità'){
        return 'Studio di fattibilità e valorizzazione';
      }
      return 'Sopralluogo preliminare';
    }

    if(data.esitoDesiderato === 'Capire se procedere con un sopralluogo'){
      return 'Sopralluogo preliminare';
    }

    return 'Prima lettura tecnico-strategica';
  }

  function buildSummaryCopy(profile, framing, data){
    const openingByProfile = {
      'Valorizzazione lineare': 'Dalle informazioni inserite emerge un caso che sembra relativamente ordinato e leggibile per una prima valutazione tecnico-strategica.',
      'Potenziale interessante da approfondire': 'Dalle informazioni raccolte emerge un immobile con potenzialità interessanti, ma che richiede un primo approfondimento per essere letto correttamente.',
      'Caso da verificare con attenzione': 'Dalle informazioni raccolte emerge un caso che richiede una verifica attenta prima di assumere decisioni operative o economiche.',
      'Recupero complesso': 'Dalle informazioni raccolte emerge un caso complesso, per cui conviene chiarire fattibilità, vincoli e tenuta economica prima di immaginare scenari di valorizzazione.'
    };

    const additions = [];
    if(data.documentazione === 'Quasi nulla' || data.documentazione === 'Non so'){
      additions.push('La documentazione disponibile oggi appare ancora parziale o poco leggibile.');
    }
    if(data.proprieta === 'Condivisa tra più persone'){
      additions.push('L’assetto proprietario condiviso suggerisce di ordinare anche il percorso decisionale.');
    }

    return [openingByProfile[profile], framing, ...additions].join(' ');
  }

  function buildSummary(data){
    const profile = classifyProfile(data);
    const framing = getFraming(data);
    const nextStep = getRecommendedNextStep(profile, data);

    return {
      profile,
      framing,
      nextStep,
      summaryCopy: buildSummaryCopy(profile, framing, data)
    };
  }

  // Aggiorna questo blocco se in futuro vuoi cambiare etichette o formato dell'email.
  function buildEmailBody(data){
    return [
      'Buongiorno,',
      '',
      'desidero richiedere una prima valutazione tecnico-strategica preliminare relativa a un immobile da recuperare, valorizzare o valutare per una possibile operazione.',
      '',
      'IMMOBILE',
      '- Tipologia: ' + data.tipologiaImmobile,
      '- Metratura: ' + data.metraturaIndicativa,
      '- Località: ' + data.localita,
      '- Stato attuale: ' + data.statoAttuale,
      '- Tempo di inattività / scarso utilizzo: ' + data.tempoInattivita,
      '',
      'PROPRIETÀ E OBIETTIVO',
      '- Ruolo: ' + data.profiloRichiedente,
      '- Obiettivo principale: ' + data.obiettivoPrincipale,
      '- Situazione attuale: ' + data.situazioneAttuale,
      '- Proprietà: ' + data.proprieta,
      '',
      'POTENZIALE E CRITICITÀ',
      '- Dubbio principale: ' + data.dubbioPrincipale,
      '- Vincoli / contesto: ' + data.vincoli,
      '- Documentazione disponibile: ' + data.documentazione,
      '- Budget orientativo: ' + data.budgetOrientativo,
      '- Criticità note: ' + data.criticita,
      '',
      'ESITO DESIDERATO',
      '- Obiettivo di questa fase: ' + data.esitoDesiderato,
      '- Tempistiche: ' + data.tempistiche,
      '- Foto o materiale: ' + data.materialeUtile,
      '- Note: ' + data.noteAggiuntive,
      '',
      'CONTATTO',
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
    const mailto = 'mailto:' + INVESTOR_APP_CONFIG.recipientEmail
      + '?subject=' + encodeURIComponent(INVESTOR_APP_CONFIG.subject)
      + '&body=' + encodeURIComponent(body);

    window.location.href = mailto;
  });

  form.querySelectorAll('input, select, textarea').forEach(field=>{
    const eventName = field.tagName === 'SELECT' || field.type === 'checkbox' ? 'change' : 'input';
    field.addEventListener(eventName, ()=> syncFieldValidationMessage(field));
  });

  updateProgress();
});
