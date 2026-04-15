// @ts-nocheck

// -- PASSWORD STRENGTH CHECKER -- //

const password = document.getElementById('password-input');
const checkPasswordButton = document.getElementById('check-password');
const passwordStrengthResult = document.getElementById(
  'password-strength-result',
);
const clearInputButton = document.getElementById('clear-password-input');
const passwordIssuesList = document.getElementById('password-issues-list');

function detectCommonPatterns(password) {
  const commonPatterns = [
    'password',
    'qwerty',
    'abc',
    '123',
    '123456',
    '12345',
    'letmein',
    'welcome',
    'admin',
    'login',
    'pass',
    'test',
  ];
  const passwordLower = password.toLowerCase();
  const issues = [];
  let entropyPenalty = 0;

  // Check for common patterns as substrings
  for (const pattern of commonPatterns) {
    if (passwordLower.includes(pattern)) {
      issues.push(`Contains common pattern: "${pattern}"`);
      entropyPenalty += 60;
      break;
    }
  }

  // Check for repeated characters (3+ in a row)
  for (const char of 'abcdefghijklmnopqrstuvwxyz0123456789') {
    if (passwordLower.includes(char.repeat(3))) {
      issues.push('Contains too many repeated characters.');
      entropyPenalty += 50;
      break;
    }
  }

  return { issues, entropyPenalty };
}

function calculatePasswordEntropy(charSetSize, passwordLength) {
  return Math.log2(charSetSize) * passwordLength;
}

function entropyToStrength(entropy) {
  if (entropy < 30) {
    return { strength: 'Very Weak', color: '#ff0055' };
  } else if (entropy < 50) {
    return { strength: 'Weak', color: '#ff0055' };
  } else if (entropy < 70) {
    return { strength: 'Moderate', color: '#ff8400' };
  } else if (entropy < 90) {
    return { strength: 'Strong', color: '#ffd900' };
  } else {
    return { strength: 'Very Strong', color: '#00ff88' };
  }
}

function calculatePasswordStrength(password) {
  let charSet = 0;
  const missingCriteria = [];
  if (password.length < 8) {
    missingCriteria.push(`at least ${8 - password.length} more characters`);
  }

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    charSet += 26;
  } else missingCriteria.push('at least one lowercase letter');
  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    charSet += 26;
  } else missingCriteria.push('at least one uppercase letter');
  //check for digits
  if (/[0-9]/.test(password)) {
    charSet += 10;
  } else missingCriteria.push('at least one digit');
  //check for all other characters (special characters)
  if (/[^A-Za-z0-9]/.test(password)) {
    charSet += 32; // Assuming 32 special characters
  } else missingCriteria.push('at least one special character');

  let entropy = calculatePasswordEntropy(charSet, password.length);

  // Apply penalty for common patterns and repeated characters
  const patternAnalysis = detectCommonPatterns(password);
  entropy = Math.max(entropy - patternAnalysis.entropyPenalty, 0);

  // Merge pattern issues with missing criteria
  const allIssues = [...patternAnalysis.issues, ...missingCriteria];

  const passwordStrength = entropyToStrength(entropy);
  return {
    passwordStrength,
    missingCriteria: allIssues,
  };
}

password.addEventListener('input', () => {
  const passwordValue = password.value;

  if (passwordValue.length === 0) {
    passwordStrengthResult.textContent = 'Please enter a password.';
    passwordStrengthResult.style.color = '#ff0055';
    passwordIssuesList.replaceChildren();
    return;
  }
  const strength = calculatePasswordStrength(passwordValue).passwordStrength;
  passwordStrengthResult.textContent = `Password Strength: ${strength.strength}`;
  passwordStrengthResult.style.color = strength.color;
  passwordIssuesList.replaceChildren();
  const allIssues = calculatePasswordStrength(password.value).missingCriteria;

  if (allIssues.length === 0) {
    const listItem = document.createElement('li');
    listItem.textContent = 'No issues detected.';
    listItem.style.color = '#00ff88';
    passwordIssuesList.appendChild(listItem);
    return;
  } else {
    allIssues.forEach((issue) => {
      const listItem = document.createElement('li');
      if (issue.includes('Contains') || issue.includes('repeated')) {
        listItem.textContent = issue;
        listItem.style.color = '#ff6b9d';
      } else {
        listItem.textContent = `To strengthen your password consider adding ${issue}.`;
      }
      passwordIssuesList.appendChild(listItem);
    });
  }
});

clearInputButton.addEventListener('click', () => {
  password.value = '';
  passwordStrengthResult.textContent = 'Please enter a password.';
  passwordIssuesList.replaceChildren();
});

// --- HASH GENERATOR-- //

const hashGeneratorInput = document.getElementById('user-input');
const hashGeneratorOutput = document.getElementById('hash-output');
const resetHashGeneratorButton = document.getElementById(
  'reset-hash-generator',
);

resetHashGeneratorButton.addEventListener('click', () => {
  hashGeneratorInput.value = '';
  hashGeneratorOutput.textContent = '';
});

async function generateHash(text, algorithm) {
  // 1. Encode the string to UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // 2. Hash the bytes using the Web Crypto API
  const hashBuffer = await crypto.subtle.digest(algorithm, data);

  // 3. Convert the raw buffer to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
}

hashGeneratorInput.addEventListener('input', async (event) => {
  const text = event.target.value;

  if (text.length === 0) {
    hashGeneratorOutput.textContent = ''; // Clear output if input is empty
    return;
  }

  const hash = await generateHash(text, 'SHA-256');
  hashGeneratorOutput.textContent = hash;
});

// --- PERMISSIONS CALCULATOR -- //

const permissionsOutput = document.getElementById('permissions-calc-output');
const permissionCheckboxes = document.querySelectorAll('.perm');
const octalOutput = document.getElementById('permissions-calc-octal-output');
const commandOutput = document.getElementById(
  'permissions-calc-command-output',
);
const permissionsCalcResetButton = document.getElementById('reset-permissions');

function calculateOctalValue() {
  const octalMap = {
    owner: 0,
    group: 0,
    public: 0,
  };

  const octalValueToSymbolMap = {
    1: 'x',
    2: 'w',
    4: 'r',
  };

  let symbolicString = '-';

  permissionCheckboxes.forEach((checkbox) => {
    const val = parseInt(checkbox.dataset.value);
    if (checkbox.checked) {
      octalMap[checkbox.dataset.class] += val;
      const char = octalValueToSymbolMap[val];
      symbolicString += char;
    } else {
      symbolicString += '-';
    }
  });
  octalOutput.textContent = `0${octalMap.owner}${octalMap.group}${octalMap.public} / ${symbolicString}`;
  commandOutput.textContent = `The command you need to type is: chmod ${octalMap.owner}${octalMap.group}${octalMap.public} filename`;
}

permissionCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', calculateOctalValue);
});

permissionsCalcResetButton.addEventListener('click', () => {
  permissionCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  octalOutput.textContent = '0--- / ---------';
  commandOutput.textContent = 'The command you need to type is:';
});
