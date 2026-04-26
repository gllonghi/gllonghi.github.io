// File creato per la mini app "Stima budget di ristrutturazione".
// Cambia qui l'indirizzo email destinatario della richiesta.
const BUDGET_APP_CONFIG = {
  recipientEmail: 'info@longhiarchitettura.com',
  subject: 'Richiesta prima valutazione budget ristrutturazione'
};

const BUDGET_APP_VALIDATION_MESSAGES = {
  tipologia_immobile: 'Seleziona la tipologia di immobile.',
  metratura_indicativa: 'Inserisci la metratura indicativa.',
  localita_comune: 'Inserisci localita o comune.',
  stato_attuale: 'Seleziona lo stato attuale.',
  livello_intervento: 'Seleziona il livello di intervento desiderato.',
  rifacimento_impianti: 'Indica se e previsto il rifacimento degli impianti.',
  numero_bagni: 'Seleziona il numero di bagni da rifare.',
  cucina: 'Indica se la cucina va rifatta.',
  serramenti: 'Indica se i serramenti vanno sostituiti.',
  vincoli: 'Seleziona eventuali vincoli o contesti delicati.',
  fascia_qualitativa: 'Seleziona la fascia qualitativa desiderata.',
  tempistiche: 'Seleziona le tempistiche desiderate.',
  nome_cognome: 'Inserisci nome e cognome.',
  email: 'Inserisci il tuo indirizzo email.',
  telefono: 'Inserisci il tuo numero di telefono.',
  privacy: 'Devi autorizzare il trattamento dei dati per proseguire.'
};

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('budget-form');
  const steps = Array.from(document.querySelectorAll('.budget-step'));
  const progressFill = document.getElementById('budget-progress-fill');
  const progressBar = document.querySelector('.budget-app__progress-track[role="progressbar"]');
  const currentStepText = document.getElementById('budget-current-step');
  const progressItems = Array.from(document.querySelectorAll('.budget-app__progress-steps li'));
  if(!form || !steps.length || !progressFill || !progressBar || !currentStepText) return;

  let currentStepIndex = 0;

  function syncFieldValidationMessage(field){
    field.setCustomValidity('');

    if(field.validity.valueMissing){
      field.setCustomValidity(BUDGET_APP_VALIDATION_MESSAGES[field.name] || 'Compila questo campo.');
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

  // Aggiorna questo blocco se in futuro vuoi cambiare etichette o formato dell'email.
  function buildEmailBody(){
    return [
      'Buongiorno,',
      '',
      'desidero richiedere una prima valutazione orientativa del budget di ristrutturazione.',
      '',
      'DATI IMMOBILE',
      '- Tipologia: ' + displayValue('tipologia_immobile'),
      '- Metratura: ' + displayValue('metratura_indicativa'),
      '- Località: ' + displayValue('localita_comune'),
      '',
      'STATO E INTERVENTO',
      '- Stato attuale: ' + displayValue('stato_attuale'),
      '- Livello intervento: ' + displayValue('livello_intervento'),
      '- Impianti: ' + displayValue('rifacimento_impianti'),
      '',
      'ELEMENTI PRINCIPALI',
      '- Bagni: ' + displayValue('numero_bagni'),
      '- Cucina: ' + displayValue('cucina'),
      '- Serramenti: ' + displayValue('serramenti'),
      '- Vincoli: ' + displayValue('vincoli'),
      '',
      'LIVELLO DESIDERATO',
      '- Fascia qualitativa: ' + displayValue('fascia_qualitativa'),
      '- Tempistiche: ' + displayValue('tempistiche'),
      '- Note: ' + displayValue('note_aggiuntive'),
      '',
      'CONTATTO',
      '- Nome: ' + displayValue('nome_cognome'),
      '- Email: ' + displayValue('email'),
      '- Telefono: ' + displayValue('telefono'),
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

    const body = buildEmailBody();
    const mailto = 'mailto:' + BUDGET_APP_CONFIG.recipientEmail
      + '?subject=' + encodeURIComponent(BUDGET_APP_CONFIG.subject)
      + '&body=' + encodeURIComponent(body);

    window.location.href = mailto;
  });

  form.querySelectorAll('input, select, textarea').forEach(field=>{
    const eventName = field.tagName === 'SELECT' || field.type === 'checkbox' ? 'change' : 'input';
    field.addEventListener(eventName, ()=> syncFieldValidationMessage(field));
  });

  updateProgress();
});
