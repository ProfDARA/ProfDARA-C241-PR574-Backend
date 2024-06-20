async function searchByName() {
    const nama = document.getElementById('search-nama').value;
    try {
        const response = await fetch(`https://c241pr574backend-xd67kjleiq-et.a.run.app/refugee/refugees/search/bynama?nama=${nama}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error("Error searching by name:", error);
    }
}

async function searchByPosko() {
    const posko = document.getElementById('search-posko').value;
    try {
        const response = await fetch(`https://c241pr574backend-xd67kjleiq-et.a.run.app/refugee/refugees/search/byposko?posko=${posko}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error("Error searching by posko:", error);
    }
}

async function searchByFace() {
    const fileInput = document.getElementById('search-face');
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    try {
        const response = await fetch('https://c241pr574backend-xd67kjleiq-et.a.run.app/model/predict', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        displayImageResult(data);
        reverseSearchInFirestore(data.imageName);
    } catch (error) {
        console.error("Error searching by face:", error);
    }
}

function displayImageResult(data) {
    const results = document.getElementById('results');
    results.innerHTML = '';

    const resultCard = document.createElement('div');
    resultCard.classList.add('card', 'mb-3');

    let cardContent = `
        <div class="row no-gutters">
            <div class="col-md-4">
                <img src="${data.imageUrl}" class="card-img" alt="foto">
            </div>
            <div class="col-md-8">
                <div class="card-body">
                    <h5 class="card-title">Image Name: ${data.imageName}</h5>
                </div>
            </div>
        </div>
    `;

    resultCard.innerHTML = cardContent;
    results.appendChild(resultCard);
}

async function reverseSearchInFirestore(imageName) {
    try {
        const response = await fetch(`https://c241pr574backend-xd67kjleiq-et.a.run.app/refugee/refugees/search/byimagename?imageName=${imageName}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error("Error reverse searching in Firestore:", error);
    }
}

function displayResults(data) {
    const results = document.getElementById('results');
    results.innerHTML = '';

    data.forEach(item => {
        const resultCard = document.createElement('div');
        resultCard.classList.add('card', 'mb-3');

        let cardContent = `
            <div class="row no-gutters">
                <div class="col-md-4 d-flex justify-content-center align-items-center">
                    <img src="${item.imageUrl || 'default.jpg'}" class="card-img" alt="foto">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">Nama: ${item.nama}</h5>
                        <p class="card-text">id: ${item.id}</p>
                        <p class="card-text">Usia: ${item.usia}</p>
                        <p class="card-text">Asal Daerah: ${item.asal}</p>
                        <p class="card-text">Jenis Kelamin: ${item.jk}</p>
                        <p class="card-text">Posko: ${item.posko}</p>
                        <p class="card-text">Catatan: ${item.catatan}</p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-warning btn-sm" onclick="editRefugee('${item.id}')">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteRefugee('${item.id}')">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        resultCard.innerHTML = cardContent;
        results.appendChild(resultCard);
    });
}

async function deleteRefugee(id) {
    const confirmation = confirm("Apa Anda Yakin akan menghapus data ini?");
    if (confirmation) {
        try {
            const response = await fetch(`https://c241pr574backend-xd67kjleiq-et.a.run.app/refugee/refugee/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            alert("Data Berhasil dihapus!");
            searchByName(); // Refresh the search results
        } catch (error) {
            console.error("Error menghapus data:", error);
        }
    }
}

function editRefugee(id) {
    window.location.href = `edit.html?id=${id}`;}

