/////////////////////////////////////////////////////
// Gestion de la home page  /////////////////////////
/////////////////////////////////////////////////////
// >>> GENERATION DES PROJETS

const btnAll = document.querySelector(".filter__btn-id-null");
const btnId1 = document.querySelector(".filter__btn-id-1");
const btnId2 = document.querySelector(".filter__btn-id-2");
const btnId3 = document.querySelector(".filter__btn-id-3");

const sectionProjets = document.querySelector(".gallery");

let data = null;
let id;
generationProjets(data, null);

// Reset la section projets
function resetSectionProjets() {
    sectionProjets.innerHTML = "";
}

// Génère les projets
async function generationProjets(data, id) {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        data = await response.json();
    } catch {
        const p = document.createElement("p");
        p.classList.add("error");
        p.innerHTML = "Une erreur est survenue lors de la récupération des projets<br><br>Une tentative de reconnexion automatique auras lieu dans une minute<br><br><br><br>Si le problème persiste, veuillez contacter l'administrateur du site";
        sectionProjets.appendChild(p);
        await new Promise(resolve => setTimeout(resolve, 60000));
        window.location.href = "index.html";
    }

    resetSectionProjets();

    // Filtre les résultats
    if ([1, 2, 3].includes(id)) {
        data = data.filter(data => data.categoryId == id);
    }

    // Change la couleur du bouton en fonction du filtre
    document.querySelectorAll(".filter__btn").forEach(btn => {
        btn.classList.remove("filter__btn--active");
    });
    document.querySelector(`.filter__btn-id-${id}`).classList.add("filter__btn--active");

    if (data.length === 0 || data === undefined) {
        const p = document.createElement("p");
        p.classList.add("error");
        p.innerHTML = "Aucun projet à afficher <br><br>Toutes nos excuses pour la gêne occasionnée";
        sectionProjets.appendChild(p);
        return;
    }

    // Génère les projets
    if (id === null || [1, 2, 3].includes(id)) {
        for (let i = 0; i < data.length; i++) {
            const figure = document.createElement("figure");
            sectionProjets.appendChild(figure);
            figure.classList.add(`js-projet-${data[i].id}`); // Ajoute l'id du projet pour le lien vers la modale lors de la suppression
            const img = document.createElement("img");
            img.src = data[i].imageUrl;
            img.alt = data[i].title;
            figure.appendChild(img);

            const figcaption = document.createElement("figcaption");
            figcaption.innerHTML = data[i].title;
            figure.appendChild(figcaption);
        }
    }
}

//////////////
// >>> FILTRES

btnAll.addEventListener("click", () => {
    generationProjets(data, null);
});

btnId1.addEventListener("click", () => {
    generationProjets(data, 1);
});

btnId2.addEventListener("click", () => {
    generationProjets(data, 2);
});

btnId3.addEventListener("click", () => {
    generationProjets(data, 3);
});

// Si l'utilisateur est déjà connecté, on supprime les btn filtres
document.addEventListener('alredylogged', function() {
    // Ajout de la classe 'hidden' à la div avec la classe 'filters'
    document.querySelector('.filters').classList.add('hidden');
});

/////////////////////////////////////////////////////
// Gestion des modules administrateur ///////////////
/////////////////////////////////////////////////////
// INDEX : 1- GESTION BOITE MODALE                 //
//         2- GESTION TOKEN LOGIN                  //
//         3- GENERATION DS LA MODALE              //
//         4- GESTION SUPPRESSION PROJET           //
//         5- GESTION AJOUT PROJET                 //
//         6- GESTION AJOUT D'UN PROJET            //
/////////////////////////////////////////////////////
// INDEX : 1-// GESTION BOITE MODALE ////////////////
/////////////////////////////////////////////////////
// Reset la section projets
function resetmodaleSectionProjets() {
    modaleSectionProjets.innerHTML = "";
}

// Ouverture de la modale
let modale = null;
let dataAdmin;
const modaleSectionProjets = document.querySelector(".js-admin-projets");

const openModale = function(e) {
    e.preventDefault();
    modale = document.querySelector(e.target.getAttribute("href"));

    modaleProjets(); // Génère les projets dans la modale admin
    // attendre la fin de la génération des projets
    setTimeout(() => {
        modale.style.display = null;
        modale.removeAttribute("aria-hidden");
        modale.setAttribute("aria-modal", "true");
    }, 25);
    // Ajout EventListener sur les boutons pour ouvrir la modale projet
    document.querySelectorAll(".js-modale-projet").forEach(a => {
        a.addEventListener("click", openModaleProjet);
    });

    // Apl fermeture modale
    modale.addEventListener("click", closeModale);
    modale.querySelector(".js-modale-close").addEventListener("click", closeModale);
    modale.querySelector(".js-modale-stop").addEventListener("click", stopPropagation);
};

// Génère les projets dans la modale admin
async function modaleProjets() {
    const response = await fetch('http://localhost:5678/api/works');
    dataAdmin = await response.json();
    resetmodaleSectionProjets();
    for (let i = 0; i < dataAdmin.length; i++) {
        const div = document.createElement("div");
        div.classList.add("gallery__item-modale");
        modaleSectionProjets.appendChild(div);

        const img = document.createElement("img");
        img.src = dataAdmin[i].imageUrl;
        img.alt = dataAdmin[i].title;
        div.appendChild(img);

        const p = document.createElement("p");
        div.appendChild(p);
        p.classList.add(dataAdmin[i].id, "js-delete-work");

        const icon = document.createElement("i");
        icon.classList.add("fa-solid", "fa-trash-can");
        p.appendChild(icon);

        const a = document.createElement("a");
        a.innerHTML = "Éditer";
        div.appendChild(a);
    }
    deleteWork();
}

// Ferme la modale
const closeModale = function(e) {
    e.preventDefault();
    if (modale === null) return;

    modale.setAttribute("aria-hidden", "true");
    modale.removeAttribute("aria-modal");

    modale.querySelector(".js-modale-close").removeEventListener("click", closeModale);

    // Fermeture de la modale apres 400ms
    window.setTimeout(function() {
        modale.style.display = "none";
        modale = null;
        resetmodaleSectionProjets();
    }, 300);
};

// Définit la "border" du click pour fermer la modale
const stopPropagation = function(e) {
    e.stopPropagation();
};
// Selectionne les éléments qui ouvrent la modale
document.querySelectorAll(".js-modale").forEach(a => {
    a.addEventListener("click", openModale);
});
// Ferme la modale avec la touche echap
window.addEventListener("keydown", function(e) {
    if (e.key === "Escape" || e.key === "Esc") {
        closeModale(e);
        closeModaleProjet(e);
    }
});

////////////////////////////////////////////////////
// INDEX : 2-//// GESTION TOKEN LOGIN //////////////
////////////////////////////////////////////////////

// Récupération du token
const token = localStorage.getItem("token");
const AlredyLogged = document.querySelector(".js-alredy-logged");

adminPanel();
// Gestion de l'affichage des boutons admin
function adminPanel() {
    document.querySelectorAll(".admin__modifer").forEach(a => {
        if (token === null) {
            return;
        } else {
            a.removeAttribute("aria-hidden");
            a.removeAttribute("style");
            AlredyLogged.innerHTML = "logout";
        }
    });
}

// Cache les boutons de filtre si l'utilisateur est connecté
    const filterButtons = document.querySelector('.filters');
    if (token !== null && filterButtons) {
        filterButtons.classList.add('hidden');
    }

////////////////////////////////////////////////////////////
// INDEX : 3-// GESTION SUPPRESSION D'UN PROJET /////////////
////////////////////////////////////////////////////////////

// Event listener sur les boutons supprimer par apport a leur id
function deleteWork() {
    let btnDelete = document.querySelectorAll(".js-delete-work");
    for (let i = 0; i < btnDelete.length; i++) {
        btnDelete[i].addEventListener("click", deleteProjets);
    }
}

// Supprimer le projet
async function deleteProjets() {
    console.log("DEBUG DEBUT DE FUNCTION SUPRESSION");
    console.log(this.classList[0]);
    console.log(token);

    await fetch(`http://localhost:5678/api/works/${this.classList[0]}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
        console.log(response);
        // Token good
        if (response.status === 204) {
            console.log("DEBUG SUPPRESION DU PROJET " + this.classList[0]);
            refreshPage(this.classList[0]);
        } else if (response.status === 401 || response.status === 404) {
            console.log("DEBUG DEBUT DE FUNCTION SUPRESSION TOKEN INCORRECT");
            console.log(response);
            alert("Token incorrect, déconnexion en cours");
            logout();
        }
    })
    .catch(error => {
        console.log(error);
    });
}

// Logout
function logout() {
    localStorage.removeItem("token");
    location.reload();
}

// Refresh la page après suppression du projet
function refreshPage(id) {
    const figure = document.querySelector(`.js-projet-${id}`);
    figure.remove();
    const div = document.querySelector(`.${id}`);
    div.parentElement.remove();
}

////////////////////////////////////////////////////
// INDEX : 4-// GESTION AJOUT D'UN PROJET //////////
////////////////////////////////////////////////////

// Variable globale pour stocker la référence de la modale projet
let modaleProjet = null;

// Fonction pour récupérer les catégories depuis l'API
async function getCategories() {
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des catégories');
        }
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Fonction pour ajouter les catégories aux options de la modale
async function addCategoriesToModal() {
    const categorySelect = document.querySelector('.js-categoryId');
    const categories = await getCategories();
    categorySelect.innerHTML = ''; // Réinitialiser les options

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Ouverture de la modale projet
const openModaleProjet = function(e) {
    e.preventDefault();
    modaleProjet = document.querySelector(e.target.getAttribute("href"));

    modaleProjet.style.display = null;
    modaleProjet.removeAttribute("aria-hidden");
    modaleProjet.setAttribute("aria-modal", "true");

    // Ajouter les catégories à la modale
    addCategoriesToModal();

    // Apl fermeture modale
    modaleProjet.addEventListener("click", closeModaleProjet);
    modaleProjet.querySelector(".js-modale-close").addEventListener("click", closeModaleProjet);
    modaleProjet.querySelector(".js-modale-stop").addEventListener("click", stopPropagation);
    modaleProjet.querySelector(".js-modale-return").addEventListener("click", backToModale);
};

// Retour à la modale principale
const backToModale = function(e) {
    closeModaleProjet(e);
    openModale(e);
};

// Ferme la modale projet
const closeModaleProjet = function(e) {
    e.preventDefault();
    if (modaleProjet === null) return;

    modaleProjet.setAttribute("aria-hidden", "true");
    modaleProjet.removeAttribute("aria-modal");

    modaleProjet.querySelector(".js-modale-close").removeEventListener("click", closeModaleProjet);

    // Fermeture de la modale apres 400ms
    window.setTimeout(function() {
        modaleProjet.style.display = "none";
        modaleProjet = null;
    }, 300);
};

// Selectionne les éléments qui ouvrent la modale projet
document.querySelectorAll(".js-modale-projet").forEach(a => {
    a.addEventListener("click", openModaleProjet);
});

// Validation du formulaire
const form = document.querySelector(".js-projet-form");
form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData(form);
    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            closeModaleProjet(e);
            generationProjets(data, null); // Recharge les projets après l'ajout
        } else {
            throw new Error('Erreur lors de l\'ajout du projet');
        }
    } catch (error) {
        console.error(error);
        alert('Une erreur est survenue lors de l\'ajout du projet');
    }
});
