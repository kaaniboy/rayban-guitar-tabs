const state = {
  currentScreen: 'home-screen',
  songs: ['hotel_california.txt', 'hold_me_tight.txt'], // Fallback if API fails
  tabPages: [],
  currentTabPage: 0,
};

document.addEventListener('keydown', handleKeyDown);

function handleKeyDown(e) {
  const currentScreenEl = document.getElementById(state.currentScreen);
  const focusables = Array.from(currentScreenEl.querySelectorAll('.focusable'));
  let currentIndex = focusables.indexOf(document.activeElement);

  const active = document.activeElement;
  const isScrollable = active && active.classList.contains('scrollable');

  if (e.key === 'Escape') {
    e.preventDefault();
    if (state.currentScreen !== 'home-screen') {
      navigateTo('home-screen');
    }
    return;
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    const action = active && active.getAttribute('data-action');
    if (action) {
      handleAppAction(action, active);
    }
    return;
  }

  // Handle D-pad
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (state.currentScreen === 'tab-screen') {
      if (state.tabPages.length > 0 && state.currentTabPage < state.tabPages.length - 1) {
        state.currentTabPage++;
        renderTabPage();
      }
      return;
    }
    if (isScrollable) {
      const prev = active.scrollTop;
      active.scrollTop += 60;
      if (Math.abs(active.scrollTop - prev) > 1) return;
    }
    moveFocus(1, focusables, currentIndex);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (state.currentScreen === 'tab-screen') {
      if (state.tabPages.length > 0 && state.currentTabPage > 0) {
        state.currentTabPage--;
        renderTabPage();
      }
      return;
    }
    if (isScrollable) {
      const prev = active.scrollTop;
      active.scrollTop -= 60;
      if (Math.abs(active.scrollTop - prev) > 1) return;
    }
    moveFocus(-1, focusables, currentIndex);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (isScrollable) {
      const prev = active.scrollLeft;
      active.scrollLeft += 60;
      if (Math.abs(active.scrollLeft - prev) > 1) return;
    }
    moveFocus(1, focusables, currentIndex);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (state.currentScreen === 'tab-screen') {
      navigateTo('home-screen');
      return;
    }
    if (isScrollable) {
      const prev = active.scrollLeft;
      active.scrollLeft -= 60;
      if (Math.abs(active.scrollLeft - prev) > 1) return;
    }
    moveFocus(-1, focusables, currentIndex);
  }
}

function moveFocus(dir, focusables, currentIndex) {
  if (focusables.length === 0) return;
  let next = currentIndex + dir;
  if (next >= focusables.length) next = 0;
  if (next < 0) next = focusables.length - 1;
  focusables[next].focus();
}

function handleAppAction(action, element) {
  if (action === 'back') {
    navigateTo('home-screen');
  } else if (action === 'open-tab') {
    const songId = element.getAttribute('data-song');
    openTab(songId);
  }
}

function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');
  state.currentScreen = screenId;
  
  // auto focus first element
  const firstFocusable = document.getElementById(screenId).querySelector('.focusable');
  if (firstFocusable) firstFocusable.focus();
}

async function init() {
  try {
    let res = await fetch('/api/songs');
    if (!res.ok) {
      res = await fetch('songs.json');
    }
    if (res.ok) {
      state.songs = await res.json();
    }
  } catch(e) {
    console.log("Could not fetch songs from API, using fallback.");
  }

  renderSongList();
  navigateTo('home-screen');
}

function renderSongList() {
  const list = document.getElementById('song-list');
  list.innerHTML = '';
  state.songs.forEach(song => {
    const btn = document.createElement('div');
    btn.className = 'focusable song-item';
    btn.tabIndex = 0;
    btn.setAttribute('data-action', 'open-tab');
    btn.setAttribute('data-song', song);
    btn.textContent = song.replace(/_/g, ' ').replace('.txt', '');
    list.appendChild(btn);
  });
  
  if (state.songs.length === 0) {
    list.innerHTML = '<div class="song-item">No tabs found</div>';
  }
}

async function openTab(songId) {
  document.getElementById('tab-content').textContent = 'Loading...';
  const pageIndicator = document.getElementById('page-indicator');
  if (pageIndicator) pageIndicator.textContent = '';
  navigateTo('tab-screen');

  try {
    const res = await fetch('/tabs/' + songId);
    if (res.ok) {
        const text = await res.text();
        state.tabPages = text.split('///').map(p => p.trim()).filter(p => p !== '');
        state.currentTabPage = 0;
        renderTabPage();
    } else {
        document.getElementById('tab-content').textContent = 'Tab file not found.';
    }
  } catch(e) {
    document.getElementById('tab-content').textContent = 'Error loading tab.';
  }
}

function renderTabPage() {
  if (!state.tabPages || state.tabPages.length === 0) return;
  document.getElementById('tab-content').textContent = state.tabPages[state.currentTabPage];
  const pageIndicator = document.getElementById('page-indicator');
  if (pageIndicator) {
    pageIndicator.textContent = `${state.currentTabPage + 1} / ${state.tabPages.length}`;
  }
}

init();