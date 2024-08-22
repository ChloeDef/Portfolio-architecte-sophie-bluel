/////////////////////////////////////////////////////
// Gestion de la Home Page /////////////////////////
/////////////////////////////////////////////////////

const sectionProjets = document.querySelector(".gallery");

// Fonction pour récupérer les catégories depuis l'API ou le localStorage
async function getCategories() {
    let categories = JSON.parse(localStorage.getItem('categories'));
    if (!categories) {
        try {
            const response = await fetch('http://localhost:5678/api/categories');
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des catégories');
            }
            categories = await response.json();
            localStorage.setItem('categories', JSON.stringify(categories));
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    return categories;
}

// Fonction pour récupérer les projets depuis l'API ou le localStorage
async function getProjects() {
    let projects = JSON.parse(localStorage.getItem('projects'));
    if (!projects) {
        try {
            const response = await fetch('http://localhost:5678/api/works');
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des projets');
            }
            projects = await response.json();
            localStorage.setItem('projects', JSON.stringify(projects));
        } catch (error) {
            const p = document.createElement("p");
            p.classList.add("error");
            p.innerHTML = "Une erreur est survenue lors de la récupération des projets.<br><br>Une tentative de reconnexion automatique aura lieu dans une minute.<br><br><br><br>Si le problème persiste, veuillez contacter l'administrateur du site.";
            sectionProjets.appendChild(p);
            await new Promise(resolve => setTimeout(resolve, 60000));
            window.location.href = "index.html";
            return [];
        }
    }
    return projects;
}

// Fonction pour réinitialiser la section des projets
function resetSectionProjets() {
    sectionProjets.innerHTML = "";
}

// Fonction pour générer les projets
async function generationProjets(id = null) {
    const data = await getProjects();

    resetSectionProjets();

    // Mise à jour des boutons de filtre actifs
    document.querySelectorAll(".filter__btn").forEach(btn => {
        btn.classList.remove("filter__btn--active");
    });
    const activeBtn = document.querySelector(`.filter__btn-id-${id}`) || document.querySelector('.filter__btn-id-null');
    activeBtn.classList.add("filter__btn--active");

    if (!data || data.length === 0) {
        const p = document.createElement("p");
        p.classList.add("error");
        p.innerHTML = "Aucun projet à afficher.<br><br>Toutes nos excuses pour la gêne occasionnée.";
        sectionProjets.appendChild(p);
        return;
    }

    // Filtre les projets par catégorie si un id est fourni
    const filteredData = id ? data.filter(project => project.categoryId === id) : data;

    filteredData.forEach(project => {
        const figure = document.createElement("figure");
        figure.classList.add(`js-projet-${project.id}`);
        sectionProjets.appendChild(figure);

        const img = document.createElement("img");
        img.src = project.imageUrl;
        img.alt = project.title;
        figure.appendChild(img);

        const figcaption = document.createElement("figcaption");
        figcaption.innerHTML = project.title;
        figure.appendChild(figcaption);
    });
}

// Fonction pour générer dynamiquement les boutons de filtre
async function generateFilterButtons() {
    const categories = await getCategories();
    const filterDiv = document.querySelector('.filters');
    filterDiv.innerHTML = ''; // Réinitialise les boutons existants

    // Ajoute le bouton "Tous"
    const btnAll = document.createElement('button');
    btnAll.classList.add('filter__btn', 'filter__btn-id-null');
    btnAll.textContent = 'Tous';
    btnAll.addEventListener('click', () => generationProjets(null));
    filterDiv.appendChild(btnAll);

    // Ajoute les boutons pour chaque catégorie
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.classList.add('filter__btn', `filter__btn-id-${category.id}`);
        btn.textContent = category.name;
        btn.addEventListener('click', () => generationProjets(category.id));
        filterDiv.appendChild(btn);
    });
}

// Appelle la fonction pour générer les boutons dès le chargement de la page
generateFilterButtons();
generationProjets();

/////////////////////////////////////////////////////
// Gestion des modules administrateur ///////////////
/////////////////////////////////////////////////////

// Variables et éléments globaux
let modale = null;
let dataAdmin;
const modaleSectionProjets = document.querySelector(".js-admin-projets");
const token = localStorage.getItem("token");
const AlredyLogged = document.querySelector(".js-alredy-logged");

// Gestion de l'affichage des boutons admin
function adminPanel() {
    document.querySelectorAll(".admin__modifer").forEach(a => {
        if (token !== null) {
            a.removeAttribute("aria-hidden");
            a.removeAttribute("style");
            AlredyLogged.innerHTML = "logout";
        }
    });

    // Cache les boutons de filtre si l'utilisateur est connecté
    const filterButtons = document.querySelector('.filters');
    if (token !== null && filterButtons) {
        filterButtons.classList.add('hidden');
    }
}
adminPanel();

// Ouverture et fermeture des modales
function openModale(e) {
    e.preventDefault();
    modale = document.querySelector(e.target.getAttribute("href"));

    modaleProjets(); // Génère les projets dans la modale admin
    setTimeout(() => {
        modale.style.display = null;
        modale.removeAttribute("aria-hidden");
        modale.setAttribute("aria-modal", "true");
    }, 25);

    modale.addEventListener("click", closeModale);
    modale.querySelector(".js-modale-close").addEventListener("click", closeModale);
    modale.querySelector(".js-modale-stop").addEventListener("click", e => e.stopPropagation());
}

function closeModale(e) {
    e.preventDefault();
    if (modale === null) return;

    modale.setAttribute("aria-hidden", "true");
    modale.removeAttribute("aria-modal");
    window.setTimeout(() => {
        modale.style.display = "none";
        modale = null;
        resetmodaleSectionProjets();
    }, 300);
}

document.querySelectorAll(".js-modale").forEach(a => {
    a.addEventListener("click", openModale);
});

window.addEventListener("keydown", function(e) {
    if (e.key === "Escape" || e.key === "Esc") {
        closeModale(e);
        closeModaleProjet(e);
    }
});

// Génère les projets dans la modale admin
async function modaleProjets() {
    const dataAdmin = await getProjects();
    resetmodaleSectionProjets();
    dataAdmin.forEach(project => {
        const div = document.createElement("div");
        div.classList.add("gallery__item-modale");
        modaleSectionProjets.appendChild(div);

        const img = document.createElement("img");
        img.src = project.imageUrl;
        img.alt = project.title;
        div.appendChild(img);

        const p = document.createElement("p");
        p.classList.add(project.id, "js-delete-work");
        div.appendChild(p);

        const icon = document.createElement("i");
        icon.classList.add("fa-solid", "fa-trash-can");
        p.appendChild(icon);

        const a = document.createElement("a");
        a.innerHTML = "Éditer";
        div.appendChild(a);
    });
    deleteWork();
}

// Reset la section projets de la modale
function resetmodaleSectionProjets() {
    modaleSectionProjets.innerHTML = "";
}

// Gestion de la suppression des projets
function deleteWork() {
    let btnDelete = document.querySelectorAll(".js-delete-work");
    btnDelete.forEach(btn => {
        btn.addEventListener("click", async function() {
            await fetch(`http://localhost:5678/api/works/${this.classList[0]}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(response => {
                if (response.status === 204) {
                    refreshPage(this.classList[0]);
                } else if (response.status === 401 || response.status === 404) {
                    alert("Token incorrect, déconnexion en cours");
                    logout();
                }
            })
            .catch(error => {
                console.error(error);
            });
        });
    });
}

// Fonction de déconnexion
function logout() {
    localStorage.removeItem("token");
    location.reload();
}

// Rafraîchir la page après suppression du projet
function refreshPage(id) {
    document.querySelector(`.js-projet-${id}`).remove();
    document.querySelector(`.${id}`).parentElement.remove();
}

// Ouverture et gestion de la modale projet
let modaleProjet = null;

function openModaleProjet(e) {
    e.preventDefault();
    modaleProjet = document.querySelector(e.target.getAttribute("href"));
    modaleProjet.style.display = null;
    modaleProjet.removeAttribute("aria-hidden");
    modaleProjet.setAttribute("aria-modal", "true");

    addCategoriesToModal();

    modaleProjet.addEventListener("click", closeModaleProjet);
    modaleProjet.querySelector(".js-modale-close").addEventListener("click", closeModaleProjet);
    modaleProjet.querySelector(".js-modale-stop").addEventListener("click", e => e.stopPropagation());
    modaleProjet.querySelector(".js-modale-return").addEventListener("click", backToModale);
}

function backToModale(e) {
    closeModaleProjet(e);
    openModale(e);
}

function closeModaleProjet(e) {
    e.preventDefault();
    if (modaleProjet === null) return;

    modaleProjet.setAttribute("aria-hidden", "true");
    modaleProjet.removeAttribute("aria-modal");
    window.setTimeout(() => {
        modaleProjet.style.display = "none";
        modaleProjet = null;
    }, 300);
}

// Ajout dynamique des catégories dans la modale projet
async function addCategoriesToModal() {
    const categories = await getCategories();
    const selectElement = document.getElementById("category");

    // Réinitialise les options existantes
    selectElement.innerHTML = "";

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        selectElement.appendChild(option);
    });
}

document.querySelectorAll(".js-modale-projet").forEach(a => {
    a.addEventListener("click", openModaleProjet);
});

window.addEventListener("keydown", function(e) {
    if (e.key === "Escape" || e.key === "Esc") {
        closeModaleProjet(e);
    }
});


// Affiche l'image sélectionnée dynamiquement

document.getElementById("photo").addEventListener("change", function(event) {
    const preview = document.getElementById("preview");
    const file = event.target.files[0];
    const icon = document.querySelector(".form-group-photo i");
    const label = document.querySelector(".form-group-photo label");
    const formGroupPhoto = document.querySelector(".form-group-photo");

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = "block";

            // Cache les autres éléments dans la div et le ::after
            icon.classList.add("hidden");
            label.classList.add("hidden");
            formGroupPhoto.classList.add("image-selected");
        };

        reader.readAsDataURL(file);
    } else {
        preview.src = "";
        preview.style.display = "none";

        // Réaffiche les éléments si aucun fichier n'est sélectionné
        icon.classList.remove("hidden");
        label.classList.remove("hidden");
        formGroupPhoto.classList.remove("image-selected");
    }
});
