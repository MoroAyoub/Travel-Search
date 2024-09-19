document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const departureInput = document.getElementById('departureInput');
    const destinationInput = document.getElementById('destinationInput');
    const dateInput = document.getElementById('dateInput');
    const resultsDiv = document.getElementById('results');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const loadingIndicator = document.getElementById('loadingIndicator');

    let currentPage = 1;
    let totalPages = 1;
    let currentSearchParams = {};

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const debouncedFetchResults = debounce(fetchResults, 300);

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentSearchParams = {
            departure: departureInput.value.trim().toUpperCase(),
            destination: destinationInput.value.trim().toUpperCase(),
            date: dateInput.value
        };
        currentPage = 1;
        await debouncedFetchResults();
    });

    prevPageBtn.addEventListener('click', async () => {
        if (currentPage > 1) {
            currentPage--;
            await fetchResults();
        }
    });

    nextPageBtn.addEventListener('click', async () => {
        if (currentPage < totalPages) {
            currentPage++;
            await fetchResults();
        }
    });

    async function fetchResults() {
        if (currentSearchParams.departure && currentSearchParams.destination && currentSearchParams.date) {
            try {
                loadingIndicator.style.display = 'flex';
                const queryParams = new URLSearchParams({
                    departure: currentSearchParams.departure,
                    destination: currentSearchParams.destination,
                    date: currentSearchParams.date,
                    page: currentPage
                });
                const url = `http://localhost:3000/api/search?${queryParams}`;
                console.log('Fetching from URL:', url);
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Received data:', data);
                displayResults(data);
                updatePagination(data);
            } catch (error) {
                console.error('Fetch error:', error);
                resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
            } finally {
                loadingIndicator.style.display = 'none';
            }
        }
    }

    function displayResults(data) {
        if (data && data.length > 0) {
            const resultHtml = data.map(flight => `
                <div class="flight-card">
                    <h3>Flight ${flight.id}</h3>
                    <p>Departure: ${flight.itineraries[0].segments[0].departure.iataCode} at ${formatDate(flight.itineraries[0].segments[0].departure.at)}</p>
                    <p>Arrival: ${flight.itineraries[0].segments[0].arrival.iataCode} at ${formatDate(flight.itineraries[0].segments[0].arrival.at)}</p>
                    <p>Duration: ${formatDuration(flight.itineraries[0].duration)}</p>
                    <p>Airline: ${flight.validatingAirlineCodes[0]}</p>
                    <p class="price">Price: ${flight.price.total} ${flight.price.currency}</p>
                    <p>Cabin: ${flight.travelerPricings[0].fareDetailsBySegment[0].cabin}</p>
                    <p>Seats Available: ${flight.numberOfBookableSeats}</p>
                    <button class="book-flight-btn" onclick="bookFlight('${flight.id}')">Book Flight</button>
                </div>
            `).join('');
            resultsDiv.innerHTML = resultHtml;
        } else {
            resultsDiv.innerHTML = '<p>No flights found for the given criteria.</p>';
        }
    }

    function bookFlight(flightId) {
        // This function would handle the booking process
        alert(`Initiating booking process for flight ${flightId}. In a real application, this would redirect to a booking page or open a booking modal.`);
        // In a real application, you might do something like:
        // window.location.href = `https://yourbookingsite.com/book-flight/${flightId}`;
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString('en-US', options);
    }

    function formatDuration(duration) {
        // Duration is in format "PT4H25M"
        const hours = duration.match(/(\d+)H/);
        const minutes = duration.match(/(\d+)M/);
        return `${hours ? hours[1] + 'h ' : ''}${minutes ? minutes[1] + 'm' : ''}`;
    }

    function updatePagination(data) {
        currentPage = data.currentPage;
        totalPages = data.totalPages;
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }
});
