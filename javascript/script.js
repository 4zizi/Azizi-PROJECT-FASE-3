const STORAGE_KEY = "daftarPendaftar";
const form = document.getElementById("registration-form");
const participantIdInput = document.getElementById("participant-id");
const tableBody = document.getElementById("participant-table-body");
const emptyState = document.getElementById("empty-state");
const participantCount = document.getElementById("participant-count");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");
const formTitle = document.getElementById("form-title");
const formDescription = document.getElementById("form-description");

function ambilPeserta() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function simpanPeserta(peserta) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(peserta));
}

function buatId() {
    return typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function tampilkanPeserta() {
    const peserta = ambilPeserta();
    tableBody.replaceChildren();
    participantCount.textContent = `${peserta.length} peserta`;
    emptyState.classList.toggle("hidden", peserta.length > 0);

    peserta.forEach((data) => {
        const row = document.createElement("tr");
        
        // Membaca properti jurusan (dengan fallback ke instansi jika data lama)
        const jurusanValue = data.jurusan || data.instansi || "-";
        const values = [data.nama, data.email, data.telepon, jurusanValue];
        
        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value || "-";
            row.appendChild(cell);
        });

        const kelasCell = document.createElement("td");
        const kelasSpan = document.createElement("span");
        // Membaca properti kelas (dengan fallback ke status jika data lama)
        const kelasValue = data.kelas || data.status || "X";
        kelasSpan.className = `status status-${kelasValue.toLowerCase()}`;
        kelasSpan.textContent = kelasValue;
        kelasCell.appendChild(kelasSpan);
        row.appendChild(kelasCell);

        const actionCell = document.createElement("td");
        const actionGroup = document.createElement("div");
        actionGroup.className = "action-group";
        actionGroup.append(
            buatTombolAksi("Edit", "edit-button", () => mulaiEdit(data.id)),
            buatTombolAksi("Hapus", "delete-button", () => hapusPeserta(data.id))
        );
        actionCell.appendChild(actionGroup);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

function buatTombolAksi(label, className, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `action-button ${className}`;
    button.textContent = label;
    button.addEventListener("click", handler);
    return button;
}

function resetForm() {
    form.reset();
    participantIdInput.value = "";
    document.getElementById("kelas").value = "X";
    submitButton.textContent = "Tambah Peserta";
    cancelButton.classList.add("hidden");
    formTitle.textContent = "Tambah Peserta";
    formDescription.textContent = "Isi formulir untuk mendaftarkan peserta baru.";
}

function mulaiEdit(id) {
    const data = ambilPeserta().find((peserta) => peserta.id === id);
    if (!data) return;
    participantIdInput.value = data.id;
    document.getElementById("nama").value = data.nama || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("telepon").value = data.telepon || "";
    document.getElementById("jurusan").value = data.jurusan || data.instansi || "";
    document.getElementById("kelas").value = data.kelas || data.status || "X";
    submitButton.textContent = "Simpan Perubahan";
    cancelButton.classList.remove("hidden");
    formTitle.textContent = "Edit Peserta";
    formDescription.textContent = "Perbarui data peserta yang dipilih.";
    form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function hapusPeserta(id) {
    const peserta = ambilPeserta();
    const data = peserta.find((item) => item.id === id);
    if (!data || !window.confirm(`Hapus data peserta ${data.nama}?`)) return;
    simpanPeserta(peserta.filter((item) => item.id !== id));
    if (participantIdInput.value === id) resetForm();
    tampilkanPeserta();
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const peserta = ambilPeserta();
    const data = {
        id: participantIdInput.value || buatId(),
        nama: document.getElementById("nama").value.trim(),
        email: document.getElementById("email").value.trim(),
        telepon: document.getElementById("telepon").value.trim(),
        jurusan: document.getElementById("jurusan").value.trim(),
        kelas: document.getElementById("kelas").value
    };
    const existingIndex = peserta.findIndex((item) => item.id === data.id);
    if (existingIndex === -1) peserta.push(data);
    else peserta[existingIndex] = data;
    simpanPeserta(peserta);
    resetForm();
    tampilkanPeserta();
});

cancelButton.addEventListener("click", resetForm);
tampilkanPeserta();