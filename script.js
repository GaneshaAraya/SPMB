// Data aplikasi
let queueData = {
    currentQueue: 0,
    currentOperator: 0,
    totalCalled: 0,
    recentCalls: [],
    operators: [
        { id: 1, name: "Operator 1", description: "Pendaftaran", active: true },
        { id: 2, name: "Operator 2", description: "Berkas", active: true },
        { id: 3, name: "Operator 3", description: "Wawancara", active: true },
        { id: 4, name: "Operator 4", description: "Tes Akademik", active: true },
        { id: 5, name: "Operator 5", description: "Tes Bakat", active: true },
        { id: 6, name: "Operator 6", description: "Kesehatan", active: true },
        { id: 7, name: "Operator 7", description: "Pengumuman", active: true },
        { id: 8, name: "Operator 8", description: "Bantuan", active: true }
    ],
    soundEnabled: true
};

// Elemen DOM
const queueNumberInput = document.getElementById('queueNumber');
const operatorSelect = document.getElementById('operator');
const callBtn = document.getElementById('callBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const currentQueueDisplay = document.getElementById('currentQueue');
const currentOperatorDisplay = document.getElementById('currentOperator');
const recentCallsList = document.getElementById('recentCallsList');
const operatorsGrid = document.querySelector('.operators-grid');
const totalCalledDisplay = document.getElementById('totalCalled');
const currentQueueNumDisplay = document.getElementById('currentQueueNum');
const operatorActiveDisplay = document.getElementById('operatorActive');
const soundToggleBtn = document.getElementById('soundToggle');
const testSoundBtn = document.getElementById('testSoundBtn');
const dateTimeDisplay = document.getElementById('date-time');

// Inisialisasi Speech Synthesis
const speech = window.speechSynthesis;
let voices = [];

// Fungsi untuk mendapatkan suara wanita
function getFemaleVoice() {
    // Cari suara wanita (biasanya suara wanita memiliki bahasa Inggris)
    const femaleVoices = voices.filter(voice => 
        voice.lang.includes('id') || voice.lang.includes('en') || voice.name.includes('Female')
    );
    
    // Prioritaskan suara Indonesia, lalu Inggris, lalu suara apapun yang tersedia
    if (femaleVoices.length > 0) {
        const indonesianVoice = femaleVoices.find(voice => voice.lang.includes('id'));
        if (indonesianVoice) return indonesianVoice;
        
        const englishVoice = femaleVoices.find(voice => voice.lang.includes('en'));
        if (englishVoice) return englishVoice;
        
        return femaleVoices[0];
    }
    
    // Jika tidak ada suara wanita, gunakan suara default
    return voices[0] || null;
}

// Fungsi untuk berbicara
function speak(text) {
    if (!queueData.soundEnabled) return;
    
    // Hentikan bicara yang sedang berlangsung
    speech.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID'; // Set bahasa Indonesia
    utterance.rate = 0.9; // Kecepatan bicara sedikit lebih lambat
    
    // Coba dapatkan suara wanita
    if (voices.length > 0) {
        const femaleVoice = getFemaleVoice();
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
    }
    
    // Mulai bicara
    speech.speak(utterance);
}

// Fungsi untuk memanggil antrian
function callQueue() {
    const queueNumber = parseInt(queueNumberInput.value);
    const operatorId = parseInt(operatorSelect.value);
    
    if (isNaN(queueNumber) || queueNumber < 1) {
        alert('Nomor antrian tidak valid!');
        return;
    }
    
    // Update data
    queueData.currentQueue = queueNumber;
    queueData.currentOperator = operatorId;
    queueData.totalCalled++;
    
    // Tambahkan ke riwayat panggilan
    const operator = queueData.operators.find(op => op.id === operatorId);
    const callInfo = {
        queue: queueNumber,
        operator: operator.name,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    
    queueData.recentCalls.unshift(callInfo);
    if (queueData.recentCalls.length > 5) {
        queueData.recentCalls.pop();
    }
    
    // Update tampilan
    updateDisplay();
    
    // Bicara panggilan antrian
    const callText = `Nomor antrian ${queueNumber}, silahkan menuju ${operator.name}, ${operator.description}.`;
    speak(callText);
    
    // Animasi
    currentQueueDisplay.classList.remove('pulse');
    void currentQueueDisplay.offsetWidth; // Trigger reflow
    currentQueueDisplay.classList.add('pulse');
    
    // Update operator aktif
    updateOperatorCard(operatorId);
}

// Fungsi untuk panggil antrian berikutnya
function callNextQueue() {
    const nextQueue = queueData.currentQueue + 1;
    queueNumberInput.value = nextQueue;
    callQueue();
}

// Fungsi untuk reset antrian
function resetQueue() {
    if (confirm('Apakah Anda yakin ingin mereset antrian? Riwayat panggilan akan dihapus.')) {
        queueData.currentQueue = 0;
        queueData.currentOperator = 0;
        queueData.totalCalled = 0;
        queueData.recentCalls = [];
        queueNumberInput.value = 1;
        updateDisplay();
        speak('Sistem antrian telah direset.');
    }
}

// Fungsi untuk memperbarui tampilan
function updateDisplay() {
    // Tampilkan antrian dan operator yang sedang dipanggil
    if (queueData.currentQueue > 0) {
        currentQueueDisplay.textContent = `A${queueData.currentQueue.toString().padStart(3, '0')}`;
        
        const operator = queueData.operators.find(op => op.id === queueData.currentOperator);
        if (operator) {
            currentOperatorDisplay.textContent = `${operator.name} - ${operator.description}`;
        } else {
            currentOperatorDisplay.textContent = '-';
        }
    } else {
        currentQueueDisplay.textContent = '-';
        currentOperatorDisplay.textContent = '-';
    }
    
    // Update statistik
    totalCalledDisplay.textContent = queueData.totalCalled;
    currentQueueNumDisplay.textContent = queueData.currentQueue;
    
    // Update riwayat panggilan
    updateRecentCalls();
    
    // Update operator grid
    updateOperatorsGrid();
}

// Fungsi untuk memperbarui riwayat panggilan
function updateRecentCalls() {
    recentCallsList.innerHTML = '';
    
    if (queueData.recentCalls.length === 0) {
        recentCallsList.innerHTML = '<li class="empty-history">Belum ada panggilan</li>';
        return;
    }
    
    queueData.recentCalls.forEach(call => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>Antrian ${call.queue}</strong>
                <div class="call-time">${call.time}</div>
            </div>
            <div class="call-operator">${call.operator}</div>
        `;
        recentCallsList.appendChild(li);
    });
}

// Fungsi untuk memperbarui grid operator
function updateOperatorsGrid() {
    operatorsGrid.innerHTML = '';
    
    queueData.operators.forEach(operator => {
        const operatorCard = document.createElement('div');
        operatorCard.className = `operator-card ${operator.active ? 'active' : ''} ${queueData.currentOperator === operator.id ? 'current' : ''}`;
        operatorCard.innerHTML = `
            <div class="operator-icon">
                <i class="fas fa-user-tie"></i>
            </div>
            <div class="operator-info">
                <h4>${operator.name}</h4>
                <p>${operator.description}</p>
                <div class="operator-status">
                    <i class="fas fa-circle ${operator.active ? 'active' : 'inactive'}"></i>
                    <span>${operator.active ? 'Aktif' : 'Tidak Aktif'}</span>
                </div>
            </div>
        `;
        
        // Tambahkan event listener untuk klik operator
        operatorCard.addEventListener('click', () => {
            operatorSelect.value = operator.id;
        });
        
        operatorsGrid.appendChild(operatorCard);
    });
    
    // Update jumlah operator aktif
    const activeOperators = queueData.operators.filter(op => op.active).length;
    operatorActiveDisplay.textContent = activeOperators;
}

// Fungsi untuk memperbarui kartu operator yang sedang aktif
function updateOperatorCard(operatorId) {
    // Hapus kelas 'current' dari semua operator
    document.querySelectorAll('.operator-card').forEach(card => {
        card.classList.remove('current');
    });
    
    // Tambahkan kelas 'current' ke operator yang sesuai
    const operatorCard = document.querySelector(`.operator-card:nth-child(${operatorId})`);
    if (operatorCard) {
        operatorCard.classList.add('current');
        
        // Animasi
        operatorCard.classList.remove('pulse');
        void operatorCard.offsetWidth; // Trigger reflow
        operatorCard.classList.add('pulse');
    }
}

// Fungsi untuk toggle suara
function toggleSound() {
    queueData.soundEnabled = !queueData.soundEnabled;
    
    if (queueData.soundEnabled) {
        soundToggleBtn.innerHTML = '<i class="fas fa-volume-up"></i> Suara Aktif';
        soundToggleBtn.classList.add('active');
        speak('Suara sistem diaktifkan.');
    } else {
        soundToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Suara Nonaktif';
        soundToggleBtn.classList.remove('active');
    }
}

// Fungsi untuk tes suara
function testSound() {
    if (!queueData.soundEnabled) {
        alert('Aktifkan suara terlebih dahulu!');
        return;
    }
    
    speak('Ini adalah uji suara sistem antrian SPMB SMA Negeri 1 Magetan. Suara sistem berfungsi dengan baik.');
}

// Fungsi untuk memperbarui tanggal dan waktu
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    dateTimeDisplay.textContent = now.toLocaleDateString('id-ID', options);
}

// Fungsi untuk inisialisasi suara
function initializeVoices() {
    voices = speech.getVoices();
    
    // Jika voices belum dimuat, tunggu event voiceschanged
    if (voices.length === 0) {
        speech.onvoiceschanged = () => {
            voices = speech.getVoices();
        };
    }
}

// Event Listeners
callBtn.addEventListener('click', callQueue);
nextBtn.addEventListener('click', callNextQueue);
resetBtn.addEventListener('click', resetQueue);
soundToggleBtn.addEventListener('click', toggleSound);
testSoundBtn.addEventListener('click', testSound);

// Event untuk tombol Enter di input nomor antrian
queueNumberInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        callQueue();
    }
});

// Inisialisasi aplikasi
function initApp() {
    // Inisialisasi suara
    initializeVoices();
    
    // Update tanggal dan waktu secara real-time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Update tampilan awal
    updateDisplay();
    
    // Beri pesan selamat datang
    setTimeout(() => {
        if (queueData.soundEnabled) {
            speak('Sistem antrian SPMB SMA Negeri 1 Magetan siap digunakan.');
        }
    }, 1000);
    
    // Tambahkan event listener untuk perubahan suara
    speech.onvoiceschanged = initializeVoices;
}

// Jalankan aplikasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', initApp);