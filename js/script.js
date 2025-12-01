/* =======================================
 * SLIDER FUNCTIONALITY CODE
 * ======================================= */
const sliderImages = [
    "https://openmedtech-lab.github.io/images/OpenXamp.jpg",
    "https://openmedtech-lab.github.io/images/OpenXstim.png",
    "https://openmedtech-lab.github.io/images/OpenXhand.jpeg",
    "https://openmedtech-lab.github.io/images/OpenXwheel.png",
    "https://openmedtech-lab.github.io/images/OpenXstand.jpg",
    "https://openmedtech-lab.github.io/images/OpenXwalk.jpg"
];

let currentSlideIndex = 0;
let currentProjectHash = null; // Global state for project hash

function updateSlider() {
    const sliderImageElement = document.getElementById('slider-image');
    if (sliderImageElement) {
        sliderImageElement.src = sliderImages[currentSlideIndex];
    }
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % sliderImages.length;
    updateSlider();
}

function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + sliderImages.length) % sliderImages.length;
    updateSlider();
}


/* =======================================
 * ASYNCHRONOUS CONTENT LOADING
 * ======================================= */

// Function to dynamically load research.html content
function loadResearchContent() {
    const contentLoader = document.getElementById('research-content-loader');

    // Check if content is already loaded to prevent redundant network requests
    if (contentLoader && contentLoader.dataset.loaded === 'true') {
        return;
    }

    // Use Fetch API to load the external HTML file
    fetch('research.html')
        .then(response => {
            if (!response.ok) {
                // Check for HTTP errors (404, 500, etc.)
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            // Insert the HTML content into the loader div
            if (contentLoader) {
                contentLoader.innerHTML = html;
                contentLoader.dataset.loaded = 'true'; // Mark as loaded
            }
        })
        .catch(error => {
            console.error('Error loading research.html:', error);
            if (contentLoader) {
                contentLoader.innerHTML = '<p class="text-red-600 p-8 text-center">Sorry, the research content failed to load. Check your console for details.</p>';
            }
        });
}


/* =======================================
 * TAB AND NAVIGATION MANAGEMENT (Helper)
 * ======================================= */

// Define updateActiveNav globally so it can be called correctly
function updateActiveNav(tabId, projectHash = null) {
    // 3. Update desktop button state: Remove 'active' from ALL tab buttons first
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // NOTE: Removed 'researchBtn' since it doesn't exist as a standalone element in HTML
    const projectsBtn = document.getElementById('tab-projects-btn');

    if (tabId === 'research') {
        // SCENARIO: We are on the research tab, either via 'Projects' or a specific project link
        if (projectsBtn) {
            projectsBtn.classList.add('active'); // Activate the Projects dropdown button
        }
    } else {
        // For any other tab (home, people, contact), activate the main button for that tab
        const mainButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        if (mainButton) {
            mainButton.classList.add('active');
        }
    }

    // 4. Update mobile button state
    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeMobileButton = document.querySelector(`.mobile-nav-item[data-tab="${tabId}"]`);
    if (activeMobileButton) {
        activeMobileButton.classList.add('active');
    }
}

// Updated handleProjectClick
function handleProjectClick(event) {
    event.preventDefault();

    const tabId = event.currentTarget.dataset.tab; // Should be 'research'
    const projectHash = event.currentTarget.dataset.project;

    currentProjectHash = projectHash;

    // Explicitly hide the desktop dropdown menu
    const projectsMenu = document.getElementById('projects-menu');
    if (projectsMenu) {
        // By adding 'hidden', we override the group-hover:block
        projectsMenu.classList.add('hidden');
    }

    // Force Blur on the Projects Button (Good practice for focus management)
    const projectsButton = document.getElementById('tab-projects-btn');
    if (projectsButton) {
        projectsButton.blur();
    }

    // Close mobile menu after selection (elements retrieved in DOMContentLoaded)
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    const menuIconOpen = document.getElementById('menu-icon-open');
    const menuIconClose = document.getElementById('menu-icon-close');
    
    if (mobileNavMenu && !mobileNavMenu.classList.contains('hidden')) {
        mobileNavMenu.classList.add('hidden');
        if (menuIconOpen && menuIconClose) {
            menuIconOpen.classList.remove('hidden');
            menuIconClose.classList.add('hidden');
        }
    }

    // Show the correct tab, passing the specific project hash
    showTab(tabId, false, projectHash);
}

// Modified showTab function (now globally accessible)
function showTab(tabId, isInitialLoad = false, projectHash = null) {
    // 1. Hide all content tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // 2. Show the active content tab
    const activeContent = document.getElementById(`tab-${tabId}`);
    if (activeContent) {
        activeContent.classList.remove('hidden');

        // Load Research Content if tab is 'research'
        if (tabId === 'research') {
            loadResearchContent();
        }

        // SCROLL LOGIC
        if (isInitialLoad) {
            // For initial load, scroll to top completely
            window.scrollTo(0, 0);
        } else {
            let targetElement;
            
            if (tabId === 'research' && projectHash && projectHash !== 'research') {
                // If a specific project hash exists, scroll instantly to that element ID
                // Delay to ensure the content from research.html has time to load and render
                setTimeout(() => {
                    targetElement = document.getElementById(projectHash);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
                    }
                }, 50); // 50ms delay for content loading
            } else {
                // For all other tabs, scroll instantly to the top of the content area
                targetElement = activeContent;
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
                }
            }
        }
    }

    // 3 & 4. Update Navigation States (Called globally defined function)
    updateActiveNav(tabId, projectHash);
}


/* =======================================
 * INITIALIZATION (DOM Ready)
 * ======================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements *once* on load
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    const menuIconOpen = document.getElementById('menu-icon-open');
    const menuIconClose = document.getElementById('menu-icon-close');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn'); 
    const projectsMenu = document.getElementById('projects-menu');
    const prevBtn = document.getElementById('prev-slide-btn');
    const nextBtn = document.getElementById('next-slide-btn');

    // --- Tab Event Listeners (Desktop) ---
    // Attach listeners to all standard tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior if applicable
            currentProjectHash = null;
            showTab(e.currentTarget.dataset.tab, false);
        });
    });

    // --- Tab Event Listeners (Mobile) ---
    if (mobileNavMenu && menuIconOpen && menuIconClose) {
        mobileNavMenu.querySelectorAll('.mobile-nav-item').forEach(button => {
            button.addEventListener('click', (e) => {
                currentProjectHash = null;
                showTab(e.currentTarget.dataset.tab, false);

                // Close mobile menu after click
                mobileNavMenu.classList.add('hidden');
                menuIconOpen.classList.remove('hidden');
                menuIconClose.classList.add('hidden');
            });
        });
    }

    // --- Project Dropdown Links Event Listener ---
    if (projectsMenu) {
        projectsMenu.querySelectorAll('.dropdown-item').forEach(link => {
            link.addEventListener('click', handleProjectClick);
        });
    }

    // --- Mobile Menu Toggle ---
    if (mobileMenuBtn && mobileNavMenu && menuIconOpen && menuIconClose) { 
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileNavMenu.classList.contains('hidden');
            if (isHidden) {
                mobileNavMenu.classList.remove('hidden');
                menuIconOpen.classList.add('hidden');
                menuIconClose.classList.remove('hidden');
            } else {
                mobileNavMenu.classList.add('hidden');
                menuIconOpen.classList.remove('hidden');
                menuIconClose.classList.add('hidden');
            }
        });
    }
    
    // --- Slider Event Listeners ---
    if (prevBtn) { prevBtn.addEventListener('click', prevSlide); }
    if (nextBtn) { nextBtn.addEventListener('click', nextSlide); }

    // --- Initialization ---
    updateSlider();
    showTab('home', true); // Initialize to the 'home' tab on load
});
