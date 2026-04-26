document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('form[data-mail-subject]').forEach(initForm);
});

function initForm(form){
  const app = form.closest('.budget-app') || document;
  const steps = Array.from(form.querySelectorAll('.budget-step'));
  const progressFill = app.querySelector('.budget-app__progress-fill');
  const progressBar = app.querySelector('.budget-app__progress-track[role="progressbar"]');
  const currentStepText = app.querySelector('.budget-app__progress-count span');
  const progressItems = Array.from(app.querySelectorAll('.budget-app__progress-steps li'));
  if(!steps.length || !progressFill || !progressBar || !currentStepText) return;

  let currentStepIndex = 0;

  function fieldLabel(field){
    const label = field.closest('label');
    const visibleLabel = label && label.querySelector('.budget-field__label');
    if(visibleLabel) return visibleLabel.textContent.trim();
    if(label) return label.textContent.trim().replace(/\s+/g, ' ');
    return field.name.replace(/_/g, ' ');
  }

  function syncFieldValidationMessage(field){
    field.setCustomValidity('');

    if(field.validity.valueMissing){
      field.setCustomValidity(field.type === 'checkbox'
        ? 'Please accept this required option.'
        : 'Please complete: ' + fieldLabel(field) + '.');
      return;
    }

    if(field.validity.typeMismatch && field.type === 'email'){
      field.setCustomValidity('Please enter a valid email address.');
      return;
    }

    if(field.validity.typeMismatch && field.type === 'url'){
      field.setCustomValidity('Please enter a valid link.');
      return;
    }

    if((field.validity.badInput || field.validity.rangeUnderflow) && field.type === 'number'){
      field.setCustomValidity('Please enter a valid number.');
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

  function fieldValue(field){
    if(field.type === 'checkbox') return field.checked ? 'Yes' : 'No';
    if(field.tagName === 'SELECT'){
      const selected = field.options[field.selectedIndex];
      return selected && selected.value ? selected.textContent.trim() : '';
    }
    return field.value.trim();
  }

  function buildEmailBody(){
    const lines = [
      'Hello,',
      '',
      form.dataset.mailIntro || 'I would like to send a request.',
      ''
    ];

    steps.forEach((step)=>{
      const heading = step.querySelector('h2');
      if(heading){
        lines.push(heading.textContent.trim().toUpperCase());
      }

      getFieldsForStep(step).forEach((field)=>{
        if(!field.name) return;
        const value = fieldValue(field) || 'Not provided';
        lines.push('- ' + fieldLabel(field) + ': ' + value);
      });

      lines.push('');
    });

    lines.push('Thank you.');
    return lines.join('\n');
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

    const mailto = 'mailto:info@longhiarchitettura.com'
      + '?subject=' + encodeURIComponent(form.dataset.mailSubject || 'Request from website')
      + '&body=' + encodeURIComponent(buildEmailBody());

    window.location.href = mailto;
  });

  form.querySelectorAll('input, select, textarea').forEach(field=>{
    const eventName = field.tagName === 'SELECT' || field.type === 'checkbox' ? 'change' : 'input';
    field.addEventListener(eventName, ()=> syncFieldValidationMessage(field));
  });

  updateProgress();
}

