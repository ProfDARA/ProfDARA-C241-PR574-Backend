document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const refugeeId = urlParams.get("id");

    if (refugeeId) {
        await fetchRefugeeData(refugeeId);
    }

    const form = document.getElementById("input-form");
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        await updateRefugeeData(refugeeId);
    });
});

async function fetchRefugeeData(id) {
    try {
        const response = await fetch(`https://c241pr574backend-xd67kjleiq-et.a.run.app/refugee/refugee/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error Pengambilan Data: ${response.statusText}`);
        }
        const data = await response.json();
        populateForm(data);
    } catch (error) {
        console.error("Error Pengambilan Data:", error);
    }
}

function populateForm(data) {
    document.getElementById("nama").value = data.nama;
    document.getElementById("jk").value = data.jk;
    document.getElementById("usia").value = data.usia;
    document.getElementById("asal_daerah").value = data.asal;
    document.getElementById("posko").value = data.posko;
    document.getElementById("catatan").value = data.catatan;
}

async function updateRefugeeData(id) {
    const formData = {
        "nama": document.getElementById("nama").value,
        "jk": document.getElementById("jk").value,
        "usia": document.getElementById("usia").value,
        "asal": document.getElementById("asal_daerah").value,
        "posko": document.getElementById("posko").value,
        "catatan": document.getElementById("catatan").value
    };

    try {
        const response = await fetch(`https://c241pr574backend-xd67kjleiq-et.a.run.app/refugee/refugee/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });
        if (!response.ok) {
            throw new Error(`Error updating refugee data: ${response.statusText}`);
        }
        alert("Data Berhasil Diubah!");
        window.location.href = "search.html";
    } catch (error) {
        console.error("Error Pengubahan Data:", error);
    }
}