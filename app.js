document.addEventListener('DOMContentLoaded', function () {
    const username = 'geekabhinav007';
    const defaultPage = 1;
    const defaultPerPage = 10;
    const accessToken = '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';

    // Declare headers at the beginning
    const headers = {
        Authorization: `Bearer ${accessToken}`
    };

    // Initial load
    fetchProfile(username);
    fetchRepositories(username, defaultPage, defaultPerPage);

    // Fetch user profile information
    function fetchProfile(username) {
        fetch(`https://api.github.com/users/${username}`, { headers })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status}`);
                }
                return response.json();
            })
            .then(profileData => updateProfileUI(profileData))
            .catch(error => console.error('Error fetching profile data:', error));
    }

// Update UI with user profile information
function updateProfileUI(profileData) {
    document.title = profileData.name || 'GitHub Repositories';

    const header = document.querySelector('header');
    header.innerHTML += `
    <div style=" align-items: center; font-weight: 700; margin-right: 5vh;margin-left:5vh;">
        <img src="${profileData.avatar_url}" alt="Profile Picture" style="width: 250px; height: 250px; border-radius: 50%; margin-right: 20px;">
        <div style="text-align: left;margin-left:5vh;">
            <p style="font-size: 24px; font-weight: bold; margin-bottom: 5px; ">${profileData.name || 'Not provided'}</p>
            <p style="font-size: 18px; color: #555;">${profileData.login}</p>
            <p style="font-size: 16px; margin-top: 5px;">${profileData.bio || 'No bio available'}</p>
            <p style="font-size: 16px; color: #777; margin-top: 5px;">${profileData.location || 'Not provided'}</p>
        </div>
    </div>
`;
}
    function fetchRepositories(username, page, perPage) {
        toggleLoader(true);

        const apiUrl = `https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`;

        // Pass the headers in the options object
        fetch(apiUrl, { headers })
            .then(response => {
                // Check for the Link header
                const linkHeader = response.headers.get('Link');
                const totalItems = response.headers.get('Total-Count');
                const totalPages = extractTotalPages(linkHeader, totalItems, perPage);

                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status}`);
                }

                return response.json().then(data => {
                    populateRepositoryList(data);
                    handlePagination(page, perPage, totalPages);
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                toggleLoader(false);
            });
    }

   

    // Helper function to extract total pages from Link header or calculate based on total items
    function extractTotalPages(linkHeader, totalItems, perPage) {
        if (linkHeader) {
            const matches = linkHeader.match(/&page=(\d+).*?rel="last"/);
            if (matches && matches[1]) {
                return parseInt(matches[1], 10);
            }
        }

        // If Link header is not present or doesn't contain 'last', calculate total pages
        if (totalItems && perPage) {
            return Math.ceil(totalItems / perPage);
        }

        return 6;
    }

    // Populate repository list with technologies
    function populateRepositoryList(repositories) {
        const repositoryList = document.getElementById('repository-list');
        repositoryList.innerHTML = '';

        const gridContainer = document.createElement('div');
        gridContainer.classList.add('row'); // Bootstrap class for a grid

        repositories.forEach(repo => {
            const repoItem = document.createElement('div');
            repoItem.classList.add('col-md-6', 'mb-4', 'rounded'); // Bootstrap classes for grid columns and margin
            repoItem.innerHTML = `<div class="card">
            <div class="card-body">
                <h3 class="card-title text-primary">${repo.name}</h3>
                <p class="card-text">${repo.description || 'No description available'}</p>
                <div class="technologies-list"></div>
            </div>
        </div>`;
            fetchAndDisplayLanguages(repo, repoItem.querySelector('.technologies-list'));
            gridContainer.appendChild(repoItem);
        });

        repositoryList.appendChild(gridContainer);
    }
    // Fetch and display technologies used in each repository
    function fetchAndDisplayLanguages(repo, technologiesListContainer) {
        fetch(repo.languages_url)
            .then(response => response.json())
            .then(languages => {
                const maxItemsToShow = 4; // Maximum number of items to display
                const technologiesList = document.createElement('div');
                technologiesList.classList.add('d-flex', 'gap-3', 'flex-wrap'); // Bootstrap classes for flex container

                // Limit the number of items displayed
                const displayedLanguages = Object.keys(languages).slice(0, maxItemsToShow);

                displayedLanguages.forEach(language => {
                    const listItem = document.createElement('div');
                    listItem.classList.add('list-group-item', 'bg-primary', 'text-white', 'm-1', 'rounded'); // Bootstrap classes for list items
                    listItem.innerText = language;
                    technologiesList.appendChild(listItem);
                });

                // If there are more items than the maximum, add a "Load More" button
                if (Object.keys(languages).length > maxItemsToShow) {
                    const loadMoreButton = document.createElement('button');
                    loadMoreButton.classList.add('btn', 'btn-secondary');
                    loadMoreButton.innerText = 'Load More';

                    loadMoreButton.addEventListener('click', () => {
                        // Call a function to load and display additional items
                        fetchAndDisplayMoreLanguages(repo.languages_url, technologiesList);
                    });
                    technologiesList.appendChild(loadMoreButton);
                }

                technologiesListContainer.appendChild(technologiesList);
            })
            .catch(error => console.error('Error fetching languages:', error));
    }

    // Function to fetch and display additional technologies when "Load More" is clicked
    function fetchAndDisplayMoreLanguages(languagesUrl, technologiesListContainer) {
        // You can implement additional fetch logic to load more items
        // For simplicity, this example just fetches all items again
        fetch(languagesUrl)
            .then(response => response.json())
            .then(languages => {
                // Remove the "Load More" button
                const loadMoreButton = technologiesListContainer.querySelector('.btn-secondary');
                if (loadMoreButton) {
                    technologiesListContainer.removeChild(loadMoreButton);
                }

                // Display all available items
                Object.keys(languages).forEach(language => {
                    const listItem = document.createElement('div');
                    listItem.classList.add('list-group-item', 'bg-primary', 'text-white', 'm-1', 'rounded');
                    listItem.innerText = language;
                    technologiesListContainer.appendChild(listItem);
                });
            })
            .catch(error => console.error('Error fetching more languages:', error));
    }




    // Handle pagination
    function handlePagination(page, perPage, totalPages) {
        const paginationSection = document.getElementById('pagination');

        // Create a pagination container
        const paginationContainer = document.createElement('nav');
        paginationContainer.setAttribute('aria-label', 'Page navigation');

        // Create a pagination list
        const paginationList = document.createElement('ul');
        paginationList.classList.add('pagination', 'justify-content-center'); // Center the pagination list

        // Create 'Previous' button
        const previousButton = createPaginationButton(page - 1, 'Previous', 'page-item');
        paginationList.appendChild(previousButton);

        // Create numbered buttons
        for (let i = 1; i <= totalPages; i++) {
            const paginationButton = createPaginationButton(i, i, 'page-item', i === page); // Highlight the current page
            paginationList.appendChild(paginationButton);
        }

        // Create 'Next' button
        const nextButton = createPaginationButton(page + 1, 'Next', 'page-item');
        paginationList.appendChild(nextButton);

        // Append pagination list to container
        paginationContainer.appendChild(paginationList);

        // Append the pagination container to the pagination section
        paginationSection.innerHTML = '';
        paginationSection.appendChild(paginationContainer);
    }
    // Helper function to create pagination button
    function createPaginationButton(pageNumber, buttonText, itemClass, isCurrent) {
        const listItem = document.createElement('li');
        listItem.classList.add(itemClass);

        const link = document.createElement('a');
        link.classList.add('page-link');
        link.href = '#';
        link.innerText = buttonText;

        // Add an event listener to the link
        link.addEventListener('click', () => {
            fetchRepositories(username, pageNumber, defaultPerPage); // Change defaultPerPage to perPage
        });

        if (isCurrent) {
            listItem.classList.add('active'); // Bootstrap class for the active page
        }

        listItem.appendChild(link);

        return listItem;
    }
    // Show/hide loader
    function toggleLoader(show) {
        const loader = document.getElementById('loader');
        loader.style.display = show ? 'block' : 'none';
    }
});
