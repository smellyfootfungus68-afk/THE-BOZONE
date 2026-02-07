// Particle effect background
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 5 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = ['#ff00ff', '#00ffff', '#ffff00', '#00ff00'][Math.floor(Math.random() * 4)];
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite`;
        particle.style.opacity = Math.random() * 0.5 + 0.3;
        container.appendChild(particle);
    }
}

const floatKeyframes = `
    @keyframes float {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(20px, -20px); }
        50% { transform: translate(-20px, 20px); }
        75% { transform: translate(20px, 20px); }
    }
`;
const style = document.createElement('style');
style.textContent = floatKeyframes;
document.head.appendChild(style);

createParticles();

// Notification system
function showNotification(message) {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notification-text');
    text.textContent = message;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

document.getElementById('close-notification')?.addEventListener('click', () => {
    document.getElementById('notification').classList.add('hidden');
});

// Utility function to get input from tool box
function getInput(toolBox) {
    const input = toolBox.querySelector('.input-area') || toolBox.querySelector('.input-field');
    return input ? input.value : '';
}

// Utility function to set output
function setOutput(toolBox, text) {
    const output = toolBox.querySelector('.output-area');
    if (output) {
        output.textContent = text;
    }
}

// Text Reverser
const reverseTool = document.querySelector('[data-tool="reverse"]');
if (reverseTool) {
    reverseTool.querySelector('.action-btn').addEventListener('click', () => {
        const input = getInput(reverseTool);
        const reversed = input.split('').reverse().join('');
        setOutput(reverseTool, reversed);
        showNotification('Text reversed! 🔄');
    });
}

// Case Converter
const caseTool = document.querySelector('[data-tool="case"]');
if (caseTool) {
    caseTool.querySelectorAll('[data-case]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = getInput(caseTool);
            const caseType = btn.dataset.case;
            let result = '';
            
            switch(caseType) {
                case 'upper':
                    result = input.toUpperCase();
                    break;
                case 'lower':
                    result = input.toLowerCase();
                    break;
                case 'alternate':
                    result = input.split('').map((char, i) => 
                        i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
                    ).join('');
                    break;
                case 'random':
                    result = input.split('').map(char => 
                        Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
                    ).join('');
                    break;
                case 'title':
                    result = input.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ');
                    break;
            }
            
            setOutput(caseTool, result);
            showNotification(`Converted to ${caseType} case! 🔡`);
        });
    });
}

// Word Counter
const countTool = document.querySelector('[data-tool="count"]');
if (countTool) {
    const input = countTool.querySelector('.input-area');
    
    function updateStats() {
        const text = input.value;
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines = text.split('\n').length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
        const vowels = (text.match(/[aeiouAEIOU]/g) || []).length;
        const consonants = (text.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length;
        const readTime = Math.ceil(words / 200); // Average reading speed
        
        document.getElementById('char-count').textContent = chars;
        document.getElementById('word-count').textContent = words;
        document.getElementById('line-count').textContent = lines;
        document.getElementById('sentence-count').textContent = sentences;
        document.getElementById('vowel-count').textContent = vowels;
        document.getElementById('consonant-count').textContent = consonants;
        document.getElementById('read-time').textContent = readTime;
    }
    
    input.addEventListener('input', updateStats);
}

// Zalgo Text Generator
const zalgoTool = document.querySelector('[data-tool="zalgo"]');
if (zalgoTool) {
    const zalgoChars = [
        '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307',
        '\u0308', '\u0309', '\u030A', '\u030B', '\u030C', '\u030D', '\u030E', '\u030F',
        '\u0310', '\u0311', '\u0312', '\u0313', '\u0314', '\u0315', '\u0316', '\u0317',
        '\u0318', '\u0319', '\u031A', '\u031B', '\u031C', '\u031D', '\u031E', '\u031F',
        '\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325', '\u0326', '\u0327',
        '\u0328', '\u0329', '\u032A', '\u032B', '\u032C', '\u032D', '\u032E', '\u032F',
        '\u0330', '\u0331', '\u0332', '\u0333', '\u0334', '\u0335', '\u0336', '\u0337',
        '\u0338', '\u0339', '\u033A', '\u033B', '\u033C', '\u033D', '\u033E', '\u033F'
    ];
    
    const intensitySlider = document.getElementById('zalgo-intensity');
    const intensityDisplay = document.getElementById('zalgo-level');
    
    intensitySlider.addEventListener('input', () => {
        intensityDisplay.textContent = intensitySlider.value;
    });
    
    zalgoTool.querySelector('.action-btn').addEventListener('click', () => {
        const input = getInput(zalgoTool);
        const intensity = parseInt(intensitySlider.value);
        
        let result = '';
        for (let char of input) {
            result += char;
            for (let i = 0; i < intensity; i++) {
                result += zalgoChars[Math.floor(Math.random() * zalgoChars.length)];
            }
        }
        
        setOutput(zalgoTool, result);
        showNotification('Zalgo unleashed! 👹');
    });
}

// Morse Code
const morseTool = document.querySelector('[data-tool="morse"]');
if (morseTool) {
    const morseCode = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
        'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
        'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
        '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
        '8': '---..', '9': '----.', ' ': '/'
    };
    
    const reverseMorse = Object.fromEntries(
        Object.entries(morseCode).map(([key, value]) => [value, key])
    );
    
    morseTool.querySelectorAll('[data-morse]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = getInput(morseTool);
            const action = btn.dataset.morse;
            
            if (action === 'encode') {
                const result = input.toUpperCase().split('').map(char => 
                    morseCode[char] || char
                ).join(' ');
                setOutput(morseTool, result);
                showNotification('Encoded to Morse! 📡');
            } else if (action === 'decode') {
                const result = input.split(' ').map(code => 
                    reverseMorse[code] || code
                ).join('');
                setOutput(morseTool, result);
                showNotification('Decoded from Morse! 📡');
            } else if (action === 'audio') {
                showNotification('Beep boop! 🔊 (Audio playback coming soon)');
            }
        });
    });
}

// Binary Converter
const binaryTool = document.querySelector('[data-tool="binary"]');
if (binaryTool) {
    binaryTool.querySelectorAll('[data-binary]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = getInput(binaryTool);
            const action = btn.dataset.binary;
            
            if (action === 'encode') {
                const result = input.split('').map(char => 
                    char.charCodeAt(0).toString(2).padStart(8, '0')
                ).join(' ');
                setOutput(binaryTool, result);
                showNotification('Converted to binary! 💾');
            } else if (action === 'decode') {
                try {
                    const result = input.split(' ').map(binary => 
                        String.fromCharCode(parseInt(binary, 2))
                    ).join('');
                    setOutput(binaryTool, result);
                    showNotification('Decoded from binary! 💾');
                } catch (e) {
                    setOutput(binaryTool, 'Invalid binary input!');
                }
            }
        });
    });
}

// Palindrome Checker
const palindromeTool = document.querySelector('[data-tool="palindrome"]');
if (palindromeTool) {
    palindromeTool.querySelector('.action-btn').addEventListener('click', () => {
        const input = getInput(palindromeTool);
        const cleaned = input.toLowerCase().replace(/[^a-z0-9]/g, '');
        const reversed = cleaned.split('').reverse().join('');
        const isPalindrome = cleaned === reversed && cleaned.length > 0;
        
        const result = isPalindrome 
            ? `✅ YES! "${input}" is a palindrome!` 
            : `❌ NO! "${input}" is NOT a palindrome.`;
        
        setOutput(palindromeTool, result);
        showNotification(isPalindrome ? 'Palindrome detected! 🔁' : 'Not a palindrome! 🔁');
    });
}

// Caesar Cipher
const caesarTool = document.querySelector('[data-tool="caesar"]');
if (caesarTool) {
    const shiftSlider = document.getElementById('caesar-shift');
    const shiftDisplay = document.getElementById('shift-value');
    
    shiftSlider.addEventListener('input', () => {
        shiftDisplay.textContent = shiftSlider.value;
    });
    
    function caesarCipher(text, shift, decode = false) {
        if (decode) shift = 26 - shift;
        
        return text.split('').map(char => {
            if (char.match(/[a-z]/i)) {
                const code = char.charCodeAt(0);
                const isUpperCase = code >= 65 && code <= 90;
                const base = isUpperCase ? 65 : 97;
                return String.fromCharCode(((code - base + shift) % 26) + base);
            }
            return char;
        }).join('');
    }
    
    caesarTool.querySelectorAll('[data-caesar]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = getInput(caesarTool);
            const shift = parseInt(shiftSlider.value);
            const action = btn.dataset.caesar;
            
            const result = caesarCipher(input, shift, action === 'decode');
            setOutput(caesarTool, result);
            showNotification(action === 'encode' ? 'Encrypted! 🔐' : 'Decrypted! 🔓');
        });
    });
}

// Pig Latin
const pigLatinTool = document.querySelector('[data-tool="piglatin"]');
if (pigLatinTool) {
    pigLatinTool.querySelector('.action-btn').addEventListener('click', () => {
        const input = getInput(pigLatinTool);
        
        const result = input.split(' ').map(word => {
            if (!word) return word;
            const vowels = 'aeiouAEIOU';
            
            if (vowels.includes(word[0])) {
                return word + 'way';
            } else {
                let firstVowelIndex = 0;
                for (let i = 0; i < word.length; i++) {
                    if (vowels.includes(word[i])) {
                        firstVowelIndex = i;
                        break;
                    }
                }
                return word.slice(firstVowelIndex) + word.slice(0, firstVowelIndex) + 'ay';
            }
        }).join(' ');
        
        setOutput(pigLatinTool, result);
        showNotification('Oink oink! 🐷');
    });
}

// UwU-ifier
const uwuTool = document.querySelector('[data-tool="uwu"]');
if (uwuTool) {
    uwuTool.querySelector('.action-btn').addEventListener('click', () => {
        const input = getInput(uwuTool);
        
        let result = input
            .replace(/[rl]/g, 'w')
            .replace(/[RL]/g, 'W')
            .replace(/n([aeiou])/g, 'ny$1')
            .replace(/N([aeiou])/g, 'Ny$1')
            .replace(/N([AEIOU])/g, 'NY$1')
            .replace(/ove/g, 'uv');
        
        // Add random uwu expressions
        const faces = [' uwu', ' owo', ' >w<', ' ^w^', ' >///<'];
        const words = result.split(' ');
        for (let i = 0; i < words.length; i += 5) {
            words[i] += faces[Math.floor(Math.random() * faces.length)];
        }
        result = words.join(' ');
        
        setOutput(uwuTool, result);
        showNotification('UwU-ified! 😺');
    });
}

// L33t Speak
const leetTool = document.querySelector('[data-tool="leet"]');
if (leetTool) {
    const leetMaps = {
        basic: { 'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7' },
        advanced: { 'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7', 'l': '1', 'g': '9', 'b': '8' },
        elite: { 'a': '@', 'e': '3', 'i': '!', 'o': '0', 's': '$', 't': '+', 'l': '1', 'g': '9', 'b': '8', 'c': '(', 'h': '#' }
    };
    
    leetTool.querySelectorAll('[data-leet]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = getInput(leetTool);
            const level = btn.dataset.leet;
            const map = leetMaps[level];
            
            const result = input.toLowerCase().split('').map(char => 
                map[char] || char
            ).join('');
            
            setOutput(leetTool, result);
            showNotification(`L33t ${level} activated! 💻`);
        });
    });
}

// Mockifier
const mockTool = document.querySelector('[data-tool="mock"]');
if (mockTool) {
    mockTool.querySelector('.action-btn').addEventListener('click', () => {
        const input = getInput(mockTool);
        
        const result = input.split('').map((char, i) => 
            i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
        ).join('');
        
        setOutput(mockTool, result);
        showNotification('mOcKiFiEd! 🤡');
    });
}

// Word Scrambler
const scrambleTool = document.querySelector('[data-tool="scramble"]');
if (scrambleTool) {
    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    scrambleTool.querySelectorAll('[data-scramble]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = getInput(scrambleTool);
            const action = btn.dataset.scramble;
            let result = '';
            
            if (action === 'letters') {
                result = shuffleArray(input.split('')).join('');
            } else if (action === 'words') {
                result = shuffleArray(input.split(' ')).join(' ');
            }
            
            setOutput(scrambleTool, result);
            showNotification('Scrambled! 🌪️');
        });
    });
}

// Character Replacer
const replaceTool = document.querySelector('[data-tool="replace"]');
if (replaceTool) {
    replaceTool.querySelector('.action-btn').addEventListener('click', () => {
        const input = getInput(replaceTool);
        const find = document.getElementById('find-char').value;
        const replace = document.getElementById('replace-char').value;
        
        if (!find) {
            setOutput(replaceTool, 'Please enter a character to find!');
            return;
        }
        
        const result = input.split(find).join(replace);
        setOutput(replaceTool, result);
        showNotification('Characters replaced! 🔧');
    });
}

// Number Base Converter
const basesTool = document.querySelector('[data-tool="bases"]');
if (basesTool) {
    const input = basesTool.querySelector('.input-field');
    
    input.addEventListener('input', () => {
        const value = input.value.trim();
        if (!value) {
            document.getElementById('base-binary').textContent = '-';
            document.getElementById('base-octal').textContent = '-';
            document.getElementById('base-decimal').textContent = '-';
            document.getElementById('base-hex').textContent = '-';
            return;
        }
        
        try {
            let decimal;
            
            if (value.startsWith('0x')) {
                decimal = parseInt(value, 16);
            } else if (value.startsWith('0b')) {
                decimal = parseInt(value.slice(2), 2);
            } else if (value.startsWith('0o')) {
                decimal = parseInt(value.slice(2), 8);
            } else {
                decimal = parseInt(value, 10);
            }
            
            if (isNaN(decimal)) {
                throw new Error('Invalid number');
            }
            
            document.getElementById('base-binary').textContent = '0b' + decimal.toString(2);
            document.getElementById('base-octal').textContent = '0o' + decimal.toString(8);
            document.getElementById('base-decimal').textContent = decimal.toString(10);
            document.getElementById('base-hex').textContent = '0x' + decimal.toString(16).toUpperCase();
        } catch (e) {
            document.getElementById('base-binary').textContent = 'Error';
            document.getElementById('base-octal').textContent = 'Error';
            document.getElementById('base-decimal').textContent = 'Error';
            document.getElementById('base-hex').textContent = 'Error';
        }
    });
}

// Calculator
const calcTool = document.querySelector('[data-tool="calculator"]');
if (calcTool) {
    const display = document.getElementById('calc-display');
    let currentValue = '';
    
    calcTool.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.dataset.calc;
            
            if (value === 'C') {
                currentValue = '';
                display.value = '';
            } else if (value === '=') {
                try {
                    // Replace ^ with ** for exponentiation
                    const expression = currentValue.replace(/\^/g, '**');
                    const result = eval(expression);
                    display.value = result;
                    currentValue = result.toString();
                } catch (e) {
                    display.value = 'Error';
                    currentValue = '';
                }
            } else {
                currentValue += value;
                display.value = currentValue;
            }
        });
    });
}

// Roman Numerals
const romanTool = document.querySelector('[data-tool="roman"]');
if (romanTool) {
    const romanNumerals = [
        ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
        ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
        ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
    ];
    
    function toRoman(num) {
        let result = '';
        for (let [roman, value] of romanNumerals) {
            while (num >= value) {
                result += roman;
                num -= value;
            }
        }
        return result;
    }
    
    function fromRoman(str) {
        const romanMap = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
        let result = 0;
        for (let i = 0; i < str.length; i++) {
            const current = romanMap[str[i]];
            const next = romanMap[str[i + 1]];
            if (next && current < next) {
                result -= current;
            } else {
                result += current;
            }
        }
        return result;
    }
    
    romanTool.querySelectorAll('[data-roman]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = getInput(romanTool);
            const action = btn.dataset.roman;
            
            if (action === 'to') {
                const num = parseInt(input);
                if (isNaN(num) || num <= 0 || num > 3999) {
                    setOutput(romanTool, 'Please enter a number between 1 and 3999!');
                    return;
                }
                setOutput(romanTool, toRoman(num));
                showNotification('Converted to Roman! 🏛️');
            } else if (action === 'from') {
                const result = fromRoman(input.toUpperCase());
                setOutput(romanTool, result.toString());
                showNotification('Converted from Roman! 🏛️');
            }
        });
    });
}

// Anagram Checker
const anagramTool = document.querySelector('[data-tool="anagram"]');
if (anagramTool) {
    anagramTool.querySelector('.action-btn').addEventListener('click', () => {
        const inputs = anagramTool.querySelectorAll('.input-field');
        const word1 = inputs[0].value.toLowerCase().replace(/[^a-z]/g, '');
        const word2 = inputs[1].value.toLowerCase().replace(/[^a-z]/g, '');
        
        const sorted1 = word1.split('').sort().join('');
        const sorted2 = word2.split('').sort().join('');
        
        const isAnagram = sorted1 === sorted2 && word1.length > 0;
        const result = isAnagram 
            ? '✅ YES! These are anagrams!' 
            : '❌ NO! These are NOT anagrams.';
        
        setOutput(anagramTool, result);
        showNotification(isAnagram ? 'Anagram found! 🔀' : 'Not anagrams! 🔀');
    });
}

// Vowel Destroyer
const vowelTool = document.querySelector('[data-tool="vowels"]');
if (vowelTool) {
    vowelTool.querySelectorAll('[data-vowel]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = getInput(vowelTool);
            const action = btn.dataset.vowel;
            let result = '';
            
            if (action === 'remove') {
                result = input.replace(/[aeiouAEIOU]/g, '');
            } else if (action === 'only') {
                result = input.replace(/[^aeiouAEIOU]/g, '');
            }
            
            setOutput(vowelTool, result);
            showNotification(action === 'remove' ? 'Vowels destroyed! ❌' : 'Only vowels! ✅');
        });
    });
}

// Text Repeater
const repeatTool = document.querySelector('[data-tool="repeat"]');
if (repeatTool) {
    const slider = document.getElementById('repeat-slider');
    const display = document.getElementById('repeat-count');
    
    slider.addEventListener('input', () => {
        display.textContent = slider.value;
    });
    
    repeatTool.querySelector('.action-btn').addEventListener('click', () => {
        const input = getInput(repeatTool);
        const times = parseInt(slider.value);
        const result = (input + ' ').repeat(times).trim();
        
        setOutput(repeatTool, result);
        showNotification(`Repeated ${times} times! ♻️`);
    });
}

// ASCII Art Generator
const asciiTool = document.querySelector('[data-tool="ascii"]');
if (asciiTool) {
    const fonts = {
        small: {
            'A': [' A ', 'A A', 'AAA', 'A A'],
            'B': ['BB ', 'B B', 'BB ', 'B B', 'BB '],
            'C': [' CC', 'C  ', 'C  ', 'C  ', ' CC'],
            // Add more letters as needed
        }
    };
    
    asciiTool.querySelectorAll('[data-ascii]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = getInput(asciiTool).toUpperCase();
            const size = btn.dataset.ascii;
            
            if (size === 'small') {
                let lines = ['', '', '', ''];
                for (let char of input) {
                    if (char === ' ') {
                        lines = lines.map(line => line + '  ');
                    } else {
                        const pattern = fonts.small[char] || ['?', '?', '?', '?'];
                        for (let i = 0; i < 4; i++) {
                            lines[i] += pattern[i] + ' ';
                        }
                    }
                }
                setOutput(asciiTool, lines.join('\n'));
            } else {
                // Simple large ASCII
                setOutput(asciiTool, `
  ___  ___  ___  ___  ___
 / _ \\/ __|/ __|_ _|_ _|
| |_|| (__| (__  | | | |
 \\___|\\___|\\___||___|___|

${input}
                `.trim());
            }
            
            showNotification('ASCII art generated! 🎨');
        });
    });
}

// Add some extra chaos
setInterval(() => {
    const tools = document.querySelectorAll('.tool-box');
    const randomTool = tools[Math.floor(Math.random() * tools.length)];
    randomTool.style.borderColor = ['#ff00ff', '#00ffff', '#ffff00', '#00ff00'][Math.floor(Math.random() * 4)];
}, 2000);

console.log('🎉 TEXT ZONE LOADED! Welcome to the chaos! 🎉');