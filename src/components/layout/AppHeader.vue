<template>
  <header class="d365-header">
    <div class="d365-header-left">
      <button class="header-btn app-switcher" title="App Switcher" @click="$emit('toggle-nav')">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <rect x="2" y="2" width="5" height="5" rx="1"/>
          <rect x="8" y="2" width="5" height="5" rx="1"/>
          <rect x="14" y="2" width="5" height="5" rx="1"/>
          <rect x="2" y="8" width="5" height="5" rx="1"/>
          <rect x="8" y="8" width="5" height="5" rx="1"/>
          <rect x="14" y="8" width="5" height="5" rx="1"/>
          <rect x="2" y="14" width="5" height="5" rx="1"/>
          <rect x="8" y="14" width="5" height="5" rx="1"/>
          <rect x="14" y="14" width="5" height="5" rx="1"/>
        </svg>
      </button>
      <span class="header-divider"></span>
      <router-link to="/dashboard" class="app-title">
        Dynamics 365 Sales
      </router-link>
    </div>

    <div class="d365-header-center">
      <div class="search-container" :class="{ expanded: searchFocused }" ref="searchContainer">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85-.017.016zm-5.242.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
        </svg>
        <input
          ref="searchInput"
          type="text"
          class="search-input"
          placeholder="Tell me what you want to do..."
          v-model="searchQuery"
          @focus="onSearchFocus"
          @blur="onSearchBlur"
          @keydown="onSearchKeydown"
          @input="onSearchInput"
        />
        <button
          v-if="searchQuery"
          class="search-clear-btn"
          @mousedown.prevent="clearSearch"
          title="Clear search"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M9.354 3.354a.5.5 0 00-.708-.708L6 5.293 3.354 2.646a.5.5 0 10-.708.708L5.293 6 2.646 8.646a.5.5 0 00.708.708L6 6.707l2.646 2.647a.5.5 0 00.708-.708L6.707 6l2.647-2.646z"/>
          </svg>
        </button>
        <div
          v-if="showSearchDropdown"
          class="search-dropdown"
          :class="{ 'search-dropdown--above': searchDropdownAbove }"
          ref="searchDropdown"
        >
          <!-- Loading indicator -->
          <div v-if="searchLoading" class="search-loading">
            <div class="search-loading-bar"></div>
          </div>

          <!-- Results by category -->
          <template v-if="hasResults">
            <!-- Pages -->
            <div v-if="categorizedResults.pages.length > 0" class="search-category">
              <div class="search-category-header">Pages</div>
              <div
                v-for="(result, idx) in categorizedResults.pages"
                :key="'page-' + idx"
                class="search-result-item"
                :class="{ 'search-result-item--active': flatIndex('pages', idx) === highlightedIndex }"
                @mousedown.prevent="navigateTo(result)"
                @mouseenter="highlightedIndex = flatIndex('pages', idx)"
              >
                <div class="result-icon-wrap">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="result-icon">
                    <path d="M3 1h10a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1zm1 3v1h8V4H4zm0 2.5v1h8v-1H4zm0 2.5v1h5V9H4z"/>
                  </svg>
                </div>
                <div class="result-text">
                  <div class="result-title">{{ result.title }}</div>
                  <div class="result-subtitle">{{ result.subtitle }}</div>
                </div>
              </div>
            </div>

            <!-- Contacts -->
            <div v-if="categorizedResults.contacts.length > 0" class="search-category">
              <div class="search-category-header">Contacts</div>
              <div
                v-for="(result, idx) in categorizedResults.contacts"
                :key="'contact-' + idx"
                class="search-result-item"
                :class="{ 'search-result-item--active': flatIndex('contacts', idx) === highlightedIndex }"
                @mousedown.prevent="navigateTo(result)"
                @mouseenter="highlightedIndex = flatIndex('contacts', idx)"
              >
                <div class="result-icon-wrap">
                  <svg v-if="result.contactType === 'Company'" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="result-icon">
                    <path d="M2 2a1 1 0 011-1h6a1 1 0 011 1v2h3a1 1 0 011 1v10H2V2zm2 1v2h2V3H4zm0 3v2h2V6H4zm0 3v2h2V9H4zm4-6v2h2V3H8zm4 3v2h2V6h-2zm0 3v2h2V9h-2z"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="result-icon">
                    <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm-5 6a5 5 0 0110 0H3z"/>
                  </svg>
                </div>
                <div class="result-text">
                  <div class="result-title">{{ result.title }}</div>
                  <div class="result-subtitle">{{ result.subtitle }}</div>
                </div>
                <div class="result-secondary">{{ result.secondary }}</div>
              </div>
            </div>

            <!-- Opportunities -->
            <div v-if="categorizedResults.opportunities.length > 0" class="search-category">
              <div class="search-category-header">Opportunities</div>
              <div
                v-for="(result, idx) in categorizedResults.opportunities"
                :key="'opp-' + idx"
                class="search-result-item"
                :class="{ 'search-result-item--active': flatIndex('opportunities', idx) === highlightedIndex }"
                @mousedown.prevent="navigateTo(result)"
                @mouseenter="highlightedIndex = flatIndex('opportunities', idx)"
              >
                <div class="result-icon-wrap">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="result-icon result-icon--opportunity">
                    <path d="M8 1l2.5 5 5.5.8-4 3.9.9 5.3L8 13.3 3.1 16l.9-5.3-4-3.9 5.5-.8L8 1z"/>
                  </svg>
                </div>
                <div class="result-text">
                  <div class="result-title">
                    <span class="result-stage-badge" :class="stageBadgeClass(result.stage)">{{ result.stage }}</span>
                    {{ result.title }}
                  </div>
                </div>
                <div class="result-secondary">{{ result.secondary }}</div>
              </div>
            </div>

            <!-- Activities -->
            <div v-if="categorizedResults.activities.length > 0" class="search-category">
              <div class="search-category-header">Activities</div>
              <div
                v-for="(result, idx) in categorizedResults.activities"
                :key="'act-' + idx"
                class="search-result-item"
                :class="{ 'search-result-item--active': flatIndex('activities', idx) === highlightedIndex }"
                @mousedown.prevent="navigateTo(result)"
                @mouseenter="highlightedIndex = flatIndex('activities', idx)"
              >
                <div class="result-icon-wrap">
                  <svg v-if="result.activityType === 'Call'" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="result-icon result-icon--call">
                    <path d="M3.654 1.328a.678.678 0 00-1.015-.063L1.605 2.3a1.813 1.813 0 00-.4 1.986 15.14 15.14 0 006.508 6.508 1.813 1.813 0 001.986-.4l1.035-1.034a.678.678 0 00-.063-1.015l-2.307-1.794a.678.678 0 00-.58-.122l-1.782.47a.82.82 0 01-.789-.227L3.377 4.835a.82.82 0 01-.227-.79l.47-1.781a.678.678 0 00-.122-.58L3.654 1.328z"/>
                  </svg>
                  <svg v-else-if="result.activityType === 'Email'" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="result-icon result-icon--email">
                    <path d="M0 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V4zm2 0l6 4 6-4H2zm0 1.5V12h12V5.5L8 9.5 2 5.5z"/>
                  </svg>
                  <svg v-else-if="result.activityType === 'Meeting'" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="result-icon result-icon--meeting">
                    <path d="M3.5 0a.5.5 0 01.5.5V1h8V.5a.5.5 0 011 0V1h1a2 2 0 012 2v11a2 2 0 01-2 2H2a2 2 0 01-2-2V3a2 2 0 012-2h1V.5a.5.5 0 01.5-.5zM1 4v10a1 1 0 001 1h12a1 1 0 001-1V4H1z"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="result-icon result-icon--task">
                    <path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V2zm4.5 5.793l-1.146-1.147a.5.5 0 10-.708.708l1.5 1.5a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L6.5 7.793z"/>
                  </svg>
                </div>
                <div class="result-text">
                  <div class="result-title">{{ result.title }}</div>
                </div>
                <div class="result-secondary">{{ result.secondary }}</div>
              </div>
            </div>

            <!-- Documents -->
            <div v-if="categorizedResults.documents.length > 0" class="search-category">
              <div class="search-category-header">Documents</div>
              <div
                v-for="(result, idx) in categorizedResults.documents"
                :key="'doc-' + idx"
                class="search-result-item"
                :class="{ 'search-result-item--active': flatIndex('documents', idx) === highlightedIndex }"
                @mousedown.prevent="navigateTo(result)"
                @mouseenter="highlightedIndex = flatIndex('documents', idx)"
              >
                <div class="result-icon-wrap">
                  <svg v-if="result.docType === 'Quote'" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="result-icon result-icon--quote">
                    <path d="M2 2a2 2 0 012-2h5.293A1 1 0 0110 .293L13.707 4a1 1 0 01.293.707V14a2 2 0 01-2 2H4a2 2 0 01-2-2V2zm7.5 1.5V5h1.5L9.5 3.5zM5 7v1h6V7H5zm0 2v1h6V9H5zm0 2v1h4v-1H5z"/>
                  </svg>
                  <svg v-else-if="result.docType === 'Order'" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="result-icon result-icon--order">
                    <path d="M0 1.5A.5.5 0 01.5 1H2a.5.5 0 01.485.379L2.89 3H14.5a.5.5 0 01.491.592l-1.5 8A.5.5 0 0113 12H4a.5.5 0 01-.491-.408L2.01 3.607 1.61 2H.5A.5.5 0 010 1.5zM5 12a2 2 0 100 4 2 2 0 000-4zm7 0a2 2 0 100 4 2 2 0 000-4z"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="result-icon result-icon--invoice">
                    <path d="M1.92.506a.5.5 0 01.434.14L3 1.293 3.646.646a.5.5 0 01.708 0L5 1.293 5.646.646a.5.5 0 01.708 0L7 1.293 7.646.646a.5.5 0 01.708 0l.646.647.646-.647a.5.5 0 01.708 0l.646.647.646-.647a.5.5 0 01.801.13l.5 1A.5.5 0 0113 2.5V14a1 1 0 01-1 1H4a1 1 0 01-1-1V2.5a.5.5 0 01-.04-.199l.5-1a.5.5 0 01.46-.295zM4 5v1h8V5H4zm0 2v1h5V7H4zm0 2v1h8V9H4z"/>
                  </svg>
                </div>
                <div class="result-text">
                  <div class="result-title">{{ result.title }}</div>
                  <div class="result-subtitle">{{ result.subtitle }}</div>
                </div>
                <div class="result-secondary">{{ result.secondary }}</div>
              </div>
            </div>

            <!-- See all results link -->
            <div v-if="hasMoreResults" class="search-see-all" @mousedown.prevent="seeAllResults">
              See all results for '<strong>{{ searchQuery }}</strong>'
            </div>
          </template>

          <!-- No results -->
          <div v-else-if="!searchLoading && searchQuery.length > 0" class="search-no-results">
            <div class="search-no-results-title">No results found</div>
            <div class="search-no-results-text">Try a different search term or browse the navigation menu.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="d365-header-right">
      <!-- Notification bell -->
      <div class="header-btn-wrap" ref="notifTrigger">
        <button class="header-btn" title="Notifications" @click="toggleDropdown('notifications')">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a2 2 0 01-2-2h4a2 2 0 01-2 2z"/>
          </svg>
          <span v-if="overdueCount > 0" class="notification-badge">{{ overdueCount > 9 ? '9+' : overdueCount }}</span>
        </button>
        <div
          v-if="activeDropdown === 'notifications'"
          class="header-dropdown"
          :class="dropdownPositionClass('notifications')"
          ref="notifDropdown"
        >
          <div class="header-dropdown-header">Notifications</div>
          <div v-if="overdueCount > 0" class="header-dropdown-item header-dropdown-item--warning">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#D13438"><circle cx="8" cy="8" r="8"/></svg>
            <span>{{ overdueCount }} overdue activit{{ overdueCount === 1 ? 'y' : 'ies' }}</span>
          </div>
          <div v-else class="header-dropdown-item header-dropdown-item--muted">
            No new notifications
          </div>
        </div>
      </div>

      <!-- Settings gear -->
      <div class="header-btn-wrap" ref="settingsTrigger">
        <button class="header-btn" title="Settings" @click="toggleDropdown('settings')">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 13a3 3 0 100-6 3 3 0 000 6zm7.45-2.1l-1.4-.24a5.97 5.97 0 00-.5-1.2l.83-1.15a.5.5 0 00-.06-.64l-1-1a.5.5 0 00-.63-.06l-1.15.83a6 6 0 00-1.2-.5L12.1 5.55a.5.5 0 00-.49-.42h-1.42a.5.5 0 00-.49.42l-.24 1.4c-.42.12-.82.29-1.2.5L7.1 6.6a.5.5 0 00-.64.06l-1 1a.5.5 0 00-.06.64l.83 1.15a6 6 0 00-.5 1.2l-1.4.24a.5.5 0 00-.42.49v1.42c0 .24.17.44.42.49l1.4.24c.12.42.29.82.5 1.2L5.4 14.88a.5.5 0 00.06.64l1 1c.18.17.44.2.64.06l1.15-.83c.38.21.78.38 1.2.5l.24 1.4c.05.24.25.42.49.42h1.42a.5.5 0 00.49-.42l.24-1.4c.42-.12.82-.29 1.2-.5l1.15.83a.5.5 0 00.64-.06l1-1a.5.5 0 00.06-.64l-.83-1.15c.21-.38.38-.78.5-1.2l1.4-.24a.5.5 0 00.42-.49v-1.42a.5.5 0 00-.42-.49z"/>
          </svg>
        </button>
        <div
          v-if="activeDropdown === 'settings'"
          class="header-dropdown"
          :class="dropdownPositionClass('settings')"
          ref="settingsDropdown"
        >
          <div class="header-dropdown-header">Settings</div>
          <div class="header-dropdown-item" @mousedown.prevent>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M2 2h10v10H2V2zm1 1v8h8V3H3z"/></svg>
            <span>Personalize</span>
          </div>
          <div class="header-dropdown-item" @mousedown.prevent>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 7a3 3 0 100-6 3 3 0 000 6zm-5 6a5 5 0 0110 0H2z"/></svg>
            <span>My Settings</span>
          </div>
          <div class="header-dropdown-separator"></div>
          <div class="header-dropdown-item" @mousedown.prevent>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 .5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zM7 2a5 5 0 100 10A5 5 0 007 2zm-.5 2h1v3.5h2v1H6.5V4z"/></svg>
            <span>Admin Center</span>
          </div>
        </div>
      </div>

      <!-- Help icon -->
      <div class="header-btn-wrap" ref="helpTrigger">
        <button class="header-btn" title="Help" @click="toggleDropdown('help')">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div
          v-if="activeDropdown === 'help'"
          class="header-dropdown"
          :class="dropdownPositionClass('help')"
          ref="helpDropdown"
        >
          <div class="header-dropdown-header">Help</div>
          <div class="header-dropdown-item" @mousedown.prevent>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path fill-rule="evenodd" d="M14 7A7 7 0 110 7a7 7 0 0114 0zM7 4a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0110 5a3.001 3.001 0 01-2 2.83V8a1 1 0 11-2 0V7a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
            <span>Help &amp; Support</span>
          </div>
          <div class="header-dropdown-item" @mousedown.prevent="showShortcutsOverlay">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M1 3a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2V3zm2 0v6h8V3H3zm1 1h2v1H4V4zm3 0h3v1H7V4zM4 6h1v1H4V6zm2 0h2v1H6V6zm3 0h1v1H9V6z"/></svg>
            <span>Keyboard Shortcuts</span>
          </div>
          <div class="header-dropdown-separator"></div>
          <div class="header-dropdown-item" @mousedown.prevent>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path fill-rule="evenodd" d="M7 0a7 7 0 110 14A7 7 0 017 0zm1 4a1 1 0 10-2 0 1 1 0 002 0zM6 6v5h2V6H6z" clip-rule="evenodd"/></svg>
            <span>About</span>
          </div>
        </div>
      </div>

      <!-- User avatar dropdown -->
      <div class="header-btn-wrap" ref="userTrigger">
        <div class="user-avatar" title="Current User" @click="toggleDropdown('user')">
          <span>{{ userInitials }}</span>
        </div>
        <div
          v-if="activeDropdown === 'user'"
          class="header-dropdown"
          :class="dropdownPositionClass('user')"
          ref="userDropdown"
        >
          <div class="header-dropdown-user-info">
            <div class="header-dropdown-user-avatar">{{ userInitials }}</div>
            <div>
              <div class="header-dropdown-user-name">{{ currentUser.name }}</div>
              <div class="header-dropdown-user-email">{{ currentUser.email }}</div>
            </div>
          </div>
          <div class="header-dropdown-separator"></div>
          <div class="header-dropdown-item" @mousedown.prevent>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 7a3 3 0 100-6 3 3 0 000 6zm-5 6a5 5 0 0110 0H2z"/></svg>
            <span>My Account</span>
          </div>
          <div class="header-dropdown-separator"></div>
          <div class="header-dropdown-item header-dropdown-item--danger" @mousedown.prevent="handleSignOut">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M5 1v1H1v1h12V2H9V1H5zM2 5v8a1 1 0 001 1h8a1 1 0 001-1V5H2zm3 2h1v5H5V7zm3 0h1v5H8V7z"/></svg>
            <span>Sign Out</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Keyboard shortcuts help overlay -->
    <div v-if="showShortcuts" class="shortcuts-overlay" @click.self="showShortcuts = false">
      <div class="shortcuts-modal">
        <div class="shortcuts-modal-header">
          <h2 class="shortcuts-modal-title">Keyboard Shortcuts</h2>
          <button class="shortcuts-modal-close" @click="showShortcuts = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.354 4.354a.5.5 0 00-.708-.708L8 7.293 4.354 3.646a.5.5 0 10-.708.708L7.293 8l-3.647 3.646a.5.5 0 00.708.708L8 8.707l3.646 3.647a.5.5 0 00.708-.708L8.707 8l3.647-3.646z"/>
            </svg>
          </button>
        </div>
        <div class="shortcuts-modal-body">
          <div class="shortcuts-column">
            <h3 class="shortcuts-group-title">Navigation</h3>
            <div class="shortcut-row">
              <div class="shortcut-keys"><kbd>Ctrl</kbd><span>+</span><kbd>F</kbd></div>
              <div class="shortcut-desc">Focus Tell Me search</div>
            </div>
            <div class="shortcut-row">
              <div class="shortcut-keys"><kbd>/</kbd></div>
              <div class="shortcut-desc">Focus Tell Me search</div>
            </div>
            <div class="shortcut-row">
              <div class="shortcut-keys"><kbd>Alt</kbd><span>+</span><kbd class="shortcut-arrow-key">&larr;</kbd></div>
              <div class="shortcut-desc">Go back</div>
            </div>
            <div class="shortcut-row">
              <div class="shortcut-keys"><kbd>Alt</kbd><span>+</span><kbd class="shortcut-arrow-key">&rarr;</kbd></div>
              <div class="shortcut-desc">Go forward</div>
            </div>
            <div class="shortcut-row">
              <div class="shortcut-keys"><kbd>Esc</kbd></div>
              <div class="shortcut-desc">Close modals/panels</div>
            </div>
          </div>
          <div class="shortcuts-column">
            <h3 class="shortcuts-group-title">Actions</h3>
            <div class="shortcut-row">
              <div class="shortcut-keys"><kbd>Alt</kbd><span>+</span><kbd>N</kbd></div>
              <div class="shortcut-desc">Quick create</div>
            </div>
            <div class="shortcut-row">
              <div class="shortcut-keys"><kbd>Alt</kbd><span>+</span><kbd>S</kbd></div>
              <div class="shortcut-desc">Save</div>
            </div>
            <div class="shortcut-row">
              <div class="shortcut-keys"><kbd>F5</kbd></div>
              <div class="shortcut-desc">Refresh view</div>
            </div>
            <div class="shortcut-row">
              <div class="shortcut-keys"><kbd>Ctrl</kbd><span>+</span><kbd>Shift</kbd><span>+</span><kbd>F</kbd></div>
              <div class="shortcut-desc">Toggle filter panel</div>
            </div>
            <div class="shortcut-row">
              <div class="shortcut-keys"><kbd>?</kbd></div>
              <div class="shortcut-desc">Show this help</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  data() {
    return {
      searchQuery: '',
      searchFocused: false,
      searchLoading: false,
      searchDropdownAbove: false,
      highlightedIndex: -1,
      activeDropdown: null,
      showShortcuts: false,
      debouncedResults: null,
      debounceTimer: null,
      pages: [
        { title: 'Dashboard', subtitle: 'Home - Overview', path: '/dashboard', type: 'page', icon: 'dashboard' },
        { title: 'Contacts', subtitle: 'Customers - All contacts', path: '/contacts', type: 'page', icon: 'contacts' },
        { title: 'New Contact', subtitle: 'Create a new contact', path: '/contacts/new', type: 'page', icon: 'contacts' },
        { title: 'Opportunities', subtitle: 'Sales - All opportunities', path: '/opportunities', type: 'page', icon: 'opportunities' },
        { title: 'New Opportunity', subtitle: 'Create a new opportunity', path: '/opportunities/new', type: 'page', icon: 'opportunities' },
        { title: 'Pipeline', subtitle: 'Sales - Pipeline view', path: '/opportunities/pipeline', type: 'page', icon: 'pipeline' },
        { title: 'Activities', subtitle: 'My Work - All activities', path: '/activities', type: 'page', icon: 'activities' },
        { title: 'Quotes', subtitle: 'Sales - Sales quotes', path: '/sales/quotes', type: 'page', icon: 'quotes' },
        { title: 'Orders', subtitle: 'Sales - Sales orders', path: '/sales/orders', type: 'page', icon: 'orders' },
        { title: 'Invoices', subtitle: 'Sales - Sales invoices', path: '/sales/invoices', type: 'page', icon: 'invoices' },
      ]
    }
  },

  computed: {
    currentUser() {
      return this.$store.getters['auth/currentUser']
    },
    userInitials() {
      return this.$store.getters['auth/userInitials']
    },
    overdueCount() {
      if (!this.$store) return 0
      return this.$store.getters['dashboard/overdueActivities'] || 0
    },

    allContacts() {
      if (!this.$store) return []
      return this.$store.getters['contacts/allContacts'] || []
    },

    allOpportunities() {
      if (!this.$store) return []
      return this.$store.getters['opportunities/allOpportunities'] || []
    },

    allActivities() {
      if (!this.$store) return []
      return this.$store.getters['activities/allActivities'] || []
    },

    allDocuments() {
      if (!this.$store) return []
      return this.$store.getters['sales/allDocuments'] || []
    },

    showSearchDropdown() {
      return this.searchFocused && this.searchQuery.length > 0
    },

    categorizedResults() {
      if (!this.searchQuery || this.searchQuery.length < 1) {
        return { pages: [], contacts: [], opportunities: [], activities: [], documents: [] }
      }
      return this.debouncedResults || this.computeResults()
    },

    hasResults() {
      var r = this.categorizedResults
      return r.pages.length > 0 || r.contacts.length > 0 || r.opportunities.length > 0 || r.activities.length > 0 || r.documents.length > 0
    },

    hasMoreResults() {
      if (!this.searchQuery || this.searchQuery.length < 1) return false
      var q = this.searchQuery.toLowerCase()
      var totalMatches = 0

      // Check if any category had more than 5 matches
      totalMatches += this.pages.filter(function(p) {
        return p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
      }).length

      totalMatches += this.allContacts.filter(function(c) {
        return (c.name || '').toLowerCase().includes(q) ||
               (c.email || '').toLowerCase().includes(q) ||
               (c.phone || '').toLowerCase().includes(q)
      }).length

      totalMatches += this.allOpportunities.filter(function(o) {
        return (o.name || '').toLowerCase().includes(q)
      }).length

      totalMatches += this.allActivities.filter(function(a) {
        return (a.subject || '').toLowerCase().includes(q)
      }).length

      totalMatches += this.allDocuments.filter(function(d) {
        return (d.number || '').toLowerCase().includes(q) ||
               (d.contactName || '').toLowerCase().includes(q)
      }).length

      var r = this.categorizedResults
      var shownCount = r.pages.length + r.contacts.length + r.opportunities.length + r.activities.length + r.documents.length
      return totalMatches > shownCount
    },

    totalFlatResults() {
      var r = this.categorizedResults
      return r.pages.length + r.contacts.length + r.opportunities.length + r.activities.length + r.documents.length
    }
  },

  watch: {
    activeDropdown(val) {
      if (val) {
        this.$nextTick(function() { this.positionActiveDropdown() })
      }
    }
  },

  mounted() {
    this._clickOutside = (e) => {
      if (this.activeDropdown && !this.$el.contains(e.target)) {
        this.activeDropdown = null
      }
    }
    document.addEventListener('mousedown', this._clickOutside)

    // Listen for keyboard shortcut to focus search
    this.$root.$on('shortcut-focus-search', this.focusSearch)
    this.$root.$on('shortcut-escape', this.onEscapeShortcut)
    this.$root.$on('shortcut-toggle-shortcuts-help', this.toggleShortcutsHelp)
    this.$root.$on('shortcut-close-shortcuts-help', this.closeShortcutsHelp)
  },

  beforeDestroy() {
    document.removeEventListener('mousedown', this._clickOutside)
    this.$root.$off('shortcut-focus-search', this.focusSearch)
    this.$root.$off('shortcut-escape', this.onEscapeShortcut)
    this.$root.$off('shortcut-toggle-shortcuts-help', this.toggleShortcutsHelp)
    this.$root.$off('shortcut-close-shortcuts-help', this.closeShortcutsHelp)
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  },

  methods: {
    computeResults() {
      var q = this.searchQuery.toLowerCase()
      var MAX = 5

      // Pages
      var pageResults = this.pages.filter(function(p) {
        return p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
      }).slice(0, MAX).map(function(p) {
        return { title: p.title, subtitle: p.subtitle, path: p.path, type: 'page', icon: p.icon }
      })

      // Contacts
      var contactResults = this.allContacts.filter(function(c) {
        return (c.name || '').toLowerCase().includes(q) ||
               (c.email || '').toLowerCase().includes(q) ||
               (c.phone || '').toLowerCase().includes(q)
      }).slice(0, MAX).map(function(c) {
        return {
          title: c.name,
          subtitle: c.email || '',
          secondary: c.type,
          path: '/contacts/' + c.id,
          type: 'contact',
          contactType: c.type
        }
      })

      // Opportunities
      var oppResults = this.allOpportunities.filter(function(o) {
        return (o.name || '').toLowerCase().includes(q)
      }).slice(0, MAX).map(function(o) {
        return {
          title: o.name,
          subtitle: '',
          secondary: '$' + (o.estimatedValue || 0).toLocaleString(),
          path: '/opportunities/' + o.id,
          type: 'opportunity',
          stage: o.currentStage
        }
      })

      // Activities
      var actResults = this.allActivities.filter(function(a) {
        return (a.subject || '').toLowerCase().includes(q)
      }).slice(0, MAX).map(function(a) {
        var dueStr = ''
        if (a.dueDate) {
          var d = new Date(a.dueDate)
          dueStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
        return {
          title: a.subject,
          subtitle: '',
          secondary: dueStr,
          path: '/activities',
          type: 'activity',
          activityType: a.type
        }
      })

      // Documents
      var docResults = this.allDocuments.filter(function(d) {
        return (d.number || '').toLowerCase().includes(q) ||
               (d.contactName || '').toLowerCase().includes(q)
      }).slice(0, MAX).map(function(d) {
        var docTypePath = d.type === 'Quote' ? 'quotes' : d.type === 'Order' ? 'orders' : d.type === 'Invoice' ? 'invoices' : 'quotes'
        return {
          title: d.number,
          subtitle: d.contactName || '',
          secondary: d.type,
          path: '/sales/' + docTypePath + '/' + d.id,
          type: 'document',
          docType: d.type
        }
      })

      return {
        pages: pageResults,
        contacts: contactResults,
        opportunities: oppResults,
        activities: actResults,
        documents: docResults
      }
    },

    onSearchInput() {
      this.searchLoading = true
      this.highlightedIndex = -1
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      this.debounceTimer = setTimeout(() => {
        this.debouncedResults = this.computeResults()
        this.searchLoading = false
        this.$nextTick(() => { this.positionSearchDropdown() })
      }, 200)
    },

    onSearchFocus() {
      this.searchFocused = true
      if (this.searchQuery.length > 0) {
        this.debouncedResults = this.computeResults()
        this.$nextTick(() => { this.positionSearchDropdown() })
      }
    },

    onSearchBlur() {
      // Small delay to allow clicks on dropdown items
      setTimeout(() => {
        this.searchFocused = false
        this.highlightedIndex = -1
      }, 150)
    },

    onSearchKeydown(e) {
      if (!this.showSearchDropdown) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (this.highlightedIndex < this.totalFlatResults - 1) {
          this.highlightedIndex++
        } else {
          this.highlightedIndex = 0
        }
        this.scrollToHighlighted()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (this.highlightedIndex > 0) {
          this.highlightedIndex--
        } else {
          this.highlightedIndex = this.totalFlatResults - 1
        }
        this.scrollToHighlighted()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (this.highlightedIndex >= 0) {
          var result = this.getResultAtFlatIndex(this.highlightedIndex)
          if (result) {
            this.navigateTo(result)
          }
        } else if (this.totalFlatResults > 0) {
          var firstResult = this.getResultAtFlatIndex(0)
          if (firstResult) {
            this.navigateTo(firstResult)
          }
        }
      } else if (e.key === 'Escape') {
        this.searchFocused = false
        this.highlightedIndex = -1
        this.$refs.searchInput.blur()
      }
    },

    scrollToHighlighted() {
      this.$nextTick(() => {
        var dropdown = this.$refs.searchDropdown
        if (!dropdown) return
        var active = dropdown.querySelector('.search-result-item--active')
        if (active) {
          active.scrollIntoView({ block: 'nearest' })
        }
      })
    },

    flatIndex(category, idx) {
      var r = this.categorizedResults
      var offset = 0
      var cats = ['pages', 'contacts', 'opportunities', 'activities', 'documents']
      for (var i = 0; i < cats.length; i++) {
        if (cats[i] === category) {
          return offset + idx
        }
        offset += r[cats[i]].length
      }
      return offset + idx
    },

    getResultAtFlatIndex(flatIdx) {
      var r = this.categorizedResults
      var cats = ['pages', 'contacts', 'opportunities', 'activities', 'documents']
      var offset = 0
      for (var i = 0; i < cats.length; i++) {
        if (flatIdx < offset + r[cats[i]].length) {
          return r[cats[i]][flatIdx - offset]
        }
        offset += r[cats[i]].length
      }
      return null
    },

    navigateTo(result) {
      this.searchQuery = ''
      this.searchFocused = false
      this.highlightedIndex = -1
      this.debouncedResults = null
      if (this.$refs.searchInput) {
        this.$refs.searchInput.blur()
      }
      this.$router.push(result.path).catch(function() {})
    },

    clearSearch() {
      this.searchQuery = ''
      this.debouncedResults = null
      this.highlightedIndex = -1
      this.$refs.searchInput.focus()
    },

    seeAllResults() {
      // For now just keep the dropdown open -- future: navigate to a search results page
    },

    handleSearch() {
      if (this.totalFlatResults > 0) {
        this.navigateTo(this.getResultAtFlatIndex(0))
      }
    },

    stageBadgeClass(stage) {
      if (!stage) return ''
      var s = stage.toLowerCase().replace(/\s+/g, '-')
      return 'result-stage--' + s
    },

    // Dropdown management
    toggleDropdown(name) {
      if (this.activeDropdown === name) {
        this.activeDropdown = null
      } else {
        this.activeDropdown = name
      }
    },

    positionDropdown(triggerEl, dropdownEl) {
      if (!triggerEl || !dropdownEl) return { openAbove: false, alignRight: false }
      var triggerRect = triggerEl.getBoundingClientRect()
      var dropdownHeight = dropdownEl.offsetHeight || 300
      var dropdownWidth = dropdownEl.offsetWidth || 200
      var viewportHeight = window.innerHeight
      var viewportWidth = window.innerWidth

      var spaceBelow = viewportHeight - triggerRect.bottom
      var spaceAbove = triggerRect.top
      var openAbove = spaceBelow < dropdownHeight + 8 && spaceAbove > spaceBelow

      var spaceRight = viewportWidth - triggerRect.left
      var alignRight = spaceRight < dropdownWidth

      return { openAbove: openAbove, alignRight: alignRight }
    },

    positionActiveDropdown() {
      // No-op - position is handled via CSS classes from dropdownPositionClass
    },

    dropdownPositionClass(name) {
      var refMap = {
        notifications: 'notifTrigger',
        settings: 'settingsTrigger',
        help: 'helpTrigger',
        user: 'userTrigger'
      }
      var dropRefMap = {
        notifications: 'notifDropdown',
        settings: 'settingsDropdown',
        help: 'helpDropdown',
        user: 'userDropdown'
      }
      var trigger = this.$refs[refMap[name]]
      var dropdown = this.$refs[dropRefMap[name]]
      if (!trigger) return ''

      var pos = this.positionDropdown(trigger, dropdown)
      var classes = []
      if (pos.openAbove) classes.push('header-dropdown--above')
      if (pos.alignRight) classes.push('header-dropdown--align-right')
      else classes.push('header-dropdown--align-right') // header is typically right-aligned
      return classes.join(' ')
    },

    positionSearchDropdown() {
      var container = this.$refs.searchContainer
      if (!container) return
      var rect = container.getBoundingClientRect()
      var spaceBelow = window.innerHeight - rect.bottom
      var spaceAbove = rect.top
      this.searchDropdownAbove = spaceBelow < 400 + 8 && spaceAbove > spaceBelow
    },

    focusSearch() {
      if (this.$refs.searchInput) {
        this.$refs.searchInput.focus()
      }
    },

    onEscapeShortcut() {
      this.activeDropdown = null
      if (this.showShortcuts) {
        this.showShortcuts = false
      }
    },

    toggleShortcutsHelp() {
      this.showShortcuts = !this.showShortcuts
    },

    closeShortcutsHelp() {
      this.showShortcuts = false
    },

    showShortcutsOverlay() {
      this.activeDropdown = null
      this.showShortcuts = true
    },

    handleSignOut() {
      this.activeDropdown = null
      this.$store.dispatch('auth/logout')
      this.$store.dispatch('ui/showInfo', {
        title: 'Signed out',
        message: 'You have been signed out successfully.'
      })
      this.$router.push('/login').catch(function() {})
    }
  }
}
</script>

<style scoped>
.d365-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  background: #002050;
  color: white;
  padding: 0 12px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.d365-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 220px;
}

.header-btn-wrap {
  position: relative;
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.1s;
  position: relative;
}
.header-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #D13438;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.header-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
}

.app-title {
  font-size: 15px;
  font-weight: 600;
  color: white;
  text-decoration: none;
  white-space: nowrap;
}
.app-title:hover {
  color: rgba(255, 255, 255, 0.9);
}

.d365-header-center {
  flex: 1;
  max-width: 480px;
  margin: 0 24px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  transition: all 0.2s ease;
}
.search-container.expanded {
  background: rgba(255, 255, 255, 0.2);
}

.search-icon {
  position: absolute;
  left: 10px;
  color: rgba(255, 255, 255, 0.7);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 7px 32px 7px 34px;
  background: transparent;
  border: none;
  color: white;
  font-size: 13px;
  font-family: inherit;
  outline: none;
}
.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-clear-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  border-radius: 2px;
  padding: 0;
}
.search-clear-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 480px;
  background: white;
  border: 1px solid #EDEBE9;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-radius: 0 0 2px 2px;
  z-index: 100;
  max-height: 400px;
  overflow-y: auto;
}
.search-dropdown--above {
  top: auto;
  bottom: 100%;
  border-radius: 2px 2px 0 0;
}

.search-loading {
  height: 2px;
  overflow: hidden;
}
.search-loading-bar {
  height: 2px;
  background: #0078D4;
  animation: search-loading-anim 1.2s ease-in-out infinite;
  transform-origin: left;
}
@keyframes search-loading-anim {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}

.search-category {
  border-bottom: 1px solid #F3F2F1;
}
.search-category:last-child {
  border-bottom: none;
}

.search-category-header {
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 600;
  color: #605E5C;
  padding: 8px 16px 4px;
  letter-spacing: 0.02em;
}

.search-result-item {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 16px;
  cursor: pointer;
  transition: background 0.1s;
  gap: 8px;
}
.search-result-item:hover,
.search-result-item--active {
  background: #F3F2F1;
}

.result-icon-wrap {
  flex-shrink: 0;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-icon {
  color: #0078D4;
}
.result-icon--opportunity { color: #FFB900; }
.result-icon--call { color: #107C10; }
.result-icon--email { color: #0078D4; }
.result-icon--meeting { color: #8764B8; }
.result-icon--task { color: #605E5C; }
.result-icon--quote { color: #0078D4; }
.result-icon--order { color: #107C10; }
.result-icon--invoice { color: #D13438; }

.result-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.result-title {
  font-size: 13px;
  color: #323130;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
}
.result-subtitle {
  font-size: 12px;
  color: #605E5C;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-secondary {
  flex-shrink: 0;
  font-size: 12px;
  color: #605E5C;
  text-align: right;
  white-space: nowrap;
}

.result-stage-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 2px;
  white-space: nowrap;
}
.result-stage--qualification { background: #DEECF9; color: #0078D4; }
.result-stage--development { background: #E8DEF8; color: #8764B8; }
.result-stage--proposal { background: #FFF4CE; color: #797673; }
.result-stage--negotiation { background: #FFE8CC; color: #FF8C00; }
.result-stage--closed-won { background: #DFF6DD; color: #107C10; }
.result-stage--closed-lost { background: #FDE7E9; color: #D13438; }

.search-see-all {
  padding: 10px 16px;
  font-size: 12px;
  color: #0078D4;
  cursor: pointer;
  border-top: 1px solid #F3F2F1;
}
.search-see-all:hover {
  background: #F3F2F1;
}

.search-no-results {
  padding: 20px 16px;
  text-align: center;
}
.search-no-results-title {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
  margin-bottom: 4px;
}
.search-no-results-text {
  font-size: 12px;
  color: #605E5C;
}

/* Header dropdowns */
.d365-header-right {
  display: flex;
  align-items: center;
  gap: 2px;
}

.header-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #EDEBE9;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-radius: 2px;
  min-width: 200px;
  z-index: 1001;
  color: #323130;
}
.header-dropdown--above {
  top: auto;
  bottom: 100%;
  margin-top: 0;
  margin-bottom: 4px;
}
.header-dropdown--align-right {
  right: 0;
  left: auto;
}

.header-dropdown-header {
  font-size: 13px;
  font-weight: 600;
  color: #323130;
  padding: 10px 16px 6px;
  border-bottom: 1px solid #F3F2F1;
}

.header-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  font-size: 13px;
  color: #323130;
  cursor: pointer;
  transition: background 0.1s;
}
.header-dropdown-item:hover {
  background: #F3F2F1;
}
.header-dropdown-item--muted {
  color: #A19F9D;
  cursor: default;
}
.header-dropdown-item--muted:hover {
  background: transparent;
}
.header-dropdown-item--warning {
  color: #D13438;
}
.header-dropdown-item--danger {
  color: #D13438;
}

.header-dropdown-separator {
  height: 1px;
  background: #EDEBE9;
  margin: 4px 0;
}

.header-dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}
.header-dropdown-user-avatar {
  width: 40px;
  height: 40px;
  background: #0078D4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}
.header-dropdown-user-name {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
}
.header-dropdown-user-email {
  font-size: 12px;
  color: #605E5C;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #0078D4;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: white;
  margin-left: 8px;
  cursor: pointer;
}

/* Keyboard shortcuts overlay */
.shortcuts-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcuts-modal {
  background: white;
  border-radius: 4px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);
  width: 560px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: auto;
  color: #323130;
}

.shortcuts-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #EDEBE9;
}

.shortcuts-modal-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #323130;
}

.shortcuts-modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 2px;
  color: #605E5C;
}
.shortcuts-modal-close:hover {
  background: #F3F2F1;
}

.shortcuts-modal-body {
  display: flex;
  gap: 24px;
  padding: 16px 20px 20px;
}

.shortcuts-column {
  flex: 1;
}

.shortcuts-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #605E5C;
  text-transform: uppercase;
  margin: 0 0 10px;
  letter-spacing: 0.03em;
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.shortcut-keys {
  display: flex;
  align-items: center;
  gap: 4px;
}
.shortcut-keys span {
  color: #A19F9D;
  font-size: 11px;
}

.shortcut-keys kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  background: #F3F2F1;
  border: 1px solid #C8C6C4;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  color: #323130;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  box-shadow: 0 1px 0 #C8C6C4;
}

.shortcut-arrow-key {
  font-size: 14px !important;
}

.shortcut-desc {
  font-size: 13px;
  color: #323130;
}
</style>
