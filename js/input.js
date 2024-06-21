document.getElementById('input-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nama = document.getElementById('nama').value;
    const jk = document.getElementById('jk').value; // Corrected ID to 'jk'
    const usia = document.getElementById('usia').value;
    const asal = document.getElementById('asal_daerah').value;
    const posko = document.getElementById('posko').value;
    const catatan = document.getElementById('catatan').value;
    const image = document.getElementById('image').files[0];

    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('jk', jk);
    formData.append('usia', usia);
    formData.append('asal', asal);
    formData.append('posko', posko);
    formData.append('catatan', catatan);
    formData.append('image', image);

    try {
        const response = await fetch('https://c241pr574backend-xd67kjleiq-et.a.run.app/refugee/register', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (response.ok) {
            alert('Data berhasil dimasukan!');
        } else {
            const errorData = await response.json();
            console.error('Error:', response.status, errorData);
            alert(`Gagal memasukan data: ${errorData.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Network Error:', error);
        alert('Network error, Mohon coba kembali.');
    }
});