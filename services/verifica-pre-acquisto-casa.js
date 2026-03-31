// File creato per la mini app "Verifica pre-acquisto casa".
// Cambia qui l'indirizzo email destinatario della richiesta.
const HOME_FIT_APP_CONFIG = {
  recipientEmail: 'giulialonghi.architetto@gmail.com',
  subject: 'Richiesta verifica pre-acquisto casa'
};

const HOME_FIT_APP_VALIDATION_MESSAGES = {
  tipologia_immobile: 'Seleziona la tipologia di immobile.',
  metratura_indicativa: 'Inserisci la metratura indicativa.',
  localita_comune: 'Inserisci localita o comune.',
  stato_attuale: 'Seleziona lo stato attuale dell’immobile.',
  situazione_acquisto: 'Seleziona la situazione di acquisto.',
  finalita_acquisto: 'Seleziona la finalita dell’acquisto.',
  dubbio_principale: 'Seleziona il dubbio principale.',
  esigenza_spazi: 'Indica quanto l’immobile sembra compatibile con le tue esigenze.',
  priorita_abitative: 'Seleziona la priorita abitativa principale.',
  segnali_criticita: 'Indica il livello di criticita percepito.',
  esito_desiderato: 'Seleziona l’esito desiderato di questa verifica.',
  nome_cognome: 'Inserisci nome e cognome.',
  email: 'Inserisci il tuo indirizzo email.',
  telefono: 'Inserisci il tuo numero di telefono.',
  privacy: 'Devi autorizzare il trattamento dei dati per proseguire.'
};

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('home-fit-form');
  const steps = Array.from(form ? form.querySelectorAll('.budget-step') : []);
  const progressFill = document.getElementById('home-fit-progress-fill');
  const progressBar = document.querySelector('.budget-app__progress-track[role="progressbar"]');
  const currentStepText = document.getElementById('home-fit-current-step');
  const progressItems = Array.from(document.querySelectorAll('.budget-app__progress-steps li'));
  if(!form || !steps.length || !progressFill || !progressBar || !currentStepText) return;

  let currentStepIndex = 0;

  function syncFieldValidationMessage(field){
    field.setCustomValidity('');

    if(field.validity.valueMissing){
      field.setCustomValidity(HOME_FIT_APP_VALIDATION_MESSAGES[field.name] || 'Compila questo campo.');
      return;
    }

    if(field.validity.typeMismatch && field.type === 'email'){
      field.setCustomValidity('Inserisci un indirizzo email valido.');
      return;
    }

    if(field.validity.typeMismatch && field.type === 'url'){
      field.setCustomValidity('Inserisci un link valido.');
      return;
    }

    if((field.validity.badInput || field.validity.rangeUnderflow) && field.type === 'number'){
      field.setCustomValidity(field.name === 'prezzo_richiesto' ? 'Inserisci un importo valido.' : 'Inserisci una metratura valida.');
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

  function displayCurrencyValue(name){
    const value = valueOf(name);
    return value ? value + ' €' : 'Non indicato';
  }

  function getFormData(){
    return {
      tipologiaImmobile: displayValue('tipologia_immobile'),
      metraturaIndicativa: displayValue('metratura_indicativa'),
      localitaComune: displayValue('localita_comune'),
      prezzoRichiesto: displayCurrencyValue('prezzo_richiesto'),
      statoAttuale: displayValue('stato_attuale'),
      situazioneAcquisto: displayValue('situazione_acquisto'),
      finalitaAcquisto: displayValue('finalita_acquisto'),
      dubbioPrincipale: displayValue('dubbio_principale'),
      tempisticheDecisionali: displayValue('tempistiche_decisionali'),
      composizioneNucleo: displayValue('composizione_nucleo'),
      esigenzaSpazi: displayValue('esigenza_spazi'),
      prioritaAbitative: displayValue('priorita_abitative'),
      accessoCriticitaDistributive: displayValue('accesso_criticita_distributive'),
      documentazioneDisponibile: displayValue('documentazione_disponibile'),
      segnaliCriticita: displayValue('segnali_criticita'),
      vincoliContesto: displayValue('vincoli_contesto'),
      esitoDesiderato: displayValue('esito_desiderato'),
      linkAnnuncio: displayValue('link_annuncio'),
      noteAggiuntive: displayValue('note_aggiuntive'),
      nomeCognome: displayValue('nome_cognome'),
      email: displayValue('email'),
      telefono: displayValue('telefono')
    };
  }

  // La classificazione resta volutamente sintetica: serve solo a contestualizzare la richiesta nella mail finale.
  function classifyProfile(data){
    const stateNeedsMajorWork = data.statoAttuale === 'Da ristrutturare integralmente';
    const stateManageable = data.statoAttuale === 'Abitabile' || data.statoAttuale === 'Abitabile ma datato' || data.statoAttuale === 'Da rinnovare';
    const spacesAlreadyFit = data.esigenzaSpazi === 'La casa sembra già compatibile';
    const spacesNeedSmallChanges = data.esigenzaSpazi === 'Servirebbero piccole modifiche';
    const spacesNeedRelevantChanges = data.esigenzaSpazi === 'Servirebbe una ridistribuzione significativa' || data.esigenzaSpazi === 'Non so capirlo da solo';
    const criticalKnown = data.segnaliCriticita === 'Criticità evidenti o interventi importanti';
    const criticalUnclear = data.segnaliCriticita === 'Alcuni dubbi tecnici o distributivi' || data.segnaliCriticita === 'Non so valutarlo';
    const docsSolid = data.documentazioneDisponibile === 'Ho planimetria e materiale principale';
    const docsWeak = data.documentazioneDisponibile === 'Ho solo parte del materiale' || data.documentazioneDisponibile === 'Non ho ancora documentazione' || data.documentazioneDisponibile === 'Non so' || data.documentazioneDisponibile === 'Non indicato';
    const constraintsKnown = data.vincoliContesto === 'Centro storico' || data.vincoliContesto === 'Vincolo paesaggistico' || data.vincoliContesto === 'Contesto condominiale delicato';
    const constraintsUnclear = data.vincoliContesto === 'Non so' || data.vincoliContesto === 'Non indicato';
    const wantsPriceCheck = data.esitoDesiderato === 'Capire se il prezzo ha senso rispetto al potenziale';
    const wantsStopDecision = data.esitoDesiderato === 'Capire se è meglio lasciar perdere';
    const wantsCompatibilityCheck = data.esitoDesiderato === 'Capire se l’immobile è compatibile con le mie esigenze';
    const wantsWorkDepth = data.esitoDesiderato === 'Capire se servono lavori importanti';

    if(criticalKnown && (stateNeedsMajorWork || spacesNeedRelevantChanges || docsWeak || constraintsKnown || constraintsUnclear || wantsPriceCheck || wantsStopDecision)){
      return 'Acquisto da valutare con attenzione';
    }

    if((stateNeedsMajorWork || spacesNeedRelevantChanges) && (criticalUnclear || docsWeak || constraintsKnown || constraintsUnclear || wantsCompatibilityCheck || wantsWorkDepth)){
      return 'Potenziale interessante ma con trasformazione rilevante';
    }

    if(stateManageable && (spacesAlreadyFit || spacesNeedSmallChanges) && data.segnaliCriticita === 'Nessuna criticità evidente' && docsSolid && data.vincoliContesto === 'Nessuno'){
      return 'Immobile promettente da approfondire';
    }

    return 'Compatibilità da verificare';
  }

  function getFraming(profile, data){
    const introByProfile = {
      'Compatibilità da verificare': 'Dalle informazioni inserite emerge un immobile che richiede una lettura preliminare più ordinata per capire con maggiore precisione il rapporto tra stato di fatto, esigenze abitative e margini di modifica.',
      'Immobile promettente da approfondire': 'Dalle informazioni inserite emerge un immobile che sembra ben impostato per una prima verifica, ma che merita comunque un approfondimento prima di assumere decisioni definitive.',
      'Acquisto da valutare con attenzione': 'Dalle informazioni inserite emerge un acquisto che richiede attenzione prima di procedere, soprattutto per chiarire l’impatto delle criticità emerse rispetto al valore e all’obiettivo della casa.',
      'Potenziale interessante ma con trasformazione rilevante': 'Dalle informazioni inserite emerge un immobile che potrebbe essere interessante, ma che richiede una lettura più attenta della compatibilità tra stato attuale, trasformazioni necessarie e obiettivi di acquisto.'
    };

    const details = [];

    if(data.dubbioPrincipale === 'Capire se gli spazi sono davvero adatti'){
      details.push('Il nodo principale sembra la reale tenuta distributiva della casa rispetto al modo in cui desideri abitarla.');
    } else if(data.dubbioPrincipale === 'Capire quanto va trasformata'){
      details.push('Il nodo principale sembra misurare l’entità delle trasformazioni necessarie prima di procedere con serenità.');
    } else if(data.dubbioPrincipale === 'Capire se il costo complessivo ha senso'){
      details.push('Il nodo principale sembra il rapporto tra prezzo richiesto, lavori necessari e qualità finale ottenibile.');
    } else if(data.dubbioPrincipale === 'Capire se ci sono criticità tecniche'){
      details.push('Il nodo principale sembra chiarire quanto le criticità tecniche possano incidere sulla fattibilità e sulla convenienza dell’acquisto.');
    } else if(data.dubbioPrincipale === 'Capire se conviene procedere o no'){
      details.push('Il nodo principale sembra distinguere se valga la pena approfondire oppure interrompere la valutazione in questa fase.');
    }

    if(data.documentazioneDisponibile === 'Non ho ancora documentazione' || data.documentazioneDisponibile === 'Non so'){
      details.push('La documentazione oggi disponibile appare ancora limitata e rende utile una verifica iniziale più ordinata.');
    }

    if(data.vincoliContesto === 'Centro storico' || data.vincoliContesto === 'Vincolo paesaggistico' || data.vincoliContesto === 'Contesto condominiale delicato'){
      details.push('Anche il contesto suggerisce una lettura cauta dei margini reali di trasformazione.');
    }

    return [introByProfile[profile], ...details].join(' ');
  }

  function buildSummary(data){
    const profile = classifyProfile(data);
    return {
      profile,
      framing: getFraming(profile, data)
    };
  }

  // Aggiorna questo blocco se in futuro vuoi cambiare etichette o formato dell'email.
  function buildEmailBody(data, summary){
    return [
      'Buongiorno,',
      '',
      'desidero richiedere una verifica pre-acquisto relativa a un immobile che sto valutando.',
      '',
      'PROFILO DELLA RICHIESTA',
      '- Profilo sintetico: ' + summary.profile,
      '- Inquadramento: ' + summary.framing,
      '',
      'IMMOBILE',
      '- Tipologia: ' + data.tipologiaImmobile,
      '- Metratura: ' + data.metraturaIndicativa + ' mq',
      '- Località / Comune: ' + data.localitaComune,
      '- Prezzo richiesto: ' + data.prezzoRichiesto,
      '- Stato attuale: ' + data.statoAttuale,
      '',
      'ACQUISTO E OBIETTIVO',
      '- Situazione di acquisto: ' + data.situazioneAcquisto,
      '- Finalità dell’acquisto: ' + data.finalitaAcquisto,
      '- Dubbio principale: ' + data.dubbioPrincipale,
      '- Tempistiche decisionali: ' + data.tempisticheDecisionali,
      '',
      'COMPATIBILITÀ CON LE ESIGENZE',
      '- Composizione del nucleo: ' + data.composizioneNucleo,
      '- Esigenza spazi: ' + data.esigenzaSpazi,
      '- Priorità abitative: ' + data.prioritaAbitative,
      '- Accesso / criticità distributive: ' + data.accessoCriticitaDistributive,
      '',
      'CRITICITÀ E VERIFICA',
      '- Documentazione disponibile: ' + data.documentazioneDisponibile,
      '- Segnali di criticità: ' + data.segnaliCriticita,
      '- Vincoli o contesto: ' + data.vincoliContesto,
      '- Esito desiderato: ' + data.esitoDesiderato,
      '- Link annuncio immobiliare: ' + data.linkAnnuncio,
      '- Note aggiuntive: ' + data.noteAggiuntive,
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
    const summary = buildSummary(formData);
    const body = buildEmailBody(formData, summary);
    const mailto = 'mailto:' + HOME_FIT_APP_CONFIG.recipientEmail
      + '?subject=' + encodeURIComponent(HOME_FIT_APP_CONFIG.subject)
      + '&body=' + encodeURIComponent(body);

    window.location.href = mailto;
  });

  form.querySelectorAll('input, select, textarea').forEach(field=>{
    const eventName = field.tagName === 'SELECT' || field.type === 'checkbox' ? 'change' : 'input';
    field.addEventListener(eventName, ()=> syncFieldValidationMessage(field));
  });

  updateProgress();
});
