"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

const TVMAZE_BASE_URL = 'http://api.tvmaze.com/';
const MISSING_IMAGE_URL = 'https://miro.medium.com/v2/resize:fit:479/0*5bRx6RbvKwCG5ig5.jpg';


async function getShowsByTerm(term) {
  const params = new URLSearchParams({ "q": term });
  const response = await fetch(`${TVMAZE_BASE_URL}search/shows?${params}`);
  const data = await response.json();
  const showsArr = data.map(showData => (
    {
      id: showData.show.id,
      name: showData.show.name,
      summary: showData.show.summary,
      image: showData.show.image?.medium || MISSING_IMAGE_URL
    }));

  console.log(showsArr);

  return showsArr;

}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/**
 * Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await fetch(`${TVMAZE_BASE_URL}shows/${id}/episodes`);
  const data = await response.json();
  const episodes = data.map(episode => (
    {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }));

  console.log(episodes);

  return episodes;

}


/**
 * Appends episodes to episode list
 */
function displayEpisodes(episodes) {
  const $episodesList = $('#episodesList');

  const episodesToLi = episodes.map(
    episode => `<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
  for (let episode of episodesToLi) {
    $episodesList.append(episode);
  }

  const $episodeArea = $($episodesArea);
  $episodeArea.css("display", "block");
}

/**
 *
*/
async function getShowIds(id) {
  const episodes = await getEpisodesOfShow(id);
  displayEpisodes(episodes);
}

/**
 *
*/
async function showEpisodes(evt) {
  evt.preventDefault();
  const id = $(evt.target).closest('[data-show-id]').data("showId");
  await getShowIds(id);
}

$showsList.on('click', '.Show-getEpisodes', showEpisodes);




// add other functions that will be useful / match our structure & design
