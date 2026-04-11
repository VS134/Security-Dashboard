// @ts-nocheck
const password = document.getElementById('password-input');
const checkPasswordButton = document.getElementById('check-password');
const passwordStrengthResult = document.getElementById(
  'password-strength-result',
);
const clearInputButton = document.getElementById('clear-password-input');
const passwordIssuesList = document.getElementById('password-issues-list');
const modal = document.getElementById('modal');

// const commonPatterns = [
//   '123',
//   '123456',
//   'password',
//   '123456789',
//   '12345',
//   '12345678',
//   'letmein',
//   'qwerty',
//   'abc123',
//   '111111',
// ];

function calculatePasswordEntropy(charSetSize, passwordLength) {
  return Math.log2(charSetSize) * passwordLength;
}

function entropyToStrength(entropy) {
  if (entropy < 30) {
    return 'Very Weak';
  } else if (entropy < 50) {
    return 'Weak';
  } else if (entropy < 70) {
    return 'Moderate';
  } else if (entropy < 90) {
    return 'Strong';
  } else {
    return 'Very Strong';
  }
}

function calculatePasswordStrength(password) {
  let charSet = 0;
  const missingCriteria = [];
  if (password.length < 8) {
    missingCriteria.push(`at least ${8 - password.length} more characters`);
  }
  if (/[a-z]/.test(password)) {
    charSet += 26;
  } else missingCriteria.push('at least one lowercase letter');

  if (/[A-Z]/.test(password)) {
    charSet += 26;
  } else missingCriteria.push('at least one uppercase letter');

  if (/[0-9]/.test(password)) {
    charSet += 10;
  } else missingCriteria.push('at least one digit');

  if (/[^A-Za-z0-9]/.test(password)) {
    charSet += 32; // Assuming 32 special characters
  } else missingCriteria.push('at least one special character');

  const entropy = calculatePasswordEntropy(charSet, password.length);
  const passwordStrength = entropyToStrength(entropy);

  return {
    passwordStrength,
    missingCriteria,
  };
}

checkPasswordButton.addEventListener('click', () => {
  const passwordValue = password.value;

  if (passwordValue.length === 0) {
    modal.showModal();
    passwordStrengthResult.textContent = 'Please enter a password.';
    passwordIssuesList.replaceChildren();
    return;
  }
  const strength = calculatePasswordStrength(passwordValue).passwordStrength;
  passwordStrengthResult.textContent = `Password Strength: ${strength}`;
  passwordIssuesList.replaceChildren();
  const missingCriteria = calculatePasswordStrength(
    password.value,
  ).missingCriteria;

  if (missingCriteria.length === 0) {
    const listItem = document.createElement('li');
    listItem.textContent = 'Your password is strong. Great job!';
    passwordIssuesList.appendChild(listItem);
    return;
  } else {
    missingCriteria.forEach((criterion) => {
      const listItem = document.createElement('li');
      listItem.textContent = `To strengthen your password consider adding ${criterion}.`;
      passwordIssuesList.appendChild(listItem);
    });
  }
});

clearInputButton.addEventListener('click', () => {
  password.value = '';
  passwordStrengthResult.textContent = 'Please enter a password.';
  passwordIssuesList.replaceChildren();
});

// check for common patterns 123 abc ...
// build more tools
// css to style
