(function () {
	const getCardName = (card) => {
		const explicit = card.dataset.appName || '';
		if (explicit.trim()) return explicit.trim();
		const heading = card.querySelector('.store-app-name');
		return (heading ? heading.childNodes[0].textContent : '').trim();
	};

	document.addEventListener('DOMContentLoaded', () => {
		const storeRoot = document.getElementById('storeRoot');
		const storeBody = document.getElementById('apps-store');
		if (!storeRoot || !storeBody) return;

		const searchInput = storeRoot.querySelector('.apps-search');
		const cards = Array.from(storeBody.querySelectorAll('.store-app-container'));

		if (!searchInput || cards.length === 0) return;

		const allEntries = cards.map(card => {
			const name = getCardName(card);
			return {
				card,
				name,
				nameLower: name.toLowerCase()
			};
		});

		const filterCards = (rawTerm) => {
			const term = rawTerm.trim().toLowerCase();
			const activeEntries = term === ''
				? allEntries
				: allEntries.filter(entry => entry.nameLower.includes(term));

			allEntries.forEach(entry => {
				const shouldShow = term === '' || activeEntries.includes(entry);
				entry.card.hidden = !shouldShow;
			});

		};

		const handleInput = (event) => {
			filterCards(event.target.value || '');
		};

		searchInput.addEventListener('input', handleInput);
		searchInput.addEventListener('change', handleInput);
		searchInput.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				event.stopPropagation();
				searchInput.value = '';
				filterCards('');
			}
		});

		filterCards('');
	});
})();
