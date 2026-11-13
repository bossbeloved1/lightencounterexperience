const form = document.getElementById('registrationForm');
const message = document.getElementById('formMessage');
const successModal = document.getElementById('successModal');
const successClose = document.getElementById('successClose');

function closeSuccessModal() {
  if (successModal) successModal.hidden = true;
}

successClose?.addEventListener('click', closeSuccessModal);
successModal?.addEventListener('click', (event) => {
  if (event.target === successModal) closeSuccessModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && successModal && !successModal.hidden) closeSuccessModal();
});

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.className = 'form-message';
  message.textContent = '';
  if (!form.reportValidity()) return;

  if (!window.leeSupabase) {
    message.classList.add('error');
    message.textContent = 'The registration service is not connected yet. Add your Supabase project URL and anon key in js/config.js, then try again.';
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.querySelector('span')?.textContent;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.style.opacity = '.65';
    submitButton.style.cursor = 'wait';
    const label = submitButton.querySelector('span');
    if (label) label.textContent = 'SUBMITTING...';
  }

  try {
    const data = Object.fromEntries(new FormData(form).entries());
    delete data.consent;
    const { error } = await window.leeSupabase.from('registrations').insert([data]);
    if (error) throw error;

    form.reset();
    if (successModal) {
      successModal.hidden = false;
      successClose?.focus();
    }
  } catch (error) {
    message.classList.add('error');
    message.textContent = 'We could not submit your registration. Please check your connection and try again.';
    console.error(error);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.style.opacity = '';
      submitButton.style.cursor = '';
      const label = submitButton.querySelector('span');
      if (label) label.textContent = originalButtonText || 'COMPLETE REGISTRATION';
    }
  }
});
